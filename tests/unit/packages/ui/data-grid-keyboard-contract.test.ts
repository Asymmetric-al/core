import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(
    fileURLToPath(new URL(`../../../../${relativePath}`, import.meta.url)),
    "utf8",
  );

describe("DataGrid viewport keyboard contract", () => {
  it("starts edit from the gridcell activation path", () => {
    const source = read(
      "packages/ui/components/shadcn/data-grid/data-grid.tsx",
    );

    expect(source).toMatch(/activateDataGridCellFromKeyboard/);
    expect(source).toMatch(/onActivateCell/);
    expect(source).toMatch(/setEditingCell/);
  });
});
