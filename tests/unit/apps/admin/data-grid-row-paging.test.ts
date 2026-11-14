import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../../", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return entry.name === "node_modules" ? [] : sourceFiles(path);
      }
      return /\.tsx?$/.test(entry.name) ? [path] : [];
    },
  );
}

describe("Admin data grids and row paging", () => {
  it("never leaves a grid on TanStack's silent first page of ten", () => {
    // dataGridFeatures registers the paginated row model, whose default page
    // size is 10. A grid either shows DataGridPanel's pager (`pagination`),
    // or opts out of paging with `manualPagination: true` so every row
    // renders. Otherwise rows after the tenth vanish with no pager.
    const grids = sourceFiles("apps/admin").filter((path) =>
      readFileSync(join(root, path), "utf8").includes(
        "features: dataGridFeatures",
      ),
    );
    expect(grids.length).toBeGreaterThan(10);
    const unpaged = grids.filter((path) => {
      const source = readFileSync(join(root, path), "utf8");
      const pager = /^\s*pagination=\{/m.test(source);
      const allRows = /manualPagination:\s*true/.test(source);
      return !pager && !allRows;
    });
    expect(unpaged).toEqual([]);
  });
});
