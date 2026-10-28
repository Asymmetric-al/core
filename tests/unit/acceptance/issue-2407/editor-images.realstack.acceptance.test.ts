/** #2407 PR (a) real stack [RS] (throwaway DB; skips cleanly without
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL). Criteria 2-5 and 10 run twice: on
 * storage table grants only, then on criterion 9's hosted grants plus private
 * default privileges (applied before the forward migration). Criterion 11's
 * round trips and the mutant probes run on the first stack only, last.
 * Mutants: M1-M4 c3, M5 c4, M6 c2, M7 c5/c10, M18 c11, M19 c2/c11.
 */
import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./harness";

const URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
type Case = [label: string, role: H.Role, actor: string | null, name: string];
/** "label|role|actor|name" rows; `name` may use {editor:T:A} (own folder) and {demo}. */
const table = (s: H.Stack, rows: string): Case[] =>
  rows
    .trim()
    .split("\n")
    .map((line) => {
      const [label, role, actor, name] = line.split("|") as [
        string,
        H.Role,
        string,
        string,
      ];
      const resolved = name
        .replace(/\{(\w+):(\w+):(\w+)\}/g, (_, p, t, u) => s.path(p, t, u))
        .replace("{demo}", H.DEMO)
        .replace("{file}", `${randomUUID()}.webp`)
        .replace(/\{id:(\w+)\}/g, (_, k) => s.ids[k]!);
      return [label, role, actor || null, resolved];
    });
const ALLOW3 = `
M own folder|authenticated|M|{editor:T:M}/{file}
A own folder|authenticated|A|{editor:T:A}/{file}
A RETURNING id|authenticated|A|{editor:T:A}/{file}
S2 own tenant|authenticated|S2|{editor:T:S2}/{file}
S into demo|authenticated|S|{editor:{demo}:S}/{file}`;
const DENY3 = `
uid segment != A|authenticated|A|{editor:T:X}/{file}
tenant segment != T|authenticated|A|{editor:T2:A}/{file}
purpose care-note|authenticated|A|{care-note:T:A}/{file}
three segments|authenticated|A|{editor:T:A}
empty remainder|authenticated|A|{editor:T:A}/
legacy shape|authenticated|A|editor/x-1.png
bucket root|authenticated|A|x.webp
role anon|anon||{editor:T:A}/{file}
no sub|authenticated||{editor:T:A}/{file}
sub without profile|authenticated|Z|{editor:T:Z}/{file}
S2 into demo|authenticated|S2|{editor:{demo}:S2}/{file}
S into tenant T|authenticated|S|{editor:T:S}/{file}
X into tenant T|authenticated|X|{editor:T:X}/{file}`;

