// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Returns a short human-readable label for a savings amount */
export function savingsLabel(monthly: number): string {
  if (monthly <= 0) return "Already optimized";
  if (monthly < 100) return `${formatCurrency(monthly)}/mo in savings`;
  if (monthly < 500) return `${formatCurrency(monthly)}/mo — solid savings`;
  return `${formatCurrency(monthly)}/mo — significant overspend`;
}
