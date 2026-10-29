/** #2406 spec r2 real stack (throwaway DB; skips cleanly without
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL). Criteria 2-7 and 9 run twice: on
 * storage table grants only, then on criterion 8's hosted grants plus private
 * default privileges (applied before the forward migration). Criterion 10's
 * round trips and the M5/M14 (plus M1-M4/M17 reference) mutant probes run on
 * the first stack only, after the read-only criteria.
 * Mutants: M1 c4 "uid", M2 c4 "tenant", M3 c4 "purpose", M4 c4 "three
 * segments", M5 c6 "rename outside", M6 c2, M10 c10, M14 c7/c9, M15 c2 backup
 * row, M16 c2/c8 privileges, M17 c5 "S2 into demo". Addendum 1 criterion 5:
 * Z (donor, NULL tenant) has no folder at all, not even the demo one.
 */
import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./harness";

const URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
type Case = [label: string, role: H.Role, actor: string | null, name: string];
const file = (ext = "webp") => `${randomUUID()}.${ext}`;

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
const allow3 = (s: H.Stack): Case[] => [
  [
    "U avatars",
    "authenticated",
    "U",
    `${s.path("avatars", "T", "U")}/${file()}`,
  ],
  [
    "U covers",
    "authenticated",
    "U",
    `${s.path("covers", "T", "U")}/${file("jpg")}`,
  ],
  [
    "U RETURNING id",
    "authenticated",
    "U",
    `${s.path("avatars", "T", "U")}/${file("png")}`,
  ],
];
const deny4 = (s: H.Stack): Case[] => [
  [
    "uid segment != U",
    "authenticated",
    "U",
    `${s.path("avatars", "T", "X")}/${file()}`,
  ],
  [
    "tenant segment != T",
    "authenticated",
    "U",
    `${s.path("avatars", "T2", "U")}/${file()}`,
  ],
  [
    "purpose documents",
    "authenticated",
    "U",
    `${s.path("documents", "T", "U")}/x.webp`,
  ],
  ["three segments", "authenticated", "U", s.path("avatars", "T", "U")],
  ["empty remainder", "authenticated", "U", `${s.path("avatars", "T", "U")}/`],
  ["legacy shape", "authenticated", "U", `avatars/${s.ids.U}-123.webp`],
  ["bucket root", "authenticated", "U", "x.webp"],
  ["role anon", "anon", null, `${s.path("avatars", "T", "U")}/${file()}`],
  ["no sub", "authenticated", null, `${s.path("avatars", "T", "U")}/${file()}`],
  [
    "sub without profile",
    "authenticated",
    "N",
    `${s.path("avatars", "T", "N")}/${file()}`,
  ],
  [
    "sub without profile, demo",
    "authenticated",
    "N",
    `${s.path("avatars", H.DEMO, "N")}/${file()}`,
  ],
  [
    "X into tenant T",
    "authenticated",
    "X",
    `${s.path("avatars", "T", "X")}/${file()}`,
  ],
];
const allow5 = (s: H.Stack): Case[] => [
  [
    "S into demo",
    "authenticated",
    "S",
    `${s.path("avatars", H.DEMO, "S")}/${file()}`,
  ],
  [
    "S2 into own tenant",
    "authenticated",
    "S2",
    `${s.path("avatars", "T", "S2")}/${file()}`,
  ],
];
const deny5 = (s: H.Stack): Case[] => [
  [
    "S into tenant T",
    "authenticated",
    "S",
    `${s.path("avatars", "T", "S")}/${file()}`,
  ],
  [
    "S2 into demo",
    "authenticated",
    "S2",
    `${s.path("avatars", H.DEMO, "S2")}/${file()}`,
  ],
];
/** Addendum 1 criterion 5: a tenant-less non-super_admin has no folder. */
const denyZ = (s: H.Stack): Case[] => [
  [
    "Z into tenant T",
    "authenticated",
    "Z",
    `${s.path("avatars", "T", "Z")}/${file()}`,
  ],
  [
    "Z into demo avatars",
    "authenticated",
    "Z",
    `${s.path("avatars", H.DEMO, "Z")}/${file()}`,
  ],
  [
    "Z into demo covers",
    "authenticated",
    "Z",
    `${s.path("covers", H.DEMO, "Z")}/${file("jpg")}`,
  ],
];
/** Addendum 1 criterion 5: Z's owned legacy object cannot move into demo. */
async function zUpdate(s: H.Stack) {
  const issues: string[] = [];
  const legacy = `avatars/${s.ids.Z}-123.webp`;
  const to = `${s.path("avatars", H.DEMO, "Z")}/moved.webp`;
  const r = await s.update("Z", legacy, { name: to });
  if (r.code !== "42501")
    issues.push(`Z legacy into demo: ${r.code ?? "allowed"}`);
  const [kept] = await s.rows(
    "select count(*)::int as n from storage.objects where bucket_id='profiles' and name=$1 and owner=$2",
    [legacy, s.ids.Z],
  );
  if (kept!.n !== 1 || (await s.objects()) !== 6)
    issues.push("Z legacy changed");
  return issues;
}

