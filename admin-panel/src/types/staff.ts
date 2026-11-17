/** Staff-related types for the admin panel — mirror the website `src/types.ts`. */
export interface Staff {
  id?: string;
  name: string;
  phone: string;
  email: string;
  role:
    | "Branch Manager"
    | "Customer Relationship Manager"
    | "Tally Sales"
    | "Sales Manager"
    | "Engineer"
    | "Sales Executive"
    | "Senior Sales Executive"
    | "Admin"
    | "Field Sales"
    | "Supervisor"
    | "Manager"
    | "Office coordinator";
  salary: number;
  joiningDate: string;
  employeeId?: string;
  password?: string;
  authEmail?: string;
  siteName?: string;
  overtimeHourlyRate?: number;
}

export interface Attendance {
  id?: string;
  staffId: string;
  staffName: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Weekly Off";
}

export interface AdminUser {
  id?: string;
  email: string;
  name?: string;
  role: string;
  active?: boolean;
  createdAt?: string;
}