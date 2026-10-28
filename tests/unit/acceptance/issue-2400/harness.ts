/**
 * #2400 checkers (spec r1 = issue comment 6452273654, approved 6452289573).
 * Each returns the list of problems found in the text it is given, so the
 * static suite runs it on the working tree and on in-test mutants (§9). Pins
 * are literals computed from develop a8fbab2f48086f7c39af2ea1b68028f625549fa8,
 * not `git show`, so shallow CI checkouts need no history. Owned by
 * Acceptance; implementers must not edit.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { MIGRATION, V3, code } from "../issue-2256/harness";

export { MIGRATION, ROLLBACK, DOC, FP, V3 } from "../issue-2256/harness";
export const read = (p: string) =>
  existsSync(p) ? readFileSync(p, "utf8") : "";
export const sha = (b: string | Buffer) =>
  createHash("sha256").update(b).digest("hex");
const flat = (s: string) => s.replace(/\s+/g, " ").trim();

/** Criterion 3: SHA-256 of `code()` (comments stripped) whitespace-collapsed, at a8fbab2f. */
export const FORWARD_CODE_SHA =
  "7eafdcb2e37f9dc1d603df4d31b506f006d943f4169c947afd34507cf459777f";
/** Criterion 4: the rollback's statements at a8fbab2f, without BEGIN. */
export const ROLLBACK_REST = [
  "DELETE FROM public.field_policies WHERE record_type IN ('missionaries', 'profiles') AND field_key = 'person_id' AND tenant_id IS NULL",
  ...["missionaries", "profiles"].flatMap((t) =>
    ["same_tenant_fk", "requires_tenant_check"].map(
      (c) =>
        `ALTER TABLE public.${t} DROP CONSTRAINT IF EXISTS ${t}_person_${c}`,
    ),
  ),
  "ALTER TABLE public.missionaries DROP COLUMN IF EXISTS person_id",
  "ALTER TABLE public.profiles DROP COLUMN IF EXISTS person_id",
  "DROP TABLE IF EXISTS public.persons",
  "COMMIT",
];
/** Criterion 6: the census PASS lines at a8fbab2f (counts unchanged). */
export const PASS_LINES = [
  "immutable live provenance, 171 exact whole columns, same-name floors, five explicit surfaces, reserved receipts and processor locks.",
  "all 880 database seed rows exactly equal the reviewed census categories and explicit flags.",
  "exactly 176 candidate columns equal immutable live171 plus the reviewed source-bound supplements.",
  "supplement base source hash and exact local TEXT[]/NOT NULL/default metadata.",
  "identity supplement working-tree source hash and exact local generated TEXT/TIMESTAMPTZ metadata.",
  "person anchor supplement working-tree source hash and exact local nullable UUID metadata.",
].map((l) => `PASS: ${l}`);
/** §1.5 / OQ5. */
export const MISMATCH = "field-policy census: v3 source_sha256 mismatch for ";

/** Statements: comments stripped, split on `;`, whitespace collapsed (literals kept). */
export const stmts = (sql: string) =>
  code(sql).split(";").map(flat).filter(Boolean);
/** The leading comment block before the `BEGIN;` line, `--` markers removed. */
export const header = (sql: string) =>
  flat((sql.split(/^BEGIN;\s*$/m)[0] ?? "").replace(/^\s*--/gm, " "));
/** True when `a` occurs with every one of `all` within `w` chars around it. */
const near = (t: string, a: RegExp, all: RegExp[], w = 200) =>
  [...t.matchAll(new RegExp(a.source, "gi"))].some((m) => {
    const s = t.slice(Math.max(0, m.index - w), m.index + w);
    return all.every((r) => r.test(s));
  });
const sentence = (t: string, all: RegExp[]) =>
  t.split(/(?<=\.)\s+/).some((s) => all.every((r) => r.test(s)));
/** Labels of the checks that failed. */
const groups = (t: string, re: RegExp) =>
  [...t.matchAll(re)].map((m) => m[1]!.trim());
const failed = (checks: [boolean, string][]) =>
  checks.filter(([ok]) => !ok).map(([, label]) => label);

