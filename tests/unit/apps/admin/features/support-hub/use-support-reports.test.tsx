// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { useSupportReport } from "../../../../../../apps/admin/features/support-hub/hooks/use-support-reports";
import type { SupportReportRequest } from "../../../../../../apps/admin/features/support-hub/types";

const state = vi.hoisted(() => ({
  teams: {
    data: [{ id: "care", name: "Care" }],
    isReady: true,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  query: {
    data: { conversations: [], messages: [] },
    isSuccess: true,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  labels: {
    data: [],
    isReady: true,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  hours: {
    data: [],
    isReady: true,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock(
  "../../../../../../apps/admin/node_modules/@tanstack/react-query/build/modern/index.js",
  () => ({ useQuery: () => state.query }),
);
vi.mock(
  "../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportTeams: () => state.teams }),
);
vi.mock(
  "../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => state.labels }),
);
vi.mock(
  "../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({ useSupportBusinessHours: () => state.hours }),
);

const request: SupportReportRequest = {
  slice: "volume",
  scope: { kind: "team" },
  range: { from: "2026-04-01T00:00:00.000Z", to: "2026-05-01T00:00:00.000Z" },
  groupBy: "day",
  businessHoursOnly: false,
};
beforeEach(() => {
  Object.assign(state.teams, {
    isReady: true,
    isLoading: false,
    isError: false,
  });
  for (const source of [state.query, state.labels, state.hours]) {
    source.isLoading = false;
    source.isError = false;
    source.refetch.mockClear();
  }
});
afterEach(cleanup);

it("keeps an unselected team report unavailable instead of presenting All as the team", () => {
  const { result } = renderHook(() => useSupportReport(request));
  expect(result.current.isReady).toBe(false);
  expect(result.current.isLoading).toBe(true);
});

it("gates a team scope on the teams lookup and retries that failed dependency", async () => {
  state.teams.isError = true;
  state.teams.isReady = false;
  const { result } = renderHook(() =>
    useSupportReport({ ...request, scope: { kind: "team", id: "care" } }),
  );
  expect(result.current.isError).toBe(true);
  await result.current.refetch();
  expect(state.teams.refetch).toHaveBeenCalledOnce();
  expect(state.query.refetch).not.toHaveBeenCalled();
});
