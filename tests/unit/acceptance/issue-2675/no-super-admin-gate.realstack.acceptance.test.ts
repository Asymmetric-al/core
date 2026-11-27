/**
 * AL-2675 (WP2c rest, pull request B; brief stage5/wp2c-rest.md, invariant 6
 * of part B and its gate findings; record D-82, D-109 and section 9, "WP2c
 * part 3"): what the catalog gate's query must see on a real database. Each
 * case plants one violation in the migrated database, inside the gate's own
 * psql session, wrapped in BEGIN ... ROLLBACK by a psqlBin shim (the method of
 * ../issue-2253/rls-catalog-gate.realstack.acceptance.test.ts), so nothing
 * persists, and the gate must name exactly that violation. The evaluator's
 * half of each rule is tests/unit/scripts/tenant-rls-catalog-no-super-admin.test.ts.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts).
 */
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";
import { CATALOG, removeTempDirs, tempDir } from "../issue-2253/harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const dir = tempDir("psql-wp2cb-");
afterAll(removeTempDirs);
let shims = 0;
/** A psqlBin that runs `sql` then the gate's command in one rolled-back transaction. */
function shim(sql: string) {
  const f = path.join(dir, `psql-${++shims}`);
  writeFileSync(path.join(dir, `fx-${shims}.sql`), sql);
  writeFileSync(
    f,
    `#!/bin/bash\nexec psql -q -v ON_ERROR_STOP=1 -c BEGIN -f "${dir}/fx-${shims}.sql" "$@" -c ROLLBACK\n`,
    { mode: 0o755 },
  );
  return f;
}
type Failure = { code: string; table?: string; function?: string };
type Result = { ok?: boolean; failures?: Failure[]; thrown?: string };
/** Calls runTenantRlsCatalogGate in a child process, as the verifier does. */
function gate(sql: string): Result {
  const url = pathToFileURL(path.join(process.cwd(), CATALOG)).href;
  const code = `const m = await import(${JSON.stringify(url)});
try { console.log(JSON.stringify(await m.runTenantRlsCatalogGate({ databaseUrl: process.env.ACC_URL, psqlBin: process.env.ACC_PSQL }))); }
catch (e) { console.log(JSON.stringify({ thrown: String(e?.message ?? e) })); }`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    encoding: "utf8",
    env: { ...process.env, ACC_URL: ADMIN_URL, ACC_PSQL: shim(sql) },
  });
  return JSON.parse(
    r.stdout.trim().split("\n").pop() ||
      `{"thrown":${JSON.stringify(r.stderr)}}`,
  ) as Result;
}
const named = (r: Result) =>
  r.thrown
    ? [`thrown: ${r.thrown.slice(0, 300)}`]
    : (r.failures ?? [])
        .map((f) => `${f.code} ${f.table ?? f.function}`)
        .sort();

/** A tenant-bound read of a planted table, so that only the case's own violation is named. */
const TENANT = "tenant_id = (select authz.current_tenant_id())";
/** An overload of a request-tenant helper: the gate reads every overload as a root. */
const ROOT = (body: string) =>
  `create function authz.current_tenant_id(p uuid) returns uuid language sql stable set search_path = '' as $f$ ${body} $f$;`;
