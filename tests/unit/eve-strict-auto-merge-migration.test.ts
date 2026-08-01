import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  import.meta.dirname,
  "../../supabase/migrations/20260718063523_eve_strict_auto_merge_policy_action.sql",
);

describe("Eve strict auto-merge migration", () => {
  it("adds a separate merge action and a small hard hourly budget", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("engineering.github_merge.execute");
    expect(sql).toContain("'github-auto-merge', 5");
    expect(sql).not.toMatch(/\b(?:DROP|DELETE|TRUNCATE)\b/iu);
  });
});
