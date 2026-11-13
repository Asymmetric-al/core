export const LOCATION_TYPE_LABELS = {
  missionary: "Missionary",
  project: "Project",
  custom: "Custom",
  partner: "Partner",
} as const;

export const LOCATION_TYPE_OPTIONS = (
  Object.keys(LOCATION_TYPE_LABELS) as Array<keyof typeof LOCATION_TYPE_LABELS>
).map((value) => ({ value, label: LOCATION_TYPE_LABELS[value] }));

const LOCATION_TYPE_TONES = {
  missionary: "bg-primary",
  project: "bg-info",
  custom: "bg-muted-foreground",
  partner: "bg-warning",
} as const;

export function isLocationType(
  value: string,
): value is keyof typeof LOCATION_TYPE_LABELS {
  return Object.hasOwn(LOCATION_TYPE_LABELS, value);
}

export function getLocationTypeLabel(value: string) {
  return isLocationType(value) ? LOCATION_TYPE_LABELS[value] : value;
}

export function getLocationTypeTone(value: string) {
  return isLocationType(value)
    ? LOCATION_TYPE_TONES[value]
    : "bg-muted-foreground";
}
