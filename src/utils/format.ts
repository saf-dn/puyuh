import { differenceInMonths, differenceInDays, addMonths } from "date-fns";

// ─── Date Helpers ────────────────────────────────────────────────

export function getLocalIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentDate(): string {
  return getLocalIsoDate(new Date());
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
    start: getLocalIsoDate(new Date(year, month - 1, 1)),
    end: getLocalIsoDate(new Date(year, month, 0)),
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function calculateAge(initialAgeMonths: number, createdAt: string): string {
  const startDate = new Date(createdAt);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  
  if (endDate < startDate) {
    return `${initialAgeMonths} bulan`;
  }
  
  const elapsedMonths = differenceInMonths(endDate, startDate);
  const dateAfterMonths = addMonths(startDate, elapsedMonths);
  const elapsedDays = differenceInDays(endDate, dateAfterMonths);
  
  const totalMonths = initialAgeMonths + elapsedMonths;
  
  if (elapsedDays === 0) {
    return `${totalMonths} bulan`;
  }
  return `${totalMonths} bulan ${elapsedDays} hari`;
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
