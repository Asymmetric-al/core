export function deriveRegistrationCapacity({
  capacity,
  registrants,
}: {
  capacity: number;
  registrants: number;
}) {
  const safeCapacity = Number.isFinite(capacity) ? Math.max(0, capacity) : 0;
  const safeRegistrants = Number.isFinite(registrants)
    ? Math.max(0, registrants)
    : 0;

  if (safeCapacity <= 0) {
    return {
      capacityLabel: "Capacity not set",
      progressValue: 0,
      seatsRemainingLabel: "Capacity not set",
    };
  }

  return {
    capacityLabel: safeCapacity.toLocaleString(),
    progressValue: Math.min(100, (safeRegistrants / safeCapacity) * 100),
    seatsRemainingLabel: `${Math.max(
      0,
      safeCapacity - safeRegistrants,
    ).toLocaleString()} seats remaining`,
  };
}
