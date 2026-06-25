import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const adminPackageJsonPath = fileURLToPath(
  new URL("../../../../apps/admin/package.json", import.meta.url),
);
const clientDbPath = fileURLToPath(
  new URL(
    "../../../../packages/database/collections/client-db.ts",
    import.meta.url,
  ),
);
const hooksPath = fileURLToPath(
  new URL("../../../../packages/database/hooks/hooks.ts", import.meta.url),
);

describe("TanStack foundation guardrails", () => {
  it("keeps TanStack DB ownership in shared packages instead of the admin app", () => {
    const packageJson = JSON.parse(
      readFileSync(adminPackageJsonPath, "utf8"),
    ) as {
      dependencies?: Record<string, string>;
    };

    expect(packageJson.dependencies).not.toHaveProperty("@tanstack/db");
  });

  it("does not disable TypeScript checking in shared TanStack DB sources", () => {
    const clientDbSource = readFileSync(clientDbPath, "utf8");
    const hooksSource = readFileSync(hooksPath, "utf8");

    expect(clientDbSource).not.toMatch(/@ts-nocheck/);
    expect(hooksSource).not.toMatch(/@ts-nocheck/);
  });

  it("keeps legacy client-db as a compatibility barrel", () => {
    const clientDbSource = readFileSync(clientDbPath, "utf8");

    expect(clientDbSource).not.toContain("queryCollectionOptions");
    expect(clientDbSource).not.toContain("supabase.from");
    expect(clientDbSource).not.toContain("fetchTableRows");
  });
});
