import React, { useState, useEffect } from "react";
import { Staff } from "../types";
import {
  addStaffWithId,
  deleteStaff,
  generateEmployeeId,
  STAFF_ROLES,
  ROLE_CODE_MAP,
  EMPLOYEE_ID_PREFIX,
  getMonthlyAttendanceReport,
  addAdmin,
  checkAdminExists,
} from "../firebase/db.staff";
import { provisionStaffLoginCall, staffAuthEmail } from "../firebase/config";
import { Plus, User, Phone, Trash2, Printer, FileText, X, KeyRound, Copy, IdCard, Lock, UserX, FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "../utils/exportExcel";

interface AdminStaffProps {
  staff: Staff[];
  adminEmail?: string | null;
}

export default function AdminStaff({ staff, adminEmail }: AdminStaffProps) {
  // Identify who is currently signed into the CRM panel (matched by email against
  // the staff register). A Branch Manager is NOT allowed to create another
  // Branch Manager, so that option is hidden from the role dropdown for them.
  const currentUser = adminEmail
    ? staff.find(
        (s) =>
          (s.email && s.email.toLowerCase() === adminEmail.toLowerCase()) ||
          (s.authEmail && s.authEmail.toLowerCase() === adminEmail.toLowerCase())
      )
    : undefined;
  const isBranchManager = currentUser?.role === "Branch Manager";
  const roleOptions = STAFF_ROLES.filter((r) => !(isBranchManager && r === "Branch Manager"));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Payslip modal state — month is kept as "YYYY-MM" so attendance can be cross-referenced
  const [payslipMonthKey, setPayslipMonthKey] = useState(new Date().toISOString().slice(0, 7));

  // Attendance-linked deduction (Loss of Pay for absent days + excess leaves)
  const [absentDays, setAbsentDays] = useState(0);
  const [leaveDays, setLeaveDays] = useState(0);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Company policy: 2 paid Leaves per month — leave days beyond this are unpaid
  const PAID_LEAVES_PER_MONTH = 2;

  // "2026-07" -> "July 2026" for display on the printed slip
  const formatMonthLabel = (key: string): string => {
    const [y, m] = key.split("-").map(Number);
    if (!y || !m) return key;
    return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  };

  // Total calendar days in the payslip month (per-day rate base)
  const daysInMonth = (key: string): number => {
    const [y, m] = key.split("-").map(Number);
    if (!y || !m) return 30;
    return new Date(y, m, 0).getDate();
  };

  // Per-day salary rate and the resulting absence deduction.
  // Leaves beyond the paid allowance count as unpaid days alongside absences.
  const perDayRate = selectedStaff ? selectedStaff.salary / daysInMonth(payslipMonthKey) : 0;
  const excessLeaveDays = Math.max(0, leaveDays - PAID_LEAVES_PER_MONTH);
  const unpaidDays = absentDays + excessLeaveDays;
  const lopDeduction = Math.round(perDayRate * unpaidDays);

  // Earnings
  const [basic, setBasic] = useState(8500);
  const [hra, setHra] = useState(3400);
  const [conveyance, setConveyance] = useState(1600);
  const [specialAllowance, setSpecialAllowance] = useState(3500);

  // Incentive (admin can set any amount, 0 by default)
  const [incentive, setIncentive] = useState(0);

  // Deductions
  const [pf, setPf] = useState(0);
  const [esi, setEsi] = useState(0);
  const [professionalTax, setProfessionalTax] = useState(0);
  const [tds, setTds] = useState(0);

  // Add staff form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Tally Sales" as Staff["role"],
    salary: 30000,
    joiningDate: new Date().toISOString().slice(0, 10),
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Newly generated sales credentials shown to admin after creation
  const [newCredentials, setNewCredentials] = useState<{
    name: string;
    employeeId: string;
    authEmail?: string;
    password: string;
    authNote: string;
  } | null>(null);
  const [duplicateEmployee, setDuplicateEmployee] = useState<{ employeeId: string; record: Staff | null } | null>(null);

  // All staff roles get login credentials
  const isSalesRole = true; // Always show credentials section for all roles

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required.");
      return;
    }

    if (!formData.email.trim()) {
      alert("An email address is required — a Firebase Auth login is created for every staff member.");
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      alert("A login password of at least 6 characters is required (Firebase Auth minimum).");
      return;
    }

    // A Branch Manager cannot create another Branch Manager.
    if (isBranchManager && formData.role === "Branch Manager") {
      alert("A Branch Manager is not permitted to create another Branch Manager.");
      return;
    }

    setSubmitting(true);
    try {
      const employeeId = await generateEmployeeId(formData.role, staff);
      const authEmail = staffAuthEmail(employeeId);
      const contactEmail = formData.email.trim();
      const staffId = crypto.randomUUID();

      const payload: Omit<Staff, "id"> = {
        name: formData.name,
        phone: formData.phone,
        email: contactEmail,
        authEmail,
        role: formData.role,
        salary: Number(formData.salary),
        joiningDate: formData.joiningDate,
        employeeId,
        password: formData.password,
      };

      try {
        await provisionStaffLoginCall(staffId, employeeId, formData.password, formData.role);
      } catch (authErr: unknown) {
        const code =
          authErr && typeof authErr === "object" && "code" in authErr
            ? String((authErr as { code?: string }).code)
            : "";
        const detail =
          authErr && typeof authErr === "object" && "message" in authErr
            ? String((authErr as { message?: string }).message)
            : "unknown-error";
        throw new Error(
          `Firebase Authentication account could not be created (${code || detail}). The staff record was not saved.`
        );
      }

      await addStaffWithId(staffId, payload);

      let authNote = "Firebase Auth login created (Employee ID + password).";

      if (formData.role === "Branch Manager") {
        try {
          const adminEmailLower = contactEmail.toLowerCase();
          if (!(await checkAdminExists(adminEmailLower))) {
            await addAdmin({
              email: adminEmailLower,
              name: formData.name,
              role: "admin",
              active: true,
            });
          }
          authNote += " Added to admins (CRM panel access).";
        } catch (adminErr) {
          console.error("Failed to register Branch Manager as admin:", adminErr);
          authNote += " Could not register CRM-panel access automatically.";
        }
      }

      setNewCredentials({
        name: formData.name,
        employeeId,
        authEmail,
        password: formData.password,
        authNote,
      });

      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        role: "Tally Sales",
        salary: 30000,
        joiningDate: new Date().toISOString().slice(0, 10),
        password: "",
      });
    } catch (err) {
      console.error("Failed to add staff:", err);
      alert(err instanceof Error ? err.message : "Failed to add staff. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this staff member permanently?")) {
      try {
        await deleteStaff(id);
      } catch (err) {
        console.error("Failed to delete staff:", err);
      }
    }
  };

  const handleGeneratePayslip = (employee: Staff) => {
    // Auto-calculate earnings breakdown from the staff's contracted salary
    const salary = employee.salary;
    const calcBasic = Math.round(salary * 0.5);
    const calcHra = Math.round(salary * 0.2);
    const calcConveyance = 1600;
    const calcSpecialAllowance = salary - calcBasic - calcHra - calcConveyance;
    setBasic(calcBasic);
    setHra(calcHra);
    setConveyance(calcConveyance);
    setSpecialAllowance(calcSpecialAllowance);
    setIncentive(0);
    setPf(0);
    setEsi(0);
    setProfessionalTax(0);
    setTds(0);
    setAbsentDays(0);
    setLeaveDays(0);
    setPayslipMonthKey(new Date().toISOString().slice(0, 7));
    setSelectedStaff(employee);
    setShowPayslipModal(true);
  };

  // Cross-reference the attendance register whenever the payslip month or
  // employee changes — absent days and excess leaves drive the Loss of Pay deduction.
  useEffect(() => {
    if (!showPayslipModal || !selectedStaff?.id) return;
    let cancelled = false;
    setAttendanceLoading(true);
    getMonthlyAttendanceReport(payslipMonthKey)
      .then((records) => {
        if (cancelled) return;
        const mine = records.filter((r) => r.staffId === selectedStaff.id);
        setAbsentDays(mine.filter((r) => r.status === "Absent").length);
        setLeaveDays(mine.filter((r) => r.status === "Leave").length);
      })
      .catch((err) => {
        console.error("Failed to load attendance for payslip:", err);
        if (!cancelled) {
          setAbsentDays(0);
          setLeaveDays(0);
        }
      })
      .finally(() => {
        if (!cancelled) setAttendanceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showPayslipModal, selectedStaff, payslipMonthKey]);

  // Triggers browser print window for the customized Salary slip layout
  const handlePrintPayslip = () => {
    if (!selectedStaff) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const gross = basic + hra + conveyance + specialAllowance + incentive;
    const totalDeductions = pf + esi + professionalTax + tds + lopDeduction;
    const netSalary = gross - totalDeductions;
    const totalDays = daysInMonth(payslipMonthKey);
    const payableDays = totalDays - unpaidDays;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - Shiv Construction</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'REM', Georgia, 'Times New Roman', serif; padding: 0; margin: 0; color: #1e293b; font-size: 12px; line-height: 1.3; }
            .border-box { border: 2px solid #0F766E; border-radius: 6px; padding: 18px; max-width: 100%; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #0F766E; padding-bottom: 10px; margin-bottom: 12px; }
            .header img { height: 50px; margin-bottom: 3px; }
            .header h2 { margin: 0; font-size: 16px; color: #0F172A; text-transform: uppercase; }
            .header p { margin: 3px 0 0; font-size: 10px; font-weight: bold; color: #0F766E; letter-spacing: 0.5px; }
            .confidential { text-align: center; font-size: 9px; color: #dc2626; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 10px; }
            .title { text-align: center; margin-bottom: 12px; font-weight: bold; font-size: 13px; }
            .employee-info { border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 12px; margin-bottom: 10px; font-size: 11px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
            .employee-info .label { color: #64748b; font-weight: bold; font-size: 10px; }
            .employee-info .value { font-weight: bold; color: #0F172A; }
            .payslip-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .payslip-table th { background-color: #0F172A; color: white; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
            .payslip-table td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            .payslip-table td.amount { text-align: right; font-family: 'Courier New', monospace; font-size: 11px; }
            .payslip-table tr.total-row td { font-weight: bold; border-top: 1.5px solid #0F766E; border-bottom: 1.5px solid #0F766E; }
            .payslip-table tr.net-row td { font-weight: bold; font-size: 13px; background-color: #0F766E; color: white; padding: 7px 8px; }
            .payslip-table tr.net-row td.amount { font-size: 14px; }
            .footer { margin-top: 15px; text-align: center; font-size: 9px; color: #94a3b8; }
            .sign-grid { display: flex; justify-content: space-between; margin-top: 20px; font-size: 10px; font-weight: bold; }
            .sign-grid img { height: 55px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="border-box">
            <div class="header">
              <img src="/logo.png" alt="Shiv Construction" style="height: 60px; margin-bottom: 5px;" />
            </div>

            <div class="confidential">PRIVATE &amp; CONFIDENTIAL</div>

            <div style="text-align: center; margin-bottom: 10px; font-weight: bold; font-size: 12px;">
              SALARY PAYSLIP
            </div>

            <div class="employee-info">
              <div>
                <span class="label">Employee:</span> <span class="value">${selectedStaff.name}</span>
              </div>
              <div>
                <span class="label">Emp ID:</span> <span class="value">${selectedStaff.employeeId}</span>
              </div>
              <div>
                <span class="label">Month:</span> <span class="value">${formatMonthLabel(payslipMonthKey)}</span>
              </div>
            </div>

            <div class="employee-info" style="margin-top: -10px;">
              <div>
                <span class="label">Total Days:</span> <span class="value">${totalDays}</span>
              </div>
              <div>
                <span class="label">Absent Days:</span> <span class="value" style="color: #dc2626;">${absentDays}</span>
              </div>
              <div>
                <span class="label">Leaves:</span> <span class="value" style="color: ${excessLeaveDays > 0 ? "#dc2626" : "#0F766E"};">${leaveDays} (${Math.min(leaveDays, PAID_LEAVES_PER_MONTH)} paid)</span>
              </div>
              <div>
                <span class="label">Payable Days:</span> <span class="value" style="color: #0F766E;">${payableDays}</span>
              </div>
            </div>

            <table class="payslip-table">
              <thead>
                <tr>
                  <th>Earnings</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic</td>
                  <td class="amount">${basic.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>HRA</td>
                  <td class="amount">${hra.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Conveyance</td>
                  <td class="amount">${conveyance.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Special Allowance</td>
                  <td class="amount">${specialAllowance.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Incentive</td>
                  <td class="amount">${incentive.toLocaleString("en-IN")}</td>
                </tr>
                <tr class="total-row">
                  <td>Gross</td>
                  <td class="amount">${gross.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <table class="payslip-table">
              <thead>
                <tr>
                  <th>Deductions</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PF</td>
                  <td class="amount">${pf.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>ESI</td>
                  <td class="amount">${esi.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Professional Tax</td>
                  <td class="amount">${professionalTax.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>TDS</td>
                  <td class="amount">${tds.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Loss of Pay (${absentDays} Absent${excessLeaveDays > 0 ? ` + ${excessLeaveDays} Excess Leave` : ""} = ${unpaidDays} Day${unpaidDays === 1 ? "" : "s"})</td>
                  <td class="amount">${lopDeduction.toLocaleString("en-IN")}</td>
                </tr>
                <tr class="net-row">
                  <td>Net Salary</td>
                  <td class="amount">${netSalary.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <div class="sign-grid">
              <div>Employee's Signature</div>
              <div style="text-align: right;">
                <div>Authorised Signatory</div>
                <img src="/shivconstructionsign.png" alt="Stamp" />
              </div>
            </div>

            <div class="footer">
              This is a system generated salary slip — Shiv Construction.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setShowPayslipModal(false);
  };

  // Exports the full staff register to Excel (passwords intentionally excluded),
  // including the current month's attendance summary and payable days per employee.
  const [exporting, setExporting] = useState(false);
  const handleExportExcel = async () => {
    const monthKey = new Date().toISOString().slice(0, 7);
    setExporting(true);
    try {
      // Cross-reference the attendance register for the current month
      const records = await getMonthlyAttendanceReport(monthKey);
      const stats: { [staffId: string]: { present: number; absent: number; weeklyOff: number; leave: number } } = {};
      staff.forEach((s) => {
        if (s.id) stats[s.id] = { present: 0, absent: 0, weeklyOff: 0, leave: 0 };
      });
      records.forEach((rec) => {
        const st = stats[rec.staffId];
        if (!st) return;
        if (rec.status === "Present") st.present += 1;
        else if (rec.status === "Absent") st.absent += 1;
        else if (rec.status === "Weekly Off") st.weeklyOff += 1;
        else if (rec.status === "Leave") st.leave += 1;
      });

      exportToExcel("ShivConstruction_Staff", [
        {
          name: "Staff",
          rows: staff.map((s, i) => {
            const st = (s.id && stats[s.id]) || { present: 0, absent: 0, weeklyOff: 0, leave: 0 };
            return {
              "Sr. No.": i + 1,
              "Employee ID": s.employeeId || "—",
              Name: s.name || "—",
              Phone: s.phone || "—",
              Email: s.email || "—",
              Role: s.role || "—",
              "Monthly Salary (₹)": s.salary || 0,
              "Joining Date": s.joiningDate || "—",
              "Attendance Month": formatMonthLabel(monthKey),
              "Present Days": st.present,
              "Absent Days": st.absent,
              "Leave Days": st.leave,
              "Weekly Off": st.weeklyOff,
              "Payable Days": st.present + st.weeklyOff + st.leave,
            };
          }),
        },
      ]);
    } catch (err) {
      console.error("Failed to export staff register:", err);
      alert("Could not load attendance data for the export. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Staff & HR Management</h2>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Register team members, track monthly parameters, and compile print-ready salary payslips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-white hover:bg-slate-50 text-[#0F766E] border border-[#0F766E]/30 font-bold py-2.5 px-5 rounded-xl text-xs tracking-wider flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-60 disabled:cursor-wait"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? "Exporting..." : "Export Excel"}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0F766E] hover:bg-[#0F766E] text-white font-bold py-2.5 px-5 rounded-xl text-xs tracking-wider flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet List of Staff */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] tracking-widest uppercase font-semibold">
                <th className="py-4 px-5">Staff Member</th>
                <th className="py-4 px-5">Operational Role</th>
                <th className="py-4 px-5">Monthly Salary</th>
                <th className="py-4 px-5">Joining date</th>
                <th className="py-4 px-5 text-right">Payroll Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-normal">
                    No employees registered yet. Click "Add Employee" to set up your technical team.
                  </td>
                </tr>
              ) : (
                staff.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    {/* Name & details */}
                    <td className="py-4 px-5 space-y-1">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>{emp.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 pl-5">
                        <Phone className="w-3 h-3 text-[#1D5A3C]" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>

                    {/* Operational Role + sales login credentials */}
                    <td className="py-4 px-5 space-y-1.5">
                      <span className="text-xs text-slate-700 font-medium bg-slate-50 border border-slate-100 py-1 px-2.5 rounded-lg inline-block">
                        {emp.role}
                      </span>
                      {emp.employeeId && (
                        <div className="text-[10px] font-mono text-slate-500 space-y-0.5 pt-0.5">
                          <div className="flex items-center gap-1">
                            <IdCard className="w-3 h-3 text-[#0F766E]" />
                            <span className="font-bold text-slate-700">{emp.employeeId}</span>
                          </div>
                          {emp.password && (
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-[#1D5A3C]" />
                              <span>{emp.password}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Monthly Salary */}
                    <td className="py-4 px-5 font-mono font-bold text-[#0F766E]">
                      ₹{emp.salary.toLocaleString("en-IN")}
                    </td>

                    {/* Joining Date */}
                    <td className="py-4 px-5 font-mono text-slate-500">
                      {emp.joiningDate}
                    </td>

                    {/* Actions: Generate Salary Slip, Remove staff */}
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleGeneratePayslip(emp)}
                        className="bg-slate-50 hover:bg-[#0F766E] border border-slate-200 hover:border-[#0F766E] text-slate-700 hover:text-white font-bold py-1.5 px-3 rounded-lg text-[10px] tracking-wider transition-all inline-flex items-center space-x-1 shadow-sm cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#1D5A3C]" />
                        <span>Generate Payslip</span>
                      </button>

                      <button
                        onClick={() => handleDelete(emp.id!)}
                        className="p-1.5 bg-red-50 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-100 border border-red-100 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden z-10 animate-scale-up">
            
            <div className="bg-slate-50 border-b border-slate-200 py-4 px-6 text-slate-900 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#0F172A]">Register New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-600 font-bold text-sm">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Employee Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address <span className="text-[#0F766E]">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your registered email address"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                {/* Operational Role */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Operational Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all"
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {isBranchManager && (
                      <p className="text-[9px] text-slate-400 leading-relaxed">
                        As a Branch Manager you cannot create another Branch Manager.
                      </p>
                    )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Salary */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contracted Salary (₹ / month)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="30000"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all"
                  />
                </div>

                {/* Joining date */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Staff portal login credentials — for all roles */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Staff Portal Login Access</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  An <span className="font-bold">Employee ID</span> is generated automatically on save
                  (e.g. <span className="font-mono">{EMPLOYEE_ID_PREFIX}-{ROLE_CODE_MAP[formData.role] || "OT"}-0001</span>).
                  A <span className="font-bold">Firebase Auth login</span> is also created for the email above.
                  The staff member logs in at <span className="font-mono">/login</span> → Sales Staff tab
                  {formData.role === "Branch Manager" ? " (Branch Managers also get the Admin tab)." : "."}
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#0F766E]" /> Login Password <span className="text-[#0F766E]">(min 6 chars)</span>
                  </label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Set a password to share with the staff"
                    minLength={6}
                    className="w-full bg-white border border-slate-200 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] rounded-lg py-2 px-3 text-slate-800 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0F766E] hover:bg-[#0F766E] text-white font-bold py-3 rounded-xl text-xs tracking-widest uppercase shadow-sm cursor-pointer transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {submitting ? "Creating Account..." : "Create Staff Account"}
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Payslip Config Parameter Modal Dialog */}
      {showPayslipModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-sm" onClick={() => setShowPayslipModal(false)}></div>
          
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] z-10 animate-scale-up">
            
            <div className="bg-slate-50 border-b border-slate-200 py-4 px-6 text-slate-900 flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#0F172A]">Payslip Parameter Desk</h3>
              <button onClick={() => setShowPayslipModal(false)} className="text-slate-400 hover:text-red-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase">EMPLOYEE</span>
                <span className="text-sm font-bold text-slate-900 block">{selectedStaff.name}</span>
                <span className="text-[10px] text-[#0F766E] font-bold block">Employee ID: {selectedStaff.employeeId}</span>
              <span className="text-[10px] text-[#1D5A3C] font-bold block">Base Contract Rate: ₹{selectedStaff.salary.toLocaleString("en-IN")}</span>
              </div>

              <div className="space-y-3">
                {/* Payslip Month */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">PAYSLIP MONTH</label>
                  <input
                    type="month"
                    value={payslipMonthKey}
                    onChange={(e) => setPayslipMonthKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all font-mono"
                  />
                </div>

                {/* Attendance summary — auto cross-referenced from the register */}
                <div className={`border rounded-xl p-4 space-y-2 ${unpaidDays > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${unpaidDays > 0 ? "text-red-600" : "text-[#0F766E]"}`}>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Attendance — {formatMonthLabel(payslipMonthKey)}</span>
                    </div>
                    {attendanceLoading && (
                      <span className="text-[9px] text-slate-400 animate-pulse font-mono">Checking register...</span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white border border-slate-200 rounded-lg py-2">
                      <div className="text-sm font-bold text-slate-900 font-mono">{daysInMonth(payslipMonthKey)}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Total Days</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg py-2">
                      <div className={`text-sm font-bold font-mono ${absentDays > 0 ? "text-red-600" : "text-slate-900"}`}>{absentDays}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Absent</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg py-2">
                      <div className={`text-sm font-bold font-mono ${excessLeaveDays > 0 ? "text-red-600" : "text-slate-900"}`}>{leaveDays}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Leaves</div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg py-2">
                      <div className="text-sm font-bold text-[#0F766E] font-mono">{daysInMonth(payslipMonthKey) - unpaidDays}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Payable</div>
                    </div>
                  </div>
                  {unpaidDays > 0 ? (
                    <p className="text-[10px] text-red-600 leading-relaxed">
                      Loss of Pay: {absentDays > 0 && `${absentDays} absent day${absentDays === 1 ? "" : "s"}`}{absentDays > 0 && excessLeaveDays > 0 && " + "}{excessLeaveDays > 0 && `${excessLeaveDays} leave day${excessLeaveDays === 1 ? "" : "s"} beyond the ${PAID_LEAVES_PER_MONTH} paid leaves`} = {unpaidDays} day{unpaidDays === 1 ? "" : "s"} × ₹{Math.round(perDayRate).toLocaleString("en-IN")}/day = <span className="font-bold">₹{lopDeduction.toLocaleString("en-IN")}</span> will be deducted from the salary.
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      No absences and no leaves beyond the {PAID_LEAVES_PER_MONTH} paid leaves this month. Full salary is payable.
                    </p>
                  )}
                  {/* Manual override in case the register is incomplete */}
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Adjust Absent</label>
                      <input
                        type="number"
                        min={0}
                        max={daysInMonth(payslipMonthKey)}
                        value={absentDays}
                        onChange={(e) => setAbsentDays(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 text-right outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Adjust Leaves</label>
                      <input
                        type="number"
                        min={0}
                        max={daysInMonth(payslipMonthKey)}
                        value={leaveDays}
                        onChange={(e) => setLeaveDays(Math.max(0, Number(e.target.value)))}
                        className="w-16 bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 text-right outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Earnings Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-[10px] text-[#0F766E] font-bold uppercase tracking-wider">Earnings</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Basic</label>
                      <input
                        type="number"
                        value={basic}
                        onChange={(e) => setBasic(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">HRA</label>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Conveyance</label>
                      <input
                        type="number"
                        value={conveyance}
                        onChange={(e) => setConveyance(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Special Allowance</label>
                      <input
                        type="number"
                        value={specialAllowance}
                        onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Incentive</label>
                    <input
                      type="number"
                      value={incentive}
                      onChange={(e) => setIncentive(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                    />
                  </div>
                  <div className="text-right text-xs font-bold text-[#0F766E] pt-1 border-t border-slate-200">
                    Gross: ₹{(basic + hra + conveyance + specialAllowance + incentive).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Deductions Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Deductions</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">PF</label>
                      <input
                        type="number"
                        value={pf}
                        onChange={(e) => setPf(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">ESI</label>
                      <input
                        type="number"
                        value={esi}
                        onChange={(e) => setEsi(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Professional Tax</label>
                      <input
                        type="number"
                        value={professionalTax}
                        onChange={(e) => setProfessionalTax(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">TDS</label>
                      <input
                        type="number"
                        value={tds}
                        onChange={(e) => setTds(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] font-mono transition-all"
                      />
                    </div>
                  </div>
                  {/* Attendance-linked Loss of Pay (read-only, driven by absent + excess leave days above) */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Loss of Pay ({unpaidDays} Unpaid Day{unpaidDays === 1 ? "" : "s"})</span>
                    <span className="font-mono font-bold text-red-600">₹{lopDeduction.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-right text-xs font-bold text-red-600 pt-1 border-t border-slate-200">
                    Total Deductions: ₹{(pf + esi + professionalTax + tds + lopDeduction).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Net Salary Preview */}
                <div className="bg-[#0F766E]/10 border border-[#0F766E] rounded-xl p-4 text-center">
                  <span className="text-[10px] text-[#0F766E] font-bold uppercase tracking-wider">Net Salary</span>
                  <div className="text-lg font-bold text-[#0F766E] mt-1">
                    ₹{((basic + hra + conveyance + specialAllowance + incentive) - (pf + esi + professionalTax + tds + lopDeduction)).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <button
                onClick={handlePrintPayslip}
                className="w-full bg-[#0F766E] hover:bg-[#0F766E] text-white font-bold py-3 rounded-lg text-xs tracking-widest uppercase shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Verify & Print Salary Slip</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Generated Sales Credentials Confirmation Modal */}
      {newCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-sm" onClick={() => setNewCredentials(null)}></div>

          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 animate-scale-up">
            <div className="bg-[#0F766E] py-4 px-6 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5" />
                <h3 className="text-sm font-bold">Sales Login Created</h3>
              </div>
              <button onClick={() => setNewCredentials(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <p className="text-xs text-slate-500 leading-relaxed">
                Share these credentials with <span className="font-bold text-slate-900">{newCredentials.name}</span>.
                They can sign in at <span className="font-mono">/login</span> → <span className="font-bold">Sales Staff</span> tab.
                (You can also find them later in the staff list.)
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Employee ID</div>
                    <div className="text-sm font-mono font-bold text-slate-900">{newCredentials.employeeId}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(newCredentials.employeeId)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#0F766E] transition-all"
                    title="Copy Employee ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Password</div>
                    <div className="text-sm font-mono font-bold text-slate-900">{newCredentials.password}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(newCredentials.password)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#0F766E] transition-all"
                    title="Copy Password"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {newCredentials.authNote && (
                <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 leading-relaxed">
                  {newCredentials.authNote}
                </p>
              )}

              <button
                onClick={() => setNewCredentials(null)}
                className="w-full bg-[#0F766E] hover:bg-[#0F766E] text-white font-bold py-3 rounded-xl text-xs tracking-widest uppercase shadow-sm cursor-pointer transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 bg-[#0F172A]/70 backdrop-blur-sm" onClick={() => setDuplicateEmployee(null)} />
          <section role="dialog" aria-modal="true" aria-labelledby="duplicate-employee-title" className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between bg-amber-500 px-6 py-4 text-white">
              <h3 id="duplicate-employee-title" className="text-sm font-bold">This employee login is already registered</h3>
              <button onClick={() => setDuplicateEmployee(null)} className="text-white/80 hover:text-white" aria-label="Close dialog"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 p-6 text-xs text-slate-600">
              <p>
                No new staff profile was created. Review the existing record below before trying another registration.
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Employee ID</div>
                <div className="mb-3 font-mono text-sm font-bold text-slate-900">{duplicateEmployee.employeeId}</div>
                {duplicateEmployee.record ? (
                  <dl className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-2 border-t border-slate-200 pt-3">
                    <dt className="text-slate-400">Name</dt><dd className="font-semibold text-slate-800">{duplicateEmployee.record.name}</dd>
                    <dt className="text-slate-400">Phone</dt><dd className="text-slate-800">{duplicateEmployee.record.phone}</dd>
                    <dt className="text-slate-400">Email</dt><dd className="break-all text-slate-800">{duplicateEmployee.record.email}</dd>
                    <dt className="text-slate-400">Role</dt><dd className="text-slate-800">{duplicateEmployee.record.role}</dd>
                    <dt className="text-slate-400">Joining date</dt><dd className="text-slate-800">{duplicateEmployee.record.joiningDate || "—"}</dd>
                  </dl>
                ) : (
                  <p className="border-t border-slate-200 pt-3 leading-relaxed">
                    No matching staff profile is available in this staff list. Ask your system administrator to review this Employee ID before registering again.
                  </p>
                )}
              </div>
              <button onClick={() => setDuplicateEmployee(null)} className="w-full rounded-xl bg-[#0F766E] py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-[#0B625C]">
                Close
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}