/** Criterion 6 (OQ5): returns the cases that did not behave. */
async function updates(s: H.Stack) {
  const issues: string[] = [];
  const seed = `${s.path("avatars", "T", "U")}/seed.webp`;
  const legacy = `avatars/${s.ids.U}-123.webp`;
  const own = await s.update("U", seed, {});
  if (own.code || own.count !== 1 || own.rows[0]?.name !== seed)
    issues.push(`owner in-folder update: ${own.code ?? own.count}`);
  for (const [label, to] of [
    ["rename outside folder", `${s.path("avatars", "T", "X")}/moved.webp`],
    ["rename to legacy", `avatars/${s.ids.U}-999.webp`],
  ] as const)
    if ((await s.update("U", seed, { name: to })).code !== "42501")
      issues.push(label);
  const other = await s.update("X", seed, {});
  if (other.code || other.count !== 0) issues.push("non-owner update");
  if ((await s.update("U", legacy, {})).code !== "42501")
    issues.push("legacy in-place update");
  const moved = await s.update("U", legacy, {
    name: `${s.path("avatars", "T", "U")}/moved.webp`,
  });
  if (moved.code || moved.count !== 1) issues.push("legacy move into folder");
  return issues;
}

/** Criterion 7: owner-only SELECT, owner-only DELETE. */
async function reads(s: H.Stack) {
  const issues: string[] = [];
  const anon = await s.list("anon", null);
  if (anon.code || anon.count !== 0)
    issues.push(`anon sees ${anon.count} rows`);
  const seed = `${s.path("avatars", "T", "U")}/seed.webp`;
  const legacy = `avatars/${s.ids.U}-123.webp`;
  const mine = await s.list("authenticated", "U");
  if (mine.rows.some((r) => r.owner !== s.ids.U))
    issues.push("U sees others' rows");
  const names = mine.rows.map((r) => String(r.name)).sort();
  if (mine.code || names.join() !== [legacy, seed].sort().join())
    issues.push("U does not see exactly own rows");
  const foreign = await s.remove("X", seed);
  if (foreign.code || foreign.count !== 0) issues.push("non-owner delete");
  for (const name of [legacy, seed]) {
    const r = await s.remove("U", name);
    if (r.code || r.count !== 1) issues.push(`owner delete ${name}`);
  }
  return issues;
}

const profilesPolicy = (p: Record<string, unknown>) =>
  /'profiles'/.test(`${p.qual} ${p.with_check}`);

