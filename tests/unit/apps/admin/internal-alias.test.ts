import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Companion to `tests/unit/packages/ui/internal-alias.test.ts`: the plugin is
 * workspace-agnostic, so cover an app as well as a package. This uses real
 * app code rather than a fixture — `apps/admin/app/admin/loading.tsx` already
 * imports through the app's own `@/*` tsconfig mapping.
 */
const appModulePath = fileURLToPath(
  new URL("../../../../apps/admin/app/admin/loading.tsx", import.meta.url),
);

describe("apps/admin internal @/ alias", () => {
  it("resolves @/ imports in apps/admin files against the app root", async () => {
    const loadingModule =
      await import("../../../../apps/admin/app/admin/loading");

    // Importing at all proves the root vitest config resolved the module's
    // `@/features/...` import against apps/admin rather than the repo root.
    expect(typeof loadingModule.default).toBe("function");
  });

  it("keeps that app module importing through the @/ alias", () => {
    // Guard the regression test itself: if the app module is rewritten to a
    // relative import, the first test would pass without exercising the alias.
    const appModuleSource = fs.readFileSync(appModulePath, "utf8");

    expect(appModuleSource).toMatch(/from\s+["']@\/features\//);
  });
});
