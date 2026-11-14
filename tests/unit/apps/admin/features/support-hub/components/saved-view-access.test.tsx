// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SaveViewDialog } from "../../../../../../../apps/admin/features/support-hub/components/views/SaveViewDialog";
import { SavedViewItem } from "../../../../../../../apps/admin/features/support-hub/components/views/SavedViewItem";
const mocks = vi.hoisted(() => ({ save: vi.fn().mockResolvedValue("view-1") }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportSavedView: () => ({
      mutateAsync: mocks.save,
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-saved-views",
  () => ({
    useSupportSavedViews: () => ({
      access: { agentId: "agent-1", canManageAll: false },
    }),
  }),
);
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it("restricts workspace scope and gives personal non-Latin views a slug and owner", async () => {
  render(
    <SaveViewDialog
      open
      onOpenChange={() => {}}
      routeState={
        {
          view: "all",
          layout: "board",
          status: "all",
          q: "",
          labelSlugs: [],
          assignee: "",
        } as never
      }
    />,
  );
  const workspace = screen.getByRole("radio", { name: "Whole workspace" });
  expect(
    workspace.getAttribute("aria-disabled") === "true" ||
      workspace.hasAttribute("disabled"),
  ).toBe(true);
  expect(
    screen.getByText(
      "Only support admins can share a view with the whole workspace.",
    ),
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "ไทย" } });
  fireEvent.click(screen.getByRole("button", { name: "Save view" }));
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerAgentId: "agent-1",
        slug: expect.stringMatching(/^view-/),
      }),
    ),
  );
});
it("omits unavailable saved-view actions", () => {
  render(
    <SavedViewItem
      view={{ id: "view-1", name: "Shared" } as never}
      isActive={false}
      onSelect={() => {}}
    />,
  );
  expect(
    screen.queryByRole("button", { name: /Saved view actions/ }),
  ).toBeNull();
});
