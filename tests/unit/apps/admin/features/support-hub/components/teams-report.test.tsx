// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the teams report's public UI boundary.
import { TeamsReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/TeamsReport";

const filterProps = vi.hoisted(() => ({
  last: null as Record<string, unknown> | null,
  request: vi.fn(),
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-reports",
  () => ({
    useSupportReport: (request: unknown) => {
      filterProps.request(request);
      return {
        data: { total: 0, buckets: [], unit: "count" },
        isLoading: false,
        isReady: true,
        isError: false,
      };
    },
  }),
);

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({ useSupportConversations: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({ useSupportTeams: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-state",
  () => ({
    useSupportReportRouteState: () => ({
      request: (slice: string) => ({ slice }),
      range: {
        from: "2026-01-01T00:00:00.000Z",
        to: "2026-01-31T00:00:00.000Z",
      },
      scope: "all",
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportFilters",
  () => ({
    ReportFilters: (props: Record<string, unknown>) => {
      filterProps.last = props;
      return null;
    },
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportExportMenu",
  () => ({ ReportExportMenu: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportBarChart",
  () => ({ ReportBarChart: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/reports/ReportTable",
  () => ({ ReportTable: () => null }),
);

afterEach(cleanup);

describe("Teams report", () => {
  it("uses the shared team-mix report query for its chart and export", () => {
    render(<TeamsReport />);
    expect(filterProps.request).toHaveBeenCalledWith({ slice: "team-mix" });
  });
  it("offers only the filters the team counts apply: scope, no Group by, no Business hours", () => {
    render(<TeamsReport />);
    expect(filterProps.last).toMatchObject({
      hideGroupBy: true,
      hideBusinessHours: true,
    });
    expect(filterProps.last?.hideScope).toBeFalsy();
  });
});
