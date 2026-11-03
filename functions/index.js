const functions = require("firebase-functions/v1");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { logger } = require("firebase-functions");

initializeApp();

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
