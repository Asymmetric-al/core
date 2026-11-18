// WP1.6's first hosted run: hosted Supabase gives `postgres` default
// privileges in `public` before any migration runs, and a replay without them
// never fingerprints equal to a hosted database (docs/audits/
// core-crm-cms-database-proofs/wp16-hosted-proofs.md, section 5). A hosted
// reset keeps them as the chain left them, so the release job's rebuild puts
// them back before it resets (the second rebuild of the preview project). The
// statements live in one file, which every replay, the rebuild and the
// real-stack privileges harness read, so none of them can drift.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { HOSTED_DEFAULT_PRIVILEGES } from "../../../../scripts/release/release-database.mjs";

const FILE = "scripts/sql/hosted-default-privileges.sql";
const KINDS = ["tables", "sequences", "functions"];

describe("hosted Supabase default privileges (one source)", () => {
  it("holds the platform's grants to the API roles in public", () => {
    const sql = readFileSync(FILE, "utf8").toLowerCase();
    for (const kind of KINDS) {
      expect(sql).toContain(
        `alter default privileges for role postgres in schema public grant all on ${kind} to anon, authenticated, service_role;`,
      );
    }
    expect(sql).toContain(
      "grant usage on schema public to postgres, anon, authenticated, service_role;",
    );
  });

  it("is read by the replay script, the release job's rebuild and the privileges harness", () => {
    expect(
      readFileSync("scripts/verify/supabase-migrations.mjs", "utf8"),
    ).toContain(FILE);
    expect(HOSTED_DEFAULT_PRIVILEGES).toBe(FILE);
    expect(
      readFileSync(
        "tests/unit/acceptance/issue-2674/privileges-harness.ts",
        "utf8",
      ),
    ).toContain(FILE);
  });

  it("has no second copy in code, tests or workflows", () => {
    const pattern = `in schema public grant all on (${KINDS.join("|")}) to`;
    const hits = execFileSync(
      "git",
      [
        "grep",
        "--untracked",
        "-l",
        "-i",
        "-E",
        pattern,
        "--",
        "scripts",
        "tests",
        ".github",
        "packages",
        "apps",
      ],
      { encoding: "utf8" },
    )
      .trim()
      .split("\n")
      .filter(Boolean);
    expect(hits).toEqual([FILE]);
  });
});
