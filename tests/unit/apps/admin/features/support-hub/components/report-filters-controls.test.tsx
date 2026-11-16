// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the report filters' public UI boundary.
import { ReportFilters } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportFilters";
// nuqs is installed in the admin workspace, not hoisted to the repo root.
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
import { NuqsTestingAdapter } from "../../../../../../../apps/admin/node_modules/nuqs/dist/adapters/testing.js";

afterEach(cleanup);

describe("ReportFilters controls", () => {
  it("offers Group by and Business hours only by default", () => {
    render(
      <NuqsTestingAdapter>
        <ReportFilters hideScope />
      </NuqsTestingAdapter>,
    );
    expect(screen.getByText("Group by")).toBeTruthy();
    expect(
      screen.getByRole("switch", { name: "Business hours only" }),
    ).toBeTruthy();
  });

  it("drops Group by and Business hours only for a report that ignores them", () => {
    render(
      <NuqsTestingAdapter>
        <ReportFilters hideScope hideGroupBy hideBusinessHours />
      </NuqsTestingAdapter>,
    );
    expect(screen.queryByText("Group by")).toBeNull();
    expect(
      screen.queryByRole("switch", { name: "Business hours only" }),
    ).toBeNull();
    // The window still applies.
    expect(screen.getByLabelText("From")).toBeTruthy();
    expect(screen.getByLabelText("To")).toBeTruthy();
  });
});
