import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export function daysSince(
  value: string | null | undefined,
  now = new Date(),
): number | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? differenceInCalendarDays(now, parsed) : null;
}

export function formatDate(value: string | Date | null): string {
  if (!value) return "";
  const parsed = typeof value === "string" ? parseISO(value) : value;
  return isValid(parsed) ? format(parsed, "MMM d, yyyy") : "";
}

export const getDaysSince = daysSince;

export function isOverdue(value: string | null, limit = 30): boolean {
  const days = daysSince(value);
  return days === null || days > limit;
}
