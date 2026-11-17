// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report surface regression.
import { ReportSummaryCards } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportSummaryCards";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report surface regression.
import { OverviewReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/OverviewReport";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report surface regression.
import { InboxReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/InboxReport";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report surface regression.
import { AgentsReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/AgentsReport";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report surface regression.
import { LabelsReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/LabelsReport";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Report surface regression.
import { TeamsReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/TeamsReport";
const state = vi.hoisted(() => ({
  isError: true,
  isLoading: false,
  isReady: false,
  refetch: vi.fn(),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-reports",
  () => ({
    useSupportReport: () => ({
      ...state,
      data: {
        total: 0,
        buckets: [{ key: "day", label: "Day", value: 0 }],
        unit: "count",
      },
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportTeams: () => ({ ...state, data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({ useSupportConversations: () => ({ ...state, data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-state",
  () => ({
    useSupportReportRouteState: () => ({
      request: (slice: string) => slice,
      range: { from: "2026-01-01", to: "2026-02-01" },
      scope: { kind: "all" },
      state: { groupBy: "day" },
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportFilters",
  () => ({
    ReportFilters: ({ trailing }: { trailing: React.ReactNode }) => trailing,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportExportMenu",
  () => ({
    ReportExportMenu: ({ disabled }: { disabled: boolean }) => (
      <button disabled={disabled}>Export</button>
    ),
  }),
);
beforeEach(() => {
  // A loaded report's table sits on the shared data grid, which reads the
  // viewport and its own width.
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  state.refetch.mockReset();
  Object.assign(state, { isError: true, isLoading: false, isReady: false });
});
const surfaces = [
  [OverviewReport, "In this range"],
  [InboxReport, "In this range"],
  [AgentsReport, "Conversations per agent"],
  [LabelsReport, "Conversations per label"],
  [TeamsReport, "Conversations per team"],
] as const;
function holdRefetches() {
  const settles: Array<(value: unknown) => void> = [];
  state.refetch.mockImplementation(
    () => new Promise((resolve) => settles.push(resolve)),
  );
  return (value: unknown) =>
    act(async () => {
      for (const settle of settles.splice(0)) settle(value);
    });
}
function startRetry() {
  const retry = screen.getByRole("button", { name: "Try again" });
  retry.focus();
  fireEvent.click(retry);
  return retry;
}
it.each([OverviewReport, InboxReport, AgentsReport, LabelsReport, TeamsReport])(
  "blocks fabricated zero series and export when %s fails",
  (Surface) => {
    Object.assign(state, { isError: true, isLoading: false });
    state.refetch.mockClear();
    render(<Surface />);
    expect(screen.getByRole("button", { name: "Export" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(screen.queryAllByText("0")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(state.refetch).toHaveBeenCalled();
  },
);
it.each(surfaces)(
  "says it is trying again, then focuses the %o report's first heading once it loads",
  async (Surface, heading) => {
    const settle = holdRefetches();
    const { container, rerender } = render(<Surface />);
    const retry = startRetry();
    expect(screen.getByRole("button", { name: "Trying again…" })).toBe(retry);
    expect(retry.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(retry);
    const calls = state.refetch.mock.calls.length;
    fireEvent.click(retry);
    expect(state.refetch).toHaveBeenCalledTimes(calls);
    await settle([{ isError: false }]);
    Object.assign(state, { isError: false, isReady: true });
    rerender(<Surface />);
    const target = screen.getByRole("heading", { name: heading });
    expect(document.activeElement).toBe(target);
    expect(container.contains(target)).toBe(true);
  },
);
it("focuses the loaded heading when the report settles before the retry promise", async () => {
  const settle = holdRefetches();
  const { rerender } = render(<LabelsReport />);
  startRetry();
  Object.assign(state, { isError: false, isReady: true });
  rerender(<LabelsReport />);
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Conversations per label" }),
  );
  await settle([{ isError: false }]);
});
it.each(surfaces)(
  "announces a repeat %o failure again and puts focus back on Try again",
  async (Surface) => {
    const settle = holdRefetches();
    const page = () => (
      <>
        <button type="button">Elsewhere</button>
        <Surface />
      </>
    );
    const { rerender } = render(page());
    const alert = screen.getByRole("alert");
    startRetry();
    await settle([{ isError: true }]);
    expect(screen.getByRole("alert")).not.toBe(alert);
    const again = screen.getByRole("button", { name: "Try again" });
    expect(again.getAttribute("aria-disabled")).not.toBe("true");
    expect(document.activeElement).toBe(again);
    // A later recovery the person did not ask for leaves their focus alone.
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.focus();
    Object.assign(state, { isError: false, isReady: true });
    rerender(page());
    expect(document.activeElement).toBe(elsewhere);
  },
);
it("leaves focus where the person moved it while the retry ran", async () => {
  const settle = holdRefetches();
  const page = () => (
    <>
      <button type="button">Elsewhere</button>
      <TeamsReport />
    </>
  );
  const { rerender } = render(page());
  startRetry();
  const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
  elsewhere.focus();
  await settle([{ isError: false }]);
  Object.assign(state, { isError: false, isReady: true });
  rerender(page());
  expect(document.activeElement).toBe(elsewhere);
});
it.each([OverviewReport, InboxReport, AgentsReport, LabelsReport, TeamsReport])(
  "keeps export disabled while %s loads",
  (Surface) => {
    Object.assign(state, { isError: false, isLoading: true });
    render(<Surface />);
    expect(screen.getByRole("button", { name: "Export" })).toHaveProperty(
      "disabled",
      true,
    );
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryAllByText("0")).toHaveLength(0);
  },
);
it.each([
  [OverviewReport, 3],
  [InboxReport, 4],
] as const)(
  "says Loading once per summary card while %o loads",
  (Surface, cards) => {
    Object.assign(state, { isError: false, isLoading: true });
    render(<Surface />);
    const summary = within(
      screen.getByRole("region", { name: "Report summary" }),
    );
    expect(summary.queryAllByText("Loading")).toHaveLength(cards);
    expect(summary.queryAllByText("Loading…")).toHaveLength(0);
  },
);
it("hides Overview card helpers computed from placeholder data while loading", () => {
  Object.assign(state, { isError: false, isLoading: true });
  render(<OverviewReport />);
  const summary = within(
    screen.getByRole("region", { name: "Report summary" }),
  );
  expect(summary.queryByText("No replies in this range")).toBeNull();
  expect(summary.queryByText("None resolved in this range")).toBeNull();
});
it("marks each summary card not available when its totals fail", () => {
  render(
    <ReportSummaryCards
      isError
      cards={[
        { label: "Created", value: 0, helper: "New conversations" },
        { label: "Waiting", value: 0, tone: "attention" },
      ]}
    />,
  );
  const summary = within(
    screen.getByRole("region", { name: "Report summary" }),
  );
  expect(summary.getAllByText("Not available")).toHaveLength(2);
  expect(summary.getAllByText("Couldn't load this report total.")).toHaveLength(
    2,
  );
  expect(summary.queryAllByText("0")).toHaveLength(0);
  expect(summary.queryByText("Needs attention")).toBeNull();
});
