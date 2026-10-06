/** Evaluate on demand so long-lived server modules do not freeze the calendar year. */
export function getHistoryYearOptions(now = new Date()): string[] {
  const year = now.getFullYear();
  return Array.from({ length: 5 }, (_, index) => String(year - index));
}
