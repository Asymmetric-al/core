import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  backendPid,
  fixtureIds,
  fixtureSql,
  migration,
  waitsOn,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const WRITER = "public.donor_party_for_insert(uuid,uuid,text,text)";
const FILL = "donors_fill_party_after_insert_temp";
const NBSP = "\u00a0";

async function tx<T>(db: pg.Client, fn: () => Promise<T>) {
  await db.query("begin");
  try {
    return await fn();
  } finally {
    await db.query("rollback");
  }
}

async function failure(db: pg.Client, sql: string, args: unknown[] = []) {
  await db.query("savepoint failure");
  try {
    await db.query(sql, args);
    await db.query("release savepoint failure");
    return null;
  } catch (e) {
    await db.query("rollback to savepoint failure");
    return (e as { code?: string }).code ?? "?";
  }
}

function catchUp() {
  const text = readFileSync(migration("_wp5_rest_party_writer"), "utf8");
  const start = text.indexOf("-- catch-up: begin\n");
  const end = text.indexOf("-- catch-up: end\n");
  if (start < 0 || end < start)
    throw new Error("the migration has no catch-up between its markers");
  return text.slice(start, end);
}

function donorInsertColumns(body: string) {
  return [
    ...body.matchAll(
      /insert\s+into\s+(?:public\s*\.\s*)?donors\s*\(([^)]*)\)/gi,
    ),
  ].map((m) => m[1]!.split(",").map((c) => c.trim().toLowerCase()));
}

