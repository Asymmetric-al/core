import type { SupportMessage } from "../../../types";

export type TimelineEntryKind = "email" | "note" | "draft" | "activity";

export interface TimelineEntry {
  /** Stable key for React rendering. */
  id: string;
  kind: TimelineEntryKind;
  message: SupportMessage;
  /** Local-day grouping label ("Today", "Yesterday", or `MMM d, yyyy`). */
  dayLabel: string;
  /** ISO start-of-day for the entry; used to group consecutive entries. */
  dayKey: string;
  /** True for the first entry of each day group. */
  isFirstOfDay: boolean;
}

export interface MergeOptions {
  /** Stable "now" used to compute Today / Yesterday day labels. */
  nowIso: string;
}

/**
 * Sort messages chronologically (oldest first) and tag each one with the
 * timeline entry kind plus a day-grouping key. Pure: same inputs always
 * produce the same output, so the function is safe to call during render.
 */
export function mergeTimeline(
  messages: SupportMessage[],
  options: MergeOptions,
): TimelineEntry[] {
  const sorted = [...messages].sort((left, right) => {
    if (left.postedAt === right.postedAt) {
      return left.id.localeCompare(right.id);
    }
    return left.postedAt < right.postedAt ? -1 : 1;
  });

  const now = new Date(options.nowIso);
  const today = startOfDayKey(now);
  const yesterday = startOfDayKey(addDays(now, -1));
  let lastDayKey = "";

  return sorted.map((message) => {
    const posted = new Date(message.postedAt);
    const dayKey = startOfDayKey(posted);
    const isFirstOfDay = dayKey !== lastDayKey;
    lastDayKey = dayKey;

    return {
      id: message.id,
      kind: classifyMessage(message),
      message,
      dayKey,
      dayLabel: labelForDay(dayKey, today, yesterday, posted),
      isFirstOfDay,
    };
  });
}

export function classifyMessage(message: SupportMessage): TimelineEntryKind {
  if (message.type === "system") return "activity";
  if (message.type === "note") return "note";
  if (message.deliveryState === "draft") return "draft";
  return "email";
}

function startOfDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, delta: number): Date {
  const next = new Date(date.getTime());
  next.setDate(date.getDate() + delta);
  return next;
}

const LONG_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function labelForDay(
  dayKey: string,
  todayKey: string,
  yesterdayKey: string,
  rawDate: Date,
): string {
  if (dayKey === todayKey) return "Today";
  if (dayKey === yesterdayKey) return "Yesterday";
  return LONG_DATE_FORMAT.format(rawDate);
}
