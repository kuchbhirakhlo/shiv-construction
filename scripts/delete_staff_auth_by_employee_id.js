require('dns').setDefaultResultOrder('ipv4first');
/**
 * Deletes the Firebase Auth user for <employeeId>@staff.shivconstruction.app
 * so the admin panel can recreate staff with a new password (or use provisionStaffLogin).
 *
 * Run: node scripts/delete_staff_auth_by_employee_id.js SWT-SM-0002
 */
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const EMPLOYEE_ID = process.argv[2];
const DOMAIN = 'staff.shivconstruction.app';

if (!EMPLOYEE_ID) {
  console.error('Usage: node delete_staff_auth_by_employee_id.js <employeeId>');
  process.exit(1);
}

const keyPath = path.join(__dirname, 'serviceAccountKey.json');
let sa;
try {
  sa = require(keyPath);
} catch {
  console.error('Missing scripts/serviceAccountKey.json — download from Firebase Console → Project Settings → Service accounts.');
  process.exit(1);
}

initializeApp({ credential: cert(sa) });
const auth = getAuth();
const email = `${String(EMPLOYEE_ID).trim().toLowerCase()}@${DOMAIN}`;

(async () => {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.deleteUser(user.uid);
    console.log(`Deleted Auth user ${user.uid} (${email}). You can add staff again from the admin panel.`);
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      console.log(`No Auth user for ${email}.`);
      return;
    }
    throw e;
  }
})().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});