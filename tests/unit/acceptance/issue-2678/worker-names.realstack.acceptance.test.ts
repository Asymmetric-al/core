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

const FORBIDDEN =
  /Legal Rowan|Profile Rowan|Party Rowan|Party Xu|Profile Vale|Profile Xu|Profile Yew|Profile Zed|Profile Gone|Profile Orphan|Profile Fern|Profile Reed|Profile Fen|Profile Briar|Profile Moss|Profile Hazel|Party Hazel|Profile Fenn|Profile Linden/;

const ALIAS_DIFFERS =
  "a restricted or high-risk worker's public alias must differ from the legal name";

const NEW_SINGLES = [
  0x115f, 0x1160, 0x3164, 0xffa0, 0x2800, 0xe0001, 0x180f, 0x17b4, 0x17b5,
  0x2065, 0xe0000, 0x13441, 0x13442, 0x1d159, 0x070f,
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
    const avatar = (user: string) => `https://example.test/${user}.png`;
    const member = caller(id, "UDA", "mDA", "TA");
    const keys = (names: string[]) =>
      Object.fromEntries(names.map((n) => [n, randomUUID()])) as Record<
        string,
        string
      >;
    const addUsers = async (named: Record<string, string>) => {
      for (const [user, name] of Object.entries(named)) {
        await db.query("insert into auth.users (id) values ($1)", [user]);
        await db.query(
          "update public.profiles set display_name = $2, full_name = $2, avatar_url = $3 where id = $1",
          [user, name, avatar(user)],
        );
      }
    };
    const comment = async (post: string, users: string[]) => {
      for (const user of users)
        await db.query(
          "insert into public.post_comments (post_id, user_id, content) values ($1, $2, 'acc2678 r2a')",
          [post, user],
        );
    };
    const authorsAs = async (who: object, post: string) => {
      const r = await run(
        who,
        `select user_id, display_name, avatar_url from public.post_comment_authors('${post}') order by user_id`,
      );
      expect(r.code, r.message).toBeNull();
      return Object.fromEntries(
        r.rows.map((row) => [row.user_id, [row.display_name, row.avatar_url]]),
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
      await db.query(
        "update public.posts set review_state = 'approved' where id = any($1::uuid[])",
        [[id.postW, id.postX, id.postOrg]],
      );
      await db.query(
        "update public.profiles set display_name = 'Profile Xu', full_name = 'Profile Xu' where id = $1",
        [id.UX],
      );
      await db.query(
        "update public.profiles set display_name = 'Donor Dee', full_name = 'Donor Dee' where id = $1",
        [id.UDA],
      );
      await db.query(
        "update public.profiles set avatar_url = 'https://example.test/' || id || '.png' where id = any($1::uuid[])",
        [[id.UM, id.UM2, id.UX, id.UR, id.UDA, id.UDC, id.UD2, id.US, id.UBS]],
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
        await db.query(
          "update public.posts set review_state = 'approved' where id = any($1::uuid[])",
          [[k.postBWinA, k.postBWinB, k.postMinB, k.postM2]],
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

    it("r2a C2: post_comment_authors fails closed on a level the constraint forbids today: with the level's CHECK and NOT NULL dropped, a worker and a non-worker at 'critical' and at NULL get no name and no photo without an alias, and the alias and no photo with one", async () => {
      await db.query("savepoint s");
      try {
        const k = keys(["UCN", "pCN"]);
        await addUsers({ [k.UCN!]: "Profile Cotton" });
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Party Cotton')",
          [k.pCN, id.TA],
        );
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
          [id.TA, k.UCN, k.pCN],
        );
        await comment(id.postOrg, [id.UM2, k.UCN!]);
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
        const seen: Record<string, unknown> = {};
        for (const level of ["'critical'", "null"])
          for (const aliased of [false, true]) {
            await withoutAliasCheck(
              `update public.parties set security_level = ${level}, public_alias = ${aliased ? "'Willow'" : "null"} where id = '${id.pM2}';
               update public.parties set security_level = ${level}, public_alias = ${aliased ? "'Wren'" : "null"} where id = '${k.pCN}'`,
            );
            const got = await authorsAs(member, id.postOrg);
            seen[`${level}${aliased ? " with an alias" : ""}`] = {
              worker: got[id.UM2],
              nonWorker: got[k.UCN!],
            };
          }
        expect(seen).toEqual({
          "'critical'": { worker: [null, null], nonWorker: [null, null] },
          "'critical' with an alias": {
            worker: ["Willow", null],
            nonWorker: ["Wren", null],
          },
          null: { worker: [null, null], nonWorker: [null, null] },
          "null with an alias": {
            worker: ["Willow", null],
            nonWorker: ["Wren", null],
          },
        });
        expect(JSON.stringify(seen)).not.toMatch(
          /Party Vale|Profile Vale|Profile Cotton|Party Cotton/,
        );
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

    it("r2a test 1: a member of the post's organization reads W by the alias with no photo, V by the Party name with the photo, X, Y (two worker rows here) and Z (a restricted worker of another organization only) as NULL with no photo, D by the display name with the photo, and N, whose profile is gone, as one row of NULLs; no row holds a forbidden name (gate a)", async () => {
      await db.query("savepoint s");
      try {
        const k = keys([
          "UY",
          "UZ",
          "UN",
          "pY1",
          "pY2",
          "pZ",
          "mY1",
          "mY2",
          "mZ",
          "mZA",
        ]);
        await addUsers({
          [k.UY!]: "Profile Yew",
          [k.UZ!]: "Profile Zed",
          [k.UN!]: "Profile Gone",
        });
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $4, 'Party Yew One'), ($2, $4, 'Party Yew Two'), ($3, $5, 'Party Zed')",
          [k.pY1, k.pY2, k.pZ, id.TA, id.TB],
        );
        await withoutAliasCheck(
          `update public.parties set security_level = 'restricted', security_level_source = 'manual', public_alias = 'Ash' where id = '${k.pZ}'`,
        );
        await db.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $4, $5, $7, $4), ($2, $4, $6, $7, $4), ($3, $8, $9, $10, $8)",
          [k.mY1, k.mY2, k.mZ, id.TA, k.pY1, k.pY2, k.UY, id.TB, k.pZ, k.UZ],
        );
        await db.query(
          "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'donor')",
          [k.mZA, k.UZ, id.TA],
        );
        await db.query("delete from public.profiles where id = $1", [k.UN]);
        await comment(id.postOrg, [
          id.UM,
          id.UM2,
          id.UX,
          id.UDA,
          k.UY!,
          k.UZ!,
          k.UN!,
        ]);
        const got = await authorsAs(member, id.postOrg);
        expect(got).toEqual({
          [id.UM]: ["Cedar", null],
          [id.UM2]: ["Party Vale", avatar(id.UM2)],
          [id.UX]: [null, null],
          [id.UDA]: ["Donor Dee", avatar(id.UDA)],
          [k.UY!]: [null, null],
          [k.UZ!]: [null, null],
          [k.UN!]: [null, null],
        });
        expect(JSON.stringify(got)).not.toMatch(FORBIDDEN);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("r2a test 1, guard, amended by the WP7 pull request 1 fix round (AL-2680, S7): a member of another organization only gets no commenter at all, not even their user ids", async () => {
      await db.query("savepoint s");
      try {
        await comment(id.postOrg, [id.UM, id.UM2, id.UX, id.UDA]);
        expect(
          await authorsAs(caller(id, "UBS", "mBS", "TB"), id.postOrg),
        ).toEqual({});
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("r2a test 1, guard (passes on the base): post_comment_authors runs as its definer postgres, and only postgres and authenticated hold it", async () => {
      const r = await db.query(
        `select (select array_agg(distinct pg_get_userbyid(a.grantee)::text order by pg_get_userbyid(a.grantee)::text)
                   from pg_proc as p, aclexplode(p.proacl) as a
                  where p.oid = 'public.post_comment_authors(uuid)'::regprocedure) as grantees,
                (select prosecdef from pg_proc where oid = 'public.post_comment_authors(uuid)'::regprocedure) as definer,
                (select pg_get_userbyid(proowner) from pg_proc where oid = 'public.post_comment_authors(uuid)'::regprocedure) as owner`,
      );
      expect(r.rows[0]).toEqual({
        grantees: ["authenticated", "postgres"],
        definer: true,
        owner: "postgres",
      });
    });

    it("r2a test 1 (N3, with the fix rounds' F1 and C1; C1 holds ta_restricted's allowlist for high-risk: a worker with a second, high-risk Party here gets no name, a high-risk non-worker its alias): a commenter's Parties count in every organization, at every level:R1, A and a high-risk worker by their alias here, L by the alias of a worker row it is linked to, a sensitive worker by its Party name and a sensitive or whitespace-aliased person by the display name, both with the photo; R2 (by link or by donor row), R3, R3b, R3c, R4, R5, a high-risk person without an alias, a person whose alias is only invisible characters, a standard worker of another organization only and a linked person whose profile is gone by no name and no photo; no row holds a forbidden name", async () => {
      await db.query("savepoint s");
      try {
        const people = [
          "UR1",
          "UR2",
          "UR2d",
          "UR3",
          "UR4",
          "UL",
          "UR5",
          "UR3b",
          "UA",
          "UHW",
          "UHN",
          "USW",
          "USN",
          "URI",
          "UWS",
          "UTS",
          "UN2",
          "UR3c",
          "UA2",
          "UHR5",
          "UHRA",
        ];
        const k = keys([
          ...people,
          "pR1",
          "pR2",
          "pR2d",
          "pR3",
          "pR4s",
          "pR4r",
          "pL",
          "pR5",
          "pR5r",
          "pR3bB",
          "pR3bA",
          "pA",
          "pHW",
          "pHN",
          "pSW",
          "pSN",
          "pRI",
          "pWS",
          "pTS",
          "pN2",
          "pR3cB",
          "pR3cA",
          "pA2A",
          "pA2B",
          "mL",
          "mR5",
          "mHW",
          "mSW",
          "mTS",
          "pHR5",
          "pHR5h",
          "pHRA",
          "mHR5",
        ]);
        await addUsers({
          [k.UR1!]: "Profile Fern",
          [k.UR2!]: "Profile Reed",
          [k.UR2d!]: "Profile Reed",
          [k.UR3!]: "Profile Fen",
          [k.UR4!]: "Profile Briar",
          [k.UL!]: "Profile Moss",
          [k.UR5!]: "Profile Hazel",
          [k.UR3b!]: "Profile Fenn",
          [k.UA!]: "Profile Linden",
          [k.UHW!]: "Profile Holm",
          [k.UHN!]: "Profile Hearn",
          [k.USW!]: "Profile Sage",
          [k.USN!]: "Sorrel Shown",
          [k.URI!]: "Profile Ivy",
          [k.UWS!]: "Whit Shown",
          [k.UTS!]: "Profile Tarn",
          [k.UN2!]: "Profile Nettle",
          [k.UR3c!]: "Profile Laurel",
          [k.UA2!]: "Avens Shown",
          [k.UHR5!]: "Profile Alder",
          [k.UHRA!]: "Profile Bramble",
        });
        const parties: [string, "TA" | "TB", string][] = [
          ["pR1", "TA", "Party Fern"],
          ["pR2", "TA", "Party Reed"],
          ["pR2d", "TA", "Party Reed D"],
          ["pR3", "TB", "Party Fen"],
          ["pR4s", "TA", "Party Briar S"],
          ["pR4r", "TA", "Party Briar R"],
          ["pL", "TA", "Party Moss"],
          ["pR5", "TA", "Party Hazel"],
          ["pR5r", "TA", "Party Hazel R"],
          ["pR3bB", "TB", "Party Fenn B"],
          ["pR3bA", "TA", "Party Fenn A"],
          ["pA", "TA", "Party Linden"],
          ["pHW", "TA", "Party Holm"],
          ["pHN", "TA", "Party Hearn"],
          ["pSW", "TA", "Party Sage"],
          ["pSN", "TA", "Party Sorrel"],
          ["pRI", "TA", "Party Ivy"],
          ["pWS", "TA", "Party Whit"],
          ["pTS", "TB", "Party Tarn"],
          ["pN2", "TA", "Party Nettle"],
          ["pR3cB", "TB", "Party Laurel B"],
          ["pR3cA", "TA", "Party Laurel A"],
          ["pA2A", "TA", "Party Avens A"],
          ["pA2B", "TB", "Party Avens B"],
          ["pHR5", "TA", "Party Alder"],
          ["pHR5h", "TA", "Party Alder H"],
          ["pHRA", "TA", "Party Bramble"],
        ];
        for (const [party, tenant, name] of parties)
          await db.query(
            "insert into public.parties (id, tenant_id, display_name) values ($1, $2, $3)",
            [k[party], id[tenant], name],
          );
        const level = (party: string, security: string, aliasSql: string) =>
          `update public.parties set security_level = '${security}', security_level_source = 'manual', public_alias = ${aliasSql} where id = '${k[party]}';`;
        await withoutAliasCheck(
          [
            level("pR1", "restricted", "'Fern'"),
            level("pR2", "restricted", "null"),
            level("pR2d", "restricted", "null"),
            level("pR3", "restricted", "'Ash'"),
            level("pR4r", "restricted", "'Briar'"),
            level("pL", "restricted", "'Moss'"),
            level("pR5r", "restricted", "'Briar'"),
            level("pR3bB", "restricted", "'Ash'"),
            level("pHW", "high_risk", "'Holly'"),
            level("pHN", "high_risk", "null"),
            level("pSW", "sensitive", "null"),
            level("pSN", "sensitive", "null"),
            level("pRI", "restricted", "chr(65039) || chr(8203)"),
            level("pWS", "standard", "'   '"),
            level("pN2", "restricted", "'Nettle'"),
            level("pR3cB", "restricted", "'Ash'"),
            level("pR3cA", "standard", "'Laurel'"),
            level("pA2B", "standard", "'Juniper'"),
            level("pHR5h", "high_risk", "'Bramble'"),
            level("pHRA", "high_risk", "'Bramble'"),
          ].join("\n"),
        );
        await db.query(
          "update public.parties set public_alias = 'Linden' where id = $1",
          [k.pA],
        );
        const workers: [string, "TA" | "TB", string, string | null][] = [
          ["mL", "TA", "pL", null],
          ["mR5", "TA", "pR5", "UR5"],
          ["mHW", "TA", "pHW", "UHW"],
          ["mSW", "TA", "pSW", "USW"],
          ["mTS", "TB", "pTS", "UTS"],
          ["mHR5", "TA", "pHR5", "UHR5"],
        ];
        for (const [row, tenant, party, user] of workers)
          await db.query(
            "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
            [k[row], id[tenant], k[party], user === null ? null : k[user]],
          );
        const links: ["TA" | "TB", string, string][] = [
          ["TA", "UR1", "pR1"],
          ["TA", "UR2", "pR2"],
          ["TB", "UR3", "pR3"],
          ["TA", "UR4", "pR4s"],
          ["TA", "UL", "pL"],
          ["TB", "UR3b", "pR3bB"],
          ["TA", "UA", "pA"],
          ["TA", "UHN", "pHN"],
          ["TA", "USN", "pSN"],
          ["TA", "URI", "pRI"],
          ["TA", "UWS", "pWS"],
          ["TA", "UN2", "pN2"],
          ["TB", "UR3c", "pR3cB"],
          ["TA", "UA2", "pA2A"],
          ["TB", "UA2", "pA2B"],
          ["TA", "UHRA", "pHRA"],
        ];
        for (const [tenant, user, party] of links)
          await db.query(
            "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
            [id[tenant], k[user], k[party]],
          );
        const donorRows: [string, string][] = [
          ["UR2d", "pR2d"],
          ["UR4", "pR4r"],
          ["UR5", "pR5r"],
          ["UR3b", "pR3bA"],
          ["UR3c", "pR3cA"],
          ["UHR5", "pHR5h"],
        ];
        for (const [user, party] of donorRows)
          await db.query(
            "insert into public.donors (tenant_id, party_id, profile_id, name, email) values ($1, $2, $3::uuid, 'Donor row', 'acc2678-n3-' || $3::text || '@example.test')",
            [id.TA, k[party], k[user]],
          );
        await db.query("delete from public.profiles where id = $1", [k.UN2]);
        await comment(
          id.postOrg,
          people.map((p) => k[p]!),
        );
        const got = await authorsAs(member, id.postOrg);
        expect(Object.keys(got)).toHaveLength(people.length);
        const byLabel = Object.fromEntries(people.map((p) => [p, got[k[p]!]]));
        expect(byLabel).toEqual({
          UR1: ["Fern", null],
          UR2: [null, null],
          UR2d: [null, null],
          UR3: [null, null],
          UR4: [null, null],
          UL: ["Moss", null],
          UR5: [null, null],
          UR3b: [null, null],
          UA: ["Linden", avatar(k.UA!)],
          UHW: ["Holly", null],
          UHN: [null, null],
          USW: ["Party Sage", avatar(k.USW!)],
          USN: ["Sorrel Shown", avatar(k.USN!)],
          URI: [null, null],
          UWS: ["Whit Shown", avatar(k.UWS!)],
          UTS: [null, null],
          UN2: [null, null],
          UR3c: [null, null],
          UA2: ["Avens Shown", avatar(k.UA2!)],
          UHR5: [null, null],
          UHRA: ["Bramble", null],
        });
        expect(JSON.stringify(got)).not.toMatch(FORBIDDEN);
        expect(JSON.stringify(got)).not.toMatch(
          /Profile Holm|Party Holm|Profile Hearn|Party Hearn|Profile Sage|Party Sorrel|Profile Ivy|Party Ivy|Party Whit|Profile Tarn|Party Tarn|Profile Nettle|Nettle|Profile Laurel|Laurel|Juniper|Party Avens|Profile Alder|Party Alder|Profile Bramble|Party Bramble/,
        );
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("r2a test 1 (N3, S): W's comment on a post of W's other organization, read by a member there, names W by that organization's projection and shows no photo, because W is restricted elsewhere", async () => {
      await db.query("savepoint s");
      try {
        const postS = randomUUID();
        await db.query(
          "insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values ($1, $2, null, 'In B', 'public', 'published')",
          [postS, id.TB],
        );
        await db.query(
          "update public.posts set review_state = 'approved' where id = $1",
          [postS],
        );
        await comment(postS, [id.UM]);
        const got = await authorsAs(caller(id, "UBS", "mBS", "TB"), postS);
        expect(got).toEqual({ [id.UM]: ["Missionary A in B", null] });
        expect(JSON.stringify(got)).not.toMatch(FORBIDDEN);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("r2a test 1 (N3, G), guard, amended by WP7 pull request 1 (AL-2680): a published public post with no organization holds no comment, since a comment takes its post's tenant (23502), so it names no commenter", async () => {
      await db.query("savepoint s");
      try {
        const postG = randomUUID();
        await db.query(
          "insert into public.posts (id, tenant_id, missionary_id, content, visibility, status) values ($1, null, null, 'Nowhere', 'public', 'published')",
          [postG],
        );
        await db.query("savepoint g");
        const refused = await comment(postG, [id.UDA]).then(
          () => "inserted",
          (e: { code?: string }) => e.code,
        );
        await db.query("rollback to savepoint g");
        expect(refused).toBe("23502");
        expect(await authorsAs(member, postG)).toEqual({});
      } finally {
        await db.query("rollback to savepoint s");
      }
    });
  },
);
