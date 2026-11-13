// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SavedViewItem } from "../../../../../../../apps/admin/features/support-hub/components/views/SavedViewItem";

import type { SupportSavedView } from "../../../../../../../apps/admin/features/support-hub/types";

afterEach(cleanup);

const VIEW = {
  id: "view-1",
  name: "Open receipts",
  filter: {
    view: "all",
    layout: "board",
    status: "open",
    q: "",
    labelSlugs: ["receipts"],
    assignee: "any",
  },
} as unknown as SupportSavedView;

function renderItem(isActive: boolean) {
  const onSelect = vi.fn();
  render(
    <SavedViewItem
      view={VIEW}
      isActive={isActive}
      onSelect={onSelect}
      onRename={() => {}}
      onDelete={() => {}}
    />,
  );
  return { onSelect };
}

describe("SavedViewItem", () => {
  it("is a shared button group whose applied state is announced, not only coloured", () => {
    const { onSelect } = renderItem(true);
    const apply = screen.getByRole("button", { name: "Open receipts" });
    expect(apply.getAttribute("aria-pressed")).toBe("true");
    expect(apply.getAttribute("data-slot")).toBe("button");
    expect(apply.closest("[data-slot='button-group']")).not.toBeNull();
    fireEvent.click(apply);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("uses the toolbar's button size, not a smaller local chip", () => {
    renderItem(false);
    const apply = screen.getByRole("button", { name: "Open receipts" });
    expect(apply.getAttribute("aria-pressed")).toBe("false");
    expect(apply.getAttribute("data-size")).toBe("sm");
    const actions = screen.getByRole("button", {
      name: "Saved view actions for Open receipts",
    });
    expect(actions.getAttribute("data-size")).toBe("icon-sm");
  });
});