/** Criterion 3 (M3, M4). */
export function forwardProblems(sql: string): string[] {
  const h = header(sql);
  // prettier-ignore
  return failed([
    [near(h, /ACCESS EXCLUSIVE/, [/missionaries/, /profiles/]), "ACCESS EXCLUSIVE on missionaries, profiles"],
    [near(h, /SHARE ROW EXCLUSIVE/, [/\bFKs?\b|foreign key/i, /persons/]), "FKs: SHARE ROW EXCLUSIVE, persons"],
    [/until commit/i.test(h), "until COMMIT"],
    [sentence(h, [/lock_timeout/, /\bonly\b/i, /\bwait/i]), "lock_timeout bounds only the wait"],
    [h.includes("not authoritative; see #2267"), "OQ6: not authoritative; see #2267"],
    [!/(?:isn't|is not|not) held for a (?:full )?scan/i.test(h), "keeps 'isn't held for a scan'"],
    [!/never an authorization input|nullable home\/UI hint/.test(h), "keeps a8fbab2f :13-14 wording"],
    [sha(flat(code(sql))) === FORWARD_CODE_SHA, "non-comment text differs from a8fbab2f"],
  ]);
}

const LOCK = /^SET LOCAL lock_timeout\s*(?:=|TO)\s*'5s'$/i;
/** Criterion 4 (M6), on the file text and on #2256's `body()` of it. */
export function rollbackProblems(sql: string, bodyText: string): string[] {
  const s = stmts(sql);
  const rest = s.slice(1).filter((x) => !LOCK.test(x));
  // prettier-ignore
  return failed([
    [s[0] === "BEGIN", "statement 1 is BEGIN"],
    [LOCK.test(s[1] ?? ""), "statement 2 is SET LOCAL lock_timeout = '5s'"],
    [JSON.stringify(rest) === JSON.stringify(ROLLBACK_REST), "rest equals a8fbab2f"],
    [LOCK.test(stmts(bodyText)[0] ?? ""), "body(): SET LOCAL runs first"],
    [/55P03/.test(header(sql)), "header mentions 55P03"],
  ]);
}

/** `## title` section of a markdown doc ("" when absent). */
const section = (md: string, title: string) =>
  flat(md.split(/^## /m).find((s) => s.startsWith(`${title}\n`)) ?? "");
const DEPLOY_TERMS = [
  /ACCESS EXCLUSIVE/,
  /SHARE ROW EXCLUSIVE/,
  /persons/,
  /tenants/,
  /\bCOMMIT\b/i,
  /lock_timeout/,
  /55P03/,
  /40P01/,
];
/** Criterion 5 (M9). */
export function docProblems(md: string): string[] {
  const deploy = section(md, "Deploy: lock timeout");
  const rollback = section(md, "Rollback and order");
  // prettier-ignore
  return failed([
    ...DEPLOY_TERMS.map((t): [boolean, string] => [t.test(deploy), `deploy: ${t}`]),
    [!/no lock is held for a full scan/i.test(deploy), "deploy keeps 'no lock is held for a full scan'"],
    [/\b23\b/.test(rollback) && /\b15\b/.test(rollback), "rollback: ordinals 23 and 15"],
    [/local_catalog/.test(rollback), "rollback: local_catalog"],
  ]);
}

type Chain = {
  forward: Buffer;
  v3: Buffer;
  census: string;
  foundation: string;
};
/** Criterion 6 (M5): forward bytes -> v3 source_sha256 -> v3 bytes -> census-v1, and the SQL literals. */
export function chainProblems(f: Chain): string[] {
  const fwd = sha(f.forward);
  const census = JSON.parse(f.census) as {
    repository_supplements: { artifact: string; sha256: string }[];
  };
  const entry = census.repository_supplements.find((x) => x.artifact === V3);
  const lits = [
    ...f.foundation.matchAll(
      /'supabase\/migrations\/20261025110000_person_anchor\.sql',\s*'([0-9a-f]{64})'/g,
    ),
  ].map((m) => m[1]);
  const v3 = JSON.parse(f.v3.toString()) as { source_sha256: string };
  // prettier-ignore
  return failed([
    [v3.source_sha256 === fwd, "v3 source_sha256"],
    [entry?.sha256 === sha(f.v3), "census-v1 v3 sha256"],
    [lits.length === 2 && lits.every((l) => l === fwd), "foundation SQL literals"],
  ]);
}

/** Criteria 5/6 (M8): the v3 source-hash assert carries the §1.5 message; PASS lines unchanged. */
export function censusProblems(mjs: string): string[] {
  const at = mjs.indexOf("person.source_sha256");
  const tail = at < 0 ? "" : mjs.slice(at, mjs.indexOf(");", at));
  const pass = [...mjs.matchAll(/"(PASS: [^"]+)"/g)].map((m) => m[1]);
  // prettier-ignore
  return failed([
    [[MIGRATION, "${person.source_path}"].some((f) => tail.includes(`${MISMATCH}${f}`)), "§1.5 message"],
    [JSON.stringify(pass) === JSON.stringify(PASS_LINES), "PASS lines"],
  ]);
}

/** Criterion 1: realstack files named in a step's `run`. */
export const realstackFiles = (run: string) =>
  run.match(/\S+\.realstack\.acceptance\.test\.ts/g) ?? [];
const REPLAY =
  /\bmigrationBatch\(|\bbody\(\s*(?:MIGRATION|ROLLBACK)\b|\bbatch\(\s*(?:\w+\.)?(?:FORWARD|ROLLBACK)\b|\.query\(\s*(?:\w+\.)?read(?:FileSync)?\(|read(?:FileSync)?\(\s*["'`]supabase\/migrations\//;
const ADMIN_VAR =
  /\b(?:const|let)\s+(\w+)\s*=\s*process\.env\.TENANT_GUARD_IT_ADMIN_DATABASE_URL\b/g;
/** Receiver (last segment, e.g. `s.db` -> `db`) of each replaying `.query(`. */
const CLIENT_CALL =
  /(?:[\w]+\.)*(\w+)\.query\(\s*(?:\w+\.)?(?:migrationBatch|body|batch|read|readFileSync)\(/g;

/** `<client> = new pg.Client({ connectionString: <url>`; captures <url>. */
const CTOR = String.raw`\s*(?::[^=;]+)?=\s*new\s+pg\.Client\(\s*\{\s*connectionString:\s*([^,}]+)`;

/**
 * Criterion 1 guard for one step's `run` (M1, M2). `text(file)` is the file
 * plus its sibling harness.ts. Files that replay migration or rollback text
 * must create a template0 database, drop it WITH (FORCE), and run the replay on
 * a client whose URL has that database's pathname, never the admin URL.
 */
export function guard(run: string, text: (file: string) => string) {
  const files = realstackFiles(run);
  const replaying: string[] = [];
  const problems: string[] = [];
  if (files.length < 2) return { replaying, problems };
  for (const file of files) {
    const t = text(file);
    if (!t) problems.push(`${file}: missing`);
    if (!REPLAY.test(t)) continue;
    replaying.push(file);
    const bad = (m: string) => problems.push(`${file}: ${m}`);
    if (!/TEMPLATE\s+template0/i.test(t))
      bad("no CREATE DATABASE … TEMPLATE template0");
    if (!/DROP DATABASE[^;`]*WITH\s*\(\s*FORCE\s*\)/i.test(t))
      bad("no DROP DATABASE … WITH (FORCE)");
    const admin = groups(t, ADMIN_VAR);
    const clients = [...new Set(groups(t, CLIENT_CALL))];
    if (!clients.length) bad("replay not run through a traceable client");
    for (const c of clients) {
      const urls = groups(t, new RegExp(`\\b${c}${CTOR}`, "g"));
      if (!urls.length) bad(`client ${c}: no pg.Client construction`);
      for (const u of urls) {
        const base = u.replace(/^this\./, "").replace(/\.toString\(\)$/, "");
        const pathname = new RegExp(
          `\\b${base}\\.pathname\\s*=|\\b${base}\\s*=\\s*Object\\.assign\\(\\s*new URL\\([^)]*\\)\\s*,\\s*\\{\\s*pathname`,
        );
        if (admin.includes(base) || /process\.env/.test(u) || !pathname.test(t))
          bad(`client ${c} connects to ${u}, not a private database`);
      }
    }
  }
  return { replaying, problems };
}
