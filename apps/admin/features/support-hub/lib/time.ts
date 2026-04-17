/**
 * Tiny date helpers shared by selectors and the eventual UI. Wraps the
 * built-in `Date` API rather than `date-fns` to keep this file dependency-free
 * — date-fns is already in the repo and consumers can use it directly when a
 * locale-aware format is needed.
 */
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function isPastDue(
  dueAt: string | null | undefined,
  now: Date | string = new Date(),
): boolean {
  if (!dueAt) return false;
  return toDate(dueAt).getTime() < toDate(now).getTime();
}

export function hoursUntil(
  target: string | null | undefined,
  now: Date | string = new Date(),
): number | null {
  if (!target) return null;
  const diffMs = toDate(target).getTime() - toDate(now).getTime();
  return diffMs / HOUR_MS;
}

export function minutesBetween(
  from: string | null | undefined,
  to: string | null | undefined,
): number | null {
  if (!from || !to) return null;
  const diffMs = toDate(to).getTime() - toDate(from).getTime();
  return diffMs / MINUTE_MS;
}

/**
 * Cheap relative formatter for inbox cards ("4m", "2h", "3d"). The polished UI
 * phase can swap this for a `date-fns` formatter without changing callers.
 */
export function formatRelative(
  value: string | Date,
  now: Date | string = new Date(),
): string {
  const diffMs = toDate(now).getTime() - toDate(value).getTime();
  const absMinutes = Math.round(Math.abs(diffMs) / MINUTE_MS);
  if (absMinutes < 1) return "just now";
  if (absMinutes < 60) return `${absMinutes}m`;
  const hours = Math.round(absMinutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.round(days / 365);
  return `${years}y`;
}
