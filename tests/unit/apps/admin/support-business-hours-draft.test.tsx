/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BusinessHoursList } from "../../../../apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursList";

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

const confirm = vi.hoisted(() => vi.fn());

vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportBusinessHours: () => ({
      data: [hours],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportBusinessHours: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useDeleteSupportBusinessHours: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => confirm }),
);
afterEach(() => {
  cleanup();
  confirm.mockReset();
});

function field(name: string): HTMLInputElement {
  return within(screen.getByRole("dialog")).getByLabelText(
    name,
  ) as HTMLInputElement;
}

async function discard() {
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }),
  );
  const prompt = await screen.findByRole("alertdialog", {
    name: "Discard unsaved changes?",
  });
  fireEvent.click(
    within(prompt).getByRole("button", { name: "Discard changes" }),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
}

describe("business hours discard", () => {
  it("reopens a saved record with its name, timezone and default flag together", async () => {
    render(<BusinessHoursList />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Office hours" }));
    fireEvent.change(field("Name"), { target: { value: "Unfinished draft" } });
    fireEvent.change(field("Timezone"), { target: { value: "UTC" } });
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("switch", {
        name: "Default business hours",
      }),
    );
    await discard();

    fireEvent.click(screen.getByRole("button", { name: "Edit Office hours" }));
    expect(field("Name").value).toBe("Office hours");
    expect(field("Timezone").value).toBe("Asia/Bangkok");
    expect(
      within(screen.getByRole("dialog"))
        .getByRole("switch", { name: "Default business hours" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("reopens a new schedule with the new-form defaults", async () => {
    render(<BusinessHoursList />);
    fireEvent.click(screen.getByRole("button", { name: "New schedule" }));
    fireEvent.change(field("Name"), { target: { value: "Unfinished draft" } });
    fireEvent.change(field("Timezone"), { target: { value: "Asia/Bangkok" } });
    await discard();

    fireEvent.click(screen.getByRole("button", { name: "New schedule" }));
    expect(field("Name").value).toBe("Standard support hours");
    expect(field("Timezone").value).toBe("UTC");
  });
});
