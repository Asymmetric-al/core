// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
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
afterEach(cleanup);
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
