interface ReportStatus {
  isError?: boolean;
  isLoading?: boolean;
  isReady?: boolean;
  refetch?: () => unknown;
}
export function combineReportStatus(states: ReportStatus[]) {
  return {
    isError: states.some((state) => state.isError),
    isLoading: states.some(
      (state) => state.isLoading || state.isReady === false,
    ),
    retry: () => {
      for (const state of states) if (state.isError) void state.refetch?.();
    },
  };
}
