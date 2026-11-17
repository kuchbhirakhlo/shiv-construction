/**
 * Staff / attendance / admin-user helpers for the Shiv Construction admin panel.
 * Merge these exports into the website's `src/firebase/db.ts` (or re-export from there).
 */
import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { db } from "./config";
import type { Staff, Attendance, AdminUser } from "../types/staff";

export type { Staff, Attendance, AdminUser };

export async function addStaffWithId(id: string, staff: Omit<Staff, "id">): Promise<void> {
  await setDoc(doc(db, "staff", id), staff);
}

export async function deleteStaff(id: string) {
  await deleteDoc(doc(db, "staff", id));
}

export const STAFF_ROLES: Staff["role"][] = [
  "Branch Manager",
  "Customer Relationship Manager",
  "Sales Manager",
  "Engineer",
  "Sales Executive",
  "Senior Sales Executive",
  "Tally Sales",
];

/** Prefix for generated employee IDs — matches the mobile app login hint (`SWT-SM-0001`). */
export const EMPLOYEE_ID_PREFIX = "SWT";

export const ROLE_CODE_MAP: Record<Staff["role"], string> = {
  "Branch Manager": "BM",
  "Customer Relationship Manager": "CM",
  "Tally Sales": "TC",
  "Sales Manager": "SM",
  "Engineer": "EN",
  "Sales Executive": "SE",
  "Senior Sales Executive": "SS",
  "Field Sales": "FS",
  "Supervisor": "SV",
  "Manager": "MG",
  "Office coordinator": "OC",
  "Admin": "AD",
};

export async function generateEmployeeId(role: Staff["role"], existingStaff: Staff[]): Promise<string> {
  const code = ROLE_CODE_MAP[role] || "OT";
  const usedIds = new Set(existingStaff.map((s) => s.employeeId).filter(Boolean) as string[]);
  const seqPattern = new RegExp(`^${EMPLOYEE_ID_PREFIX}-${code}-(\\d+)$`);
  let maxUsed = 0;
  usedIds.forEach((id) => {
    const m = id.match(seqPattern);
    if (m) maxUsed = Math.max(maxUsed, parseInt(m[1], 10));
  });

  const counterRef = doc(db, "counters", `staffId_${code}`);
  try {
    const nextSeq = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const current = counterDoc.exists() ? (counterDoc.data().current || 0) : 0;
      const next = Math.max(current, maxUsed) + 1;
      if (counterDoc.exists()) {
        transaction.update(counterRef, { current: next });
      } else {
        transaction.set(counterRef, { current: next });
      }
      return next;
    });
    return `${EMPLOYEE_ID_PREFIX}-${code}-${String(nextSeq).padStart(4, "0")}`;
  } catch (error) {
    console.error("Employee ID counter transaction failed, using max-scan fallback:", error);
    let seq = maxUsed + 1;
    while (usedIds.has(`${EMPLOYEE_ID_PREFIX}-${code}-${String(seq).padStart(4, "0")}`)) seq++;
    return `${EMPLOYEE_ID_PREFIX}-${code}-${String(seq).padStart(4, "0")}`;
  }
}

export async function getMonthlyAttendanceReport(month: string): Promise<Attendance[]> {
  const start = `${month}-01`;
  const end = `${month}-31`;
  const q = query(collection(db, "attendance"), where("date", ">=", start), where("date", "<=", end));
  const snap = await getDocs(q);
  const list: Attendance[] = [];
  snap.forEach((d) => {
    list.push({ id: d.id, ...d.data() } as Attendance);
  });
  return list;
}

export async function addAdmin(adminData: Omit<AdminUser, "id" | "createdAt">): Promise<string> {
  const adminRef = await addDoc(collection(db, "admins"), {
    ...adminData,
    role: adminData.role || "admin",
    active: adminData.active !== undefined ? adminData.active : true,
    createdAt: new Date().toISOString(),
  });
  return adminRef.id;
}

export async function checkAdminExists(email: string): Promise<AdminUser | null> {
  const normalized = email.toLowerCase();
  let q = query(collection(db, "admins"), where("email", "==", normalized), where("active", "==", true));
  let snap = await getDocs(q);
  if (snap.empty) {
    q = query(collection(db, "admins"), where("email", "==", normalized));
    snap = await getDocs(q);
  }
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as AdminUser;
}