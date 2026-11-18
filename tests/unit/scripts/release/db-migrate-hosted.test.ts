import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("db:migrate:hosted", () => {
  it("refuses to migrate a hosted database outside the release job, even with a connection string set", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/db-migrate-hosted.mjs"],
      {
        encoding: "utf8",
        shell: false,
        env: {
          ...process.env,
          SUPABASE_DB_URL:
            "postgresql://postgres:never-printed@db.example.supabase.co:5432/postgres",
          // A pushed migration would need the CLI; make any attempt fail loudly.
          PATH: "",
        },
      },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(".github/workflows/release.yml");
    expect(result.stderr).toContain("docs/ops/release-job.md");
    expect(`${result.stdout}${result.stderr}`).not.toContain("never-printed");
    expect(result.stderr).not.toContain("Failed to run hosted migration");
  });
});
