// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the labels report's public UI boundary.
import { LabelsReport } from "../../../../../../../apps/admin/features/support-hub/components/reports/surfaces/LabelsReport";

const filterProps = vi.hoisted(() => ({
  last: null as Record<string, unknown> | null,
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-reports",
  () => ({ useSupportReport: () => ({ data: undefined }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-state",
  () => ({ useSupportReportRouteState: () => ({ request: () => ({}) }) }),
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

describe("Labels report", () => {
  it("offers only the filters the label mix applies: scope, no Group by, no Business hours", () => {
    render(<LabelsReport />);
    expect(filterProps.last).toMatchObject({
      hideGroupBy: true,
      hideBusinessHours: true,
    });
    expect(filterProps.last?.hideScope).toBeFalsy();
  });
});
