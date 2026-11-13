import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";

import { isLoggedContact } from "./member-care.derived";

import type { ActivityLogEntry } from "./types";

export function getWeeklyCareContacts(
  activities: ActivityLogEntry[],
  now = new Date(),
) {
  const today = startOfDay(now);
  const buckets = Array.from({ length: 4 }, (_, index) => {
    const start = addDays(today, -27 + index * 7);
    const end = addDays(start, 6);
    return {
      label: format(start, "MMM d"),
      range: `${format(start, "MMM d")}–${format(end, "MMM d")}`,
      contacts: 0,
    };
  });

  for (const activity of activities) {
    if (!isLoggedContact(activity) || activity.isPrivate) continue;
    const daysAgo = differenceInCalendarDays(today, parseISO(activity.date));
    if (!Number.isFinite(daysAgo) || daysAgo < 0 || daysAgo > 27) continue;
    buckets[3 - Math.floor(daysAgo / 7)]!.contacts += 1;
  }

  return buckets;
}
