const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const MORNING_HOUR = 8;

export type SupportSnoozeOptionKey =
  "in-1-hour" | "in-4-hours" | "tomorrow-morning" | "in-7-days";

export const SUPPORT_SNOOZE_OPTIONS: ReadonlyArray<{
  key: SupportSnoozeOptionKey;
  label: string;
}> = [
  { key: "in-1-hour", label: "In 1 hour" },
  { key: "in-4-hours", label: "In 4 hours" },
  { key: "tomorrow-morning", label: "Tomorrow morning" },
  { key: "in-7-days", label: "In 7 days" },
];

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function resolveSnoozeUntil(
  key: SupportSnoozeOptionKey,
  now: Date | string,
): Date {
  const from = toDate(now);
  switch (key) {
    case "in-1-hour":
      return new Date(from.getTime() + HOUR_MS);
    case "in-4-hours":
      return new Date(from.getTime() + 4 * HOUR_MS);
    case "tomorrow-morning":
      return new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate() + 1,
        MORNING_HOUR,
      );
    case "in-7-days":
      return new Date(from.getTime() + 7 * DAY_MS);
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}

export function snoozeUntilFromNow(
  key: SupportSnoozeOptionKey,
  now: Date | string = new Date(),
): string {
  return resolveSnoozeUntil(key, now).toISOString();
}

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function formatSnoozeTime(
  target: Date | string,
  now: Date | string,
): string {
  const wake = toDate(target);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(wake);
  const days = Math.round(
    (startOfLocalDay(wake) - startOfLocalDay(toDate(now))) / DAY_MS,
  );
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  const day = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(wake);
  return `${day}, ${time}`;
}
