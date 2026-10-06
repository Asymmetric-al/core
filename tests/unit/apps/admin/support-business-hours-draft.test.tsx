/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BusinessHoursForm } from "../../../../apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursForm";
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportBusinessHours: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
);
afterEach(cleanup);
describe("business hours coordinated discard", () => {
  it("restores a saved record's name, timezone and default flag together", () => {
    const hours = {
      id: "hours",
      tenantId: "tenant",
      name: "Office hours",
      timezone: "Asia/Bangkok",
      weeklySchedule: [],
      holidays: [],
      isDefault: true,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    };
    const view = render(<BusinessHoursForm hours={hours} />);
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "Unfinished draft" },
    });
    fireEvent.change(view.getByLabelText("Timezone"), {
      target: { value: "UTC" },
    });
    fireEvent.click(
      view.getByRole("switch", { name: "Default business hours" }),
    );
    fireEvent.click(view.getByRole("button", { name: "Discard", exact: true }));
    expect(view.getByLabelText("Name")).toHaveProperty("value", "Office hours");
    expect(view.getByLabelText("Timezone")).toHaveProperty(
      "value",
      "Asia/Bangkok",
    );
    expect(
      view
        .getByRole("switch", { name: "Default business hours" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });
  it("restores new-form defaults after editing", () => {
    const view = render(<BusinessHoursForm />);
    fireEvent.change(view.getByLabelText("Name"), {
      target: { value: "Unfinished draft" },
    });
    fireEvent.change(view.getByLabelText("Timezone"), {
      target: { value: "Asia/Bangkok" },
    });
    fireEvent.click(view.getByRole("button", { name: "Discard", exact: true }));
    expect(view.getByLabelText("Name")).toHaveProperty(
      "value",
      "Standard support hours",
    );
    expect(view.getByLabelText("Timezone")).toHaveProperty("value", "UTC");
  });
});
