/**
 * #2260 acceptance, no database. Spec r2 (comment 6386169035, edited in place
 * with addendum 6407195511): criteria 17-20, plus opt-in criterion 17 (base
 * version) and 27 (diff scope): set ACCEPTANCE_2260_SCOPE=1 (base: git
 * merge-base origin/develop HEAD) or ACCEPTANCE_2260_BASE=<ref> (#2183 pattern).
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as H from "./harness";
import { D, S } from "../issue-2251/harness";

const sha256 = (b: string | Buffer) =>
  createHash("sha256").update(b).digest("hex");
const ver = (f: string) => f.slice(0, 14);
const forward = (fs: string[]) => fs.filter((f) => /^\d{14}_.+\.sql$/.test(f));
const sql = () => {
  expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist`).toBe(true);
  return H.code(H.read(H.MIGRATION));
};
/**
 * sha256 of the other exceptions entry lines, trimmed, "\n"-joined. It was
 * 9b004012... for the 85 lines at develop 0727d810; AL-2674 (D09) drops the
 * backup_notification_queue_orphans_20260214 table and its entry, and this is
 * the digest of those same lines without that one.
 */
const OTHERS_SHA =
  "866842f870309fb9a6e47f9d9a138c3ba4a612c0b08cca3ce49b335dee76d1f9";
/** Reviewed docs/ci.md prefixes, one entry per reviewed file. */
const CI_BASES = [
  // Reviewed hosted-only R1 pointer amendment to #2250's CI-doc prefix.
  {
    bytes: 40204,
    sha256: "8a5c648f445c05f600b568a754e9b5caa84c969c8e3747bac4b941d3508a40ed",
  },
  // #2215: only the `test-e2e` bullet's e2e-gate merge_group skip cause changes.
  {
    bytes: 40426,
    sha256: "b3522e382167e183488bae59835785bde27aa4f7a1bef28fad6b99b5eecea544",
  },
  // Amended by AL-2674 (WP1 slice 1.3, plan 7.1): docs/ci.md documents the
  // release workflow, the preview database job and the two new migrate
  // steps, and its field-policy paragraph describes the classification
  // manifest that replaced the AL-491 census. Pinned on that exact reviewed
  // whole file.
  {
    bytes: 44177,
    sha256: "97278ee9a0648442ac26f152b01acc8c16ae96f9478e5d7f4bdab556dc076118",
  },
  // Amended by AL-2674 (WP1.2 joined): docs/ci.md's Node line follows
  // .node-version to 24.22.3, its migrate real-stack bullet describes the three
  // AL-2674 steps (the program-wide suite glob, the release and CMS role
  // suites, the Payload qualification), its migrate summary names the
  // seed-count check and supabase/seed-expectations.json, and its release
  // section names PAYLOAD_MIGRATION_DATABASE_URI. Pinned on that exact reviewed
  // whole file.
  {
    bytes: 45088,
    sha256: "6cb39ed32ae6b0a6e7a57bb7b62ad8e6bf179086703cb32f9b4f6bb42d3a4ada",
  },
  {
    // Amended by AL-2673 (council round 2, B4 and its follow-up): docs/ci.md
    // gains one section, "Local Supabase stack workflow", after the release
    // workflow section. It documents `.github/workflows/local-supabase.yml`,
    // which applies the chain and the seed to the real Supabase image and runs
    // the auth email round trips, a workflow of its own so that ci.yml and
    // ci-integration.yml do not change. Nothing else in the file changes.
    // Pinned on that exact reviewed whole file.
    bytes: 46788,
    sha256: "b83d66c4b3ccfc91c2ba86c7118eebff6e9e1b5fafcf748ad9996b1a4a3e006b",
  },
  {
    // Amended by AL-2674 (WP1.6, record D-18): docs/ci.md's "Local Supabase
    // stack workflow" section gains one bullet, and its count of what it
    // guards goes from two to three. The workflow now also replays the chain
    // on plain Postgres as the release job does (`--hosted-defaults`) and
    // fails unless that replay fingerprints exactly as the stack does, so a
    // change of Supabase's default privileges fails a pull request rather
    // than a release. Nothing else in the file changes.
    // Pinned on that exact reviewed whole file.
    bytes: 47141,
    sha256: "a1e298892caec8406bdeef31e41814f9532bf3527e2d77436104d052d1d4ad37",
  },
  {
    // Amended by AL-2674 (WP1.6 review H7, record D-18): the WP1.6 bullet of
    // docs/ci.md's "Local Supabase stack workflow" section no longer says
    // that a change of Supabase's default privileges fails a pull request
    // rather than a release. It says the job compares with the image the
    // pinned CLI starts, not with hosted, and that the release's gates catch
    // a change on hosted. Nothing else in the file changes. Pinned on that exact reviewed whole file.
    bytes: 47190,
    sha256: "74852f931758754843fbd50e41d432fbd40375f06f002c99f3524417f2b8782e",
  },
  // D-18: WP2H documents the proof dependencies, including its Vitest config and resolver plugins.
  // This pin accepts only the reviewed file bytes, as before.
  {
    bytes: 47791,
    sha256: "bac3dc897167173b05ea29aca95ac25f4bd64f675f22780c71aeba1821b6a5b6",
  },
];
/** Criterion 20 doc rules, " ~ "-separated regexes. */
const DOC_RULES = String.raw`anon ~ authenticated ~ service_role ~ SELECT, INSERT, UPDATE ~ auth\.uid\(\) ~ authz\.current_tenant_id\(\) ~ cross[- ]tenant ~ default (privileges|grants) ~ DELETE ~ #2251 ~ #668 ~ Down`;

