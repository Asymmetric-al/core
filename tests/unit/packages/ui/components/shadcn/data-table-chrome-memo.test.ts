import { describe, expect, it } from "vitest";

import {
  areChromeTablePropsInterchangeable,
  areDataTableChromeActionsEqual,
} from "../../../../../../packages/ui/components/shadcn/data-table/data-table-chrome-memo";

import type { RowData, Table } from "../../../../../../packages/ui/components/shadcn/data-table/tanstack";

type Person = { id: string; name: string };

function makeTableWrapper<TData extends RowData>(
  atoms: object,
  options: {
    columns?: readonly unknown[];
    data?: readonly unknown[];
    pageCount?: number;
    rowCount?: number;
  },
): Table<TData> {
  return { atoms, options } as Table<TData>;
}

describe("areChromeTablePropsInterchangeable", () => {
  const atoms = {};

  it("treats fresh wrappers as interchangeable when atoms and option inputs match", () => {
    const data: Person[] = [];
    const columnDefs = [{ id: "name" }];
    const previous = makeTableWrapper(atoms, {
      columns: columnDefs,
      data,
      pageCount: 2,
      rowCount: 10,
    });
    const next = makeTableWrapper(atoms, {
      columns: columnDefs,
      data,
      pageCount: 2,
      rowCount: 10,
    });

    expect(areChromeTablePropsInterchangeable(previous, next)).toBe(true);
  });

  it("returns false when columns change without a new atoms map", () => {
    const data: Person[] = [];
    const previous = makeTableWrapper(atoms, {
      columns: [{ id: "name" }],
      data,
    });
    const next = makeTableWrapper(atoms, {
      columns: [{ id: "email" }],
      data,
    });

    expect(areChromeTablePropsInterchangeable(previous, next)).toBe(false);
  });
});

describe("areDataTableChromeActionsEqual", () => {
  it("compares action contents instead of array identity", () => {
    const onClick = () => {};
    const previous = [{ label: "Archive", onClick }];
    const next = [{ label: "Archive", onClick }];

    expect(areDataTableChromeActionsEqual(previous, next)).toBe(true);
  });

  it("returns false when action handlers differ", () => {
    const previous = [{ label: "Archive", onClick: () => {} }];
    const next = [{ label: "Archive", onClick: () => {} }];

    expect(areDataTableChromeActionsEqual(previous, next)).toBe(false);
  });
});
