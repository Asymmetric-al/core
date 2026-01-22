import { format, differenceInDays, parseISO } from "date-fns";

/**
 * Parses a 'YYYY-MM-DD' string into a local Date object.
 * This avoids timezone shifts that can happen with new Date('YYYY-MM-DD').
 */
export const parseLocalYMD = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
};

/**
 * Formats a date string or Date object into a standard 'MMM d, yyyy' format.
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const d = typeof date === "string" ? parseLocalYMD(date) : date;
  return format(d, "MMM d, yyyy");
};

/**
 * Returns the number of days between today and a given date string.
 */
export const getDaysSince = (dateStr: string): number => {
  if (!dateStr) return 0;
  const date = parseLocalYMD(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(today, date);
};

/**
 * Checks if a date is "overdue" (more than 30 days ago).
 */
export const isOverdue = (dateStr: string, limit = 30): boolean => {
  return getDaysSince(dateStr) > limit;
};
