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
const ROUTE_STATE = {
  view: "mine",
  layout: "board",
  status: "open",
  q: "",
  labelSlugs: [],
  assignee: "",
} as never;
it("submits the save view form once from the name field", async () => {
  render(
    <SaveViewDialog open onOpenChange={() => {}} routeState={ROUTE_STATE} />,
  );
  const name = screen.getByLabelText("Name") as HTMLInputElement;
  const save = screen.getByRole("button", { name: "Save view" });
  expect(name.form).not.toBeNull();
  expect(save.closest("form")).toBe(name.form);
  expect(save.getAttribute("type")).toBe("submit");
  fireEvent.change(name, { target: { value: "Mine open" } });
  fireEvent.submit(name.form!);
  await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
  expect(mocks.save).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Mine open", scope: "personal" }),
  );
});
it("keeps Save available and ties the missing name error to the field", () => {
  render(
    <SaveViewDialog open onOpenChange={() => {}} routeState={ROUTE_STATE} />,
  );
  const name = screen.getByLabelText("Name");
  const save = screen.getByRole("button", { name: "Save view" });
  expect(save.hasAttribute("disabled")).toBe(false);
  expect(save.getAttribute("aria-disabled")).not.toBe("true");
  expect(name.getAttribute("aria-invalid")).not.toBe("true");
  save.focus();
  fireEvent.click(save);
  expect(mocks.save).not.toHaveBeenCalled();
  expect(name.getAttribute("aria-invalid")).toBe("true");
  const errorId = name.getAttribute("aria-describedby");
  expect(errorId).toBeTruthy();
  expect(document.getElementById(errorId!)?.textContent).toBe(
    "Enter a view name.",
  );
  expect(document.activeElement).toBe(name);
  fireEvent.change(name, { target: { value: "M" } });
  expect(name.getAttribute("aria-invalid")).not.toBe("true");
  expect(name.hasAttribute("aria-describedby")).toBe(false);
});
it("names the scope choice once, from its visible title", () => {
  render(
    <SaveViewDialog open onOpenChange={() => {}} routeState={ROUTE_STATE} />,
  );
  const title = screen.getByText("Scope");
  // Not a legend that would name a wrapping group as well.
  expect(title.tagName).not.toBe("LEGEND");
  expect(title.closest("fieldset")).toBeNull();
  expect(screen.queryByRole("group", { name: "Scope" })).toBeNull();
  const radios = screen.getByRole("radiogroup", { name: "Scope" });
  expect(radios.hasAttribute("aria-label")).toBe(false);
  expect(radios.getAttribute("aria-labelledby")).toBe(title.id);
});
