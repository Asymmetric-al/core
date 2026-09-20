import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

import { activateDataGridCellFromKeyboard } from "../../../../packages/ui/components/shadcn/data-grid/data-grid-keyboard";

const cellSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../../../packages/ui/components/shadcn/data-grid/data-grid-cell.tsx",
      import.meta.url,
    ),
  ),
  "utf8",
);

describe("DataGridCell nested interactives", () => {
  it("keeps display cells non-interactive so the gridcell is the only tab stop", () => {
    expect(cellSource).not.toMatch(/<button\b/);
    expect(cellSource).toMatch(/onDoubleClick=\{onStartEdit\}/);
    expect(cellSource).toMatch(
      /onClick=\{isSelected \? onStartEdit : undefined\}/,
    );
    expect(cellSource).toMatch(/if \(!isEditing\) \{\s*const selectedOption/);
  });
});

describe("DataGrid cell keyboard activation", () => {
  it("starts edit from Enter or Space on the gridcell, not an inner control", () => {
    const activate = vi.fn();
    const gridcell = {} as EventTarget;

    expect(
      activateDataGridCellFromKeyboard(
        {
          key: "Enter",
          preventDefault: vi.fn(),
          target: gridcell,
          currentTarget: gridcell,
        },
        activate,
      ),
    ).toBe(true);
    expect(
      activateDataGridCellFromKeyboard(
        {
          key: " ",
          preventDefault: vi.fn(),
          target: gridcell,
          currentTarget: gridcell,
        },
        activate,
      ),
    ).toBe(true);
    expect(
      activateDataGridCellFromKeyboard(
        {
          key: "Tab",
          preventDefault: vi.fn(),
          target: gridcell,
          currentTarget: gridcell,
        },
        activate,
      ),
    ).toBe(false);
    expect(activate).toHaveBeenCalledTimes(2);
  });

  it("does not steal Space or Enter from nested editors", () => {
    const activate = vi.fn();
    const preventDefault = vi.fn();
    const gridcell = {} as EventTarget;
    const input = {} as EventTarget;

    expect(
      activateDataGridCellFromKeyboard(
        {
          key: " ",
          preventDefault,
          target: input,
          currentTarget: gridcell,
        },
        activate,
      ),
    ).toBe(false);
    expect(
      activateDataGridCellFromKeyboard(
        {
          key: "Enter",
          preventDefault,
          target: input,
          currentTarget: gridcell,
        },
        activate,
      ),
    ).toBe(false);
    expect(activate).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