/** Runs allow/deny cases; returns the labels that did not behave. */
async function inserts(s: H.Stack, allow: Case[], deny: Case[]) {
  const issues: string[] = [];
  for (const [label, role, actor, name] of allow) {
    const r = await s.insert(role, actor, name, label.includes("RETURNING"));
    if (r.code || r.count !== 1) issues.push(`allow ${label}: ${r.code}`);
  }
  for (const [label, role, actor, name] of deny) {
    const before = await s.objects();
    const r = await s.insert(role, actor, name);
    if (r.code !== "42501" || (await s.objects()) !== before)
      issues.push(`deny ${label}: ${r.code ?? "allowed"}`);
  }
  return issues;
}
/** Criterion 4 (OQ12): returns the cases that did not behave. */
async function updates(s: H.Stack) {
  const issues: string[] = [];
  const seed = `${s.path("editor", "T", "A")}/seed.webp`;
  const legacy = `editor/${s.ids.A}-123.png`;
  const mine = await s.update("A", seed, {});
  if (mine.code || mine.count !== 1 || mine.rows[0]?.name !== seed)
    issues.push(`owner in-folder update: ${mine.code ?? mine.count}`);
  for (const [label, to] of [
    ["rename outside folder", `${s.path("editor", "T", "X")}/moved.webp`],
    ["rename to legacy", `editor/${s.ids.A}-999.png`],
  ] as const)
    if ((await s.update("A", seed, { name: to })).code !== "42501")
      issues.push(label);
  const other = await s.update("X", seed, {});
  if (other.code || other.count !== 0) issues.push("non-owner update");
  if ((await s.update("A", legacy, {})).code !== "42501")
    issues.push("legacy in-place update");
  const moved = await s.update("A", legacy, {
    name: `${s.path("editor", "T", "A")}/moved.png`,
  });
  if (moved.code || moved.count !== 1) issues.push("legacy move into folder");
  return issues;
}
/** Criterion 5: anon none, owner-only SELECT, owner-only DELETE. */
async function reads(s: H.Stack) {
  const issues: string[] = [];
  const anon = await s.list("anon", null);
  if (anon.code || anon.count !== 0)
    issues.push(`anon sees ${anon.count} rows`);
  const seed = `${s.path("editor", "T", "A")}/seed.webp`;
  for (const actor of ["A", "X"]) {
    const mine = await s.list("authenticated", actor);
    if (
      mine.code ||
      mine.count !== 2 ||
      mine.rows.some((r) => r.owner !== s.ids[actor])
    )
      issues.push(`${actor} does not see exactly own rows`);
  }
  const foreign = await s.remove("X", seed);
  if (foreign.code || foreign.count !== 0) issues.push("non-owner delete");
  for (const name of [`editor/${s.ids.A}-123.png`, seed]) {
    const r = await s.remove("A", name);
    if (r.code || r.count !== 1) issues.push(`owner delete ${name}`);
  }
  return issues;
}
const bucketPolicy = (p: H.Row) =>
  `${p.qual} ${p.with_check}`.includes(`'${H.BUCKET}'`);
const rest = (rows: H.Row[]) => rows.filter((p) => !bucketPolicy(p));
const names = (rows: H.Row[]) =>
  rows
    .filter(bucketPolicy)
    .map((p) => p.policyname)
    .sort();
const EXPECTED = [...H.NEW_POLICIES, H.DELETE_POLICY].sort();
const NEW_LIMITS = { size: String(H.LIMIT), types: H.TYPES };

