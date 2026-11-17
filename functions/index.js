const functions = require("firebase-functions/v1");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");

initializeApp();
const db = getFirestore();

const EMAIL_DOMAIN = "staff.shivconstruction.app";

function staffAuthEmail(employeeId) {
  return `${String(employeeId).trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

/**
 * Keep Firebase Auth in sync with a staff Firestore doc:
 * uid = staff doc id, email = employeeId@staff.shivconstruction.app,
 * claims { staff: true } and { admin: true } for Branch Managers.
 */
async function provisionStaffAuth(staffId, data) {
  if (!data) return { skipped: "deleted" };
  const employeeId = data.employeeId;
  const password = data.password;
  if (!employeeId || !password) return { skipped: "no employeeId/password" };

  const auth = getAuth();
  const email = staffAuthEmail(employeeId);

  try {
    await auth.updateUser(staffId, { email, password, disabled: false });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await auth.createUser({
        uid: staffId,
        email,
        password,
        disabled: false,
        emailVerified: true,
      });
    } else {
      throw err;
    }
  }

  const existing = (await auth.getUser(staffId)).customClaims || {};
  const claims = { ...existing, staff: true };
  if (data.role === "Branch Manager") {
    claims.admin = true;
  }
  await auth.setCustomUserClaims(staffId, claims);
  return { done: staffId, email };
}

/**
 * Callable from the admin panel when client-side createUserWithEmailAndPassword
 * fails (sign-up restrictions, email already registered with a different password,
 * etc.). Uses the Admin SDK so staff Auth provisioning does not depend on public
 * sign-up. Caller must be signed in with a real admin email (listed in /admins).
 */
exports.provisionStaffLogin = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.email) {
    throw new functions.https.HttpsError("permission-denied", "Sign in to the admin panel first.");
  }
  const adminEmail = context.auth.token.email.toLowerCase();
  const adminSnap = await db.collection("admins").where("email", "==", adminEmail).limit(1).get();
  if (adminSnap.empty && !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can provision staff logins.");
  }

  const staffId = data && data.staffId;
  const employeeId = data && data.employeeId;
  const password = data && data.password;
  const role = (data && data.role) || null;
  if (!staffId || !employeeId || !password) {
    throw new functions.https.HttpsError("invalid-argument", "staffId, employeeId, and password are required.");
  }
  if (typeof password !== "string" || password.length < 6) {
    throw new functions.https.HttpsError("invalid-argument", "Password must be at least 6 characters.");
  }

  try {
    const result = await provisionStaffAuth(staffId, { employeeId, password, role });
    if (result.skipped) {
      throw new functions.https.HttpsError("failed-precondition", `Provisioning skipped: ${result.skipped}`);
    }
    return { uid: staffId, email: result.email };
  } catch (err) {
    logger.error("provisionStaffLogin failed", { staffId, error: err.message });
    throw new functions.https.HttpsError("internal", err.message || "Provisioning failed.");
  }
});

// 1st-gen Firestore trigger in the database region (asia-south1).
exports.onStaffWritten = functions.region("asia-south1").firestore.document("staff/{staffId}").onWrite(async (change, context) => {
  const staffId = context.params.staffId;
  const data = change.after.exists ? change.after.data() : null;
  if (!data) {
    logger.info("staff doc deleted; leaving Auth user in place", { staffId });
    return;
  }
  try {
    const result = await provisionStaffAuth(staffId, data);
    logger.info("staff auth provisioned", { staffId, ...result });
  } catch (err) {
    logger.error("staff auth provisioning failed", { staffId, error: err.message });
    throw err;
  }
});
