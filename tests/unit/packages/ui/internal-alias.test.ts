import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { mergeClassesViaInternalAlias } from "../../../../packages/ui/lib/internal-alias-fixture";

const fixturePath = fileURLToPath(
  new URL(
    "../../../../packages/ui/lib/internal-alias-fixture.ts",
    import.meta.url,
  ),
);

describe("packages/ui internal @/ alias", () => {
  it("resolves @/ imports in packages/ui files against the package root", () => {
    // Importing the fixture at all proves the root vitest config resolved its
    // `@/lib/utils` import per importer (packages/ui has no repo-root `src/`).
    expect(mergeClassesViaInternalAlias("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("keeps the fixture importing through the @/ alias", () => {
    // Guard the regression test itself: if the fixture is rewritten to a
    // relative import, the first test would pass without exercising the alias.
    const fixtureSource = fs.readFileSync(fixturePath, "utf8");

    expect(fixtureSource).toMatch(/from\s+["']@\/lib\/utils["']/);
  });
});