function criteria(hosted: boolean) {
  const tag = hosted ? " [c8 hosted grants]" : "";
  const title = `#2406 real-stack${hosted ? " (criterion 8: hosted grants + private default privileges)" : ""}`;
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
      it(`#2406 criterion ${name}${tag}`, () => {
        H.migrated();
        return s.tx(fn);
      });

    check(
      "2: profiles bucket limits, other buckets unchanged, prior limits recorded, backup table unreachable (M6/M15/M16)",
      async () => {
        expect(
          s.priorApplied,
          "storage.buckets lacks the limit columns (§2.3 bootstrap)",
        ).toBe(true);
        const [b] = await s.rows(
          "select public from storage.buckets where id='profiles'",
        );
        expect(b!.public).toBe(true);
        expect(await s.limits()).toEqual({
          size: String(H.LIMIT),
          types: H.TYPES,
        });
        const others = (rows: Record<string, unknown>[]) =>
          rows.filter((r) => r.id !== "profiles");
        expect(others(await s.buckets())).toEqual(others(s.pre.buckets));
        expect(
          await s.rows(
            `select bucket_id, file_size_limit::text as size, allowed_mime_types as types from ${H.BACKUP}`,
          ),
        ).toEqual([{ bucket_id: "profiles", ...H.PRIOR }]);
        expect(await s.privileges(H.BACKUP)).toEqual([]);
      },
    );
    check(
      "3: U inserts avatars/T/U/<uuid>.webp and covers/T/U/<uuid>.jpg, also with RETURNING id",
      async () => {
        expect(await inserts(s, allow3(s), [])).toEqual([]);
      },
    );
    check(
      "4: RLS refuses every off-layout or unauthenticated INSERT with 42501 and adds no row (M1-M4)",
      async () => {
        expect(await inserts(s, [], deny4(s))).toEqual([]);
      },
    );
    check(
      "5: super_admin without tenant uses demo only; super_admin with tenant never demo (OQ4, M17)",
      async () => {
        expect(await inserts(s, allow5(s), deny5(s))).toEqual([]);
      },
    );
    check(
      "5 (addendum 1): donor Z with NULL tenant: INSERT into avatars/T/Z, avatars/demo/Z and covers/demo/Z refused 42501, no row; legacy UPDATE into avatars/demo/Z refused, unchanged",
      async () => {
        expect(await inserts(s, [], denyZ(s))).toEqual([]);
        expect(await zUpdate(s)).toEqual([]);
      },
    );
    check(
      "6: owner UPDATE stays in folder, non-owner 0 rows, legacy can only move in (OQ5, M5)",
      async () => {
        expect(await updates(s)).toEqual([]);
      },
    );
    check(
      "7: anon lists 0 rows, U sees only own rows, owner-only DELETE, delete policy unchanged (M14)",
      async () => {
        expect(await reads(s)).toEqual([]);
        const del = (rows: Record<string, unknown>[]) =>
          rows.find((p) => p.policyname === H.DELETE_POLICY);
        expect(del(await s.policies())).toEqual(del(s.pre.policies));
        expect(del(s.pre.policies)).toBeDefined();
      },
    );
    check(
      "9: exactly four profiles policies; other buckets' policies unchanged (M14)",
      async () => {
        const now = await s.policies();
        expect(
          now
            .filter(profilesPolicy)
            .map((p) => p.policyname)
            .sort(),
        ).toEqual([...H.NEW_POLICIES, H.DELETE_POLICY].sort());
        expect(now.map((p) => p.policyname)).not.toContain(
          "Public read profiles",
        );
        const shape = Object.fromEntries(
          now.map((p) => [p.policyname, [p.cmd, p.roles]]),
        );
        expect(shape).toMatchObject({
          "profiles owner folder insert": ["INSERT", ["authenticated"]],
          "profiles owner folder update": ["UPDATE", ["authenticated"]],
          "profiles owner select": ["SELECT", ["authenticated"]],
        });
        const rest = (rows: Record<string, unknown>[]) =>
          rows.filter((p) => !profilesPolicy(p));
        expect(rest(now)).toEqual(rest(s.pre.policies));
        expect(rest(now).map((p) => p.policyname)).toEqual(
          expect.arrayContaining([
            "Public read document-uploads",
            "Public read email-assets",
          ]),
        );
      },
    );

    if (hosted) return;

    // Probes: swap in a known mutant and show the criterion check flags it.
    const tenantOf = `(select coalesce(p.tenant_id::text, case when p.role = 'super_admin' then '${H.DEMO}' end)
      from public.profiles p where p.user_id = (select auth.uid()))`;
    const part = {
      bucket: "bucket_id = 'profiles'",
      purpose: "split_part(name,'/',1) in ('avatars','covers')",
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
        "deny uid segment != U: allowed",
      ],
      [
        "M2 drops the tenant segment check",
        ref("tenant"),
        "deny tenant segment != T: allowed",
      ],
      [
        "M3 accepts any purpose",
        ref("purpose"),
        "deny purpose documents: allowed",
      ],
      [
        "M4 accepts three segments",
        ref("rest"),
        "deny three segments: allowed",
      ],
      [
        "M17 demo tenant for any super_admin",
        ref(null, anySuper),
        "deny S2 into demo: allowed",
      ],
    ])("#2406 mutant probe: INSERT %s", (_label, expr, issue) => {
      H.migrated();
      return s.tx(async () => {
        await s.db.query(
          `alter policy "profiles owner folder insert" on storage.objects with check (${expr})`,
        );
        const found = await inserts(
          s,
          [...allow3(s), ...allow5(s)],
          [...deny4(s), ...deny5(s)],
        );
        if (issue) expect(found).toContain(issue);
        else expect(found).toEqual([]);
      });
    });
    it("#2406 mutant probes: M5 UPDATE WITH CHECK without folder, M14 SELECT without owner / public read kept", () => {
      H.migrated();
      return s.tx(async () => {
        await s.db.query("savepoint probe");
        await s.db
          .query(`alter policy "profiles owner folder update" on storage.objects
          with check (bucket_id = 'profiles' and owner = (select auth.uid()))`);
        expect(await updates(s)).toContain("rename outside folder");
        await s.db.query("rollback to savepoint probe");
        await s.db.query(
          `alter policy "profiles owner select" on storage.objects using (bucket_id = 'profiles')`,
        );
        expect(await reads(s)).toContain("U sees others' rows");
        await s.db.query("rollback to savepoint probe");
        await s.db.query(
          `create policy "Public read profiles" on storage.objects for select using (bucket_id = 'profiles')`,
        );
        expect((await reads(s))[0]).toMatch(/^anon sees [1-9]/);
      });
    });

    describe("#2406 criterion 10: rollback (runs last; mutates the stack)", () => {
      const run = (path: string) => expect(s.psql(path).status, path).toBe(0);
      it("#2406 criterion 10: migrate -> rollback -> migrate; rollback restores the pre-migration catalog and recorded non-NULL limits, drops the backup (M10)", async () => {
        H.migrated();
        expect(s.priorApplied).toBe(true);
        run(H.ROLLBACK);
        expect(await s.policies()).toEqual(s.pre.policies);
        expect(await s.limits()).toEqual(H.PRIOR);
        expect(await s.regclass(H.BACKUP)).toBeNull();
        run(H.FORWARD);
        expect(await s.limits()).toEqual({
          size: String(H.LIMIT),
          types: H.TYPES,
        });
        expect((await s.policies()).filter(profilesPolicy).length).toBe(4);
      });
      it("#2406 criterion 10: a run starting from NULL limits round-trips back to NULL", async () => {
        H.migrated();
        run(H.ROLLBACK);
        await s.db.query(
          "update storage.buckets set file_size_limit=null, allowed_mime_types=null where id='profiles'",
        );
        run(H.FORWARD);
        expect(await s.limits()).toEqual({
          size: String(H.LIMIT),
          types: H.TYPES,
        });
        run(H.ROLLBACK);
        expect(await s.limits()).toEqual({ size: null, types: null });
        expect(await s.policies()).toEqual(s.pre.policies);
        run(H.FORWARD);
      });
      it("#2406 criterion 10: rollback without the recorded row raises and changes nothing", async () => {
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
