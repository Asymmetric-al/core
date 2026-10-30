/**
 * #2253 real-stack acceptance: r1 §6 criteria 1-6. Runs against the migrated
 * database named by TENANT_GUARD_IT_ADMIN_DATABASE_URL (PG17 superuser, as in
 * CI's `migrate` job); without it the block skips, except in that job, where
 * it fails. Each fixture runs inside the gate's own psql session, wrapped in
 * BEGIN ... ROLLBACK by a psqlBin shim, so nothing persists.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import pg from "pg";
import { afterAll, describe, expect, it } from "vitest";

import {
  CATALOG,
  EXCEPTIONS,
  MARKER,
  VERIFIER,
  read,
  removeTempDirs,
  tempDir,
  tempRepo,
} from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const dir = tempDir("psql-");
afterAll(removeTempDirs);
let shims = 0;
/** A psqlBin that runs `sql` then the caller's command in one rolled-back transaction. */
function shim(sql: string, body?: string) {
  const f = path.join(dir, `psql-${++shims}`);
  writeFileSync(
    path.join(dir, `fx-${shims}.sql`),
    sql || "select 1 where false;",
  );
  writeFileSync(
    f,
    `#!/bin/bash\n${body ?? ""}\nexec psql -q -c BEGIN -f "${dir}/fx-${shims}.sql" "$@" -c ROLLBACK\n`,
    { mode: 0o755 },
  );
  return f;
}
type Failure = { code: string; table?: string; function?: string };
type Result = { ok?: boolean; failures?: Failure[]; thrown?: string };
/** Calls runTenantRlsCatalogGate from `root` in a child process (cwd = root). */
function run(psqlBin: string, root = process.cwd()): Result {
  const url = pathToFileURL(path.join(root, CATALOG)).href;
  const code = `const m = await import(${JSON.stringify(url)});
try { console.log(JSON.stringify(await m.runTenantRlsCatalogGate({ databaseUrl: process.env.ACC_URL, psqlBin: process.env.ACC_PSQL }))); }
catch (e) { console.log(JSON.stringify({ thrown: String(e?.message ?? e) })); }`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ACC_URL: ADMIN_URL, ACC_PSQL: psqlBin },
  });
  return JSON.parse(
    r.stdout.trim().split("\n").pop() ||
      `{"thrown":${JSON.stringify(r.stderr)}}`,
  ) as Result;
}
/** [code, bare object name] pairs, sorted. */
const pairs = (r: Result) =>
  (r.failures ?? [])
    .map((f) => [
      f.code,
      String(f.table ?? f.function)
        .replace(/\(.*$/, "")
        .split(".")
        .pop()!
        .replace(/"/g, ""),
    ])
    .sort();

const NOBYPASS = "create role acc2253_nobypass nosuperuser nobypassrls;";
const TENANT = (t: string, extra = "") =>
  `create table public.${t} (id int, tenant_id uuid)${extra};`;
const POLICY = (t: string) =>
  `create policy acc2253 on public.${t} using (true);`;
const CASES: [string, string, string[][]][] = [
  [
    "RLS_DISABLED (forced, with policy, not enabled)",
    `${TENANT("acc2253_off")} alter table public.acc2253_off force row level security; ${POLICY("acc2253_off")}`,
    [["RLS_DISABLED", "acc2253_off"]],
  ],
  [
    "FORCE_MISSING (enabled, with policy)",
    `${TENANT("acc2253_unforced")} alter table public.acc2253_unforced enable row level security; ${POLICY("acc2253_unforced")}`,
    [["FORCE_MISSING", "acc2253_unforced"]],
  ],
  [
    "NO_POLICY_UNLISTED (enabled, forced, no policy, not listed)",
    `${TENANT("acc2253_nopol")} alter table public.acc2253_nopol enable row level security, force row level security;`,
    [["NO_POLICY_UNLISTED", "acc2253_nopol"]],
  ],
  [
    "all three on a bare partitioned (relkind p) tenant table",
    "create table public.acc2253_part (tenant_id uuid) partition by list (tenant_id);",
    [
      ["FORCE_MISSING", "acc2253_part"],
      ["NO_POLICY_UNLISTED", "acc2253_part"],
      ["RLS_DISABLED", "acc2253_part"],
    ],
  ],
  [
    "nothing for a non-tenant table, a dropped tenant_id, a view or a non-public schema (5)",
    `create table public.acc2253_plain (id int); ${TENANT("acc2253_dropped")} alter table public.acc2253_dropped drop column tenant_id; create view public.acc2253_v as select null::uuid tenant_id; create schema acc2253_s; create table acc2253_s.t (tenant_id uuid); ${NOBYPASS} alter table public.acc2253_plain owner to acc2253_nobypass;`,
    [],
  ],
  [
    "stale exceptions: gained a policy, dropped, lost tenant_id (3)",
    "create policy acc2253 on public.donor_merge_candidates using (false); drop table public.backup_notification_queue_orphans_20260214; alter table public.currency_rate_snapshots drop column tenant_id cascade;",
    [
      ["STALE_HAS_POLICY", "donor_merge_candidates"],
      ["STALE_MISSING_TABLE", "backup_notification_queue_orphans_20260214"],
      ["STALE_NOT_TENANT", "currency_rate_snapshots"],
    ],
  ],
  [
    "OWNER_NO_BYPASS for a compliant tenant table owned by a non-bypass role (4)",
    `${NOBYPASS} ${TENANT("acc2253_owned")} alter table public.acc2253_owned enable row level security, force row level security; ${POLICY("acc2253_owned")} alter table public.acc2253_owned owner to acc2253_nobypass;`,
    [["OWNER_NO_BYPASS", "acc2253_owned"]],
  ],
  [
    "DEFINER_OWNER_NO_BYPASS in public/authz/document_cutover/private only; invoker and tenant_guard-owned exempt (4)",
    `${NOBYPASS} create schema acc2253_s; do $$ declare s text; begin
      foreach s in array array['public', 'authz', 'document_cutover', 'private', 'acc2253_s'] loop
        execute format('create function %I.acc2253_def_%s() returns int language sql security definer as ''select 1''', s, s);
        execute format('alter function %I.acc2253_def_%s() owner to acc2253_nobypass', s, s);
      end loop; end $$;
      create function public.acc2253_invoker() returns int language sql as 'select 1';
      alter function public.acc2253_invoker() owner to acc2253_nobypass;
      create function public.acc2253_guard() returns int language sql security definer as 'select 1';
      alter function public.acc2253_guard() owner to tenant_guard;`,
    ["authz", "document_cutover", "private", "public"].map((s) => [
      "DEFINER_OWNER_NO_BYPASS",
      `acc2253_def_${s}`,
    ]),
  ],
];

// Runs in every migrate-job run: passes in the real step, fails without the URL.
it.runIf(IN_MIGRATE_JOB)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

/** Lead's ruling: the spec's tenant tables (public, relkind r/p, live tenant_id) and how many have policies, read from the replayed DB itself (not via the gate). */
async function catalogCounts() {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  await db.connect();
  const { rows } =
    await db.query(`select count(*)::int n, count(*) filter (where exists (select 1 from pg_policy p where p.polrelid = c.oid))::int pol
      from pg_class c join pg_namespace s on s.oid = c.relnamespace where s.nspname = 'public' and c.relkind in ('r', 'p')
      and exists (select 1 from pg_attribute a where a.attrelid = c.oid and a.attname = 'tenant_id' and a.attnum > 0 and not a.attisdropped)`);
  await db.end();
  return rows[0] as { n: number; pol: number };
}
const LISTED = 85;

describe.skipIf(!ADMIN_URL)(
  "#2253 tenant RLS catalog gate (real stack)",
  () => {
    it(`6: the clean catalog is green: every tenant table has a policy or is one of the ${LISTED} listed, 0 stale`, async () => {
      const r = run(shim(""));
      expect(r, JSON.stringify(r)).toMatchObject({ ok: true });
      expect(r.failures).toEqual([]);
      const { n, pol } = await catalogCounts();
      const listed = (JSON.parse(read(EXCEPTIONS)) as { entries: unknown[] })
        .entries.length;
      expect(listed).toBe(LISTED);
      expect(pol).toBeGreaterThan(0);
      expect(
        n,
        `${n} tenant tables = ${pol} with policies + ${listed} listed`,
      ).toBe(pol + listed);
    });

    it.each(CASES)("2-6: %s", (_name, sql, expected) => {
      const r = run(shim(sql));
      expect(r.ok, JSON.stringify(r)).toBe(expected.length === 0);
      expect(pairs(r)).toEqual(expected);
    });

    it.each<[string, string | null]>([
      ["a missing file", null],
      ["bad JSON", "{"],
      ["a duplicate table", "dup"],
      ["an entry without table", "notable"],
    ])("3: EXCEPTIONS_MALFORMED on %s", (_name, variant) => {
      const doc = JSON.parse(read(EXCEPTIONS)) as {
        entries: Record<string, unknown>[];
      };
      if (variant === "dup") doc.entries.push(doc.entries[0]!);
      if (variant === "notable")
        doc.entries.push({ outcome: "deny_by_default", reason: "x" });
      const text =
        variant === null ? null : variant === "{" ? "{" : JSON.stringify(doc);
      const root = tempRepo(
        [CATALOG],
        text === null ? {} : { [EXCEPTIONS]: text },
      );
      const r = run("psql", root);
      expect(r.ok).not.toBe(true);
      expect(JSON.stringify(r)).toContain("EXCEPTIONS_MALFORMED");
    });

    /** Shim for the verifier: migrations and the stdin probe are no-ops (the DB is already migrated); queries pass through. */
    function verifier(drift: string) {
      const log = path.join(dir, `log-${shims + 1}`);
      const body = `case " $* " in *" -f "*) exit 0;; *" -c "*) ;; *) cat >/dev/null; exit 0;; esac
case "$*" in *"${MARKER}"*) echo gate >> ${log};; *) echo census >> ${log}; exec psql "$@";; esac`;
      const psql = shim(drift, body);
      const r = spawnSync(process.execPath, [VERIFIER], {
        encoding: "utf8",
        env: { ...process.env, DATABASE_URL: ADMIN_URL, PSQL_BIN: psql },
      });
      return {
        status: r.status,
        out: `${r.stdout}\n${r.stderr}`,
        calls: read(log).trim().split("\n"),
      };
    }

    it("1, 6: supabase-migrations.mjs runs the gate once, after the census, then prints a counts line and the success line", async () => {
      const { n, pol } = await catalogCounts();
      const r = verifier("");
      expect(r.status, r.out).toBe(0);
      expect(r.calls[0]).toBe("census");
      expect(r.calls.filter((c) => c === "gate")).toHaveLength(1);
      const lines = r.out.split("\n");
      const done = lines.findIndex((l) =>
        /Verified \d+ forward Supabase migrations/.test(l),
      );
      expect(done).toBeGreaterThan(0);
      const word = (k: number) => new RegExp(`(?<![\\d.])${k}(?![\\d.])`);
      expect(
        lines
          .slice(0, done)
          .some((l) => [n, pol, LISTED].every((k) => word(k).test(l))),
        `gate summary line with the counts ${n} / ${pol} / ${LISTED}`,
      ).toBe(true);
    });

    it("1, 2: an unforced tenant table makes the verifier exit non-zero, name it, and skip the success line", () => {
      const r = verifier(
        "alter table public.donors no force row level security;",
      );
      expect(r.status).not.toBe(0);
      expect(r.calls).toContain("gate");
      expect(r.out).toContain("donors");
      expect(r.out).toContain("FORCE_MISSING");
      expect(r.out).not.toContain("forward Supabase migrations");
    });
  },
);
