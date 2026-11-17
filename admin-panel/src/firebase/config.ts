/**
 * Shiv Construction admin panel — Firebase bootstrap + staff Auth provisioning.
 * Copy into the Vercel website `src/firebase/config.ts` (merge with existing exports).
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const storage = getStorage(app);

/** Must match `AppStrings.staffAuthEmailDomain` in the Flutter app (`shivconstruction`). */
export const STAFF_AUTH_EMAIL_DOMAIN = "staff.shivconstruction.app";

export const staffAuthEmail = (employeeId: string) =>
  `${employeeId.trim().toLowerCase()}@${STAFF_AUTH_EMAIL_DOMAIN}`;

export const FUNCTIONS_REGION = "asia-south1";

/**
 * Provision staff login via Admin SDK (`functions/provisionStaffLogin`).
 * `staffId` must be the Firestore doc id (use `crypto.randomUUID()` before `addStaffWithId`).
 */
export async function provisionStaffLoginCall(
  staffId: string,
  employeeId: string,
  password: string,
  role: string
): Promise<{ uid: string; email: string }> {
  const functions = getFunctions(app, FUNCTIONS_REGION);
  const call = httpsCallable<
    { staffId: string; employeeId: string; password: string; role: string },
    { uid: string; email: string }
  >(functions, "provisionStaffLogin");
  const { data } = await call({ staffId, employeeId, password, role });
  return data;
}