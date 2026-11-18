// WP1.6's first hosted run: hosted Supabase gives `postgres` default
// privileges in `public` before any migration runs, and a replay without them
// never fingerprints equal to a hosted database (docs/audits/
// core-crm-cms-database-proofs/wp16-hosted-proofs.md, section 5). A hosted
// reset keeps them as the chain left them, so the release job's rebuild puts
// them back before it resets (the second rebuild of the preview project). The
// statements live in one file, which every replay, the rebuild and the
// real-stack privileges harness read, so none of them can drift.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { HOSTED_DEFAULT_PRIVILEGES } from "../../../../scripts/release/release-database.mjs";

const FILE = "scripts/sql/hosted-default-privileges.sql";
const KINDS = ["tables", "sequences", "functions"];

describe("hosted Supabase default privileges (one source)", () => {
  it("holds the platform's grants to the API roles in public", () => {
    const sql = readFileSync(FILE, "utf8").toLowerCase();
    for (const kind of KINDS) {
      expect(sql).toContain(
        `alter default privileges for role postgres in schema public grant all on ${kind} to postgres, anon, authenticated, service_role;`,
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

  // Review H2: every other statement of default privileges in public, in any
  // wording and across lines, is a named exception that says what it is.
  const EXCEPTIONS: Record<string, string> = {
    "scripts/sql/supabase-compat-bootstrap.sql":
      "not a statement of hosted Supabase's defaults",
    "scripts/release/release-database.mjs":
      "What a replay starts from, worked out from the file; never committed.",
    "tests/unit/scripts/release/schema-fingerprint.realstack.test.ts":
      "Review H5: the restore only grants",
    "tests/unit/scripts/release/hosted-default-privileges.test.ts":
      "Review H2: every other statement of default privileges in public",
  };

  it("names every other statement of default privileges in public, and each says what it is", () => {
    const files = execFileSync(
      "git",
      [
        "ls-files",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        "scripts",
        "tests",
        ".github",
        "packages",
        "apps",
      ],
      { encoding: "utf8", maxBuffer: 64 << 20 },
    )
      .split("\n")
      .filter((file) => /\.(sql|ts|tsx|mjs|cjs|js|ya?ml|md)$/.test(file));
    const statement =
      /alter\s+default\s+privileges[^;]*?\bin\s+schema\s+public\b/i;
    const hits = files.filter(
      (file) => existsSync(file) && statement.test(readFileSync(file, "utf8")),
    );
    expect(hits.filter((file) => file !== FILE).sort()).toEqual(
      Object.keys(EXCEPTIONS).sort(),
    );
    for (const [file, says] of Object.entries(EXCEPTIONS))
      expect(readFileSync(file, "utf8"), file).toContain(says);
    // The bootstrap's grant points at the platform's defaults.
    expect(
      readFileSync("scripts/sql/supabase-compat-bootstrap.sql", "utf8"),
    ).toContain(FILE);
  });
});
