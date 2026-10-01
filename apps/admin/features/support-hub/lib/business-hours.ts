import { normalizeSupportClockTime } from "@asym/database/collections/support-hub.schema";

import type { SupportBusinessHours } from "../types";

/**
 * Day of week index (Monday = 0 ... Sunday = 6) used by the weekly schedule
 * entries. We pick Monday-first to match the way the UI renders the schedule
 * and to keep weekends contiguous for the off-hours filter.
 */
const DAY_ORDER: SupportBusinessHours["weeklySchedule"][number]["day"][] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function mondayFirstIndex(date: Date): number {
  const sundayFirst = date.getUTCDay();
  return (sundayFirst + 6) % 7;
}

function parseClock(value: string): { hours: number; minutes: number } | null {
  const normalized = normalizeSupportClockTime(value);
  if (!normalized) return null;
  const [hoursRaw, minutesRaw] = normalized.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return { hours, minutes };
}

/**
 * Returns true when `iso` falls inside the weekly schedule of `hours` and is
 * not a holiday. Pure: no timezone math beyond what UTC offers — the schedule
 * is interpreted as if it were authored in UTC because our mock data has no
 * tenant timezone plumbing yet. Phase 7 will pipe the tenant timezone in.
 */
export function isWithinBusinessHours(
  hours: SupportBusinessHours,
  iso: string,
): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;

  const dateKey = date.toISOString().slice(0, 10);
  if (hours.holidays.some((holiday) => holiday.date.startsWith(dateKey))) {
    return false;
  }

  const dayIndex = mondayFirstIndex(date);
  const dayName = DAY_ORDER[dayIndex];
  const dayEntry = hours.weeklySchedule.find((entry) => entry.day === dayName);
  if (!dayEntry || !dayEntry.enabled) return false;

  const open = parseClock(dayEntry.openTime);
  const close = parseClock(dayEntry.closeTime);
  if (!open || !close) return false;

  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const openMinutes = open.hours * 60 + open.minutes;
  const closeMinutes = close.hours * 60 + close.minutes;
  return minutes >= openMinutes && minutes < closeMinutes;
}

/**
 * Counts the number of minutes between `start` and `end` that fall inside
 * business hours. Steps minute-by-minute for simplicity (the mock data sets
 * are small); Phase 7 can replace this with a faster interval-intersect
 * implementation when real data volumes warrant it.
 */
export function minutesWithinBusinessHours(
  hours: SupportBusinessHours,
  startIso: string,
  endIso: string,
): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (end <= start) return 0;
  let count = 0;
  const stepMs = 60 * 1000;
  for (let cursor = start.getTime(); cursor < end.getTime(); cursor += stepMs) {
    if (isWithinBusinessHours(hours, new Date(cursor).toISOString())) {
      count += 1;
    }
  }
  return count;
}

/**
 * Returns a filter predicate that keeps only values whose timestamps fall
 * inside the supplied business hours. When `hours` is `null`, the predicate
 * returns `true` for every value so the caller can default to "always on".
 */
export function businessHoursPredicate(
  hours: SupportBusinessHours | null,
): (iso: string | null | undefined) => boolean {
  if (!hours) return () => true;
  return (iso) => {
    if (!iso) return false;
    return isWithinBusinessHours(hours, iso);
  };
}
