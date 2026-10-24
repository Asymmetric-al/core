/**
 * #2254 static acceptance (spec r1): migration text (criteria 2, 4, 11, 12,
 * Q7 guard), census evidence pins (9), CI step (8) and docs (12, 13).
 * Owned by Acceptance; implementers must not edit.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DOC,
  FP,
  INLINE,
  MIGRATIONS,
  V2,
  migrationFile,
  migrationSql,
  newMigrations,
  read,
  sha256,
} from "./harness";
import {
  MODELLED_KEYS_BY_JOB,
  PINNED_STEP_BODIES,
  loadWorkflowDocument,
} from "../../helpers/workflow-yaml";

const flat = (s: string) => s.replace(/\s+/g, " ");
/** Lists the patterns missing from text (keeps failure output short). */
const missing = (text: string, pats: (string | RegExp)[]) =>
  pats
    .filter((p) => (typeof p === "string" ? !text.includes(p) : !p.test(text)))
    .map(String);

describe("#2254 migration text", () => {
  it("criterion 2 + In 1 + Q1: UTF8 assertion, inlined pre-check, then function and DDL in order", () => {
    const sql = migrationSql();
    let pos = 0;
    const order = [
      /pg_encoding_to_char\s*\(\s*encoding\s*\)/i,
      INLINE,
      /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.normalize_email\b/i,
      /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?email_normalized\b/i,
      /ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?email_verified_at\b/i,
      /UNIQUE\s*\(\s*tenant_id\s*,\s*profile_id\s*\)/i,
      /CREATE\s+UNIQUE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?donors_tenant_email_normalized_uidx\b/i,
      /INSERT\s+INTO\s+public\.field_policies\b/i,
    ].map((re) => {
      const i = pos < 0 ? -1 : sql.slice(pos).search(re);
      return (pos = i < 0 ? -1 : pos + i + 1);
    });
    expect(order, "all statements present, in this order").not.toContain(-1);
    expect(sql).toMatch(/current_database\s*\(\s*\)/i);
    expect(sql).toMatch(/'UTF8'/);
    expect(sql.slice(0, order[1])).toMatch(/RAISE\s+EXCEPTION/i);
    const pre = sql.slice(0, order[2]);
    expect(
      /ALTER\s+TABLE|CREATE\s/i.test(pre),
      "no DDL before the pre-check",
    ).toBe(false);
    expect(
      /normalize_email\s*\(/i.test(pre),
      "pre-check inlines, no normalize_email call",
    ).toBe(false);
    expect(
      /HAVING\s+count\s*\(/i.test(pre),
      "pre-check groups duplicates",
    ).toBe(true);
  });
  it("criterion 1 + Q9: normalizer signature, attributes and exact body", () => {
    const sql = flat(migrationSql());
    expect(sql).toMatch(
      /FUNCTION public\.normalize_email\s*\(\s*raw text\s*\)\s*RETURNS text/i,
    );
    for (const attr of [
      /LANGUAGE sql/i,
      /\bIMMUTABLE\b/i,
      /\bSTRICT\b/i,
      /PARALLEL SAFE/i,
      /SET search_path\s*(?:=|TO)\s*''/i,
    ])
      expect(sql).toMatch(attr);
    expect(sql.toLowerCase()).toContain(
      "nullif(btrim(lower(normalize(raw, nfkc)), e' \\t\\r\\n'), '')",
    );
  });
  it("criteria 3 + 4: generated column; email_verified_at has no default, trigger or write", () => {
    const sql = flat(migrationSql());
    expect(sql).toMatch(
      /email_normalized text GENERATED ALWAYS AS \(\s*public\.normalize_email\(\s*email\s*\)\s*\) STORED/i,
    );
    expect(sql).toMatch(
      /email_verified_at (?:timestamptz|timestamp with time zone)(?: NULL)?\s*[,;]/i,
    );
    expect(sql).not.toMatch(
      /email_verified_at (?:timestamptz|timestamp with time zone)[^,;]*\bdefault\b/i,
    );
    expect(sql).not.toMatch(
      /CREATE\s+(?:OR\s+REPLACE\s+)?(?:CONSTRAINT\s+)?TRIGGER/i,
    );
    expect(sql).not.toMatch(/SET\s+email_verified_at|email_verified_at\s*=/i);
  });
  it("criterion 4: no write to email_verified_at in supabase/migrations, seed, packages or apps", () => {
    const own = `${MIGRATIONS}/${migrationFile()}`;
    const files = spawnSync(
      "git",
      [
        "ls-files",
        "-co",
        "--exclude-standard",
        MIGRATIONS,
        "supabase/seed.sql",
        "packages",
        "apps",
      ],
      { encoding: "utf8" },
    )
      .stdout.split("\n")
      .filter((f) => /\.(sql|ts|tsx|js|mjs|cjs)$/.test(f));
    const hits = files.filter(
      (f) =>
        f !== own &&
        f !== "packages/database/types/database.ts" &&
        read(f).includes("email_verified_at"),
    );
    expect(hits).toEqual([]);
  });
  it("criterion 11 + Q7: no receipt table, no donations trigger, no merged_into_donor_id", () => {
    for (const f of newMigrations()) {
      const sql = read(`${MIGRATIONS}/${f}`).replace(/--[^\n]*/g, "");
      expect(sql, f).not.toMatch(
        /CREATE\s+TABLE|\breceipt|\bdonations\b|merged_into_donor_id/i,
      );
    }
    expect(migrationSql()).not.toMatch(/donor_merge_(?:redirects|candidates)/i);
    expect(
      sha256(
        readFileSync(
          "tests/unit/supabase/donor-matching-merge-candidates-migration.test.ts",
        ),
      ),
    ).toBe("fa3fb727381f37e5462026b0a0881e78fa7b67f88423ea291953dd14290ec83f");
  });
  it("criterion 12: grep gate, no lower(email)/toLowerCase email normalization in new identity code", () => {
    const files = [
      ...newMigrations().map((f) => `${MIGRATIONS}/${f}`),
      ...spawnSync(
        "git",
        ["ls-files", "-co", "--exclude-standard", "packages/api/src/identity"],
        { encoding: "utf8" },
      )
        .stdout.split("\n")
        .filter(Boolean),
    ];
    expect(files).toContain(`${MIGRATIONS}/${migrationFile()}`);
    for (const f of files) {
      const text = read(f);
      expect(text, f).not.toMatch(
        /lower\s*\(\s*(?:b?trim\s*\(\s*)?[\w.]*email/i,
      );
      expect(text, f).not.toMatch(
        /email\w*\s*\)?\s*\??\.\s*(?:trim\(\)\s*\??\.\s*)?toLowerCase/i,
      );
    }
  });
});

describe("#2254 criterion 9: census evidence", () => {
  const census = () => JSON.parse(read(`${FP}/census-v1.json`));
  it("census-v1.json: 171 live / 174 candidate / 870 rows, v1 then v2 supplement", () => {
    const c = census();
    expect([
      c.column_count,
      c.candidate_column_count,
      c.baseline_row_count,
    ]).toEqual([171, 174, 870]);
    expect(
      c.repository_supplements.map((s: { artifact: string }) => s.artifact),
    ).toEqual(["repository-supplement-v1.json", V2]);
    expect(c.repository_supplements[0].sha256).toBe(
      "ca922ac896858c16597826e3f81e30f1c74f6903e466b5e053c891fd4b8b3296",
    );
    expect(c.repository_supplements[1].sha256).toBe(
      sha256(readFileSync(`${FP}/${V2}`)),
    );
    expect(c.provenance.live_capture_sha256).toBe(
      "0ab1165501bf059ba12c71898cb9597725282be458ab0c71e6280c1064e4736a",
    );
  });
  it("v1 artifact bytes and v1 census checks unchanged; v2 binds the new migration by working-tree hash", () => {
    expect(sha256(readFileSync(`${FP}/repository-supplement-v1.json`))).toBe(
      "ca922ac896858c16597826e3f81e30f1c74f6903e466b5e053c891fd4b8b3296",
    );
    const script = read("scripts/verify/field-policy-census.mjs");
    expect(
      missing(script, [
        "supabase/migrations/20260702090000_donation_stripe_refund_ids.sql",
        "2fd5fe0c396d9662e5595b1f24879c4b3dc5404b9ab24b7c0ff60c144d1b9bda",
        '"git",',
        'name: "stripe_refund_ids"',
        'udt_name: "_text"',
      ]),
    ).toEqual([]);
    expect(missing(script, [/reviewed supplements/i])).toEqual([]);
    expect(
      /single source supplement|\b172\b|\b860\b/.test(script),
      "stale",
    ).toBe(false);
    const own = migrationFile();
    const v2 = read(`${FP}/${V2}`);
    expect(
      missing(v2, [
        `"supabase/migrations/${own}"`,
        sha256(readFileSync(`${MIGRATIONS}/${own}`)),
        '"email_normalized"',
        '"email_verified_at"',
      ]),
      V2,
    ).toEqual([]);
  });
  it("supabase/tests/field_policies_foundation.sql expects 174 columns and 870 rows", () => {
    const sql = read("supabase/tests/field_policies_foundation.sql");
    expect(sql).toMatch(/<>\s*174\b/);
    expect(sql).toMatch(/<>\s*870\b/);
    expect(sql).not.toMatch(/<>\s*(?:172|860)\b/);
  });
});

describe("#2254 criterion 8: CI migrate step (Samson clarification)", () => {
  const steps = () =>
    loadWorkflowDocument(".github/workflows/ci-integration.yml").jobs!.migrate!
      .steps as Record<string, string>[];
  it("one name+run step after the reader-role step runs the issue-2254 real-stack file(s)", () => {
    const all = steps();
    const reader = all.findIndex(
      (s) => s.name === "Verify document-cutover reader role (real stack)",
    );
    const index = all.findIndex((s) =>
      /tests\/unit\/acceptance\/issue-2254\//.test(s.run ?? ""),
    );
    expect(reader).toBe(14);
    expect(index).toBeGreaterThan(reader);
    const step = all[index]!;
    expect(Object.keys(step).sort()).toEqual(["name", "run"]);
    expect(step.run).toMatch(
      /^bun x vitest run tests\/unit\/acceptance\/issue-2254\//,
    );
    expect(MODELLED_KEYS_BY_JOB.migrate!.steps[`name:${step.name}`]).toEqual([
      "name",
      "run",
    ]);
    const pin = PINNED_STEP_BODIES.migrate![`name:${step.name}`];
    expect(pin?.index).toBe(index);
    expect(pin?.run).toBe(step.run!.trim());
  });
  it("docs/ci.md migrate section describes the step", () => {
    const ci = read("docs/ci.md");
    const section = ci.slice(
      ci.indexOf("### `migrate`"),
      ci.indexOf("### `smoke`"),
    );
    expect(/2254/.test(section), "migrate section names #2254").toBe(true);
  });
});

describe("#2254 criteria 12 + 13: docs", () => {
  const doc = () => flat(read(DOC));
  it.each([
    [
      "normalizer contract (criterion 1) and parity fixture",
      [
        "public.normalize_email",
        "IMMUTABLE",
        "STRICT",
        "PARALLEL SAFE",
        "search_path",
        "NFKC",
        "UTF8",
        "foo@bar.com",
        "a@x.com",
        "fi@x.com",
        "a+tag@x.com",
        "a.b@gmail.com",
        "ＦＯＯ",
        /plus[- ]tag/i,
      ],
    ],
    [
      "İ, ß and final Σ out of contract",
      ["İ", "ß", "Σ", /out[- ]of[- ]contract/i],
    ],
    [
      "criteria 3, 4, 6: generated column, email_verified_at (#509), both keys",
      [
        /generated/i,
        "email_normalized",
        "email_verified_at",
        "#509",
        "(tenant_id, profile_id)",
        "donors_tenant_email_normalized_uidx",
        /email_normalized IS NOT NULL/i,
      ],
    ],
    [
      "criterion 7: fail loud before any DDL, ids-only, never automatic",
      [
        /before any DDL/i,
        /no (?:email|PII)|without (?:email|PII)|ids[- ]only/i,
        /never automatic|no automatic|not automatic/i,
      ],
    ],
    [
      "criterion 12: no lower(email); guest matcher exception pending #508",
      [
        "lower(email)",
        "packages/api/src/donate/guest/donor-matching.ts",
        "#508",
      ],
    ],
    [
      "Q7 trade-off: merged donor counts against the key; #512",
      [/merged/i, "donor_merge_redirects", "#512"],
    ],
  ] as const)("%s", (_t, pats) => {
    expect(missing(doc(), [...pats]), `${DOC} (In 5)`).toEqual([]);
  });
  it("publishes a read-only ```sql Q10 preflight with the inlined expression (criterion 7, Q2)", () => {
    const q = [...read(DOC).matchAll(/```sql\n([\s\S]*?)```/gi)]
      .map((m) => m[1]!)
      .find((b) => INLINE.test(b) && /HAVING\s+count\s*\(/i.test(b));
    expect(q, "preflight block").toBeDefined();
    expect(/normalize_email/i.test(q!), "no normalize_email call").toBe(false);
    expect(missing(q!, ["profile_id", "tenant_id"])).toEqual([]);
    expect(
      /\b(?:INSERT|UPDATE|DELETE|ALTER|DROP|CREATE|TRUNCATE|MERGE)\b/i.test(q!),
      "read-only",
    ).toBe(false);
  });
  it("README states 174 candidate columns / 870 rows and the v2 supplement", () => {
    const readme = flat(read(`${FP}/README.md`));
    expect(missing(readme, ["174 candidate columns", "870 rows", V2])).toEqual(
      [],
    );
    expect(/172 candidate columns|860 rows/.test(readme), "stale counts").toBe(
      false,
    );
  });
});