function criteria(hosted: boolean) {
  const tag = hosted ? " [c9 hosted grants]" : "";
  const title = `#2407a real-stack [RS]${hosted ? " (criterion 9: hosted grants + private default privileges before migrating)" : ""}`;
  describe.skipIf(!URL)(title, () => {
    let s: H.Stack;
    beforeAll(async () => {
      s = new H.Stack(URL, hosted);
      await s.open();
    }, 300_000);
    afterAll(async () => {
      if (s) await s.close();
    });
    const check = (name: string, fn: () => Promise<void>) =>
      it(`#2407a criterion ${name}${tag}`, () => {
        H.migrated();
        return s.tx(fn);
      });

    check(
      "2: document-uploads public with 5242880 / four types, no bucket added, other buckets unchanged, backup row = prior values, backup table unreachable (M6/M19)",
      async () => {
        expect(
          s.priorApplied,
          "storage.buckets lacks the limit columns (bootstrap, OQ17)",
        ).toBe(true);
        const [b] = await s.rows(
          "select public from storage.buckets where id=$1",
          [H.BUCKET],
        );
        expect(b!.public).toBe(true);
        expect(await s.limits()).toEqual(NEW_LIMITS);
        const others = (rows: H.Row[]) => rows.filter((r) => r.id !== H.BUCKET);
        // (b) relaxes this for its care bucket; (a) adds no bucket.
        expect(others(await s.buckets())).toEqual(others(s.pre.buckets));
        expect(
          await s.rows(
            `select bucket_id, file_size_limit::text as size, allowed_mime_types as types from ${H.BACKUP}`,
          ),
        ).toEqual([{ bucket_id: H.BUCKET, ...H.PRIOR }]);
        expect(
          await s.rows(
            `select r as role, p as privilege from unnest(array['anon','authenticated','service_role']) r,
           unnest(array['SELECT','INSERT','UPDATE','DELETE']) p where has_table_privilege(r::name, $1::text, p)`,
            [H.BACKUP],
          ),
        ).toEqual([]);
      },
    );
    check(
      "3: M, A, S2 insert editor/T/{self}/<uuid>.webp (A also RETURNING id); S only under demo",
      async () => {
        expect(await inserts(s, table(s, ALLOW3), [])).toEqual([]);
      },
    );
    check(
      "3: RLS refuses every off-layout, cross-actor or unauthenticated INSERT with 42501 and no row (M1-M4)",
      async () => {
        expect(await inserts(s, [], table(s, DENY3))).toEqual([]);
      },
    );
    check(
      "4: owner UPDATE stays in folder, non-owner 0 rows, legacy can only move in (M5)",
      async () => {
        expect(await updates(s)).toEqual([]);
      },
    );
    check(
      "5: anon lists 0 rows, each user sees only owner = self, owner-only DELETE, P4 qual unchanged (M7)",
      async () => {
        expect(await reads(s)).toEqual([]);
        const del = (rows: H.Row[]) =>
          rows.find((p) => p.policyname === H.DELETE_POLICY);
        expect(del(s.pre.policies)).toBeDefined();
        expect(del(await s.policies())).toEqual(del(s.pre.policies));
      },
    );
    check(
      "10 + Chief (a): document-uploads policies are exactly N1, N2, N3, P4 (P2->N1 and P1->N3 together); P1-P3 absent; other policies unchanged (M7)",
      async () => {
        const now = await s.policies();
        expect(names(now)).toEqual(EXPECTED);
        for (const old of H.OLD_POLICIES)
          expect(now.map((p) => p.policyname)).not.toContain(old);
        const shape = Object.fromEntries(
          now.map((p) => [p.policyname, [p.cmd, p.roles]]),
        );
        expect(shape).toMatchObject({
          [H.NEW_POLICIES[0]!]: ["INSERT", ["authenticated"]],
          [H.NEW_POLICIES[1]!]: ["UPDATE", ["authenticated"]],
          [H.NEW_POLICIES[2]!]: ["SELECT", ["authenticated"]],
        });
        expect(rest(now)).toEqual(rest(s.pre.policies));
        expect(rest(now).map((p) => p.policyname)).toContain(
          "Public read email-assets",
        );
      },
    );

    if (hosted) return;

    // Probes: swap in a known mutant and show the criterion check flags it.
    const tenantOf = `(select coalesce(p.tenant_id::text, case when p.role = 'super_admin' then '${H.DEMO}' end)
      from public.profiles p where p.user_id = (select auth.uid()))`;
    const part = {
      bucket: `bucket_id = '${H.BUCKET}'`,
      purpose: "split_part(name,'/',1) = 'editor'",
      tenant: `split_part(name,'/',2) = ${tenantOf}`,
      uid: "split_part(name,'/',3) = (select auth.uid())::text",
      rest: "split_part(name,'/',4) <> ''",
    };
    const ref = (drop: keyof typeof part | null, extra = "") =>
      Object.entries(part)
        .filter(([k]) => k !== drop)
        .map(
          ([, v]) =>
            `(${v}${extra && v === part.tenant ? ` or ${extra}` : ""})`,
        )
        .join(" and ");
    const anySuper = `(split_part(name,'/',2) = '${H.DEMO}' and exists (select 1 from public.profiles p
      where p.user_id = (select auth.uid()) and p.role = 'super_admin'))`;
    it.each([
      ["reference policy (harness self-check)", ref(null), null],
      [
        "M1 drops the uid segment check",
        ref("uid"),
        "deny uid segment != A: allowed",
      ],
      [
        "M2 drops the tenant segment check",
        ref("tenant"),
        "deny tenant segment != T: allowed",
      ],
      [
        "M2 demo tenant for any super_admin",
        ref(null, anySuper),
        "deny S2 into demo: allowed",
      ],
      [
        "M3 accepts any purpose",
        ref("purpose"),
        "deny purpose care-note: allowed",
      ],
      [
        "M4 accepts three segments",
        ref("rest"),
        "deny three segments: allowed",
      ],
    ])("#2407a mutant probe: N1 %s", (_label, expr, issue) => {
      H.migrated();
      return s.tx(async () => {
        await s.db.query(
          `alter policy "${H.NEW_POLICIES[0]}" on storage.objects with check (${expr})`,
        );
        const found = await inserts(s, table(s, ALLOW3), table(s, DENY3));
        if (issue) expect(found).toContain(issue);
        else expect(found).toEqual([]);
      });
    });
    it("#2407a mutant probes: M5 N2 WITH CHECK without folder; M7 N3 without owner / P1 kept", () => {
      H.migrated();
      return s.tx(async () => {
        await s.db.query("savepoint probe");
        await s.db.query(`alter policy "${H.NEW_POLICIES[1]}" on storage.objects
          with check (bucket_id = '${H.BUCKET}' and owner = (select auth.uid()))`);
        expect(await updates(s)).toContain("rename outside folder");
        await s.db.query("rollback to savepoint probe");
        await s.db.query(
          `alter policy "${H.NEW_POLICIES[2]}" on storage.objects using (bucket_id = '${H.BUCKET}')`,
        );
        expect(await reads(s)).toContain("A does not see exactly own rows");
        await s.db.query("rollback to savepoint probe");
        await s.db.query(
          `create policy "${H.OLD_POLICIES[2]}" on storage.objects for select using (bucket_id = '${H.BUCKET}')`,
        );
        expect((await reads(s))[0]).toMatch(/^anon sees [1-9]/);
      });
    });

    describe("#2407a criterion 11: rollback (runs last; mutates the stack)", () => {
      const run = (path: string) => expect(s.psql(path).status, path).toBe(0);
      const gone = () =>
        s.rows("select to_regclass($1)::text as r", [H.BACKUP]);
      it("#2407a criterion 11: migrate -> rollback -> migrate; rollback restores the pre-migration catalog (P1-P3 back, N1-N3 gone) and recorded non-NULL limits, drops the backup (M18)", async () => {
        H.migrated();
        expect(s.priorApplied).toBe(true);
        run(H.ROLLBACK);
        expect(await s.policies()).toEqual(s.pre.policies);
        expect(await s.limits()).toEqual(H.PRIOR);
        expect(await gone()).toEqual([{ r: null }]);
        run(H.FORWARD);
        expect(await s.limits()).toEqual(NEW_LIMITS);
        expect(names(await s.policies())).toEqual(EXPECTED);
      });
      it("#2407a criterion 11: a run starting from NULL limits round-trips back to NULL (M18)", async () => {
        H.migrated();
        run(H.ROLLBACK);
        await s.db.query(
          "update storage.buckets set file_size_limit=null, allowed_mime_types=null where id=$1",
          [H.BUCKET],
        );
        run(H.FORWARD);
        expect(await s.limits()).toEqual(NEW_LIMITS);
        run(H.ROLLBACK);
        expect(await s.limits()).toEqual({ size: null, types: null });
        expect(await s.policies()).toEqual(s.pre.policies);
        run(H.FORWARD);
      });
      it("#2407a criterion 11: rollback without the recorded row raises and changes nothing (M19)", async () => {
        H.migrated();
        await s.db.query(`delete from ${H.BACKUP}`);
        const before = {
          policies: await s.policies(),
          limits: await s.limits(),
        };
        expect(s.psql(H.ROLLBACK).status, "rollback must fail").not.toBe(0);
        expect({
          policies: await s.policies(),
          limits: await s.limits(),
        }).toEqual(before);
      });
    });
  });
}

criteria(false);
criteria(true);
