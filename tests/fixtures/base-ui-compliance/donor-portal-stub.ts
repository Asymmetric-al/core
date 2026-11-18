/** No donor snapshot in the header fixture; the header falls back to auth. */
export function useDonorPortalSnapshot() {
  return { data: undefined };
}

/** No missionary snapshot in the sidebar fixture, so no overdue badge. */
export function useMissionaryPortalSnapshot() {
  return { data: undefined };
}

export function usePendingFollowRequestCount() {
  return { data: 0 };
}
