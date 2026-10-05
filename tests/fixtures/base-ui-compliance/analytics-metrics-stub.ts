// Layout-only data boundary: no session or provider request is made.
export function useAuth() {
  return { profile: { id: "analytics-layout-fixture" }, loading: false };
}

export function useDonationMetrics() {
  return { monthlyBreakdown: [], isLoading: false, error: null };
}
