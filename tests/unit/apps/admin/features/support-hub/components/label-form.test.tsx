// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LabelForm } from "../../../../../../../apps/admin/features/support-hub/components/labels/LabelForm";
import { LabelManagerDialog } from "../../../../../../../apps/admin/features/support-hub/components/labels/LabelManagerDialog";
const { save } = vi.hoisted(() => ({ save: vi.fn().mockResolvedValue({}) }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportLabel: () => ({ mutateAsync: save, isPending: false }),
    useDeleteSupportLabel: () => ({ mutateAsync: vi.fn() }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({
    useSupportLabels: () => ({
      data: [
        {
          id: "a",
          name: "Receipts",
          slug: "receipts",
          tone: "blue",
          description: "Giving",
        },
        {
          id: "b",
          name: "Care",
          slug: "care",
          tone: "rose",
          description: "Care requests",
        },
      ],
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider",
  () => ({ useConfirm: () => vi.fn() }),
);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("associates an inline required-name error and uses plain colour names", () => {
  const view = render(<LabelForm onSaved={vi.fn()} onCancel={vi.fn()} />);
  const form = view.container.querySelector("form");
  expect(form).not.toBeNull();
  fireEvent.submit(form!);
  expect(screen.getByLabelText("Name").getAttribute("aria-invalid")).toBe(
    "true",
  );
  expect(screen.getByText("Enter a label name.")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Use Red tone" })).toBeTruthy();
  expect(save).not.toHaveBeenCalled();
});
it("resets the editor when switching labels without closing the dialog", async () => {
  render(<LabelManagerDialog open onOpenChange={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Edit Receipts" }));
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Unsaved" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Edit Care" }));
  expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
    "Care",
  );
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "b",
        name: "Care",
        tone: "rose",
        description: "Care requests",
      }),
    ),
  );
});
