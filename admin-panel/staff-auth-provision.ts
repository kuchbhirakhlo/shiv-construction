/**
 * Drop-in for the Vercel admin app (shivconstruction-liart).
 * Replace client-side createUserWithEmailAndPassword in AdminStaff with this.
 *
 * 1. Deploy Cloud Functions from this repo (exports.provisionStaffLogin).
 * 2. After generateEmployeeId(), pick staffId = crypto.randomUUID().
 * 3. await provisionStaffLoginCall(staffId, employeeId, password, role).
 * 4. await addStaffWithId(staffId, payload) — same as today.
 */
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./config"; // your existing firebase app module

export async function provisionStaffLoginCall(
  staffId: string,
  employeeId: string,
  password: string,
  role: string
): Promise<{ uid: string; email: string }> {
  const functions = getFunctions(app, "asia-south1");
  const call = httpsCallable<
    { staffId: string; employeeId: string; password: string; role: string },
    { uid: string; email: string }
  >(functions, "provisionStaffLogin");
  const { data } = await call({ staffId, employeeId, password, role });
  return data;
}