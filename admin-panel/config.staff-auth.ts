/**
 * REPLACE createOrVerifyStaffAuthAccount / createStaffAuthAccount in the Vercel app's config.
 * Do not create staff Auth users in the browser.
 */
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./config";

export const STAFF_AUTH_EMAIL_DOMAIN = "staff.shivconstruction.app";

export const staffAuthEmail = (employeeId: string) =>
  `${employeeId.trim().toLowerCase()}@${STAFF_AUTH_EMAIL_DOMAIN}`;

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