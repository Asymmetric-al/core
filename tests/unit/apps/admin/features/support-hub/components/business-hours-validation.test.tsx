// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BusinessHoursForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/business-hours/BusinessHoursForm";
const mocks = vi.hoisted(() => ({
  save: vi.fn().mockResolvedValue("schedule-1"),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportBusinessHours: () => ({
      mutateAsync: mocks.save,
      isPending: false,
    }),
  }),
);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("blocks reversed intervals and focuses the labelled closing time", async () => {
  render(<BusinessHoursForm />);
  fireEvent.change(screen.getByLabelText("Monday closing time"), {
    target: { value: "08:00" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));
  expect(
    await screen.findByText("Closing time must be after opening time."),
  ).toBeTruthy();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByLabelText("Monday closing time"),
    ),
  );
  expect(mocks.save).not.toHaveBeenCalled();
});
it("adds a local-calendar holiday with an empty focused name, handles clear, and trims on save", async () => {
  render(<BusinessHoursForm />);
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  const name = await screen.findByLabelText<HTMLInputElement>("Holiday 1 name");
  await waitFor(() => expect(document.activeElement).toBe(name));
  expect(name.value).toBe("");
  const date = screen.getByLabelText<HTMLInputElement>("Holiday 1 date");
  const today = new Date();
  expect(date.value).toBe(
    [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-"),
  );
  fireEvent.change(date, { target: { value: "" } });
  fireEvent.change(name, { target: { value: "  Office closed  " } });
  fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));
  expect(await screen.findByText("Choose a valid holiday date.")).toBeTruthy();
  expect(mocks.save).not.toHaveBeenCalled();
  fireEvent.change(date, { target: { value: "2026-12-25" } });
  fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        holidays: [
          expect.objectContaining({
            label: "Office closed",
            date: "2026-12-25T00:00:00.000Z",
          }),
        ],
      }),
    ),
  );
});

it("labels holiday removal and blocks missing names and enabled opening times", async () => {
  render(<BusinessHoursForm />);
  fireEvent.change(screen.getByLabelText("Monday opening time"), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(screen.getByRole("button", { name: "Remove holiday 1" })).toBeTruthy();
  expect(
    screen.getByLabelText("Holiday 1 name").getAttribute("placeholder"),
  ).toBe("Holiday name");
  fireEvent.click(screen.getByRole("button", { name: "Create schedule" }));
  expect(await screen.findByText("Enter a holiday name.")).toBeTruthy();
  const opening = screen.getByLabelText("Monday opening time");
  expect(opening.getAttribute("aria-invalid")).toBe("true");
  await waitFor(() => expect(document.activeElement).toBe(opening));
  expect(mocks.save).not.toHaveBeenCalled();
});
