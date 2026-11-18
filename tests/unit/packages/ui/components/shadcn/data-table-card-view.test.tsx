/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DataTableCardView,
  DataTableMobileView,
} from "../../../../../../packages/ui/components/shadcn/data-table/data-table-card-view";

type Person = { id: string; name: string };

const rows = [
  {
    id: "row-1",
    original: { id: "person-1", name: "Ada Lovelace" },
    getIsSelected: () => false,
    toggleSelected: vi.fn(),
  },
] as never;

const rowActions = [{ label: "Edit", onClick: vi.fn() }];
const getRowModel = vi.fn(() => ({ rows }));
const table = {
  getRowModel,
} as never;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("DataTableCardView row action trigger", () => {
  it("names card row action triggers from the primary field by default", () => {
    const multiRows = [
      rows[0],
      {
        id: "row-2",
        original: { id: "person-2", name: "Grace Hopper" },
        getIsSelected: () => false,
        toggleSelected: vi.fn(),
      },
    ] as never;

    render(
      <DataTableCardView
        rows={multiRows}
        primaryField="name"
        enableRowSelection={false}
        rowActions={rowActions}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Row actions for Grace Hopper" }),
    ).toBeTruthy();
    expect(
      screen.queryAllByRole("button", { name: "Open row actions" }),
    ).toHaveLength(0);
  });

  it("uses getRowActionAriaLabel when provided", () => {
    render(
      <DataTableCardView<Person>
        rows={rows}
        primaryField="name"
        enableRowSelection={false}
        rowActions={rowActions}
        getRowActionAriaLabel={(row) =>
          `Row actions for ${(row.original as Person).name}`
        }
      />,
    );

    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
  });

  it("falls back to the shared default row action label without a primary field", () => {
    render(
      <DataTableCardView
        rows={rows}
        enableRowSelection={false}
        rowActions={rowActions}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Open row actions" }),
    ).toBeTruthy();
  });

  it("runs card row actions without invoking the row click handler", () => {
    const onRowClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <DataTableCardView
        rows={rows}
        primaryField="name"
        enableRowSelection={false}
        onRowClick={onRowClick}
        rowActions={[{ label: "Edit", onClick: onActionClick }]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(onActionClick).toHaveBeenCalledWith({
      id: "person-1",
      name: "Ada Lovelace",
    });
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("keeps trigger keyboard activation separate from the card keyboard handler", () => {
    const onRowClick = vi.fn();
    const onActionClick = vi.fn();

    render(
      <DataTableCardView
        rows={rows}
        primaryField="name"
        enableRowSelection={false}
        onRowClick={onRowClick}
        rowActions={[{ label: "Edit", onClick: onActionClick }]}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Row actions for Ada Lovelace",
    });

    // Base UI renders the trigger as a native button, so Enter/Space open the
    // menu via native activation (which jsdom does not simulate). Assert the
    // element, then check that trigger keydown bubbling into the card's own
    // Enter/Space handler never fires the row click.
    expect(trigger.tagName).toBe("BUTTON");
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.keyDown(trigger, { key: " " });
    expect(onRowClick).not.toHaveBeenCalled();

    // The primary text is the row's own native button.
    const primary = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(primary.tagName).toBe("BUTTON");
    fireEvent.click(primary);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("renders mobile rows from the table model with forced selection and row actions", () => {
    render(
      <DataTableMobileView<Person>
        table={table}
        primaryField="name"
        rowActions={rowActions}
        getRowActionAriaLabel={(row) =>
          `Row actions for ${(row.original as Person).name}`
        }
      />,
    );

    expect(getRowModel).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("checkbox", { name: "Select Ada Lovelace" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Row actions for Ada Lovelace" }),
    ).toBeTruthy();
  });
});

describe("DataTableCardView clickable card", () => {
  const detailRows = [
    {
      id: "row-1",
      original: { id: "person-1", name: "Ada Lovelace", email: "ada@x.org" },
      getIsSelected: () => false,
      toggleSelected: vi.fn(),
    },
  ] as never;

  it("keeps the row checkbox and actions out of a button", () => {
    const { container } = render(
      <DataTableCardView
        rows={detailRows}
        primaryField="name"
        secondaryField="email"
        onRowClick={vi.fn()}
        rowActions={rowActions}
      />,
    );

    const card = container.querySelector('[data-slot="card"]');
    expect(card?.getAttribute("role")).toBeNull();
    expect(card?.hasAttribute("tabindex")).toBe(false);

    const checkbox = screen.getByRole("checkbox", {
      name: "Select Ada Lovelace",
    });
    const trigger = screen.getByRole("button", {
      name: "Row actions for Ada Lovelace",
    });
    for (const control of [checkbox, trigger]) {
      expect(control.parentElement?.closest('[role="button"], button')).toBe(
        null,
      );
    }
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("opens the row from its primary text exactly once", () => {
    const onRowClick = vi.fn();
    render(
      <DataTableCardView
        rows={detailRows}
        primaryField="name"
        secondaryField="email"
        onRowClick={onRowClick}
      />,
    );

    const primary = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(primary.tagName).toBe("BUTTON");
    expect(primary.getAttribute("type")).toBe("button");
    fireEvent.click(primary);
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: "row-1" }),
    );
  });

  it("still opens the row from a pointer click elsewhere on the card", () => {
    const onRowClick = vi.fn();
    render(
      <DataTableCardView
        rows={detailRows}
        primaryField="name"
        secondaryField="email"
        onRowClick={onRowClick}
      />,
    );

    fireEvent.click(screen.getByText("ada@x.org"));
    expect(onRowClick).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select Ada Lovelace" }),
    );
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("shows the primary text as plain text when the card does not open", () => {
    render(
      <DataTableCardView
        rows={detailRows}
        primaryField="name"
        enableRowSelection={false}
      />,
    );

    expect(screen.getByText("Ada Lovelace").tagName).toBe("P");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("opens the row from the secondary text when there is no primary text", () => {
    const onRowClick = vi.fn();
    render(
      <DataTableCardView
        rows={detailRows}
        secondaryField="email"
        enableRowSelection={false}
        onRowClick={onRowClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ada@x.org" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it('falls back to "Select row" without a primary field', () => {
    render(<DataTableCardView rows={detailRows} />);

    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeTruthy();
  });

  it("gives a card without primary or secondary text one open button", () => {
    const onRowClick = vi.fn();
    render(<DataTableCardView rows={detailRows} onRowClick={onRowClick} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.tagName).toBe("BUTTON");
    expect(buttons[0]?.getAttribute("aria-label")).toBe("Open row");
    fireEvent.click(buttons[0]!);
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: "row-1" }),
    );
  });

  it("keeps the open button beside the row actions without card text", () => {
    const onRowClick = vi.fn();
    render(
      <DataTableCardView
        rows={detailRows}
        onRowClick={onRowClick}
        rowActions={rowActions}
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Open row" }));
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("treats whitespace-only card text as missing", () => {
    const blankRows = [
      {
        id: "row-1",
        original: { id: "person-1", name: "  ", email: " " },
        getIsSelected: () => false,
        toggleSelected: vi.fn(),
      },
    ] as never;
    const onRowClick = vi.fn();
    render(
      <DataTableCardView
        rows={blankRows}
        primaryField="name"
        secondaryField="email"
        enableRowSelection={false}
        onRowClick={onRowClick}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]?.getAttribute("aria-label")).toBe("Open row");
    fireEvent.click(buttons[0]!);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("opens from the secondary text when the primary text is blank", () => {
    const blankPrimaryRows = [
      {
        id: "row-1",
        original: { id: "person-1", name: "  ", email: "ada@x.org" },
        getIsSelected: () => false,
        toggleSelected: vi.fn(),
      },
    ] as never;
    const onRowClick = vi.fn();
    render(
      <DataTableCardView
        rows={blankPrimaryRows}
        primaryField="name"
        secondaryField="email"
        enableRowSelection={false}
        onRowClick={onRowClick}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toBe(screen.getByRole("button", { name: "ada@x.org" }));
    fireEvent.click(buttons[0]!);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});
