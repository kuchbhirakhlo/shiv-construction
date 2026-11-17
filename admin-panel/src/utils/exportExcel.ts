import * as XLSX from "xlsx";

// Generic Excel export helper shared by the admin pages.
// Each sheet is an array of plain row objects — keys become the header row.
export interface ExcelSheet {
  name: string; // sheet tab name (max 31 chars, enforced below)
  rows: Record<string, string | number>[];
}

// Formats a Firestore Timestamp / Date / ISO string into "DD Mon YYYY, HH:MM".
export function formatExportDate(value: any): string {
  if (!value) return "—";
  let d: Date;
  if (typeof value?.toDate === "function") {
    d = value.toDate(); // Firestore Timestamp
  } else if (typeof value?.seconds === "number") {
    d = new Date(value.seconds * 1000); // serialized Timestamp
  } else {
    d = new Date(value);
  }
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Builds a workbook from one or more sheets and triggers a browser download.
export function exportToExcel(fileName: string, sheets: ExcelSheet[]) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, rows }) => {
    const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: "No data" }]);

    // Auto-size columns to the widest cell (capped so huge text doesn't blow up the sheet).
    const headers = rows.length ? Object.keys(rows[0]) : ["Note"];
    ws["!cols"] = headers.map((h) => {
      const maxLen = Math.max(h.length, ...rows.map((r) => String(r[h] ?? "").length));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
    });

    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileName}_${stamp}.xlsx`);
}
