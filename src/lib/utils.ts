import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric amount in FCFA (XOF)
 * Example: 1500000 -> "1 500 000 FCFA"
 */
export function formatFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 FCFA";
  }
  const rounded = Math.round(amount);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} FCFA`;
}

/**
 * Format date in French format (JJ/MM/AAAA)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Format date with time (JJ/MM/AAAA HH:mm)
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Helper to calculate VAT and totals
 */
export function calculateTotals(subtotalHT: number, vatRate: number = 19.0, discount: number = 0) {
  const discountedHT = Math.max(0, subtotalHT - discount);
  const taxAmount = Math.round(discountedHT * (vatRate / 100));
  const totalTTC = discountedHT + taxAmount;
  return {
    subtotalHT,
    discountedHT,
    vatRate,
    taxAmount,
    totalTTC,
  };
}