describe("#2260 static (17-20)", () => {
  it(`17: ${H.MIGRATION_NAME} is the only *_donor_feed_preferences_own_rows.sql, version unique and > ${H.DEVELOP_LATEST}`, () => {
    sql();
    const all = forward(readdirSync(H.MIG));
    expect(
      all.filter((f) =>
        /^\d{14}_donor_feed_preferences_own_rows\.sql$/.test(f),
      ),
    ).toEqual([H.MIGRATION_NAME]);
    expect(ver(H.MIGRATION_NAME) > H.DEVELOP_LATEST).toBe(true);
    expect(all.filter((f) => ver(f) === ver(H.MIGRATION_NAME))).toHaveLength(1);
  });
  it("17: -- Down: header, REVOKE ALL, #2251 precondition; no current_tenant_id, publication or DELETE grant", () => {
    sql();
    expect(H.read(H.MIGRATION)).toMatch(/^-- Down:/);
    const body = sql();
    expect(body).toMatch(
      /REVOKE\s+ALL\s+ON\s+(TABLE\s+)?public\.donor_feed_preferences\s+FROM\s+PUBLIC\s*,\s*anon\s*,\s*authenticated\s*;/i,
    );
    expect(body).toMatch(/relforcerowsecurity/i);
    expect(body).toMatch(/RAISE[\s\S]*#2251/i);
    expect(body).not.toMatch(
      /FUNCTION\s+authz\.current_tenant_id\s*\(|ALTER\s+PUBLICATION/i,
    );
    for (const g of body.match(/\bGRANT\b[^;]*;/gi) ?? [])
      expect(g).not.toMatch(/\b(DELETE|ALL|TRUNCATE)\b/i);
  });
  it("18: exceptions JSON drops only donor_feed_preferences: 84 entries (67 S + 17 D, after AL-2674), others byte-identical, sorted", () => {
    const raw = H.read(H.EXCEPTIONS);
    const e = (
      JSON.parse(raw) as { entries: { table: string; outcome: string }[] }
    ).entries;
    const n = (o: string) => e.filter((x) => x.outcome === o).length;
    expect([e.length, n("service_role_needed"), n("deny_by_default")]).toEqual([
      84, 67, 17,
    ]);
    const lines = raw
      .split("\n")
      .filter((l) => l.includes('"table"'))
      .map((l) => l.trim().replace(/,$/, ""));
    const tables = lines.map((l) => (JSON.parse(l) as { table: string }).table);
    expect(tables).not.toContain(H.TABLE);
    expect(tables).toEqual([...Object.keys(S), ...D].sort());
    expect(sha256(lines.join("\n")), "other entries changed").toBe(OTHERS_SHA);
  });
  // Rewritten by the WP2a sweep (AL-2675; plan 5.4 NX-03, WP2 exit "no route
  // reads the token claim"): the route took its tenant from the token's
  // app_metadata claim; it now takes the request's resolved donor
  // assignment's, and reads no claim at all.
  it(`19: ${H.ROUTE}: no default/literal tenant, email lookup or admin client; tenant from the resolved assignment, no claim`, () => {
    const src = H.read(H.ROUTE);
    expect(src).toMatch(/\bgetAuthContext\(request\)/);
    expect(src).toMatch(/auth\.isAuthenticated \? auth\.tenantId : null/);
    expect(src).not.toMatch(/app_metadata|user_metadata|getClaims\(/);
    expect(src).not.toMatch(
      /DEFAULT_TENANT_ID|00000000-0000-0000-0000-000000000001|\.eq\(\s*["'`]email["'`]|\b(get|create)AdminClient\s*\(/,
    );
    const imports = src.match(/^import\b[^;]*;/gm) ?? [];
    expect(imports.filter((i) => /admin|service[-_]?role/i.test(i))).toEqual(
      [],
    );
    if (!existsSync(H.ALLOWLIST)) return;
    const a = (
      JSON.parse(H.read(H.ALLOWLIST)) as { entries: { file: string }[] }
    ).entries;
    expect(a.length, "117 entries at develop 0727d810").toBeLessThanOrEqual(
      117,
    );
    expect(a.map((x) => x.file)).not.toContain(H.ROUTE);
  });
  it.each(DOC_RULES.split(" ~ "))(`20: ${H.DOC} matches /%s/i`, (re) =>
    expect(H.read(H.DOC)).toMatch(new RegExp(re, "i")),
  );
  it("20: docs/ci.md keeps develop's bytes as a prefix; nothing #2260 after it", () => {
    const bytes = readFileSync("docs/ci.md");
    const base = CI_BASES.find(
      (b) => sha256(bytes.subarray(0, b.bytes)) === b.sha256,
    );
    expect(base, "docs/ci.md prefix").toBeDefined();
    expect(bytes.subarray(base!.bytes).toString("utf8")).not.toMatch(
      /2260|donor_feed_preferences/i,
    );
  });
});

const BASE = process.env.ACCEPTANCE_2260_BASE?.trim() ?? "";
const ON = process.env.ACCEPTANCE_2260_SCOPE?.trim() === "1" || BASE !== "";
const git = (...args: string[]) => {
  const r = spawnSync("git", args, { encoding: "utf8" });
  expect(r.status, `git ${args.join(" ")}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
};
/** §6 paths (Builder + Acceptance) plus the #2155/#2201 fingerprint appends the workflow edit forces. */
const DECLARED = [
  H.MIGRATION,
  H.ROUTE,
  H.EXCEPTIONS,
  H.DOC,
  ".github/workflows/ci-integration.yml",
].concat(
  `helpers/workflow-yaml.ts packages/api/feed-preferences.test.ts acceptance/issue-2250/static.acceptance.test.ts
  acceptance/issue-2251/harness.ts acceptance/issue-2251/rls-posture.realstack.acceptance.test.ts
  acceptance/issue-2251/static.acceptance.test.ts acceptance/issue-2253/rls-catalog-gate.realstack.acceptance.test.ts
  scripts/rls-deny-by-default-exceptions.test.ts scripts/supabase-migrations.test.ts
  acceptance/issue-2155/postgres-ecr-gates.acceptance.test.ts acceptance/issue-2201/merge-group.acceptance.test.ts`
    .split(/\s+/)
    .map((p) => `tests/unit/${p}`),
);

describe.skipIf(!ON)(
  "#2260 opt-in (PR base; ACCEPTANCE_2260_SCOPE=1 or ACCEPTANCE_2260_BASE)",
  () => {
    const base = () => BASE || git("merge-base", "origin/develop", "HEAD");
    it("17: the version is greater than every migration on the PR base", () => {
      const onBase = forward(
        git("ls-tree", "--name-only", `${base()}:${H.MIG}`).split("\n"),
      );
      expect(
        onBase.filter((f) => ver(f) >= ver(H.MIGRATION_NAME)),
        `base ${base()}`,
      ).toEqual([]);
    });
    it("27: the PR diff touches only §6 paths and tests/unit/acceptance/issue-2260/", () => {
      const changed = [
        ...git("diff", "--name-only", "--no-renames", base()).split("\n"),
        ...git("ls-files", "--others", "--exclude-standard").split("\n"),
      ].filter(Boolean);
      const outside = changed.filter(
        (f) =>
          !DECLARED.includes(f) &&
          !f.startsWith("tests/unit/acceptance/issue-2260/"),
      );
      expect(outside, `diff against ${base()}`).toEqual([]);
      expect(changed).toContain(H.REALSTACK);
    });
  },
);
