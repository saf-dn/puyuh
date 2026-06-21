// ─── Date Helpers ────────────────────────────────────────────────

export function getCurrentDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export function getMonthName(month: number): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return months[month - 1] || "";
}

export function getMonthYear(year: number, month: number): string {
  return `${getMonthName(month)} ${year}`;
}

/** Returns ISO date strings for the first and last day of the month. */
export function getDateRange(year: number, month: number) {
  return {
    start: new Date(year, month - 1, 1).toISOString().split("T")[0],
    end: new Date(year, month, 0).toISOString().split("T")[0],
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// ─── Number / Currency Helpers ───────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

// ─── Store Helpers ───────────────────────────────────────────────

/** Extracts a human-readable message from any thrown value. */
export function storeError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
