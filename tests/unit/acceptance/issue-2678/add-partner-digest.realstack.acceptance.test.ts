import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { addPartnerHarness } from "./add-partner.harness";
import { ADMIN_URL, IN_MIGRATE_JOB, migration } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest 2 item zero (c) and (f) (moved from add-partner.realstack, fix round F9 of pull request 2859): Add Partner's command log keeps only the submission's digest, the migration rewrites earlier payloads to theirs, and a hand-added partner prefers a channel it has",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());
    const { tx, partner, attempt, caller } = addPartnerHarness(db);

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
            "insert into public.donors (tenant_id, party_id, name, phone) values ($1, public.donor_party_for_insert($1, null, 'Staff made', null), 'Staff made', '+1 555 0103') returning id",
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
  },
);
