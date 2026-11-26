import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  backendPid,
  fixtureIds,
  fixtureSql,
  keepAs,
  waitsOn,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const WRAPPER =
  "public.add_partner(uuid,uuid,text,text,text,text,text,text,uuid)";
const COMMAND =
  "tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,text,uuid)";

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest (brief invariants 5 and 6, rule 13; D-16 ruling on Add Partner, items 5-9): Add Partner is a human command on the caller's token; every refusal (42501, 22023 for a payload that is not a partner, 23505 for a key used otherwise) writes no Party, donor or command-log row",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function tx<T>(fn: (id: Record<string, string>) => Promise<T>) {
      const id: Record<string, string> = fixtureIds();
      await db.query("begin");
      try {
        await db.query(fixtureSql(id as never));
        return await fn(id);
      } finally {
        await db.query("rollback");
      }
    }

    const partner = (
      tenant: string,
      key: string,
      fields: Partial<
        Record<
          "name" | "email" | "phone" | "type" | "frequency" | "location",
          string | null
        >
      > = {},
    ) => {
      const value = (v: string | null | undefined, fallback: string | null) => {
        const chosen = v === undefined ? fallback : v;
        return chosen === null ? "null" : `'${chosen.replaceAll("'", "''")}'`;
      };
      return `select public.add_partner('${tenant}', '${key}', ${value(fields.name, "Partner Pat")}, ${value(fields.email, "pat@example.test")}, ${value(fields.phone, null)}, ${value(fields.type, "Individual")}, ${value(fields.frequency, "Monthly")}, ${value(fields.location, "Kampala")}, null) r`;
    };
    const counts = async (tenant: string) =>
      (
        await db.query(
          `select (select count(*) from public.parties where tenant_id = $1)::int parties,
                  (select count(*) from public.donors where tenant_id = $1)::int donors,
                  (select count(*) from public.crm_command_logs where tenant_id = $1)::int logs,
                  (select count(*) from public.account_links where tenant_id = $1)::int links,
                  (select count(*) from authz.memberships where tenant_id = $1)::int memberships`,
          [tenant],
        )
      ).rows[0];
    const caller = (
      id: Record<string, string>,
      user: string,
      membership: string | null,
      tenant: string,
    ) => ({
      sub: user,
      headers: {
        "x-asym-tenant": id[tenant]!,
        ...(membership ? { "x-asym-assignment": id[membership]! } : {}),
      },
    });

    it("both functions: the command a tenant_guard-owned definer with an empty search path, the wrapper a postgres-owned invoker, EXECUTE for authenticated only; no owner, assignment, Party or profile argument (red: 42883)", async () => {
      const r = await db.query(
        `select p.oid::regprocedure::text fn, p.prosecdef, pg_get_userbyid(p.proowner) owner, p.proconfig, p.proargnames,
                has_function_privilege('anon', p.oid, 'EXECUTE') anon,
                has_function_privilege('service_role', p.oid, 'EXECUTE') service,
                has_function_privilege('authenticated', p.oid, 'EXECUTE') signed_in
           from pg_proc p where p.oid in ($1::regprocedure, $2::regprocedure) order by 1`,
        [WRAPPER, COMMAND],
      );
      const args = [
        "p_tenant_id",
        "p_idempotency_key",
        "p_name",
        "p_email",
        "p_phone",
        "p_type",
        "p_frequency",
        "p_location",
        "p_request_id",
      ];
      expect(r.rows).toEqual([
        {
          fn: "add_partner(uuid,uuid,text,text,text,text,text,text,uuid)",
          prosecdef: false,
          owner: "postgres",
          proconfig: ['search_path=""'],
          proargnames: args,
          anon: false,
          service: false,
          signed_in: true,
        },
        {
          fn: "tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,text,uuid)",
          prosecdef: true,
          owner: "tenant_guard",
          proconfig: ['search_path=""'],
          proargnames: args,
          anon: false,
          service: false,
          signed_in: true,
        },
      ]);
    });

    it("a missionary of A adds a partner: one new Party joined to no login, one donor in A owned by their worker row, one command-log row; nothing linked or granted (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        const before = await counts(id.TA!);
        const key = randomUUID();
        const out = await as(
          "authenticated",
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, {
            name: " Partner\u00a0 Pat ",
            phone: "\u00a0",
            location: " Kampala\u200b ",
          }),
        );
        expect(out.code, out.message).toBeNull();
        const result = out.rows[0]!.r as Record<string, unknown>;
        expect(result).toMatchObject({ duplicate: false });
        expect(await counts(id.TA!)).toEqual({
          ...before,
          parties: before.parties + 1,
          donors: before.donors + 1,
          logs: before.logs + 1,
        });
        const donor = await db.query(
          `select d.tenant_id, d.party_id, d.missionary_id, d.ministry_assignment_id, d.name, d.email, d.phone, d.type, d.frequency, d.location, d.status,
                  p.display_name, (select count(*) from public.account_links al where al.party_id = p.id)::int links
             from public.donors d join public.parties p on p.id = d.party_id where d.id = $1`,
          [result.donorId],
        );
        expect(donor.rows).toEqual([
          {
            tenant_id: id.TA,
            party_id: result.partyId,
            missionary_id: id.UM,
            ministry_assignment_id: id.mA,
            name: "Partner Pat",
            email: "pat@example.test",
            phone: null,
            type: "Individual",
            frequency: "Monthly",
            location: "Kampala",
            status: "Active",
            display_name: "Partner Pat",
            links: 0,
          },
        ]);
        const log = await db.query(
          "select actor_user_id, action, resource_type, resource_id, idempotency_key, status from public.crm_command_logs where id = $1",
          [result.commandLogId],
        );
        expect(log.rows).toEqual([
          {
            actor_user_id: id.UM,
            action: "missionary.partner.create",
            resource_type: "donor",
            resource_id: result.donorId,
            idempotency_key: key,
            status: "succeeded",
          },
        ]);
      }));

    it("the same key returns the original pair, the payload compared after the form's normalization; another payload, another caller or another command's key under it is a conflict that writes nothing (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        const key = randomUUID();
        const first = await as(
          "authenticated",
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { phone: "+1 555 0100" }),
        );
        expect(first.code, first.message).toBeNull();
        const after = await counts(id.TA!);
        const again = await as(
          "authenticated",
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, {
            name: "Partner  Pat",
            email: "PAT@example.test",
            phone: " +1 555 0100 ",
          }),
        );
        expect(again.code, again.message).toBeNull();
        expect(again.rows[0]!.r).toEqual({
          ...(first.rows[0]!.r as object),
          duplicate: true,
        });
        for (const [who, membership, fields] of [
          ["UM", "mM", { name: "Someone Else" }],
          ["UM", "mM", { frequency: "Annually" }],
          ["UM", "mM", { phone: null }],
          ["UM2", "mM2", {}],
        ] as const) {
          const conflict = await as(
            "authenticated",
            caller(id, who, membership, "TA"),
            partner(id.TA!, key, fields),
          );
          expect([who, fields, conflict.code]).toEqual([who, fields, "23505"]);
        }
        expect(await counts(id.TA!)).toEqual(after);
      }));

    it("refusals, each 42501 writing nothing in A: staff of A of every sub-role and a tenant administrator, a donor of A, a missionary of A and B naming A with their B row, a request whose tenant header differs from the argument, a missionary of B alone naming A either way (who adds in B), a revoked or inactive missionary row, a missionary of an inactive A (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        for (const [key, role, staffRole, admin] of [
          ["sFinance", "staff", "finance", false],
          ["sMobilizer", "staff", "mobilizer", false],
          ["sHr", "staff", "hr", false],
          ["sCare", "staff", "member_care", false],
          ["sAdmin", "staff", "development", true],
        ] as const) {
          id[key] = randomUUID();
          id[`u${key}`] = randomUUID();
          await db.query("insert into auth.users (id) values ($1)", [
            id[`u${key}`],
          ]);
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, $3, $4, $5, $6)",
            [id[key], id[`u${key}`], id.TA, role, staffRole, admin],
          );
        }
        const before = await counts(id.TA!);
        const refused = async (
          label: string,
          who: { sub: string; headers: Record<string, string> },
          tenant = id.TA!,
        ) => {
          const out = await as(
            "authenticated",
            who,
            partner(tenant, randomUUID()),
          );
          expect([label, out.code]).toEqual([label, "42501"]);
        };
        await refused("staff development", caller(id, "US", "mS", "TA"));
        for (const key of ["sFinance", "sMobilizer", "sHr", "sCare", "sAdmin"])
          await refused(key, caller(id, `u${key}`, key, "TA"));
        await refused("donor of A", caller(id, "UDA", "mDA", "TA"));
        await refused("missionary of B naming A", {
          sub: "UM",
          headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mMB! },
        });
        await refused(
          "tenant header differs from the argument",
          caller(id, "UM", "mMB", "TB"),
          id.TA!,
        );
        id.UOB = randomUUID();
        id.mOB = randomUUID();
        id.pOB = randomUUID();
        await db.query("insert into auth.users (id) values ($1)", [id.UOB]);
        await db.query(
          "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'missionary')",
          [id.mOB, id.UOB, id.TB],
        );
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Missionary of B alone')",
          [id.pOB, id.TB],
        );
        await db.query(
          "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1)",
          [id.TB, id.pOB, id.UOB],
        );
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
          [id.TB, id.UOB, id.pOB],
        );
        await refused("a missionary of B alone naming A", {
          sub: "UOB",
          headers: { "x-asym-tenant": id.TA!, "x-asym-assignment": id.mOB! },
        });
        await refused(
          "a missionary of B alone, B's header, A's argument",
          caller(id, "UOB", "mOB", "TB"),
          id.TA!,
        );
        const inB = await as(
          "authenticated",
          caller(id, "UOB", "mOB", "TB"),
          partner(id.TB!, randomUUID()),
        );
        expect(inB.code, inB.message).toBeNull();
        await db.query(
          "update authz.memberships set revoked_at = now() where id = $1",
          [id.mM2],
        );
        await refused("revoked missionary", caller(id, "UM2", "mM2", "TA"));
        await db.query(
          "update authz.memberships set revoked_at = null, is_active = false where id = $1",
          [id.mM2],
        );
        await refused("inactive missionary", caller(id, "UM2", "mM2", "TA"));
        await db.query(
          "update public.tenants set status = 'suspended' where id = $1",
          [id.TA],
        );
        await refused(
          "missionary of an inactive A",
          caller(id, "UM", "mM", "TA"),
        );
        await db.query(
          "update public.tenants set status = 'active' where id = $1",
          [id.TA],
        );
        expect(await counts(id.TA!)).toEqual(before);
      }));

    it("a person with a live missionary and a live donor row in A: refused with no assignment named and with the donor row named; added with the missionary row named (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        id.mUMDonor = randomUUID();
        await db.query(
          "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'donor')",
          [id.mUMDonor, id.UM, id.TA],
        );
        const before = await counts(id.TA!);
        for (const [label, membership] of [
          ["no assignment named", null],
          ["the donor row named", "mUMDonor"],
        ] as const) {
          const out = await as(
            "authenticated",
            caller(id, "UM", membership, "TA"),
            partner(id.TA!, randomUUID()),
          );
          expect([label, out.code]).toEqual([label, "42501"]);
        }
        expect(await counts(id.TA!)).toEqual(before);
        const named = await as(
          "authenticated",
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, randomUUID()),
        );
        expect(named.code, named.message).toBeNull();
      }));

    it("the worker row comes only through the caller's account link and its Party: no link, a link to a Party with no worker row, or a worker row with no login is refused (42501) and writes nothing; two worker rows on one Party cannot exist (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        const before = await counts(id.TA!);
        const refusedFor = async (label: string) => {
          const out = await as(
            "authenticated",
            caller(id, "UM2", "mM2", "TA"),
            partner(id.TA!, randomUUID()),
          );
          expect([label, out.code]).toEqual([label, "42501"]);
        };
        await db.query(
          "delete from public.account_links where tenant_id = $1 and user_id = $2",
          [id.TA, id.UM2],
        );
        await refusedFor("no link");
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
          [id.TA, id.UM2, id.pD2],
        );
        await refusedFor("a link to a Party with no worker row");
        await db.query(
          "update public.account_links set party_id = $3 where tenant_id = $1 and user_id = $2",
          [id.TA, id.UM2, id.pM2],
        );
        await db.query(
          "update public.missionaries set profile_id = null where id = $1",
          [id.m2],
        );
        await refusedFor("a worker row with no login");
        expect(await counts(id.TA!)).toEqual(before);
        const unique = await db.query(
          "select pg_get_constraintdef(oid) def from pg_constraint where conname = 'missionaries_tenant_party_key'",
        );
        expect(unique.rows).toEqual([{ def: "UNIQUE (tenant_id, party_id)" }]);
      }));

    it("a payload that is not a partner is 22023 and writes nothing: a name, location or email of only no-break spaces, an email that is not one address, an unknown type or frequency (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        const before = await counts(id.TA!);
        for (const fields of [
          { name: "\u00a0\u00a0" },
          { name: "P" },
          { location: "\u3000" },
          { email: "\u00a0" },
          { email: "not an address" },
          { email: "a@b@example.test" },
          { type: "Household" },
          { frequency: "Weekly" },
        ]) {
          const out = await as(
            "authenticated",
            caller(id, "UM", "mM", "TA"),
            partner(id.TA!, randomUUID(), fields),
          );
          expect([fields, out.code]).toEqual([fields, "22023"]);
        }
        expect(await counts(id.TA!)).toEqual(before);
      }));

    it("two sessions with one key at once leave one Party, one donor and one log row, and both answer the original pair", async () => {
      const id: Record<string, string> = fixtureIds();
      const key = randomUUID();
      const first = new pg.Client({ connectionString: ADMIN_URL });
      const second = new pg.Client({ connectionString: ADMIN_URL });
      await db.query(fixtureSql(id as never));
      try {
        await first.connect();
        await second.connect();
        const start = async (client: pg.Client) => {
          await client.query("begin");
          await client.query("set local role authenticated");
          await client.query(
            "select set_config('request.jwt.claims', $1, true), set_config('request.headers', $2, true)",
            [
              JSON.stringify({ sub: id.UM, role: "authenticated" }),
              JSON.stringify({
                "x-asym-tenant": id.TA,
                "x-asym-assignment": id.mM,
              }),
            ],
          );
        };
        const firstPid = await backendPid(first);
        const secondPid = await backendPid(second);
        await start(first);
        await start(second);
        const one = await first.query(partner(id.TA!, key));
        const racing = second.query(partner(id.TA!, key));
        await waitsOn(db, secondPid, firstPid);
        await first.query("commit");
        const two = await racing;
        await second.query("commit");
        expect(two.rows[0].r).toEqual({ ...one.rows[0].r, duplicate: true });
        const written = await db.query(
          `select (select count(*) from public.donors where tenant_id = $1 and missionary_id = $2)::int donors,
                  (select count(*) from public.crm_command_logs where tenant_id = $1 and idempotency_key = $3)::int logs,
                  (select count(*) from public.parties p where p.tenant_id = $1 and p.display_name = 'Partner Pat')::int parties`,
          [id.TA, id.UM, key],
        );
        expect(written.rows).toEqual([{ donors: 1, logs: 1, parties: 1 }]);
      } finally {
        await first.query("rollback").catch(() => undefined);
        await second.query("rollback").catch(() => undefined);
        await first.end().catch(() => undefined);
        await second.end().catch(() => undefined);
        for (const sql of [
          "delete from public.crm_command_logs where tenant_id = any($1::uuid[])",
          "delete from public.donor_feed_preferences where tenant_id = any($1::uuid[])",
          "delete from public.follows where tenant_id = any($1::uuid[])",
          "delete from public.donor_activities where tenant_id = any($1::uuid[])",
          "delete from public.donor_pledges where tenant_id = any($1::uuid[])",
          "delete from public.donations where tenant_id = any($1::uuid[])",
          "delete from public.giving_target_entity_locks where tenant_id = any($1::uuid[])",
          "delete from public.account_links where tenant_id = any($1::uuid[])",
          "delete from public.donors where tenant_id = any($1::uuid[])",
          "delete from public.missionaries where tenant_id = any($1::uuid[])",
          "delete from public.parties where tenant_id = any($1::uuid[])",
          "delete from public.legal_entities where tenant_id = any($1::uuid[])",
          "delete from authz.memberships where tenant_id = any($1::uuid[])",
          "delete from public.tenants where id = any($1::uuid[])",
        ])
          await db.query(sql, [[id.TA, id.TB]]);
        await db.query("delete from auth.users where id = any($1::uuid[])", [
          ["UDA", "UDC", "UD2", "UM", "UM2", "US", "UBS"].map((k) => id[k]),
        ]);
      }
    });
  },
);
