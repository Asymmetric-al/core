import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  import.meta.dirname,
  "../../supabase/migrations/20260718054632_eve_github_operator_policy_action.sql",
);

describe("Eve GitHub operator migration", () => {
  it("adds only the operator catalog action and its hard budget", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("engineering.github_operation.write");
    expect(sql).toContain("'github-operator', 20");
    expect(sql).not.toMatch(/\b(?:DROP|DELETE|TRUNCATE)\b/iu);
  });
});