const READS_TENANT_CLAIM = `create function private.acc2675b_token_tenant() returns uuid language sql stable as $f$ select (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid $f$;`;

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c rest B: the catalog gate's query sees what the rules need (real stack)",
  () => {
    it("guard: the migrated chain passes with nothing planted", () => {
      expect(named(gate("select 1;"))).toEqual([]);
    });

    it("fails the role name tested in a policy outside public, and a policy that calls a function testing it", () => {
      expect(
        named(
          gate(
            "create policy acc2675b on authz.memberships for select to authenticated using (exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.role = 'super_admin'));",
          ),
        ),
      ).toEqual(["POLICY_SUPER_ADMIN_BRANCH authz.memberships"]);
      expect(
        named(
          gate(`create function public.acc2675b_platform_admin() returns boolean language sql stable set search_path = '' as $f$ select exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'super_admin') $f$;
            create policy acc2675b on public.donors for select to authenticated using (${TENANT} and (select public.acc2675b_platform_admin()));`),
        ),
      ).toEqual(["POLICY_SUPER_ADMIN_BRANCH donors"]);
    });

    it("fails a write policy that calls the staff-read helper, and a staff-wide read on the bare staff check", () => {
      expect(
        named(
          gate(
            `create policy acc2675b on public.crm_notes for insert to authenticated with check (${TENANT} and (select authz.staff_read()));`,
          ),
        ),
      ).toEqual(["STAFF_READ_HELPER_IN_WRITE crm_notes"]);
      expect(
        named(
          gate(
            `create policy acc2675b on public.funds for select to authenticated using (${TENANT} and (select authz.assignment_is('staff')));`,
          ),
        ),
      ).toEqual(["STAFF_READ_ON_BARE_STAFF_CHECK funds"]);
    });

    it("(d) does not count a restrictive policy as admitting a grant", () => {
      const planted = `create table public.acc2675b_r (id int, tenant_id uuid references public.tenants on delete restrict);
        alter table public.acc2675b_r enable row level security, force row level security;
        grant select on public.acc2675b_r to authenticated;
        create policy acc2675b on public.acc2675b_r as restrictive for select to authenticated using (${TENANT});`;
      expect(named(gate(planted))).toEqual(["GRANT_WITHOUT_POLICY acc2675b_r"]);
      // With a permissive policy beside it, the grant is admitted.
      expect(
        named(
          gate(
            `${planted} create policy acc2675b_p on public.acc2675b_r for select to authenticated using (${TENANT} and (select authz.staff_read()));`,
          ),
        ),
      ).toEqual([]);
    });

    it("(e) finds a new table scoped through a parent row by its foreign key, outside the constant list", () => {
      const child = `create table public.acc2675b_child (id int, donor_id uuid references public.donors (id));
        alter table public.acc2675b_child enable row level security;
        grant select on public.acc2675b_child to authenticated;
        create policy acc2675b on public.acc2675b_child for select to authenticated using (true);`;
      expect(named(gate(child))).toEqual([
        "PARENT_SCOPED_POLICY_NOT_PINNED acc2675b_child",
      ]);
      // A grandchild through a table with no tenant column is scoped too.
      expect(
        named(
          gate(`create table public.acc2675b_mid (id uuid primary key, donor_id uuid references public.donors (id));
            create table public.acc2675b_leaf (id int, mid_id uuid references public.acc2675b_mid (id));
            alter table public.acc2675b_leaf enable row level security;
            grant select on public.acc2675b_leaf to authenticated;
            create policy acc2675b on public.acc2675b_leaf for select to authenticated using (true);`),
        ),
      ).toEqual(["PARENT_SCOPED_POLICY_NOT_PINNED acc2675b_leaf"]);
    });

    it("(f) follows a helper's call however a comment sits between the schema, its dot and the name", () => {
      for (const call of [
        "private/* hidden */.acc2675b_token_tenant()",
        "private /* a /* nested */ comment */ . acc2675b_token_tenant ()",
        "private -- hidden\n.acc2675b_token_tenant()",
        "private.acc2675b_token_tenant/* hidden */()",
      ])
        expect(
          named(gate(`${READS_TENANT_CLAIM} ${ROOT(`select ${call}`)}`)),
          call,
        ).toEqual([
          "TENANT_HELPER_READS_CLAIM private.acc2675b_token_tenant()",
        ]);
    });

    it("(b) fails a function a helper reaches that sets a search path that is not empty; auth.uid(), which sets none, passes", () => {
      expect(
        named(
          gate(`create function private.acc2675b_reach() returns uuid language sql stable set search_path = public as $f$ select null::uuid $f$;
            ${ROOT("select private.acc2675b_reach()")}`),
        ),
      ).toEqual(["TENANT_HELPER_SEARCH_PATH private.acc2675b_reach()"]);
      expect(named(gate(ROOT("select auth.uid()")))).toEqual([]);
    });

    it("(g) reads a policy's roles as Postgres applies them (USAGE): a role held WITH INHERIT FALSE does not reach it, an inherited one does", () => {
      expect(
        named(
          gate(`create role acc2675b_noinherit nologin;
            grant acc2675b_noinherit to authenticated with inherit false;
            create policy acc2675b on public.donors for select to acc2675b_noinherit using (true);`),
        ),
      ).toEqual([]);
      expect(
        named(
          gate(`create role acc2675b_inherit nologin;
            grant acc2675b_inherit to authenticated;
            create policy acc2675b on public.donors for select to acc2675b_inherit using (true);`),
        ),
      ).toEqual(["TENANT_CONDITION_MISSING donors"]);
    });
  },
);
