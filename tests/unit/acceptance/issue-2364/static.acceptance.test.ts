/** #2364 [A][S] criteria 8-10, §6/7 and H1. Runtime criteria live alongside. */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";

const API = "packages/api/src/donate/index.ts";
const REGISTRY = "packages/database/collections/registry.ts";
const DOC = "docs/guides/architecture/data-access-boundary.md";
const BUILDER = "packages/api/tests/unit/donate-get-config.test.ts";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const sql = () => {
  expect(H.read(H.FORWARD), H.FORWARD).not.toBe("");
  return H.code(H.read(H.FORWARD));
};
describe("#2364 static [A][S]", () => {
  it("#2364 criterion 8: reserved migration is unique, later than corrected #2312 version (H1), forward-fix only", () => {
    sql();
    const files = readdirSync(H.MIG);
    expect(
      files.filter((f) =>
        /^\d{14}_missionaries_server_only_reads\.sql$/.test(f),
      ),
    ).toEqual([H.NAME]);
    expect(files.filter((f) => f.startsWith(H.NAME.slice(0, 14)))).toEqual([
      H.NAME,
    ]);
    expect(H.NAME.slice(0, 14) > "20261025120800").toBe(true);
    expect(H.read(`${H.MIG}/rollback_${H.NAME}`)).toBe("");
    expect(H.read(H.FORWARD)).toMatch(/^--\s*Down:.*forward[- ]fix.*only/im);
  });
  it("#2364 criterion 8: all four named policy drops use IF EXISTS and authenticated gets exactly id/profile_id SELECT", () => {
    const text = sql();
    for (const name of [
      "tanstack browser read",
      "public read",
      "tenant scoped read",
      H.OWN,
    ])
      expect(text).toMatch(
        new RegExp(
          `DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+"${name}"\\s+ON\\s+public\\.missionaries\\s*;`,
          "i",
        ),
      );
    expect(text).not.toMatch(/\bDROP\s+POLICY\b(?!\s+IF\s+EXISTS\b)/i);
    const revoke = text.match(
      /REVOKE\s+ALL(?:\s+PRIVILEGES)?\s+ON\s+(?:TABLE\s+)?public\.missionaries\s+FROM\s+([^;]+);/i,
    );
    expect(
      revoke?.[1]
        ?.toLowerCase()
        .split(",")
        .map((r) => r.trim())
        .sort(),
    ).toEqual(["anon", "authenticated", "public"]);
    const grants = [
      ...text.matchAll(
        /GRANT\s+SELECT\s*\(([^)]+)\)\s+ON\s+(?:TABLE\s+)?public\.missionaries\s+TO\s+authenticated\s*;/gi,
      ),
    ];
    expect(grants).toHaveLength(1);
    expect(
      grants[0]?.[1]
        ?.split(",")
        .map((s) => s.trim().replaceAll('"', ""))
        .sort(),
    ).toEqual([...H.KEYS].sort());
  });
  it("#2364 criterion 8: one transaction, pre/post asserts, own policy and enabled RLS; no forbidden statements", () => {
    const text = sql();
    const top = text.replace(/\$(\w*)\$[\s\S]*?\$\1\$/g, " ").trim();
    expect(top).toMatch(/^BEGIN\s*;/i);
    expect(top).toMatch(/COMMIT\s*;$/i);
    expect(top.match(/\bBEGIN\s*;/gi)).toHaveLength(1);
    expect(top.match(/\bCOMMIT\s*;/gi)).toHaveLength(1);
    expect(
      text.match(/RAISE\s+EXCEPTION/gi)?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);
    expect(text).toMatch(/relrowsecurity/i);
    expect(text).toMatch(/to_regclass|pg_class/i);
    for (const role of ["anon", "authenticated", "service_role"])
      expect(text).toMatch(
        new RegExp(`has_table_privilege\\s*\\(\\s*'${role}'`, "i"),
      );
    expect(text).toMatch(/pg_policies/i);
    expect(text).toMatch(
      /ALTER\s+TABLE\s+public\.missionaries\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
    );
    expect(text).toMatch(
      /CREATE\s+POLICY\s+"missionaries own row key read"[\s\S]*?FOR\s+SELECT\s+TO\s+authenticated[\s\S]*?USING/i,
    );
    for (const pattern of [
      /GRANT[^;]*\bTO\b[^;]*\banon\b/i,
      /\bTO\s+public\b/i,
      /USING\s*\(\s*true\s*\)/i,
      /\b(?:GRANT|REVOKE)[^;]*\bservice_role\b/i,
      /ALTER\s+PUBLICATION/i,
      /\bperson_id\b/i,
    ])
      expect(text).not.toMatch(pattern);
    // §1.1 says unforced. NO FORCE may be needed because #2251/#2312 now
    // force it; reject forcing, while preserving the approved target state.
    expect(text.replace(/\bNO\s+FORCE\b/gi, "")).not.toMatch(/\bFORCE\b/i);
  });
  it("#2364 criterion 9: Builder supplies the declared GET config unit suite", () => {
    expect(H.read(BUILDER), BUILDER).not.toBe("");
  });
  it("#2364 criterion 10: POST bytes and protected schema/tests remain unchanged (§7 pins)", () => {
    const source = H.read(API);
    expect(
      sha(
        source.slice(
          source.indexOf("export const POST"),
          source.indexOf("export async function GET"),
        ),
      ),
    ).toBe("8ce4bff1f5180014b9dde3904ec379c381634079e4724ecce5b9f968d22abf77");
    // Baseline byte pins from 2b028084, one protected file per row.
    // prettier-ignore
    for (const [file, hash] of [
      ["packages/api/src/schemas/donate.ts", "1af7b2100ef7e578299880e785be64a5438621c979bc6d36a3016a1ccfc2844f"],
      ["tests/unit/supabase/canonical-tanstack-db-migration.test.ts", "70029e03348beb5ac6c4d5f47a0b0f6d5b038f3bb572ba106b47bdeec1cbdea0"],
      ["tests/unit/packages/database/collection-registry.test.ts", "24dcc41b8e554b7d03384cfc468d02e8a14a4d31588c7e703c009c2707a85206"],
      ["tests/unit/graphql-gift-engagement-adapters.test.ts", "fe28e5e4e229fc90904730ffb716cb334ae04061f99d801a8d3635c5bb288af5"],
    ]) expect(sha(H.read(file!)), file).toBe(hash);
  });
  it("#2364 criterion 10: §6 diff has only declared edits and exactly one new migration; no applied migration edits", (ctx) => {
    const base = H.git("merge-base", "HEAD", "origin/develop");
    // Branch-agnostic: once #2364's migration is in the shared ancestor, this
    // PR-scope assertion must skip, rather than policing unrelated later PRs.
    const merged = spawnSync("git", ["cat-file", "-e", `${base}:${H.FORWARD}`]);
    expect(merged.error).toBeUndefined();
    if (merged.status === 0)
      ctx.skip(
        "#2364 is already in the merge base; its original PR scope no longer applies",
      );
    const files = H.git("diff", "--name-only", base, "HEAD")
      .split("\n")
      .filter(Boolean);
    const allowed = new Set([
      H.FORWARD,
      API,
      REGISTRY,
      DOC,
      BUILDER,
      "tests/unit/acceptance/issue-2312/public-reads.realstack.acceptance.test.ts",
      // Builder 0cf86552: 2364 real-stack path joins the tenant-isolation step;
      // compat bootstrap grants service_role SELECT (hosted default privilege).
      ".github/workflows/ci-integration.yml",
      "scripts/sql/supabase-compat-bootstrap.sql",
      "tests/unit/helpers/workflow-yaml.ts",
      // Shared acceptance pins re-pinned for that workflow change.
      "tests/unit/acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts",
      "tests/unit/acceptance/issue-2201/merge-group.acceptance.test.ts",
      "tests/unit/acceptance/issue-2250/static.acceptance.test.ts",
      "tests/unit/acceptance/issue-2402/static.acceptance.test.ts",
    ]);
    expect(
      files.filter(
        (p) =>
          !allowed.has(p) && !p.startsWith("tests/unit/acceptance/issue-2364/"),
      ),
    ).toEqual([]);
    const before = H.git("ls-tree", "-r", "--name-only", base, H.MIG).split(
      "\n",
    );
    const added = readdirSync(H.MIG).filter(
      (f) => /^\d{14}_.+\.sql$/.test(f) && !before.includes(`${H.MIG}/${f}`),
    );
    expect(added).toEqual([H.NAME]);
    expect(
      H.git(
        "diff",
        "--name-status",
        "--diff-filter=DMRT",
        base,
        "HEAD",
        "--",
        H.MIG,
      ),
    ).toBe("");
  });
  it("#2364 criterion 10: registry change is note-only and docs explain service-role missionaries reads/config-only GET", () => {
    const base = H.git("merge-base", "HEAD", "origin/develop");
    const stripNote = (source: string) =>
      source
        .replace(
          /(supabaseEntry\("missionariesCollection"[\s\S]*?notes:\s*)"[^"\n]*"/,
          '$1"<note>"',
        )
        .trim();
    expect(stripNote(H.read(REGISTRY))).toBe(
      stripNote(H.git("show", `${base}:${REGISTRY}`)),
    );
    const entry =
      H.read(REGISTRY).match(
        /supabaseEntry\("missionariesCollection"[\s\S]*?\n  \}\),/,
      )?.[0] ?? "";
    expect(entry).toContain('rls: "demo-review-required"');
    expect(entry).toContain('mutationPolicy: "read-only"');
    expect(entry).toMatch(/notes:[\s\S]*server[\s\S]*routes?/i);
    const doc = H.read(DOC);
    expect(doc).toMatch(/missionaries reads/i);
    expect(doc).toMatch(/server.only/i);
    expect(doc).toMatch(/service.role/i);
    expect(doc).toMatch(/\/api\/missionaries/);
    expect(doc).toMatch(/GraphQL/i);
    expect(doc).toMatch(/\/api\/donate[\s\S]*(?:config|publishableKey)/);
  });
});
