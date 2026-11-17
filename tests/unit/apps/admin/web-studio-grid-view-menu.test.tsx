// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) The View panel is the public boundary under test.
import {
  GridViewMenu,
  type GridViewColumn,
} from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/grid-view-menu";

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const COLUMNS: GridViewColumn[] = [
  {
    id: "title",
    label: "Title",
    visible: true,
    canHide: false,
    movable: false,
  },
  {
    id: "_status",
    label: "Status",
    visible: true,
    canHide: false,
    movable: false,
  },
  { id: "slug", label: "Slug", visible: true, canHide: true, movable: true },
  {
    id: "layout",
    label: "Layout",
    visible: true,
    canHide: true,
    movable: true,
  },
  {
    id: "updatedAt",
    label: "Updated At",
    visible: false,
    canHide: true,
    movable: true,
  },
];

// Payload saves the new order and hands the columns back in it.
function StatefulMenu({
  onReorder,
  onToggle = () => {},
}: {
  onReorder: (order: string[]) => void;
  onToggle?: (id: string, visible: boolean) => void;
}) {
  const [columns, setColumns] = useState(COLUMNS);
  return (
    <GridViewMenu
      columns={columns}
      onToggle={onToggle}
      onReorder={(order) => {
        onReorder(order);
        setColumns([
          ...columns.filter((column) => !column.movable),
          ...order.map((id) => columns.find((column) => column.id === id)!),
        ]);
      }}
    />
  );
}

async function openMenu(props: Partial<Parameters<typeof StatefulMenu>[0]>) {
  const onReorder = vi.fn<(order: string[]) => void>();
  render(<StatefulMenu onReorder={onReorder} {...props} />);
  const trigger = await screen.findByRole("button", { name: "View" });
  fireEvent.click(trigger);
  const panel = await screen.findByRole("dialog", { name: "Columns" });
  return { onReorder, panel, trigger };
}

const announced = () =>
  document.querySelector('[aria-live="assertive"]')?.textContent ?? "";
const movableOrder = (panel: HTMLElement) =>
  within(within(panel).getByRole("list", { name: "Column order" }))
    .getAllByRole("listitem")
    .map((item) => item.querySelector("label")?.textContent);

describe("Web Studio View panel columns", () => {
  it("lists the movable columns as a named sortable list and keeps the fixed ones outside it", async () => {
    const onToggle = vi.fn();
    const { panel } = await openMenu({ onToggle });

    const list = within(panel).getByRole("list", { name: "Column order" });
    expect(list.getAttribute("aria-roledescription")).toBe("sortable list");
    expect(movableOrder(panel)).toEqual(["Slug", "Layout", "Updated At"]);
    for (const label of ["Slug", "Layout", "Updated At"]) {
      const handle = within(list).getByRole("button", {
        name: `Reorder ${label}`,
      });
      expect(handle.getAttribute("aria-pressed")).toBe("false");
    }
    // Title and Status keep their place: no handle, no moves, not in the list.
    expect(within(list).queryByText("Title")).toBeNull();
    expect(within(list).queryByText("Status")).toBeNull();
    expect(
      within(panel).queryByRole("button", { name: /Title|Status/ }),
    ).toBeNull();
    expect(within(panel).getByRole("checkbox", { name: "Title" })).toBeTruthy();

    fireEvent.click(within(list).getByRole("checkbox", { name: "Updated At" }));
    expect(onToggle).toHaveBeenCalledWith("updatedAt", true);
  });

  it("moves a column with its named Move button, announces where it went and keeps focus there", async () => {
    const { onReorder, panel } = await openMenu({});

    const down = within(panel).getByRole("button", { name: "Move Slug down" });
    down.focus();
    fireEvent.click(down);

    expect(onReorder).toHaveBeenCalledExactlyOnceWith([
      "layout",
      "slug",
      "updatedAt",
    ]);
    expect(movableOrder(panel)).toEqual(["Layout", "Slug", "Updated At"]);
    expect(document.activeElement).toBe(down);
    await waitFor(() =>
      expect(announced()).toBe("Dropped Slug at position 2 of 3."),
    );
  });

  it("keeps a Move button focusable once its column reaches an end, and does nothing from there", async () => {
    const { onReorder, panel } = await openMenu({});

    const up = within(panel).getByRole("button", { name: "Move Layout up" });
    up.focus();
    fireEvent.click(up);
    expect(movableOrder(panel)).toEqual(["Layout", "Slug", "Updated At"]);

    // A natively disabled button would drop focus out of the popover.
    expect(up.getAttribute("aria-disabled")).toBe("true");
    expect(up.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(up);
    fireEvent.click(up);
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(
      within(panel)
        .getByRole("button", { name: "Move Updated At down" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  it("reorders a column from its handle with the keyboard", async () => {
    const { onReorder, panel } = await openMenu({});

    const handle = within(panel).getByRole("button", { name: "Reorder Slug" });
    handle.focus();
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "End" });
    expect(onReorder).not.toHaveBeenCalled();
    fireEvent.keyDown(handle, { key: " " });

    expect(onReorder).toHaveBeenCalledExactlyOnceWith([
      "layout",
      "updatedAt",
      "slug",
    ]);
    expect(document.activeElement).toBe(handle);
    await waitFor(() =>
      expect(announced()).toBe("Dropped Slug at position 3 of 3."),
    );
  });

  it("puts a picked-up column back on Escape without closing the popover", async () => {
    const { onReorder, panel, trigger } = await openMenu({});

    const handle = within(panel).getByRole("button", { name: "Reorder Slug" });
    handle.focus();
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(movableOrder(panel)).toEqual(["Layout", "Slug", "Updated At"]);
    fireEvent.keyDown(handle, { key: "Escape" });

    expect(movableOrder(panel)).toEqual(["Slug", "Layout", "Updated At"]);
    expect(onReorder).not.toHaveBeenCalled();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    // With nothing picked up, Escape closes the popover again.
    fireEvent.keyDown(handle, { key: "Escape" });
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("false"),
    );
  });
});
