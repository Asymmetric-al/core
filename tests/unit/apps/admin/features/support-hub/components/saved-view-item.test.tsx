// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SavedViewItem } from "../../../../../../../apps/admin/features/support-hub/components/views/SavedViewItem";
import { touchTargetSizes } from "../../../../../helpers/coarse-touch-target";

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
  // Applying a view again re-applies it, so the applied view is current
  // state, not a toggle that could be turned off.
  it("is a shared button group whose applied state is announced, not only coloured", () => {
    const { onSelect } = renderItem(true);
    const apply = screen.getByRole("button", { name: "Open receipts" });
    expect(apply.hasAttribute("aria-pressed")).toBe(false);
    expect(apply.getAttribute("aria-current")).toBe("true");
    expect(apply.getAttribute("data-variant")).toBe("secondary");
    expect(apply.getAttribute("data-slot")).toBe("button");
    expect(apply.closest("[data-slot='button-group']")).not.toBeNull();
    fireEvent.click(apply);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("uses the toolbar's button size, not a smaller local chip", () => {
    renderItem(false);
    const apply = screen.getByRole("button", { name: "Open receipts" });
    expect(apply.hasAttribute("aria-pressed")).toBe(false);
    expect(apply.hasAttribute("aria-current")).toBe(false);
    expect(apply.getAttribute("data-variant")).toBe("outline");
    expect(apply.getAttribute("data-size")).toBe("sm");
    const actions = screen.getByRole("button", {
      name: "Saved view actions for Open receipts",
    });
    expect(actions.getAttribute("data-size")).toBe("icon-sm");
  });

  it("gives the actions trigger a 44px touch target on coarse pointers only", async () => {
    renderItem(false);
    const actions = screen.getByRole("button", {
      name: "Saved view actions for Open receipts",
    });
    const group = actions.closest("[data-slot='button-group']")!;
    const sizes = await touchTargetSizes(actions, group);
    expect(sizes.coarse.minWidth).toBeGreaterThanOrEqual(44);
    expect(sizes.coarse.minHeight).toBeGreaterThanOrEqual(44);
    // Fine pointers keep icon-sm's 32px square.
    expect(sizes.fine.minWidth).toBe(0);
    expect(actions.getAttribute("data-size")).toBe("icon-sm");
  });
});
