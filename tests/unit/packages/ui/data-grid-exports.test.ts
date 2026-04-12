import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const packageJsonPath = fileURLToPath(
  new URL("../../../../packages/ui/package.json", import.meta.url),
);
const shadcnBarrelPath = fileURLToPath(
  new URL(
    "../../../../packages/ui/components/shadcn/index.ts",
    import.meta.url,
  ),
);

describe("packages/ui data grid exports", () => {
  it("exposes the shared data-grid entrypoints from package exports", () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      exports?: Record<string, string>;
    };

    expect(packageJson.exports).toMatchObject({
      "./components/shadcn/data-grid": "./components/shadcn/data-grid/index.ts",
      "./components/shadcn/data-grid/*": "./components/shadcn/data-grid/*.tsx",
      "./components/shadcn/data-grid/types":
        "./components/shadcn/data-grid/types.ts",
    });
  });

  it("re-exports DataGrid from the shared shadcn barrel", () => {
    const source = readFileSync(shadcnBarrelPath, "utf8");

    expect(source).toMatch(/export\s+\*\s+from\s+["']\.\/data-grid["'];/);
  });
});
