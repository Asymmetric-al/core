import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  caller,
  fixtureIds,
  fixtureSql,
  keepAs,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const ALIAS_DIFFERS =
  "a restricted or high-risk worker's public alias must differ from the legal name";

const NEW_SINGLES = [
  0x115f, 0x1160, 0x3164, 0xffa0, 0x2800, 0xe0001, 0x180f, 0x17b4, 0x17b5,
  0x2065, 0xe0000,
];
const NEW_RANGES: [number, number][] = [
  [0xfe00, 0xfe0f],
  [0xe0100, 0xe01ef],
  [0xe0020, 0xe007f],
  [0xfff9, 0xfffb],
  [0x0001, 0x0008],
  [0x000e, 0x001f],
  [0x007f, 0x0084],
  [0x0086, 0x009f],
  [0x180b, 0x180d],
  [0x1bca0, 0x1bca3],
  [0x1d173, 0x1d17a],
  [0x13430, 0x1343f],
  [0xfff0, 0xfff8],
  [0xe0002, 0xe001f],
  [0xe0080, 0xe00ff],
  [0xe01f0, 0xe0fff],
];
const NEW_REMOVED = [
  ...new Set([
    ...NEW_SINGLES,
    ...NEW_RANGES.flatMap(([a, b]) => [a, Math.floor((a + b) / 2), b]),
  ]),
].sort((a, b) => a - b);
const hex = (c: number) =>
  `U+${c
    .toString(16)
    .toUpperCase()
    .padStart(c > 0xffff ? 5 : 4, "0")}`;