it("the external-identifier checks carry private.normalize_safety_text's removal and whitespace classes exactly, as 20261126010000 writes them (red: no migration)", () => {
  const classes = (file: string) => {
    const text = readFileSync(migration(file), "utf8");
    return {
      removal: [...text.matchAll(/\$re\$\[(.*?)\]\$re\$/gs)].map((m) => m[1]),
      space: [...text.matchAll(/\$ws\$\[(.*?)\]\+\$ws\$/gs)].map((m) => m[1]),
    };
  };
  const r1 = classes("_wp5_2r1_worker_names");
  const mine = classes("_wp5_rest_party_writer");
  expect(r1.removal).toHaveLength(2);
  expect(mine.removal).toEqual([r1.removal[0], r1.removal[0]]);
  expect(mine.space).toEqual([r1.space[0], r1.space[0]]);
});

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest (brief invariants 1-4, 8 and 11; rulings WP5 part 2 Q8, Q15, Q-C, Q1 (b)): one Party writer for every donor writer, the saga's legacy-only lookups, the one catch-up of account links, and blank as the safety normalizer means it",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    const newPerson = async (display: string | null, full: string | null) => {
      const user = randomUUID();
      await db.query(
        "insert into auth.users (id, email) values ($1::uuid, 'wp5rest-' || $1::text || '@example.test')",
        [user],
      );
      await db.query(
        "insert into public.profiles (id, user_id) values ($1, $1) on conflict (id) do nothing",
        [user],
      );
      await db.query(
        "update public.profiles set display_name = $2, full_name = $3 where id = $1",
        [user, display, full],
      );
      return user;
    };
    const count = async (table: string, tenant: string) =>
      Number(
        (
          await db.query(
            `select count(*) n from public.${table} where tenant_id = $1`,
            [tenant],
          )
        ).rows[0].n,
      );
    const gift = (tenant: string, profile: string) =>
      db.query(
        "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 500, p_idempotency_key => $3) r",
        [tenant, profile, randomUUID()],
      );
    const donorParty = async (tenant: string, profile: string) =>
      (
        await db.query(
          "select d.party_id, p.display_name from public.donors d left join public.parties p on p.id = d.party_id where d.tenant_id = $1 and d.profile_id = $2",
          [tenant, profile],
        )
      ).rows;

    it("the writer is a postgres-owned definer with an empty search path, EXECUTE for tenant_guard and service_role only, reading nothing from auth (red: 42883, no writer)", async () => {
      const r = await db.query(
        `select p.prosecdef, pg_get_userbyid(p.proowner) owner, p.proconfig, p.prosrc,
                (select coalesce(string_agg(distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end, '+' order by case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end), '-')
                   from aclexplode(p.proacl) a where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) grantees
           from pg_proc p where p.oid = $1::regprocedure`,
        [WRITER],
      );
      expect(r.rows).toHaveLength(1);
      const [w] = r.rows;
      expect(w.prosecdef).toBe(true);
      expect(w.owner).toBe("postgres");
      expect(w.proconfig).toEqual(['search_path=""']);
      expect(w.grantees).toBe("service_role+tenant_guard");
      expect(w.prosrc).not.toMatch(/\bauth\s*\./i);
    });

    it("no function inserts into donors without naming party_id (catalog sweep; red: begin_donation_saga and atomic_create_donation_with_audit omit it)", async () => {
      const r = await db.query(
        `select p.oid::regprocedure::text fn, p.prosrc from pg_proc p join pg_namespace n on n.oid = p.pronamespace
          where n.nspname not in ('pg_catalog', 'information_schema') and p.prosrc ~* 'insert\\s+into\\s+(public\\s*\\.\\s*)?donors'`,
      );
      const writers = r.rows.map((row) => row.fn as string).sort();
      expect(writers).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^atomic_create_donation_with_audit\(/),
          expect.stringMatching(/^begin_donation_saga\(/),
        ]),
      );
      const omitting = r.rows
        .filter((row) =>
          donorInsertColumns(row.prosrc as string).some(
            (columns) => !columns.includes("party_id"),
          ),
        )
        .map((row) => row.fn);
      expect(omitting).toEqual([]);
    });

    it("with the temporary fill trigger off, a signed-in person's first gift through begin_donation_saga names the Party at insert: the linked Party, else the worker row's, else one new Party named from the profile; answers, owner and grants unchanged (red: party_id NULL)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        await db.query(`alter table public.donors disable trigger ${FILL}`);
        const parties = await count("parties", id.TA);
        const links = await count("account_links", id.TA);

        const linked = (await gift(id.TA, id.UM2)).rows[0].r;
        expect(Object.keys(linked).sort()).toEqual([
          "donation_id",
          "donor_id",
          "outbox_id",
          "replayed",
        ]);
        expect(linked.replayed).toBe(false);
        expect(await donorParty(id.TA, id.UM2)).toEqual([
          { party_id: id.pM2, display_name: "Second missionary" },
        ]);

        const worker = await newPerson("Unlinked Worker", null);
        const workerParty = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker party')",
          [workerParty, id.TA],
        );
        await db.query(
          "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1)",
          [id.TA, workerParty, worker],
        );
        await gift(id.TA, worker);
        expect(await donorParty(id.TA, worker)).toEqual([
          { party_id: workerParty, display_name: "Worker party" },
        ]);

        const fresh = await newPerson(`${NBSP}${NBSP}`, "Gift Full");
        await gift(id.TA, fresh);
        expect(await donorParty(id.TA, fresh)).toEqual([
          { party_id: expect.any(String), display_name: "Gift Full" },
        ]);
        await gift(id.TA, fresh);
        expect(await count("parties", id.TA)).toBe(parties + 2);
        expect(await count("account_links", id.TA)).toBe(links);

        const key = randomUUID();
        const once = await db.query(
          "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 700, p_idempotency_key => $3) r",
          [id.TA, fresh, key],
        );
        const again = await db.query(
          "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 700, p_idempotency_key => $3) r",
          [id.TA, fresh, key],
        );
        expect(again.rows[0].r).toEqual({
          replayed: true,
          outbox_id: once.rows[0].r.outbox_id,
          donation_id: once.rows[0].r.donation_id,
        });

        const grants = await db.query(
          `select p.oid::regprocedure::text fn, pg_get_userbyid(p.proowner) owner, p.prosecdef, p.proacl::text acl
             from pg_proc p where p.proname in ('begin_donation_saga', 'atomic_create_donation_with_audit') order by 1`,
        );
        expect(grants.rows).toEqual([
          {
            fn: "atomic_create_donation_with_audit(uuid,uuid,uuid,uuid,bigint,text,uuid,text,text,jsonb,text,text)",
            owner: "postgres",
            prosecdef: false,
            acl: "{postgres=X/postgres,service_role=X/postgres}",
          },
          {
            fn: "begin_donation_saga(uuid,uuid,uuid,bigint,text,uuid,uuid,text,text,text,jsonb)",
            owner: "postgres",
            prosecdef: false,
            acl: "{postgres=X/postgres,service_role=X/postgres}",
          },
        ]);
      }));

    it("with the fill trigger off, atomic_create_donation_with_audit names the Party at insert the same way (red: party_id NULL)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        await db.query(`alter table public.donors disable trigger ${FILL}`);
        const person = await newPerson("Atomic Giver", null);
        await db.query(
          "select public.atomic_create_donation_with_audit(p_tenant_id => $1, p_donor_profile_id => $2, p_actor_user_id => $2, p_missionary_id => null, p_amount => 300)",
          [id.TA, person],
        );
        expect(await donorParty(id.TA, person)).toEqual([
          { party_id: expect.any(String), display_name: "Atomic Giver" },
        ]);
        await db.query(
          "select public.atomic_create_donation_with_audit(p_tenant_id => $1, p_donor_profile_id => $2, p_actor_user_id => $2, p_missionary_id => null, p_amount => 300)",
          [id.TA, id.UM2],
        );
        expect(await donorParty(id.TA, id.UM2)).toEqual([
          { party_id: id.pM2, display_name: "Second missionary" },
        ]);
      }));

    it("a guest call (no profile) gets its own new Party each time, joined to no login, worker or other donor; a name blank after the safety normalizer falls through, no-break spaces included (red: 42883)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        const call = async (name: string | null, email: string | null) => {
          const made = await db.query(
            "select public.donor_party_for_insert($1, null, $2, $3) id",
            [id.TA, name, email],
          );
          return (
            await db.query(
              "select id, display_name from public.parties where id = $1",
              [made.rows[0].id],
            )
          ).rows[0];
        };
        const first = await call("  Jo   Guest ", "jo@example.test");
        const second = await call("Jo Guest", "jo@example.test");
        expect(first.display_name).toBe("Jo Guest");
        expect(second.id).not.toBe(first.id);
        expect(
          (await call(`${NBSP}\u200b${NBSP}`, ` ${NBSP}mail@example.test`))
            .display_name,
        ).toBe("mail@example.test");
        expect((await call(`${NBSP}\t`, `\u3000`)).display_name).toBe(
          "Unnamed supporter",
        );
        const joined = await db.query(
          `select count(*) n from public.parties p where p.id in ($1, $2) and (
             exists (select 1 from public.account_links al where al.party_id = p.id)
             or exists (select 1 from public.missionaries m where m.party_id = p.id)
             or exists (select 1 from public.donors d where d.party_id = p.id))`,
          [first.id, second.id],
        );
        expect(joined.rows).toEqual([{ n: "0" }]);
      }));

    it("the writer writes only in the tenant the guard entered, and for the guard reads its links and worker rows (red: 42883)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        await db.query("set local role tenant_guard");
        await db.query("select tenant_guard.enter($1)", [id.TA]);
        expect(
          (
            await db.query(
              "select public.donor_party_for_insert($1, $2, null, null) p",
              [id.TA, id.UM2],
            )
          ).rows,
        ).toEqual([{ p: id.pM2 }]);
        expect(
          await failure(
            db,
            "select public.donor_party_for_insert($1, null, 'Elsewhere', null)",
            [id.TB],
          ),
        ).toBe("42501");
        await db.query("reset role");
        expect(
          await failure(
            db,
            "select public.donor_party_for_insert(null, null, 'No tenant', null)",
          ),
        ).toBe("22004");
        await db.query("set local role authenticated");
        expect(
          await failure(
            db,
            "select public.donor_party_for_insert($1, null, 'Signed in', null)",
            [id.TA],
          ),
        ).toBe("42501");
        await db.query("reset role");
      }));

    it("external_identifiers refuses a source or external id that the safety normalizer leaves empty, the checks validated, and the service key still writes a real one (red: a no-break-space source is accepted)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        const insert = (source: string, external: string) =>
          failure(
            db,
            "insert into public.external_identifiers (tenant_id, source, external_id, target_type, target_id, party_id) values ($1, $2, $3, 'party', $4, $4)",
            [id.TA, source, external, id.pDA],
          );
        for (const blank of [NBSP, `${NBSP} ${NBSP}`, "\u200b", "\u3000\t", ""])
          expect([blank, await insert(blank, "x-1")]).toEqual([blank, "23514"]);
        for (const blank of [NBSP, "\u2028", "\ufeff"])
          expect([blank, await insert("crm", blank)]).toEqual([blank, "23514"]);
        await db.query("set local role service_role");
        expect(await insert(" legacy crm ", " A-1 ")).toBeNull();
        await db.query("reset role");
        const checks = await db.query(
          `select conname, convalidated from pg_constraint
            where conrelid = 'public.external_identifiers'::regclass
              and conname in ('external_identifiers_source_check', 'external_identifiers_external_id_check') order by 1`,
        );
        expect(checks.rows).toEqual([
          {
            conname: "external_identifiers_external_id_check",
            convalidated: true,
          },
          { conname: "external_identifiers_source_check", convalidated: true },
        ]);
      }));

    it("the catch-up links, once, a login to the one Party its donor and worker rows name in a tenant; never one linked elsewhere there, never an ambiguous one; a gift after it links nothing (red: no migration)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        const giver = await newPerson("After Part One", null);
        await gift(id.TA, giver);
        const giverParty = (await donorParty(id.TA, giver))[0]!.party_id;

        const both = await newPerson("Two Parties", null);
        await gift(id.TA, both);
        const otherParty = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker elsewhere')",
          [otherParty, id.TA],
        );
        await db.query(
          "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1)",
          [id.TA, otherParty, both],
        );

        const relinked = await newPerson("Claimed elsewhere", null);
        await gift(id.TA, relinked);
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
          [id.TA, relinked, id.pD2],
        );
        const linksBefore = await count("account_links", id.TA);

        await db.query(catchUp());

        const linkOf = async (user: string) =>
          (
            await db.query(
              "select party_id, linked_via from public.account_links where tenant_id = $1 and user_id = $2",
              [id.TA, user],
            )
          ).rows;
        expect(await linkOf(giver)).toEqual([
          { party_id: giverParty, linked_via: "profile_backfill" },
        ]);
        expect(await linkOf(both)).toEqual([]);
        expect(await linkOf(relinked)).toEqual([
          { party_id: id.pD2, linked_via: "account_claim" },
        ]);
        expect(await count("account_links", id.TA)).toBe(linksBefore + 1);

        const later = await newPerson("After the catch-up", null);
        await gift(id.TA, later);
        expect(await linkOf(later)).toEqual([]);
        expect(await count("account_links", id.TA)).toBe(linksBefore + 1);
      }));

    const giftAs = (
      tenant: string,
      profile: string | null,
      key: string = randomUUID(),
      writer = "begin_donation_saga",
    ) =>
      db.query(
        writer === "begin_donation_saga"
          ? "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $3, p_amount => 500, p_idempotency_key => $4) r"
          : "select public.atomic_create_donation_with_audit(p_tenant_id => $1, p_donor_profile_id => $2, p_actor_user_id => $3, p_missionary_id => null, p_amount => 500) r",
        writer === "begin_donation_saga"
          ? [tenant, profile, profile ?? id.UM, key]
          : [tenant, profile, profile ?? id.UM],
      );
    const donorsOnParty = async (tenant: string, party: string) =>
      (
        await db.query(
          "select d.id, (select count(*)::int from public.donations g where g.donor_id = d.id) gifts from public.donors d where d.tenant_id = $1 and d.party_id = $2 order by d.created_at, d.id",
          [tenant, party],
        )
      ).rows as { id: string; gifts: number }[];

    it("F2: a guest gives, claims the gift, signs in and gives again through either legacy writer: one donor on that Party with every gift, found by the account link and its Party, and a true replay of the signed-in gift's key answers the stored gift (red: the signed-in gift writes a second donor on the Party)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        for (const writer of [
          "begin_donation_saga",
          "atomic_create_donation_with_audit",
        ]) {
          const guest = (await giftAs(id.TA, null)).rows[0].r;
          const party = (
            await db.query(
              "select party_id from public.donors where id = (select donor_id from public.donations where id = $1)",
              [guest.donation_id],
            )
          ).rows[0].party_id as string;
          const person = await newPerson(`Claimer ${writer}`, null);
          await db.query(
            "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
            [id.TA, person, party],
          );
          const key = randomUUID();
          const signedIn = (await giftAs(id.TA, person, key, writer)).rows[0].r;
          expect([writer, await donorsOnParty(id.TA, party)]).toEqual([
            writer,
            [{ id: signedIn.donor_id, gifts: 2 }],
          ]);
          if (writer === "begin_donation_saga") {
            const again = (await giftAs(id.TA, person, key, writer)).rows[0].r;
            expect(again).toEqual({
              replayed: true,
              outbox_id: signedIn.outbox_id,
              donation_id: signedIn.donation_id,
            });
          }
        }
      }));

    it("F2: the seed's claimed donor (no profile_id, an account_claim link) gives and gets no twin (red: a second donor on the Party)", () =>
      tx(db, async () => {
        const claimed = (
          await db.query(
            `select al.tenant_id, al.party_id, p.id profile
               from public.account_links al
               join public.donors d on d.tenant_id = al.tenant_id and d.party_id = al.party_id
               join public.profiles p on p.user_id = al.user_id
              where al.linked_via = 'account_claim' and d.profile_id is null
              limit 1`,
          )
        ).rows[0] as { tenant_id: string; party_id: string; profile: string };
        expect(claimed).toBeDefined();
        const before = await donorsOnParty(claimed.tenant_id, claimed.party_id);
        expect(before).toHaveLength(1);
        await giftAs(claimed.tenant_id, claimed.profile);
        expect(
          await donorsOnParty(claimed.tenant_id, claimed.party_id),
        ).toEqual([{ id: before[0]!.id, gifts: before[0]!.gifts + 1 }]);
      }));

    it("F2: a signed-in person whose Party already has two donors in the organization is refused (21000) by either legacy writer, and nothing is written (red: a gift is written)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        const party = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Twin party')",
          [party, id.TA],
        );
        await db.query(
          "insert into public.donors (tenant_id, party_id, name) values ($1, $2, 'Twin one'), ($1, $2, 'Twin two')",
          [id.TA, party],
        );
        const person = await newPerson("Twin login", null);
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
          [id.TA, person, party],
        );
        const before = await count("donations", id.TA);
        for (const writer of [
          "begin_donation_saga",
          "atomic_create_donation_with_audit",
        ]) {
          await db.query("savepoint twin");
          const code = await giftAs(id.TA, person, randomUUID(), writer).then(
            () => null,
            (e: { code?: string }) => e.code ?? "?",
          );
          await db.query("rollback to savepoint twin");
          expect([writer, code]).toEqual([writer, "21000"]);
        }
        expect(await count("donations", id.TA)).toBe(before);
        expect(await donorsOnParty(id.TA, party)).toHaveLength(2);
      }));

    it("F5: the catch-up links no soft-deleted login; deleted_at is added inside this rolled-back case where the plain image's auth.users lacks it (red: it links one)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        await db.query(
          "alter table auth.users add column if not exists deleted_at timestamptz",
        );
        const deleted = await newPerson("Deleted login", null);
        await gift(id.TA, deleted);
        await db.query(
          "update auth.users set deleted_at = now() where id = $1",
          [deleted],
        );
        await db.query(catchUp());
        expect(
          (
            await db.query(
              "select count(*)::int n from public.account_links where user_id = $1",
              [deleted],
            )
          ).rows,
        ).toEqual([{ n: 0 }]);
      }));

    it("a login with an account link cannot be deleted (23503), so the demo clean-up's delete of a linked demo login is refused and recorded, its link and Party kept (Q7 guard, passes on the base; the loop going on is tests/unit/packages/api/cleanup-demo-users)", () =>
      tx(db, async () => {
        await db.query(fixtureSql(id));
        expect(
          await failure(db, "delete from auth.users where id = $1", [id.UDC]),
        ).toBe("23503");
        expect(
          (
            await db.query(
              "select party_id from public.account_links where tenant_id = $1 and user_id = $2",
              [id.TA, id.UDC],
            )
          ).rows,
        ).toEqual([{ party_id: id.pDC }]);
      }));

    it("two first gifts of one signed-in person at once, with the fill trigger off, leave one donor and one Party: the second waits on the Party writer's lock (red: it waits on the donor key and no Party is written)", async () => {
      const tenant = randomUUID();
      const person = randomUUID();
      const first = new pg.Client({ connectionString: ADMIN_URL });
      const second = new pg.Client({ connectionString: ADMIN_URL });
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp5rest race', 'wp5rest-race-' || $1::text)",
        [tenant],
      );
      await db.query(
        "insert into auth.users (id, email) values ($1::uuid, 'wp5rest-race-' || $1::text || '@example.test')",
        [person],
      );
      try {
        await db.query(`alter table public.donors disable trigger ${FILL}`);
        await first.connect();
        await second.connect();
        const race = (c: pg.Client) =>
          c.query(
            "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 100, p_idempotency_key => $3)",
            [tenant, person, randomUUID()],
          );
        const firstPid = await backendPid(first);
        const secondPid = await backendPid(second);
        await first.query("begin");
        await second.query("begin");
        await race(first);
        const racing = race(second);
        await waitsOn(db, secondPid, firstPid);
        const waiting = await db.query(
          "select locktype from pg_catalog.pg_locks where pid = $1 and not granted",
          [secondPid],
        );
        expect(waiting.rows).toEqual([{ locktype: "advisory" }]);
        await first.query("commit");
        await racing;
        await second.query("commit");
        const donors = await db.query(
          "select d.party_id, (select count(*) from public.parties p where p.tenant_id = $1) parties, (select id from public.parties p where p.tenant_id = $1 limit 1) party from public.donors d where d.tenant_id = $1",
          [tenant],
        );
        expect(donors.rows).toHaveLength(1);
        expect(donors.rows[0].parties).toBe("1");
        expect(donors.rows[0].party_id).toBe(donors.rows[0].party);
        expect(
          (
            await db.query(
              "select count(*) n from public.donations where tenant_id = $1",
              [tenant],
            )
          ).rows,
        ).toEqual([{ n: "2" }]);
      } finally {
        await first.query("rollback").catch(() => undefined);
        await second.query("rollback").catch(() => undefined);
        await first.end().catch(() => undefined);
        await second.end().catch(() => undefined);
        await db.query(`alter table public.donors enable trigger ${FILL}`);
        for (const table of [
          "audit_logs",
          "donation_saga_outbox",
          "donations",
          "donors",
          "parties",
        ])
          await db.query(`delete from public.${table} where tenant_id = $1`, [
            tenant,
          ]);
        await db.query("delete from auth.users where id = $1", [person]);
        await db.query("delete from public.tenants where id = $1", [tenant]);
      }
    });
  },
);
