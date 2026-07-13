const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a value for display in the user's local timezone.
 *
 * `new Date("2026-06-11")` is parsed as UTC midnight, which renders as the
 * previous day in timezones west of UTC. Date-only strings are therefore
 * parsed into local-time components; everything else defers to `new Date`.
 */
export function makeDisplayDate(value?: string | number | Date): Date {
  if (value === undefined) {
    return new globalThis.Date();
  }
  if (typeof value === "string") {
    const match = DATE_ONLY_PATTERN.exec(value);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new globalThis.Date(year, month - 1, day);
      }
    }
  }
  return new globalThis.Date(value);
}

/** Today's date as a YYYY-MM-DD string in the user's local timezone. */
export function todayDateInputValue(): string {
  const now = new globalThis.Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
