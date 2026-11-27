import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readdirSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { checkSql, downSql } from "./assignment-keys.helpers";
import { ADMIN_URL, IN_MIGRATE_JOB, MIG, migration } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const FIRST = "20261127060000";
const FUNCTIONS = [
  "public.begin_donation_saga(uuid,uuid,uuid,bigint,text,uuid,uuid,text,text,text,jsonb)",
  "public.atomic_create_donation_with_audit(uuid,uuid,uuid,uuid,bigint,text,uuid,text,text,jsonb,text,text)",
  "tenant_guard.redeem_account_claim(uuid,text)",
  "private.login_party(uuid,uuid)",
  "private.record_claim_merge_candidate(uuid,uuid,uuid)",
  "tenant_guard.add_partner(uuid,uuid,text,text,text,text,text,uuid)",
  "private.derive_ministry_assignment_id()",
  "private.rederive_ministry_assignment_children()",
  "private.repair_ministry_assignment_ids()",
  "public.missionary_task_write(uuid,uuid,uuid,text,uuid,jsonb)",
  "tenant_guard.confirm_worker_security_level(uuid,uuid,text,text,text)",
  "public.confirm_worker_security_level(uuid,uuid,text,text,text)",
  "private.insert_worker(uuid,text,uuid)",
  "tenant_guard.create_worker(uuid,text,text,text,text,text,text,uuid,text)",
  "public.create_worker(uuid,text,text,text,text,text,text,uuid,text)",
];

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest 2a, fix round F6 of pull request 2859, and WP5 rest 2b (D-18: part B's files join the cycle): on a scratch database built to just before 20261127060000, each file's committed check is valid and false before the file, true after it; its Down restores every function, comment and grant the file changed, changes only the rows the file changed, and leaves the check false; and the file applies again",
  () => {
    const name = `acc2678rest2_${randomUUID().replaceAll("-", "")}`;
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    let db: pg.Client;
    let url = "";
    let created = false;
    const psql = (target: string) =>
      spawnSync(
        "psql",
        [
          url,
          "-X",
          "-q",
          "-v",
          "ON_ERROR_STOP=1",
          ...(target.endsWith("/20260214090000_foundation_1_schema.sql")
            ? ["--single-transaction"]
            : []),
          "-f",
          target,
        ],
        { encoding: "utf8", timeout: 120_000 },
      );
    const applied = new Set<string>();
    const apply = (file: string) => {
      const run = psql(file);
      expect(run.status, run.stderr).toBe(0);
      applied.add(file);
    };
    const catchUp = (version: string) => {
      for (const f of readdirSync(MIG)
        .filter(
          (f) =>
            /^\d{14}_.+\.sql$/.test(f) &&
            f.slice(0, 14) >= FIRST &&
            f.slice(0, 14) < version,
        )
        .sort())
        if (!applied.has(`${MIG}/${f}`)) apply(`${MIG}/${f}`);
    };
    const committed = async (file: string) =>
      Object.values(
        (await db.query(checkSql(file))).rows[0] as Record<string, unknown>,
      )[0];
    const snapshot = async () => ({
      functions: (
        await db.query(
          `select f, pg_get_functiondef(p.oid) as def, p.proacl::text as acl,
                  obj_description(p.oid, 'pg_proc') as comment, p.proowner::regrole::text as owner
             from unnest($1::text[]) as f
             left join pg_proc p on p.oid = to_regprocedure(f)
            order by f`,
          [FUNCTIONS],
        )
      ).rows,
      columns: (
        await db.query(
          "select attname, attacl::text from pg_attribute where attrelid = 'public.donors'::regclass and attacl is not null order by attname",
        )
      ).rows,
      schema: (
        await db.query(
          "select nspacl::text from pg_namespace where nspname = 'tenant_guard'",
        )
      ).rows,
    });
    const upAndDown = async (
      suffix: string,
      data: {
        afterUp?: () => Promise<void>;
        afterDown?: () => Promise<void>;
      } = {},
    ) => {
      const file = migration(suffix);
      catchUp(file.slice(MIG.length + 1, MIG.length + 15));
      const before = await snapshot();
      expect(await committed(file), "before the file").toBe(false);
      apply(file);
      expect(await committed(file), "after the file").toBe(true);
      await data.afterUp?.();
      await db.query(downSql(file));
      expect(await snapshot(), "after the Down").toEqual(before);
      expect(await committed(file), "after the Down").toBe(false);
      await data.afterDown?.();
      apply(file);
      expect(await committed(file), "applied again").toBe(true);
    };

    beforeAll(async () => {
      const target = new URL(ADMIN_URL);
      target.pathname = `/${name}`;
      url = target.toString();
      await admin.connect();
      await admin.query(`create database ${name} template template0`);
      created = true;
      for (const step of [
        "scripts/sql/supabase-compat-bootstrap.sql",
        ...readdirSync(MIG)
          .filter((f) => /^\d{14}_.+\.sql$/.test(f) && f.slice(0, 14) < FIRST)
          .sort()
          .map((f) => `${MIG}/${f}`),
      ]) {
        const run = psql(step);
        expect(run.status, `replay stopped at ${step}: ${run.stderr}`).toBe(0);
      }
      db = new pg.Client({ connectionString: url });
      await db.connect();
    }, 900_000);

    afterAll(async () => {
      try {
        await db?.end();
      } finally {
        try {
          if (created) await admin.query(`drop database ${name} with (force)`);
        } finally {
          await admin.end();
        }
      }
    });

    it("20261127060000 (the Party lock): the check, the file, the Down (the saga, the atomic writer and the claim with its comment restored, the two helpers dropped) and the file again", async () => {
      await upAndDown("_wp5_rest2_party_lock");
    }, 300_000);

    it("20261127060100 (Add Partner's digest): the check, the file, the Down (the command and its comment restored, the column grant revoked) and the file again; the file corrects only add_partner's donors with no e-mail by private.normalize_safety_text and the old default, records each in the audit log, and its Down sets back only those still holding the corrected value: a preference of text, a phone that was there before, and one a missionary changed since stay", async () => {
      const tenant = randomUUID();
      const party = randomUUID();
      const ids = Object.fromEntries(
        [
          "corrected",
          "blankEmail",
          "text",
          "phoneBefore",
          "nbspEmail",
          "hasEmail",
          "notAdded",
        ].map((key) => [key, randomUUID()]),
      ) as Record<string, string>;
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678 rest2', 'acc2678-rest2-' || $1::text)",
        [tenant],
      );
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Hand added')",
        [party, tenant],
      );
      const rows: [string, string | null, string | null, string][] = [
        [ids.corrected!, null, "+256 700 000 001", "email"],
        [ids.blankEmail!, "", null, "email"],
        [ids.text!, null, null, "text"],
        [ids.phoneBefore!, null, "+256 700 000 002", "phone"],
        [ids.nbspEmail!, " ", "+256 700 000 003", "email"],
        [ids.hasEmail!, "kept@example.test", null, "email"],
        [ids.notAdded!, null, null, "email"],
      ];
      for (const [id, email, phone, preferred] of rows) {
        await db.query(
          "insert into public.donors (id, tenant_id, party_id, name, email, phone, preferred_contact) values ($1, $2, $3, 'Hand added', $4, $5, $6)",
          [id, tenant, party, email, phone, preferred],
        );
        if (id !== ids.notAdded)
          await db.query(
            "insert into public.crm_command_logs (tenant_id, actor_user_id, action, resource_type, resource_id, status, command_payload) values ($1, $2, 'missionary.partner.create', 'donor', $3, 'succeeded', '{\"name\":\"Hand added\"}')",
            [tenant, randomUUID(), id],
          );
      }
      const preferences = async () =>
        Object.fromEntries(
          (
            await db.query(
              "select id, preferred_contact from public.donors where tenant_id = $1",
              [tenant],
            )
          ).rows.map((r) => [
            Object.keys(ids).find((key) => ids[key] === r.id),
            r.preferred_contact,
          ]),
        );
      const audited = async () =>
        (
          await db.query(
            "select resource_id from public.audit_logs where tenant_id = $1 and action = 'donor_preferred_contact_corrected' order by resource_id",
            [tenant],
          )
        ).rows.map((r) => r.resource_id as string);

      await upAndDown("_wp5_rest2_add_partner_digest", {
        afterUp: async () => {
          expect(await preferences(), "after the file").toEqual({
            corrected: "phone",
            blankEmail: null,
            text: "text",
            phoneBefore: "phone",
            nbspEmail: "phone",
            hasEmail: "email",
            notAdded: "email",
          });
          expect(await audited()).toEqual(
            [ids.corrected!, ids.blankEmail!, ids.nbspEmail!].sort(),
          );
          await db.query(
            "update public.donors set preferred_contact = 'text' where id = $1",
            [ids.blankEmail],
          );
        },
        afterDown: async () => {
          expect(await preferences(), "after the Down").toEqual({
            corrected: "email",
            blankEmail: "text",
            text: "text",
            phoneBefore: "phone",
            nbspEmail: "email",
            hasEmail: "email",
            notAdded: "email",
          });
        },
      });
    }, 300_000);

    it("20261127060200 (the assignment-key race): the check, the file, the Down (the four functions and three comments restored) and the file again", async () => {
      await upAndDown("_wp5_rest2_assignment_key_race");
    }, 300_000);

    it("20261127090000 (part B, the stale confirm's entry): the check, the file, the Down (the command and its wrapper dropped) and the file again", async () => {
      await upAndDown("_wp5_rest2b_confirm_level");
    }, 300_000);

    it("20261127090100 (part B, create_worker): the check, the file, the Down (the command, its wrapper and private.insert_worker dropped, tenant_guard's grant on its schema as before) and the file again", async () => {
      await upAndDown("_wp5_rest2b_create_worker");
    }, 300_000);

    it("20261127090200 (part B, issue 2835's items of 28 November): the check, the file, the Down (the claim's text and comment, and the two key triggers' comments, restored) and the file again", async () => {
      await upAndDown("_wp5_rest2b_claim_and_key_order");
    }, 300_000);
  },
);
