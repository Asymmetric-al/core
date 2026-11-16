// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ConfirmProvider } from "../../../../../../../apps/admin/features/support-hub/components/workspace/confirm-provider";
import { LabelsSettingsPanel } from "../../../../../../../apps/admin/features/support-hub/components/settings/labels/LabelsSettingsPanel";
import { LabelForm } from "../../../../../../../apps/admin/features/support-hub/components/labels/LabelForm";
import { MacroPreviewLine } from "../../../../../../../apps/admin/features/support-hub/components/macros/MacroPreviewLine";
import { DeleteSavedViewConfirm } from "../../../../../../../apps/admin/features/support-hub/components/views/DeleteSavedViewConfirm";
import type { SupportSavedView } from "../../../../../../../apps/admin/features/support-hub/types";
const mocks = vi.hoisted(() => ({
  save: vi.fn().mockResolvedValue("label"),
  remove: vi.fn(),
  loading: true,
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useDeleteSupportLabel: () => ({
      mutateAsync: mocks.remove,
      isPending: false,
    }),
    useSaveSupportLabel: () => ({ mutateAsync: mocks.save, isPending: false }),
    useDeleteSupportSavedView: () => ({
      mutateAsync: mocks.remove,
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: [], isLoading: mocks.loading }),
    useSupportTeams: () => ({ data: [], isLoading: mocks.loading }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [], isLoading: mocks.loading }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({
    useSupportCannedResponses: () => ({ data: [], isLoading: mocks.loading }),
  }),
);
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.loading = true;
});
it("reports label draft changes and saves a non-Latin label with a nonempty slug", async () => {
  const onStateChange = vi.fn();
  render(
    <LabelForm
      onSaved={vi.fn()}
      onCancel={vi.fn()}
      onStateChange={onStateChange}
    />,
  );
  expect(onStateChange).toHaveBeenLastCalledWith({
    hasChanges: false,
    isSaving: false,
  });
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "ช่วยเหลือ" },
  });
  expect(onStateChange).toHaveBeenLastCalledWith({
    hasChanges: true,
    isSaving: false,
  });
  expect(
    screen.getByLabelText("Name").closest("form")?.className,
  ).not.toContain("border");
  fireEvent.click(screen.getByRole("button", { name: "Create label" }));
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ช่วยเหลือ",
        slug: expect.stringMatching(/^label-.+/),
      }),
    ),
  );
});
it("does not call loading macro targets unavailable", () => {
  const { rerender } = render(
    <MacroPreviewLine
      actions={[
        { kind: "assign_agent", agentId: "agent-1" },
        { kind: "add_label", labelId: "label-1" },
        { kind: "send_canned_response", cannedResponseId: "response-1" },
      ]}
    />,
  );
  expect(screen.queryByText(/unavailable/)).toBeNull();
  expect(screen.getByText("Assign agent")).toBeTruthy();
  mocks.loading = false;
  rerender(
    <MacroPreviewLine
      actions={[{ kind: "assign_agent", agentId: "agent-1" }]}
    />,
  );
  expect(screen.getByText("Assign agent: Agent unavailable")).toBeTruthy();
});
it("keeps failed view deletion open, blocks duplicate deletion, and permits retry", async () => {
  let reject!: (error: Error) => void;
  mocks.remove
    .mockImplementationOnce(
      () =>
        new Promise((_resolve, rejectPromise) => {
          reject = rejectPromise;
        }),
    )
    .mockResolvedValueOnce(undefined);
  const close = vi.fn();
  render(
    <DeleteSavedViewConfirm
      view={{ id: "view-1", name: "My view" } as SupportSavedView}
      onClose={close}
    />,
  );
  fireEvent.click(await screen.findByRole("button", { name: "Delete view" }));
  expect(
    screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Delete view" }));
  fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
  expect(close).not.toHaveBeenCalled();
  expect(mocks.remove).toHaveBeenCalledTimes(1);
  reject(new Error("Failed"));
  await screen.findByRole("alert");
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Delete view" }));
  await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
});

it("asks before discarding a changed label from settings", async () => {
  mocks.loading = false;
  render(
    <ConfirmProvider>
      <LabelsSettingsPanel />
    </ConfirmProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "New label" }));
  fireEvent.change(await screen.findByLabelText("Name"), {
    target: { value: "Unfinished" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(
    await screen.findByRole("alertdialog", {
      name: "Discard unsaved changes?",
    }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(screen.getByLabelText<HTMLInputElement>("Name").value).toBe(
    "Unfinished",
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Discard changes" }),
  );
  await waitFor(() => expect(screen.queryByLabelText("Name")).toBeNull());
});
