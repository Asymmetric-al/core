export type DurationUnit = "minutes" | "hours" | "days";
export interface DurationParts {
  amount: string;
  unit: DurationUnit;
}
const MINUTES = { minutes: 1, hours: 60, days: 1440 };
export const DURATION_ERROR = "Enter a time of at least 1 minute.";
export function toDurationParts(minutes: number): DurationParts {
  const unit =
    minutes % 1440 === 0 ? "days" : minutes % 60 === 0 ? "hours" : "minutes";
  return { amount: String(minutes / MINUTES[unit]), unit };
}
export function durationPartsToMinutes(parts: DurationParts): number | null {
  const minutes = Number(parts.amount) * MINUTES[parts.unit];
  return parts.amount.trim() && Number.isSafeInteger(minutes) && minutes > 0
    ? minutes
    : null;
}
