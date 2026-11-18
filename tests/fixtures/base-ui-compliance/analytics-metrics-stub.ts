// Layout-only data boundary: no session or provider request is made.
export function useAuth() {
  return { profile: { id: "analytics-layout-fixture" }, loading: false };
}

const DAY = 86_400_000;
const daysAgo = (days: number) =>
  new Date(Date.now() - days * DAY).toISOString();

// Completed gifts this year and last, with five-figure totals, so the stat
// cards show real values and comparisons rather than the empty state.
const gifts = [
  { days: 20, donorId: "partner-a", type: "recurring", cents: 1_234_567 },
  { days: 80, donorId: "partner-b", type: "one_time", cents: 987_654 },
  { days: 150, donorId: "partner-a", type: "offline", cents: 456_789 },
  { days: 400, donorId: "partner-a", type: "recurring", cents: 876_543 },
  { days: 500, donorId: "partner-c", type: "one_time", cents: 123_456 },
].map((gift) => ({
  amountCents: gift.cents,
  currency: "USD",
  date: daysAgo(gift.days),
  donorId: gift.donorId,
  type: gift.type,
  status: "completed",
}));

export function useDonationMetrics() {
  return { gifts, isLoading: false, error: null };
}
