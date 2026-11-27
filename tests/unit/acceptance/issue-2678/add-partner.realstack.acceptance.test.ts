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
  keepAs,
  migration,
  waitsOn,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const WRAPPER = "public.add_partner(uuid,uuid,text,text,text,text,text,uuid)";
const COMMAND =
  "tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,uuid)";
const WITH_EMAIL = [
  "public.add_partner(uuid,uuid,text,text,text,text,text,text,uuid)",
  "tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,text,uuid)",
];
const NAMED = '{"defaultAnonymousToRecipient": false}';

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
          "name" | "phone" | "type" | "frequency" | "location",
          string | null
        >
      > = {},
    ) => {
      const value = (v: string | null | undefined, fallback: string | null) => {
        const chosen = v === undefined ? fallback : v;
        return chosen === null ? "null" : `'${chosen.replaceAll("'", "''")}'`;
      };
      return `select public.add_partner('${tenant}', '${key}', ${value(fields.name, "Partner Pat")}, ${value(fields.phone, null)}, ${value(fields.type, "Individual")}, ${value(fields.frequency, "Monthly")}, ${value(fields.location, "Kampala")}, null) r`;
    };
    async function attempt(
      id: Record<string, string>,
      who: { sub: string; headers: Record<string, string> },
      sql: string,
    ) {
      await db.query("savepoint attempt");
      try {
        await db.query("set local role authenticated");
        await db.query(
          "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
          [
            JSON.stringify({ sub: id[who.sub], role: "authenticated" }),
            JSON.stringify(who.headers),
          ],
        );
        const r = await db.query(sql);
        await db.query("reset role");
        await db.query(
          "select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true), set_config('app.current_tenant_id', '', true)",
        );
        await db.query("release savepoint attempt");
        return {
          code: null,
          hint: null,
          r: r.rows[0]?.r as Record<string, unknown>,
        };
      } catch (e) {
        await db.query("rollback to savepoint attempt");
        const err = e as { code?: string; hint?: string };
        return { code: err.code ?? "?", hint: err.hint ?? null, r: null };
      }
    }
    const donorRows = async (ids: string[]) =>
      (
        await db.query(
          "select to_jsonb(d) - 'updated_at' row from public.donors d where d.id = any($1::uuid[]) order by d.id",
          [ids],
        )
      ).rows;
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

    it("both functions: the command a tenant_guard-owned definer with an empty search path, the wrapper a postgres-owned invoker, EXECUTE for authenticated only; no owner, assignment, Party, profile or e-mail argument, the signature with an e-mail gone, and the guard holds no e-mail column of donors (fix round F1 rule 1; red: the nine-argument signature)", async () => {
      expect(
        (
          await db.query(
            "select to_regprocedure($1) is null wrapper, to_regprocedure($2) is null command",
            WITH_EMAIL,
          )
        ).rows,
      ).toEqual([{ wrapper: true, command: true }]);
      expect(
        (
          await db.query(
            `select has_column_privilege('tenant_guard', 'public.donors', 'email', 'INSERT') email_insert,
                    has_column_privilege('tenant_guard', 'public.donors', 'email', 'SELECT') email_select`,
          )
        ).rows,
      ).toEqual([{ email_insert: false, email_select: false }]);
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
        "p_phone",
        "p_type",
        "p_frequency",
        "p_location",
        "p_request_id",
      ];
      expect(r.rows).toEqual([
        {
          fn: "add_partner(uuid,uuid,text,text,text,text,text,uuid)",
          prosecdef: false,
          owner: "postgres",
          proconfig: ['search_path=""'],
          proargnames: args,
          anon: false,
          service: false,
          signed_in: true,
        },
        {
          fn: "tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,uuid)",
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

    it("a missionary of A adds a partner: one new Party joined to no login, one donor in A owned by their worker row with no e-mail and named to its missionary by exactly one preference key, one command-log row; nothing linked or granted (fix round F1, F7 item 2; red: an e-mail argument, no preference)", () =>
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
                  d.giving_preferences::text preferences,
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
            email: null,
            preferences: NAMED,
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

    it("a key conflict says so to the route: other details, another caller or another command's key under it raise 23505 with the hint add_partner_key, and write nothing (fix round F1 rule 5; red: no hint)", () =>
      tx(async (id) => {
        const key = randomUUID();
        expect(
          (
            await attempt(
              id,
              caller(id, "UM", "mM", "TA"),
              partner(id.TA!, key),
            )
          ).code,
        ).toBeNull();
        const noteKey = randomUUID();
        await db.query(
          "insert into public.crm_command_logs (tenant_id, actor_user_id, action, resource_type, idempotency_key, status) values ($1, $2, 'crm.note.create', 'note', $3, 'succeeded')",
          [id.TA, id.UM, noteKey],
        );
        const before = await counts(id.TA!);
        for (const [label, who, membership, sql] of [
          [
            "other details",
            "UM",
            "mM",
            partner(id.TA!, key, { name: "Someone Else" }),
          ],
          ["another caller", "UM2", "mM2", partner(id.TA!, key)],
          ["another command's key", "UM", "mM", partner(id.TA!, noteKey)],
        ] as const) {
          const out = await attempt(id, caller(id, who, membership, "TA"), sql);
          expect([label, out.code, out.hint]).toEqual([
            label,
            "23505",
            "add_partner_key",
          ]);
        }
        expect(await counts(id.TA!)).toEqual(before);
      }));

    it("a person the organization already knows is created like anyone else: a name and phone equal to another missionary's partner, an anonymous donor and a general-fund donor give a new Party, a donor with no e-mail and one log row, the answer of a fresh person, and the existing donors untouched (fix round F1 rule 3; red: an e-mail argument)", () =>
      tx(async (id) => {
        const existing: string[] = [];
        for (const [email, missionary, preferences] of [
          ["pat@example.test", id.UM2, "{}"],
          [
            "pat.anon@example.test",
            null,
            '{"defaultAnonymousToRecipient": true}',
          ],
          ["pat.fund@example.test", null, "{}"],
        ] as const)
          existing.push(
            (
              await db.query(
                "insert into public.donors (tenant_id, name, phone, email, missionary_id, giving_preferences) values ($1, 'Partner Pat', '+1 555 0100', $2, $3, $4::jsonb) returning id",
                [id.TA, email, missionary, preferences],
              )
            ).rows[0].id,
          );
        const untouched = await donorRows(existing);
        const fresh = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, randomUUID(), {
            name: "Fresh Person",
            phone: "+1 555 0199",
          }),
        );
        expect(fresh.code).toBeNull();
        const before = await counts(id.TA!);
        const known = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, randomUUID(), { phone: "+1 555 0100" }),
        );
        expect(known.code).toBeNull();
        expect(Object.keys(known.r!).sort()).toEqual(
          Object.keys(fresh.r!).sort(),
        );
        expect(known.r).toMatchObject({ duplicate: false });
        expect(await counts(id.TA!)).toEqual({
          ...before,
          parties: before.parties + 1,
          donors: before.donors + 1,
          logs: before.logs + 1,
        });
        expect(
          (
            await db.query(
              "select email, party_id <> all($2::uuid[]) new_party from public.donors where id = $1",
              [
                known.r!.donorId,
                (
                  await db.query(
                    "select array_agg(party_id) p from public.donors where id = any($1::uuid[])",
                    [existing],
                  )
                ).rows[0].p,
              ],
            )
          ).rows,
        ).toEqual([{ email: null, new_party: true }]);
        expect(await donorRows(existing)).toEqual(untouched);
      }));

    it("the stored submission decides a replay, never the donor as it is now: after an edit of the partner the same details answer the stored pair, details equal to the edited row are a key conflict, and after the preference changed a replay answers duplicate and leaves it as it is (fix round F8, F9, F7 item 3; red: the edited row refuses the true retry)", () =>
      tx(async (id) => {
        const key = randomUUID();
        const first = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { phone: "+1 555 0100" }),
        );
        expect(first.code).toBeNull();
        await db.query(
          "update public.donors set name = 'Edited Pat', location = 'Entebbe' where id = $1",
          [first.r!.donorId],
        );
        const after = await counts(id.TA!);
        const retry = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { phone: "+1 555 0100" }),
        );
        expect(retry.code).toBeNull();
        expect(retry.r).toEqual({ ...first.r, duplicate: true });
        const asEdited = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, {
            name: "Edited Pat",
            location: "Entebbe",
            phone: "+1 555 0100",
          }),
        );
        expect([asEdited.code, asEdited.hint]).toEqual([
          "23505",
          "add_partner_key",
        ]);
        await db.query(
          "update public.donors set giving_preferences = '{\"defaultAnonymousToRecipient\": true}' where id = $1",
          [first.r!.donorId],
        );
        const afterChoice = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { phone: "+1 555 0100" }),
        );
        expect(afterChoice.r).toEqual({ ...first.r, duplicate: true });
        expect(
          (
            await db.query(
              "select giving_preferences::text p from public.donors where id = $1",
              [first.r!.donorId],
            )
          ).rows,
        ).toEqual([{ p: '{"defaultAnonymousToRecipient": true}' }]);
        expect(await counts(id.TA!)).toEqual(after);
      }));

    it("WP5 rest 2 item zero (c): the command log keeps nothing a person typed: a new partner's command_payload is exactly the SHA-256 of the canonical payload, with no name, phone or location anywhere in the row; a true retry still answers the stored pair and other details are still a key conflict (red: the payload holds the name, phone and location)", () =>
      tx(async (id) => {
        const key = randomUUID();
        const first = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { name: "Partner Pat", phone: "+1 555 0100" }),
        );
        expect(first.code).toBeNull();
        const row = (
          await db.query(
            `select command_payload, to_jsonb(l)::text whole,
                    command_payload = jsonb_build_object('sha256', encode(sha256(convert_to(
                      jsonb_build_object('name', 'Partner Pat', 'phone', '+1 555 0100', 'type', 'Individual', 'frequency', 'Monthly', 'location', 'Kampala')::text,
                      'UTF8')), 'hex')) digest_of_canonical
               from public.crm_command_logs l where l.id = $1`,
            [first.r!.commandLogId],
          )
        ).rows[0];
        expect(Object.keys(row.command_payload)).toEqual(["sha256"]);
        expect(row.digest_of_canonical).toBe(true);
        for (const typed of ["Partner Pat", "555 0100", "Kampala"])
          expect(row.whole).not.toContain(typed);
        const retry = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, {
            name: " Partner  Pat ",
            phone: " +1 555 0100 ",
          }),
        );
        expect(retry.r).toEqual({ ...first.r, duplicate: true });
        const other = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { name: "Someone Else", phone: "+1 555 0100" }),
        );
        expect([other.code, other.hint]).toEqual(["23505", "add_partner_key"]);
      }));

    it("WP5 rest 2 item zero (c): the migration rewrites every stored missionary.partner.create payload to its digest, counted on planted rows before and after; another command's payload is left alone; a retry of a submission stored before the migration still answers its pair (red: the migration has no rewrite)", () =>
      tx(async (id) => {
        const text = readFileSync(
          migration("_wp5_rest2_add_partner_digest"),
          "utf8",
        );
        const start = text.indexOf("-- payload digests: begin\n");
        const end = text.indexOf("-- payload digests: end\n");
        expect(start >= 0 && end > start).toBe(true);
        const key = randomUUID();
        const first = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { phone: "+1 555 0100" }),
        );
        expect(first.code).toBeNull();
        await db.query(
          `update public.crm_command_logs set command_payload = jsonb_build_object('name', 'Partner Pat', 'phone', '+1 555 0100', 'type', 'Individual', 'frequency', 'Monthly', 'location', 'Kampala') where id = $1`,
          [first.r!.commandLogId],
        );
        await db.query(
          `insert into public.crm_command_logs (tenant_id, actor_user_id, action, resource_type, idempotency_key, status, command_payload) values
             ($1, $2, 'missionary.partner.create', 'donor', $4, 'succeeded', '{"name": "Planted One", "phone": "+1 555 0111", "type": "Individual", "frequency": "Monthly", "location": "Gulu"}'),
             ($3, $2, 'missionary.partner.create', 'donor', $5, 'succeeded', '{"name": "Planted Two", "phone": null, "type": "Church", "frequency": "Annually", "location": "Jinja"}'),
             ($1, $2, 'crm.note.create', 'note', $6, 'succeeded', '{}')`,
          [id.TA, id.UM, id.TB, randomUUID(), randomUUID(), randomUUID()],
        );
        const exposed = async () =>
          (
            await db.query(
              "select count(*)::int n from public.crm_command_logs where tenant_id = any($1::uuid[]) and action = 'missionary.partner.create' and command_payload - 'sha256' <> '{}'::jsonb",
              [[id.TA, id.TB]],
            )
          ).rows[0].n as number;
        const typedAnywhere = async () =>
          (
            await db.query(
              "select count(*)::int n from public.crm_command_logs where tenant_id = any($1::uuid[]) and command_payload::text ~ 'Planted|Kampala|Gulu|Jinja|555 01'",
              [[id.TA, id.TB]],
            )
          ).rows[0].n as number;
        expect(await exposed()).toBe(3);
        expect(await typedAnywhere()).toBe(3);
        await db.query(text.slice(start, end));
        expect(await exposed()).toBe(0);
        expect(await typedAnywhere()).toBe(0);
        expect(
          (
            await db.query(
              "select command_payload from public.crm_command_logs where tenant_id = $1 and action = 'crm.note.create'",
              [id.TA],
            )
          ).rows,
        ).toEqual([{ command_payload: {} }]);
        const retry = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, key, { phone: "+1 555 0100" }),
        );
        expect(retry.r).toEqual({ ...first.r, duplicate: true });
      }));

    it("WP5 rest 2 item zero (f): a partner added with a phone and no e-mail prefers the phone, one with neither prefers no channel (red: both prefer e-mail)", () =>
      tx(async (id) => {
        const withPhone = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, randomUUID(), { phone: "+1 555 0100" }),
        );
        const without = await attempt(
          id,
          caller(id, "UM", "mM", "TA"),
          partner(id.TA!, randomUUID(), { name: "No Phone", phone: " " }),
        );
        expect(
          (
            await db.query(
              "select id, email, phone, preferred_contact from public.donors where id = any($1::uuid[]) order by phone nulls last",
              [[withPhone.r!.donorId, without.r!.donorId]],
            )
          ).rows,
        ).toEqual([
          {
            id: withPhone.r!.donorId,
            email: null,
            phone: "+1 555 0100",
            preferred_contact: "phone",
          },
          {
            id: without.r!.donorId,
            email: null,
            phone: null,
            preferred_contact: null,
          },
        ]);
      }));

    it("WP5 rest 2 item zero (f): the migration corrects only rows add_partner made (a missionary.partner.create log row names the donor) that have no e-mail and the default preference: phone where a phone exists, else none; it says how many it changed; a donor another writer made, or one with an e-mail, is left as it is (red: the migration has no correction)", () =>
      tx(async (id) => {
        const text = readFileSync(
          migration("_wp5_rest2_add_partner_digest"),
          "utf8",
        );
        const start = text.indexOf("-- preferred contact: begin\n");
        const end = text.indexOf("-- preferred contact: end\n");
        expect(start >= 0 && end > start).toBe(true);
        const added = [];
        for (const phone of ["+1 555 0100", null, "+1 555 0102"])
          added.push(
            (
              await attempt(
                id,
                caller(id, "UM", "mM", "TA"),
                partner(id.TA!, randomUUID(), {
                  name: `Added ${phone ?? "none"}`,
                  phone,
                }),
              )
            ).r!.donorId as string,
          );
        await db.query(
          "update public.donors set preferred_contact = 'email' where id = any($1::uuid[])",
          [added],
        );
        await db.query(
          "update public.donors set email = 'given@example.test' where id = $1",
          [added[2]],
        );
        const other = (
          await db.query(
            "insert into public.donors (tenant_id, name, phone) values ($1, 'Staff made', '+1 555 0103') returning id",
            [id.TA],
          )
        ).rows[0].id as string;
        const notices: string[] = [];
        const listen = (m: { message?: string }) =>
          notices.push(m.message ?? "");
        db.on("notice", listen);
        try {
          await db.query(text.slice(start, end));
        } finally {
          db.off("notice", listen);
        }
        expect(
          (
            await db.query(
              "select id, preferred_contact from public.donors where id = any($1::uuid[])",
              [[...added, other]],
            )
          ).rows.sort((a, b) => a.id.localeCompare(b.id)),
        ).toEqual(
          [
            { id: added[0], preferred_contact: "phone" },
            { id: added[1], preferred_contact: null },
            { id: added[2], preferred_contact: "email" },
            { id: other, preferred_contact: "email" },
          ].sort((a, b) => a.id!.localeCompare(b.id!)),
        );
        const said = notices
          .map((m) => /preferred contact was corrected: (\d+)/.exec(m)?.[1])
          .filter(Boolean);
        expect(said).toHaveLength(1);
        expect(Number(said[0])).toBeGreaterThanOrEqual(2);
      }));

    it("the guard may insert the donor's giving_preferences and may not read it (fix round F7 item 7; red: no grant)", async () => {
      expect(
        (
          await db.query(
            `select has_column_privilege('tenant_guard', 'public.donors', 'giving_preferences', 'INSERT') can_insert,
                    has_column_privilege('tenant_guard', 'public.donors', 'giving_preferences', 'SELECT') can_read`,
          )
        ).rows,
      ).toEqual([{ can_insert: true, can_read: false }]);
    });

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

    it("a payload that is not a partner is 22023 and writes nothing: a name or location of only no-break spaces, a one-letter name, a phone over 50, an unknown type or frequency (red: 42883)", () =>
      tx(async (id) => {
        const as = keepAs(db, id);
        const before = await counts(id.TA!);
        for (const fields of [
          { name: "\u00a0\u00a0" },
          { name: "P" },
          { location: "\u3000" },
          { phone: "5".repeat(51) },
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

    it("a revocation or a suspension committed while the command waits on its key refuses it (42501) and nothing is written: what the preamble checked is held to commit (fix round F4; red: the partner is written)", async () => {
      const id: Record<string, string> = fixtureIds();
      const holder = new pg.Client({ connectionString: ADMIN_URL });
      const callerClient = new pg.Client({ connectionString: ADMIN_URL });
      await db.query(fixtureSql(id as never));
      try {
        await holder.connect();
        await callerClient.connect();
        const holderPid = await backendPid(holder);
        const callerPid = await backendPid(callerClient);
        for (const [label, change, undo] of [
          [
            "revoked",
            "update authz.memberships set revoked_at = now() where id = $1",
            "update authz.memberships set is_active = true where id = $1",
          ],
          [
            "suspended",
            "update public.tenants set status = 'suspended' where id = (select tenant_id from authz.memberships where id = $1)",
            "update public.tenants set status = 'active' where id = (select tenant_id from authz.memberships where id = $1)",
          ],
        ] as const) {
          const key = randomUUID();
          await holder.query("begin");
          await holder.query(
            "select pg_advisory_xact_lock(hashtext('add_partner'), hashtext($1::text || ':' || $2::text))",
            [id.TA, key],
          );
          await callerClient.query("begin");
          await callerClient.query("set local role authenticated");
          await callerClient.query(
            "select set_config('request.jwt.claims', $1, true), set_config('request.headers', $2, true)",
            [
              JSON.stringify({ sub: id.UM, role: "authenticated" }),
              JSON.stringify({
                "x-asym-tenant": id.TA,
                "x-asym-assignment": id.mM,
              }),
            ],
          );
          const waiting = callerClient.query(partner(id.TA!, key)).then(
            () => null,
            (e: { code?: string }) => e.code ?? "?",
          );
          await waitsOn(db, callerPid, holderPid);
          await db.query("set lock_timeout = '10s'");
          await db.query(change, [id.mM]);
          await db.query("reset lock_timeout");
          await holder.query("commit");
          const code = await waiting;
          await callerClient.query("rollback");
          expect([label, code]).toEqual([label, "42501"]);
          expect(
            (
              await db.query(
                "select count(*)::int n from public.crm_command_logs where tenant_id = $1 and idempotency_key = $2",
                [id.TA, key],
              )
            ).rows,
          ).toEqual([{ n: 0 }]);
          await db.query(undo, [id.mM]);
        }
        expect(
          (
            await db.query(
              "select count(*)::int n from public.donors where tenant_id = $1 and missionary_id = $2",
              [id.TA, id.UM],
            )
          ).rows,
        ).toEqual([{ n: 0 }]);
      } finally {
        await holder.query("rollback").catch(() => undefined);
        await callerClient.query("rollback").catch(() => undefined);
        await holder.end().catch(() => undefined);
        await callerClient.end().catch(() => undefined);
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
