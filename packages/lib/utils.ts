/**
 * Formats a number as USD currency.
 *
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.5) // "$1,234.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Extracts initials from a name string.
 *
 * @param name - Full name string
 * @returns Uppercase initials (e.g., "JD" for "John Doe")
 *
 * @example
 * getInitials('John Doe') // "JD"
 * getInitials('Jane') // "J"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classnames with precedence.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
