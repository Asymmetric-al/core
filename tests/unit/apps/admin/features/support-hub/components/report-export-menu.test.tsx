// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ReportExportMenu } from "../../../../../../../apps/admin/features/support-hub/components/reports/ReportExportMenu";
import type { SupportReportSeries } from "../../../../../../../apps/admin/features/support-hub/types";
const download = vi.hoisted(() => vi.fn(() => true));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/report-export",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    downloadReportBlob: download,
  }),
);
afterEach(cleanup);
const series: SupportReportSeries = {
  slice: "volume",
  generatedAt: "2026-11-11T00:00:00Z",
  unit: "count",
  total: 1,
  buckets: [{ key: "day", label: "Day", value: 1, secondaryValue: null }],
};
it("offers CSV and JSON for each visible series", async () => {
  render(
    <ReportExportMenu
      items={[
        { label: "Received", series },
        { label: "Sent", series: { ...series, slice: "messages-sent" } },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Export" }));
  expect(
    await screen.findByRole("menuitem", { name: "Sent (JSON)" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("menuitem", { name: "Received (CSV)" }));
  expect(download).toHaveBeenCalled();
});
it.each(["The report is still loading.", "The report couldn’t load."])(
  "keeps blocked export focusable with a reason: %s",
  (reason) => {
    render(
      <ReportExportMenu
        items={[{ label: "Created", series }]}
        disabled
        disabledReason={reason}
      />,
    );
    const button = screen.getByRole("button", { name: "Export" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button).toHaveProperty("disabled", false);
    expect(button.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText(reason)).toBeTruthy();
    fireEvent.click(button);
    expect(screen.queryByRole("menu")).toBeNull();
  },
);

it("exports successfully loaded zero-activity buckets", async () => {
  render(
    <ReportExportMenu
      items={[
        {
          label: "Created",
          series: {
            ...series,
            total: 0,
            buckets: [{ ...series.buckets[0], value: 0 }],
          },
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Export" }));
  expect(
    await screen.findByRole("menuitem", { name: "Created (CSV)" }),
  ).toBeTruthy();
});
