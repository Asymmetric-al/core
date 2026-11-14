/**
 * One way to show a Support Hub duration everywhere (inbox cards, reports,
 * SLA targets): minutes under an hour, hours under a day, then days.
 * Returns an em dash for a missing or zero duration.
 */
export function formatSupportDuration(minutes: number | null | undefined) {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) {
    return "—";
  }
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours * 10) / 10} h`;
  return `${Math.round((hours / 24) * 10) / 10} d`;
}
