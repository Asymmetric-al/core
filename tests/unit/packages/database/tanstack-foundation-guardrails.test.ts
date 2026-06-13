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
  new URL(
    "../../../../packages/database/hooks/missionary-donors.ts",
    import.meta.url,
  ),
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

  it("keeps the unbounded fetchTableRows helper off tenant-scale tables", () => {
    const clientDbSource = readFileSync(clientDbPath, "utf8");

    // fetchTableRows loads an entire table; it is only acceptable for small
    // reference tables. Growth-prone tables must go through a bounded fetcher,
    // so pin the helper's call sites to exactly the reference tables.
    const fetchTableRowsTargets = [
      ...clientDbSource.matchAll(/fetchTableRows<[\s\S]*?>\(\s*"([a-z_]+)"/g),
    ]
      .map((match) => match[1])
      .sort();

    expect(fetchTableRowsTargets).toEqual([
      "funds",
      "missionaries",
      "profiles",
    ]);

    // Each tenant-scale collection declares a bounded fetcher.
    for (const table of [
      "donors",
      "donor_activities",
      "donor_pledges",
      "posts",
      "donations",
      "post_comments",
      "follows",
    ]) {
      expect(clientDbSource).toContain(`table: "${table}"`);
    }
  });
});
