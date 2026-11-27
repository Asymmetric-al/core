import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  attempt,
  inTx,
  role,
} from "./wp8a-rest2a-harness";

const MIGRATIONS = join(__dirname, "../../../../supabase/migrations");

function gateStatements() {
  const name = readdirSync(MIGRATIONS).find((f) =>
    f.endsWith("_wp8a2_rest2a_tenant_not_null.sql"),
  );
  if (!name) throw new Error("the tenant NOT NULL migration is missing");
  const text = readFileSync(join(MIGRATIONS, name), "utf8");
  const start = text.indexOf("-- gate: begin");
  const end = text.indexOf("-- gate: end");
  if (start < 0 || end < start) throw new Error("the migration marks no gate");
  return text.slice(start, end);
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "migrate supplies TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2681 WP8a part 2 rest, PR 2a: donations.tenant_id NOT NULL behind its count gate (W8-R16, record 964; real stack, rolled back)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function beforeTheRule() {
      await role(db, null);
      await db.query(
        "ALTER TABLE public.donations ALTER COLUMN tenant_id DROP NOT NULL",
      );
      await db.query(
        "ALTER TABLE public.donations DROP CONSTRAINT donations_tenant_id_present",
      );
    }

    it("the database's writers of donations are the two legacy functions and the intake command, nothing else", () =>
      inTx(db, async () => {
        await role(db, null);
        const writers = (
          await db.query(
            `SELECT p.oid::regprocedure::text AS f
               FROM pg_proc AS p JOIN pg_namespace AS n ON n.oid = p.pronamespace
              WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND p.prokind IN ('f', 'p')
                AND pg_get_functiondef(p.oid) ~* 'insert\\s+into\\s+(public\\.)?donations[\\s(]'
              ORDER BY 1`,
          )
        ).rows.map((r) => r.f as string);
        expect(writers).toEqual([
          "atomic_create_donation_with_audit(uuid,uuid,uuid,uuid,bigint,text,uuid,text,text,jsonb,text,text)",
          "begin_donation_saga(uuid,uuid,uuid,bigint,text,uuid,uuid,text,text,text,jsonb)",
          "tenant_guard.begin_line_gift(uuid,text,text,text,jsonb,bigint,text,boolean,text,jsonb,jsonb)",
        ]);
      }));

    it("before the rule each legacy writer already refuses a gift without an organization and writes nothing, so the rule changes no running statement", () =>
      inTx(db, async () => {
        await beforeTheRule();
        await role(db, "service_role");
        const saga = await attempt(
          db,
          "SELECT public.begin_donation_saga(NULL, $1, $1, 1000) AS r",
          [randomUUID()],
        );
        const atomic = await attempt(
          db,
          "SELECT public.atomic_create_donation_with_audit(NULL, $1, $1, NULL, 1000) AS r",
          [randomUUID()],
        );
        await role(db, null);
        expect(saga.ok).toBe(false);
        expect(atomic.ok).toBe(false);
        const orphans = (
          await db.query(
            "SELECT count(*)::int AS n FROM public.donations WHERE tenant_id IS NULL",
          )
        ).rows[0].n;
        expect(orphans).toBe(0);
      }));

    it("the gate refuses with the count while a gift has no organization and changes nothing; on a clean table it makes the column NOT NULL", () =>
      inTx(db, async () => {
        await beforeTheRule();
        await db.query(
          "INSERT INTO public.donations (id, amount, currency, status) VALUES ($1, 500, 'usd', 'completed')",
          [randomUUID()],
        );
        const refused = await attempt(db, gateStatements());
        expect(`${refused.code} ${refused.message}`).toBe(
          "55000 donations_without_tenant",
        );
        const still = (
          await db.query(
            "SELECT attnotnull FROM pg_attribute WHERE attrelid = 'public.donations'::regclass AND attname = 'tenant_id'",
          )
        ).rows[0].attnotnull;
        expect(still).toBe(false);
        await db.query("DELETE FROM public.donations WHERE tenant_id IS NULL");
        const passed = await attempt(db, gateStatements());
        expect(passed.ok).toBe(true);
        const now = (
          await db.query(
            `SELECT a.attnotnull, c.convalidated
               FROM pg_attribute AS a
               JOIN pg_constraint AS c ON c.conrelid = a.attrelid AND c.conname = 'donations_tenant_id_present'
              WHERE a.attrelid = 'public.donations'::regclass AND a.attname = 'tenant_id'`,
          )
        ).rows[0];
        expect(now).toEqual({ attnotnull: true, convalidated: true });
      }));

    it("the count is in the refusal's detail", () =>
      inTx(db, async () => {
        await beforeTheRule();
        for (let i = 0; i < 2; i += 1)
          await db.query(
            "INSERT INTO public.donations (id, amount, currency, status) VALUES ($1, 500, 'usd', 'completed')",
            [randomUUID()],
          );
        await db.query("SAVEPOINT gate_detail");
        const detail = await db
          .query(gateStatements())
          .then(() => null)
          .catch((e: { detail?: string }) => e.detail ?? null);
        await db.query("ROLLBACK TO SAVEPOINT gate_detail");
        expect(detail).toBe(
          "2 donations have no organization; bring each into line before this migration runs.",
        );
      }));
  },
);
