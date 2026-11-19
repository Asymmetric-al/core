// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: regression test at the label editor's public UI boundary.
import { LabelForm } from "../../../../../../../apps/admin/features/support-hub/components/labels/LabelForm";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: regression test at the label manager's public UI boundary.
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
it("returns focus to the edited label's Edit button, or to New label, when the inline form closes", async () => {
  render(<LabelManagerDialog open onOpenChange={vi.fn()} />);
  // The dialog focuses its first control one animation frame after it opens.
  // Let it finish opening first: a frame that is still pending would move
  // focus to Edit Receipts after a later step had returned it.
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Edit Receipts" }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Edit Care" }));
  const cancel = screen.getByRole("button", { name: "Cancel" });
  cancel.focus();
  fireEvent.click(cancel);
  expect(screen.queryByLabelText("Name")).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Edit Care" }),
  );

  fireEvent.click(screen.getByRole("button", { name: "Edit Receipts" }));
  const saveChanges = screen.getByRole("button", { name: "Save changes" });
  saveChanges.focus();
  fireEvent.click(saveChanges);
  await waitFor(() => expect(screen.queryByLabelText("Name")).toBeNull());
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Edit Receipts" }),
  );

  fireEvent.click(screen.getByRole("button", { name: "New label" }));
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Urgent" },
  });
  const create = screen.getByRole("button", { name: "Create label" });
  create.focus();
  fireEvent.click(create);
  await waitFor(() => expect(screen.queryByLabelText("Name")).toBeNull());
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "New label" }),
  );
});