const GUARDS: [string, string, string][] = [
  ["a visible Arabic format mark U+0601", "'Al' || chr(1537) || 'ice'", ""],
  ["a visible Kaithi number sign U+110BD", "'Al' || chr(69821) || 'ice'", ""],
  [
    "a visible Kaithi number sign above U+110CD",
    "'Al' || chr(69837) || 'ice'",
    "",
  ],
  [
    "a visible Arabic pound mark above U+0890",
    "'Al' || chr(2192) || 'ice'",
    "",
  ],
  [
    "a visible Arabic piastre mark above U+0891",
    "'Al' || chr(2193) || 'ice'",
    "",
  ],
  ["a precomposed Hangul name", "'김철수'", "김철수"],
  ["next line U+0085", "'Al' || chr(133) || 'ice'", "Al ice"],
  ["a tab", "'Al' || chr(9) || 'ice'", "Al ice"],
  ["a carriage return", "'Al' || chr(13) || 'ice'", "Al ice"],
];

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r1: a worker's name outside Mission Control, and the safety text (plan :1003, #2805 note 1 and obligation 2)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = {
      ...fixtureIds(),
      UX: randomUUID(),
      UR: randomUUID(),
      pX: randomUUID(),
      pR: randomUUID(),
      pDup: randomUUID(),
      mX: randomUUID(),
      mR: randomUUID(),
      mDup: randomUUID(),
      postW: randomUUID(),
      postX: randomUUID(),
      postOrg: randomUUID(),
    };
    const queryAs = asRole(db, id);
    const writeAs = keepAs(db, id);
    const admin = caller(id, "US", "mS", "TA");
    const run = (who: object, sql: string) =>
      queryAs("authenticated", who as never, sql);
    const act = (who: object, sql: string) =>
      writeAs("authenticated", who as never, sql);
    const refusal = async (sql: string) => {
      const r = await run(admin, sql);
      return r.code === null ? null : `${r.code} ${r.message}`;
    };
    const withoutAliasCheck = async (sql: string) => {
      await db.query(
        "alter table public.parties disable trigger parties_alias_check",
      );
      await db.query(sql);
      await db.query(
        "alter table public.parties enable trigger parties_alias_check",
      );
    };

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id as never));
      await db.query(
        "update authz.memberships set is_tenant_admin = true where id = $1",
        [id.mS],
      );
      await db.query("insert into auth.users (id) values ($1), ($2)", [
        id.UX,
        id.UR,
      ]);
      await db.query(
        "update public.profiles set display_name = 'Profile Rowan', full_name = 'Profile Rowan', first_name = 'Profile', last_name = 'Rowan' where id = $1",
        [id.UM],
      );
      await db.query(
        "update public.profiles set display_name = 'Profile Vale', full_name = 'Profile Vale' where id = $1",
        [id.UM2],
      );
      await db.query(
        "update public.parties set display_name = 'Party Rowan' where id = $1",
        [id.pMA],
      );
      await db.query(
        "update public.parties set display_name = 'Party Vale' where id = $1",
        [id.pM2],
      );
      const restricted = await act(
        admin,
        `select public.set_worker_identity('${id.TA}', '${id.pMA}', 'Legal Rowan', null, null, null, 'restricted', 'Cedar', 'fixture') as r`,
      );
      expect(restricted.code, restricted.message).toBeNull();
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $3, 'Party Xu'), ($2, $3, 'Party Reed')",
        [id.pX, id.pR, id.TA],
      );
      await withoutAliasCheck(
        `update public.parties set security_level = 'restricted', security_level_source = 'manual' where id = '${id.pX}';
         update public.parties set security_level = 'restricted', security_level_source = 'manual', public_alias = chr(65039) || chr(8203) where id = '${id.pR}'`,
      );
      await db.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $3, $4, $5, $3), ($2, $3, $6, $7, $3)",
        [id.mX, id.mR, id.TA, id.pX, id.UX, id.pR, id.UR],
      );
      await db.query(
        "insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values ($1, $4, $5, 'From W', 'public', 'published'), ($2, $4, $6, 'From X', 'public', 'published'), ($3, $4, null, 'From the organization', 'public', 'published')",
        [id.postW, id.postX, id.postOrg, id.TA, id.UM, id.UX],
      );
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    it(`each newly removed character (${NEW_REMOVED.length} code points: every single one, and the first, a middle and the last of each range) is removed from a name, inside or at its end, and alone is no name`, async () => {
      const r = await db.query(
        `select c,
                private.normalize_safety_text('Alice' || chr(c)) as trailing,
                private.normalize_safety_text('Al' || chr(c) || 'ice') as inside,
                private.normalize_safety_text(chr(c)) as alone
           from unnest($1::int[]) as c order by c`,
        [NEW_REMOVED],
      );
      expect(
        r.rows.map((row) => [hex(row.c), row.trailing, row.inside, row.alone]),
      ).toEqual(NEW_REMOVED.map((c) => [hex(c), "Alice", "Alice", null]));
    });

    it("each newly removed character: an alias that is the legal name plus it is refused (23514), a legal name of it alone is refused (22023) and a reason of it alone is refused (22023)", async () => {
      await db.query("savepoint s");
      try {
        const created = await act(
          admin,
          `select public.set_worker_identity('${id.TA}', '${id.pM2}', 'Alice Smith', null, null, null, 'restricted', 'Juniper', 'fixture') as r`,
        );
        expect(created.code, created.message).toBeNull();
        const seen: [string, string | null, string | null, string | null][] =
          [];
        for (const c of NEW_REMOVED)
          seen.push([
            hex(c),
            await refusal(
              `select public.restrict_worker_publication('${id.TA}', '${id.pM2}', 'restricted', 'Alice Smith' || chr(${c}), null, 'r')`,
            ),
            await refusal(
              `select public.set_worker_identity('${id.TA}', '${id.pM2}', chr(${c}), null, null, null, null, null, 'r')`,
            ),
            await refusal(
              `select public.restrict_worker_publication('${id.TA}', '${id.pM2}', 'restricted', null, null, chr(${c}))`,
            ),
          ]);
        expect(seen).toEqual(
          NEW_REMOVED.map((c) => [
            hex(c),
            `23514 ${ALIAS_DIFFERS}`,
            "22023 A legal name is required",
            "22023 A reason is required",
          ]),
        );
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("guard (passes on the base): visible format marks, a precomposed Hangul name and whitespace characters are not removed; next line, tab and carriage return each become one space", async () => {
      for (const [label, sql, expected] of GUARDS) {
        const r = await db.query(
          `select private.normalize_safety_text(${sql}) as n, ${sql} as raw,
                  public.worker_public_display_name(${sql}, null, null) as projected`,
        );
        const want = expected === "" ? r.rows[0].raw : expected;
        expect([r.rows[0].n, r.rows[0].projected], label).toEqual([want, want]);
      }
    });

    it("with standard_conforming_strings off, both functions give the same results for the old and the new characters and the guards, and no escape_string_warning notice is raised", async () => {
      const notices: string[] = [];
      const onNotice = (n: { message?: string }) =>
        notices.push(n.message ?? "");
      db.on("notice", onNotice);
      await db.query("savepoint s");
      try {
        await db.query("set local standard_conforming_strings = off");
        await db.query("set local escape_string_warning = on");
        const r = await db.query(
          `select c,
                  private.normalize_safety_text('Al' || chr(c) || 'ice') as n,
                  public.worker_public_display_name('Al' || chr(c) || 'ice', null, null) as a,
                  public.worker_public_display_name(null, 'Al' || chr(c) || 'ice', null) as p
             from unnest($1::int[]) as c order by c`,
          [[...NEW_REMOVED, 0x00ad, 0x200b, 0xfeff]],
        );
        expect(r.rows.map((row) => [hex(row.c), row.n, row.a, row.p])).toEqual(
          [...NEW_REMOVED, 0x00ad, 0x200b, 0xfeff]
            .sort((x, y) => x - y)
            .map((c) => [hex(c), "Alice", "Alice", "Alice"]),
        );
        for (const [label, sql, expected] of GUARDS) {
          const g = await db.query(
            `select private.normalize_safety_text(${sql}) as n, ${sql} as raw`,
          );
          expect(g.rows[0].n, label).toBe(
            expected === "" ? g.rows[0].raw : expected,
          );
        }
      } finally {
        await db.query("rollback to savepoint s");
        db.off("notice", onNotice);
      }
      expect(notices.filter((m) => /nonstandard use of/i.test(m))).toEqual([]);
    });

    it("as service_role the projections fail closed: the alias for a restricted worker, the Party name for an unrestricted one, and NULL for a restricted worker without an alias or with an alias of removed characters only; a post's author by the same rule, NULL for an organization post", async () => {
      const r = await queryAs(
        "service_role",
        {},
        `select m.id, public.worker_public_name(m) as name
           from public.missionaries as m
          where m.id in ('${id.mA}', '${id.m2}', '${id.mX}', '${id.mR}')`,
      );
      expect(r.code, r.message).toBeNull();
      expect(
        Object.fromEntries(r.rows.map((row) => [row.id, row.name])),
      ).toEqual({
        [id.mA]: "Cedar",
        [id.m2]: "Party Vale",
        [id.mX]: null,
        [id.mR]: null,
      });
      const posts = await queryAs(
        "service_role",
        {},
        `select p.id, public.post_author_public_name(p) as name
           from public.posts as p
          where p.id in ('${id.postW}', '${id.postX}', '${id.postOrg}')`,
      );
      expect(posts.code, posts.message).toBeNull();
      expect(
        Object.fromEntries(posts.rows.map((row) => [row.id, row.name])),
      ).toEqual({ [id.postW]: "Cedar", [id.postX]: null, [id.postOrg]: null });
      expect(JSON.stringify([r.rows, posts.rows])).not.toMatch(
        /Legal Rowan|Profile Rowan|Party Rowan|Party Xu|Party Reed|Profile Vale/,
      );
    });

    it("assignment_for_profile is the sole worker row of the tenant and profile: NULL for two rows, for none and for a NULL argument", async () => {
      const one = await db.query(
        "select private.assignment_for_profile($1, $2) as a",
        [id.TA, id.UM],
      );
      expect(one.rows).toEqual([{ a: id.mA }]);
      await db.query("savepoint s");
      try {
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Second row')",
          [id.pDup, id.TA],
        );
        await db.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
          [id.mDup, id.TA, id.pDup, id.UM],
        );
        const r = await db.query(
          `select private.assignment_for_profile($1, $2) as two,
                  private.assignment_for_profile($1, $3) as none,
                  private.assignment_for_profile(null, $2) as no_tenant,
                  private.assignment_for_profile($1, null) as no_profile`,
          [id.TA, id.UM, id.UDA],
        );
        expect(r.rows).toEqual([
          { two: null, none: null, no_tenant: null, no_profile: null },
        ]);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("every branch of the projection: high_risk with and without an alias, sensitive without one, standard with one, and a worker with no profile; a post's author resolves only a sole worker row in the post's own organization (F5)", async () => {
      await db.query("savepoint s");
      try {
        const k = Object.fromEntries(
          [
            "UHA",
            "UHN",
            "USN",
            "USA",
            "UBW",
            "pHA",
            "pHN",
            "pSN",
            "pSA",
            "pNP",
            "pBW",
            "pDup2",
            "mHA",
            "mHN",
            "mSN",
            "mSA",
            "mNP",
            "mBW",
            "mDup2",
            "postBWinA",
            "postBWinB",
            "postMinB",
            "postM2",
          ].map((n) => [n, randomUUID()]),
        ) as Record<string, string>;
        await db.query(
          "insert into auth.users (id) values ($1), ($2), ($3), ($4), ($5)",
          [k.UHA, k.UHN, k.USN, k.USA, k.UBW],
        );
        await db.query(
          `insert into public.parties (id, tenant_id, display_name) values
             ($1, $8, 'Party Hart'), ($2, $8, 'Party Hale'), ($3, $8, 'Party Sens'),
             ($4, $8, 'Party Std'), ($5, $8, 'Party Noprof'), ($6, $9, 'Party Bravo'),
             ($7, $8, 'Party Second')`,
          [k.pHA, k.pHN, k.pSN, k.pSA, k.pNP, k.pBW, k.pDup2, id.TA, id.TB],
        );
        await db.query(
          `update public.parties set security_level = 'high_risk', security_level_source = 'manual', public_alias = 'Birch' where id = '${k.pHA}';
           update public.parties set security_level = 'sensitive', security_level_source = 'manual' where id = '${k.pSN}';
           update public.parties set public_alias = 'Aspen' where id = '${k.pSA}'`,
        );
        await withoutAliasCheck(
          `update public.parties set security_level = 'high_risk', security_level_source = 'manual' where id = '${k.pHN}'`,
        );
        await db.query(
          `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
             ($1, $8, $9, $10, $8), ($2, $8, $11, $12, $8), ($3, $8, $13, $14, $8),
             ($4, $8, $15, $16, $8), ($5, $8, $17, null, $8), ($6, $18, $19, $20, $18),
             ($7, $8, $21, $22, $8)`,
          [
            k.mHA,
            k.mHN,
            k.mSN,
            k.mSA,
            k.mNP,
            k.mBW,
            k.mDup2,
            id.TA,
            k.pHA,
            k.UHA,
            k.pHN,
            k.UHN,
            k.pSN,
            k.USN,
            k.pSA,
            k.USA,
            k.pNP,
            id.TB,
            k.pBW,
            k.UBW,
            k.pDup2,
            id.UM2,
          ],
        );
        await db.query(
          `insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values
             ($1, $5, $7, 'B worker in A', 'public', 'published'),
             ($2, $6, $7, 'B worker in B', 'public', 'published'),
             ($3, $6, $8, 'A and B worker in B', 'public', 'published'),
             ($4, $5, $9, 'Two rows in A', 'public', 'published')`,
          [
            k.postBWinA,
            k.postBWinB,
            k.postMinB,
            k.postM2,
            id.TA,
            id.TB,
            k.UBW,
            id.UM,
            id.UM2,
          ],
        );
        const workers = await queryAs(
          "service_role",
          {},
          `select m.id, public.worker_public_name(m) as name from public.missionaries as m
            where m.id in ('${k.mHA}', '${k.mHN}', '${k.mSN}', '${k.mSA}', '${k.mNP}', '${k.mBW}')`,
        );
        expect(workers.code, workers.message).toBeNull();
        expect(
          Object.fromEntries(workers.rows.map((r) => [r.id, r.name])),
        ).toEqual({
          [k.mHA!]: "Birch",
          [k.mHN!]: null,
          [k.mSN!]: "Party Sens",
          [k.mSA!]: "Aspen",
          [k.mNP!]: "Party Noprof",
          [k.mBW!]: "Party Bravo",
        });
        const posts = await queryAs(
          "service_role",
          {},
          `select p.id, public.post_author_public_name(p) as name from public.posts as p
            where p.id in ('${id.postW}', '${k.postBWinA}', '${k.postBWinB}', '${k.postMinB}', '${k.postM2}')`,
        );
        expect(posts.code, posts.message).toBeNull();
        expect(
          Object.fromEntries(posts.rows.map((r) => [r.id, r.name])),
        ).toEqual({
          [id.postW]: "Cedar",
          [k.postBWinA!]: null,
          [k.postBWinB!]: "Party Bravo",
          [k.postMinB!]: "Missionary A in B",
          [k.postM2!]: null,
        });
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("the projection names the Party only for a standard or sensitive worker: an unknown level or a NULL level gets the alias or NULL (F6, fail closed)", async () => {
      await db.query("savepoint s");
      try {
        const checks = await db.query(
          `select conname from pg_constraint
            where conrelid = 'public.parties'::regclass and contype = 'c'
              and pg_get_constraintdef(oid) like '%security_level%'`,
        );
        for (const { conname } of checks.rows)
          await db.query(
            `alter table public.parties drop constraint "${conname}"`,
          );
        await db.query(
          "alter table public.parties alter column security_level drop not null",
        );
        const name = async () =>
          (
            await db.query(
              "select public.worker_public_name(m) as name from public.missionaries as m where m.id = $1",
              [id.m2],
            )
          ).rows[0].name;
        await db.query(
          "update public.parties set security_level = 'critical' where id = $1",
          [id.pM2],
        );
        expect(await name(), "an unknown level, no alias").toBeNull();
        await withoutAliasCheck(
          `update public.parties set security_level = null where id = '${id.pM2}'`,
        );
        expect(await name(), "a NULL level, no alias").toBeNull();
        await db.query(
          "update public.parties set public_alias = 'Willow' where id = $1",
          [id.pM2],
        );
        expect(await name(), "a NULL level with an alias").toBe("Willow");
        await db.query(
          "update public.parties set security_level = 'critical' where id = $1",
          [id.pM2],
        );
        expect(await name(), "an unknown level with an alias").toBe("Willow");
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("only the server key reaches the projections: no EXECUTE for anon or authenticated on any of the four functions, EXECUTE for service_role on the two public ones only, ACLs of postgres and service_role alone, and a direct call on a constructed row refused 42501", async () => {
      const fns = [
        ["public.worker_public_name(public.missionaries)", true],
        ["public.post_author_public_name(public.posts)", true],
        ["private.worker_public_name_for(uuid, uuid)", false],
        ["private.assignment_for_profile(uuid, uuid)", false],
      ] as const;
      for (const [fn, served] of fns) {
        const r = await db.query(
          `select has_function_privilege('anon', $1, 'execute') as anon,
                  has_function_privilege('authenticated', $1, 'execute') as authenticated,
                  has_function_privilege('service_role', $1, 'execute') as service_role,
                  (select array_agg(distinct pg_get_userbyid(a.grantee)::text order by pg_get_userbyid(a.grantee)::text)
                     from pg_proc as p, aclexplode(p.proacl) as a
                    where p.oid = $1::regprocedure) as grantees,
                  (select pg_get_userbyid(proowner) from pg_proc where oid = $1::regprocedure) as owner,
                  (select prosecdef from pg_proc where oid = $1::regprocedure) as definer,
                  (select provolatile from pg_proc where oid = $1::regprocedure) as volatility,
                  (select proconfig from pg_proc where oid = $1::regprocedure) as config`,
          [fn],
        );
        expect(r.rows[0], fn).toEqual({
          anon: false,
          authenticated: false,
          service_role: served,
          grantees: served ? ["postgres", "service_role"] : ["postgres"],
          owner: "postgres",
          definer: served,
          volatility: "s",
          config: ['search_path=""'],
        });
      }
      for (const role of ["anon", "authenticated"])
        for (const [fn, row] of [
          [
            "worker_public_name",
            `jsonb_populate_record(null::public.missionaries, jsonb_build_object('id', '${id.mA}', 'tenant_id', '${id.TA}'))`,
          ],
          [
            "post_author_public_name",
            `jsonb_populate_record(null::public.posts, jsonb_build_object('id', '${id.postW}', 'tenant_id', '${id.TA}', 'missionary_id', '${id.UM}'))`,
          ],
        ] as const) {
          const r = await queryAs(
            role,
            role === "anon" ? {} : admin,
            `select public.${fn}(${row}) as name`,
          );
          expect([r.code, r.message], `${role} ${fn}`).toEqual([
            "42501",
            `permission denied for function ${fn}`,
          ]);
        }
    });
  },
);
