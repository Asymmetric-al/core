import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { COMMITTED, downSql, SUFFIX } from "./assignment-keys.helpers";
import { ADMIN_URL, IN_MIGRATE_JOB, MIG, migration } from "./harness";
import {
  captureFingerprint,
  diffFingerprints,
} from "../../../../scripts/release/schema-fingerprint.mjs";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r3, the migration on a scratch database: twice, the committed check and the Down",
  () => {
    const name = `acc2678r3_${randomUUID().replaceAll("-", "")}`;
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    let db: pg.Client;
    let url = "";
    let created = false;
    let file = "";
    const psql = (target: string) =>
      spawnSync(
        process.env.PSQL_BIN?.trim() || "psql",
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
    const definitions = async () =>
      (
        await db.query(
          `select p.oid::regprocedure::text as fn, pg_get_functiondef(p.oid) as def, p.proacl::text as acl,
                  obj_description(p.oid, 'pg_proc') as comment, p.proowner::regrole::text as owner
             from pg_proc p where p.oid = any(array['public.missionary_owned_tasks(uuid,uuid,uuid)',
               'public.missionary_task_write(uuid,uuid,uuid,text,uuid,jsonb)', 'public.search_crm_donors(uuid,text)']::regprocedure[])
            order by 1`,
        )
      ).rows;
    const committed = async () =>
      (await db.query(COMMITTED)).rows[0].committed as boolean;
    const policies = async () =>
      (
        await db.query(
          `select count(*) filter (where p.record_type = 'donors' and p.field_key = 'ministry_assignment_id')::int as key_rows,
                  count(*)::int as total,
                  md5(string_agg(p::text, E'\\n' order by p::text)) as digest
             from public.field_policies p`,
        )
      ).rows[0] as { key_rows: number; total: number; digest: string };

    beforeAll(async () => {
      file = migration(SUFFIX);
      const version = path.basename(file).slice(0, 14);
      const target = new URL(ADMIN_URL);
      target.pathname = `/${name}`;
      url = target.toString();
      await admin.connect();
      await admin.query(`create database ${name} template template0`);
      created = true;
      for (const step of [
        "scripts/sql/supabase-compat-bootstrap.sql",
        ...readdirSync(MIG)
          .filter((f) => /^\d{14}_.+\.sql$/.test(f) && f.slice(0, 14) < version)
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

    it("10. the committed check is false before the file and true after; a second run stops at its first ADD COLUMN (42701) and changes nothing; the Down, in the header's order, restores the task functions and search_crm_donors byte for byte, removes the key's five field-policy rows (which the schema fingerprint does not see) so the table's contents are the base's again, and the catalog gate passes but for service_role's table privileges and CREATE on authz, which 20261126190000, later in the chain than this scratch database, closes (D-18, issue 2841: the gate holds service_role since then), and for the claim redemption's review, which 20261127060000 moves (D-18, AL-2678 WP5 rest 2 item zero (b))", async () => {
      const sources = await definitions();
      const base = captureFingerprint({ databaseUrl: url });
      const basePolicies = await policies();
      expect(basePolicies.key_rows, "no key rows before the file").toBe(0);
      expect(await committed(), "before the file").toBe(false);

      const first = psql(file);
      expect(first.status, first.stderr).toBe(0);
      expect(await committed(), "after the file").toBe(true);
      const applied = captureFingerprint({ databaseUrl: url });
      expect(await policies()).toMatchObject({
        key_rows: 5,
        total: basePolicies.total + 5,
      });

      const again = await db.query(readFileSync(file, "utf8")).then(
        () => null,
        (e: { code?: string; message?: string }) => e,
      );
      await db.query("rollback");
      expect(again).toMatchObject({
        code: "42701",
        message:
          'column "ministry_assignment_id" of relation "donors" already exists',
      });
      expect(
        diffFingerprints(applied, captureFingerprint({ databaseUrl: url })),
      ).toMatchObject({ equal: true });

      await db.query(downSql(file));
      expect(await committed(), "after the Down").toBe(false);
      expect(await definitions()).toEqual(sources);
      expect(await policies(), "field_policies after the Down").toEqual(
        basePolicies,
      );
      expect(
        diffFingerprints(base, captureFingerprint({ databaseUrl: url })),
      ).toMatchObject({
        equal: true,
        missing: [],
        unexpected: [],
        changed: [],
      });
      const gate = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `const m = await import(${JSON.stringify(pathToFileURL(path.resolve("scripts/verify/tenant-rls-catalog.mjs")).href)});
console.log(JSON.stringify(await m.runTenantRlsCatalogGate({ databaseUrl: process.env.ACC_URL, psqlBin: process.env.PSQL_BIN?.trim() || "psql" })));`,
        ],
        {
          encoding: "utf8",
          env: { ...process.env, ACC_URL: url },
          timeout: 120_000,
        },
      );
      const verdict = JSON.parse(
        gate.stdout.trim().split("\n").pop() || "{}",
      ) as {
        ok?: boolean;
        failures?: { code: string; table?: string; function?: string }[];
      };
      expect(verdict.failures, gate.stderr).toBeInstanceOf(Array);
      const later = (f: { code: string; table?: string; function?: string }) =>
        f.code === "SERVICE_ROLE_UNSAFE_PRIVILEGE" ||
        (f.code === "SERVICE_ROLE_SCHEMA_CREATE" && f.table === "authz") ||
        (f.function ===
          "tenant_guard.redeem_account_claim(p_tenant_id uuid, p_token text)" &&
          [
            "COMMAND_EXCEPTION_UNREVIEWED",
            "COMMAND_HUMAN_NO_PREAMBLE",
          ].includes(f.code));
      expect(
        verdict.failures!.filter((f) => !later(f)),
        gate.stderr,
      ).toEqual([]);
    }, 300_000);
  },
);
