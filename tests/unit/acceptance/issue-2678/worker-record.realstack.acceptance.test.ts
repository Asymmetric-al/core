import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  MIG,
  asRole,
  caller,
  fixtureIds,
  fixtureSql,
  keepAs,
  migration,
} from "./harness";
import {
  captureFingerprint,
  diffFingerprints,
} from "../../../../scripts/release/schema-fingerprint.mjs";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const SUFFIX = "_wp5_2r2b1_worker_record";
const COLUMNS = [
  "assignment_id",
  "created_at",
  "display_name",
  "do_not_publish",
  "has_legal_identity",
  "has_login",
  "party_id",
  "public_alias",
  "security_level",
  "security_level_source",
];
const FORBIDDEN = [
  "Legal Kestrel",
  "Country Kestrel",
  "Place Kestrel",
  "Legal Vale",
  "Country Vale",
  "Place Vale",
  "Legal Zed",
  "Country Zed",
  "Place Zed",
];
const IDENTITY_KEYS = [
  "legal_name",
  "legalName",
  "real_country",
  "realCountry",
  "precise_location",
  "preciseLocation",
];
const COMMITTED = `select to_regprocedure('public.worker_records(uuid)') is not null
   and to_regprocedure('tenant_guard.reveal_worker_identity(uuid,uuid,text)') is not null
   and to_regprocedure('public.reveal_worker_identity(uuid,uuid,text)') is not null
   and coalesce(not has_function_privilege('authenticated', to_regprocedure('public.read_party_restricted(uuid)'), 'EXECUTE'), false)
   and coalesce(not has_column_privilege('service_role', to_regclass('public.parties'), 'security_level', 'UPDATE'), false) as committed`;
const NO_CAPABILITY =
  "tenant_guard: the selected assignment does not hold the capability this command requires";

function absent(value: unknown) {
  const text = JSON.stringify(value).toLowerCase();
  for (const word of FORBIDDEN)
    expect(text, `holds ${word}`).not.toContain(word.toLowerCase());
  for (const key of IDENTITY_KEYS)
    expect(text, `holds the key ${key}`).not.toContain(
      `"${key.toLowerCase()}"`,
    );
}

function downSql(file: string) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith("-- Down "));
  if (start < 0) throw new Error(`${file} has no Down`);
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("--   ")) body.push(line.slice("--   ".length));
    else if (body.length) break;
  }
  return body.join("\n");
}

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r2b1: the worker's record, the audited reveal and the narrowed grants (plan lines 984, 1004, 1006; R2B-Q1, R-P7, Q6)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = {
      ...fixtureIds(),
      ...(Object.fromEntries(
        [
          "UP",
          "mP",
          "UDS",
          "mDSA",
          "mDSB",
          "UOP",
          "UN",
          "pU",
          "wU",
          "pK",
          "wK",
          "pV",
          "wV",
          "pZ",
          "wZ",
        ].map((k) => [k, randomUUID()]),
      ) as Record<
        | "UP"
        | "mP"
        | "UDS"
        | "mDSA"
        | "mDSB"
        | "UOP"
        | "UN"
        | "pU"
        | "wU"
        | "pK"
        | "wK"
        | "pV"
        | "wV"
        | "pZ"
        | "wZ",
        string
      >),
    };
    const run = asRole(db, id);
    const keep = keepAs(db, id);
    const admin = caller(id, "US", "mS", "TA");
    const plain = caller(id, "UP" as never, "mP" as never, "TA");
    const adminB = caller(id, "UBS", "mBS", "TB");
    const adminBforgedA = {
      sub: "UBS",
      headers: { "x-asym-tenant": id.TA, "x-asym-assignment": id.mBS },
    };
    const dualA = caller(id, "UDS" as never, "mDSA" as never, "TA");
    const dualB = caller(id, "UDS" as never, "mDSB" as never, "TB");
    const donor = caller(id, "UDA", "mDA", "TA");
    const missionary = caller(id, "UM", "mM", "TA");
    const nobody = { sub: "UN", headers: { "x-asym-tenant": id.TA } };
    const operator = {
      sub: "UOP",
      aal: "aal2",
      headers: { "x-asym-tenant": id.TA },
    };
    const records = (who: object, arg = "") =>
      run(
        "authenticated",
        who as never,
        `select * from public.worker_records(${arg})`,
      );
    const reveal = (who: object, party: string, reason: string) =>
      keep(
        "authenticated",
        who as never,
        `select public.reveal_worker_identity('${id.TA}', '${party}', '${reason.replaceAll("'", "''")}') as r`,
      );
    const audits = async (party: string) =>
      (
        await db.query(
          "select action, details from public.audit_logs where resource_type = 'party' and resource_id = $1 order by created_at, id",
          [party],
        )
      ).rows as { action: string; details: Record<string, unknown> }[];

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id as never));
      await db.query(
        "update authz.memberships set is_tenant_admin = true where id = any($1::uuid[])",
        [[id.mS, id.mBS]],
      );
      await db.query(
        "insert into auth.users (id, email, email_confirmed_at) select u, 'acc2678r2b1-' || u || '@example.test', now() from unnest($1::uuid[]) u",
        [[id.UP, id.UDS, id.UOP, id.UN]],
      );
      await db.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [[id.UP, id.UDS, id.UOP, id.UN]],
      );
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values
           ($1, $2, $3, 'staff', 'member_care', true),
           ($4, $5, $3, 'staff', 'finance', true),
           ($6, $5, $7, 'staff', 'finance', true)`,
        [id.mP, id.UP, id.TA, id.mDSA, id.UDS, id.mDSB, id.TB],
      );
      await db.query(
        "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acc2678r2b1', 'fixture operator')",
        [id.UOP],
      );
      await db.query(
        `insert into public.parties (id, tenant_id, display_name, security_level, security_level_source, public_alias) values
           ($1, $5, 'Worker Umber', 'standard', 'unreviewed_default', null),
           ($2, $5, 'Worker Kestrel', 'standard', 'manual', null),
           ($3, $5, 'Worker Vale', 'restricted', 'manual', 'Birch'),
           ($4, $6, 'Worker Zed', 'standard', 'manual', null)`,
        [id.pU, id.pK, id.pV, id.pZ, id.TA, id.TB],
      );
      await db.query(
        `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
           ($1, $5, $2, null, $5), ($3, $5, $4, null, $5)`,
        [id.wU, id.pU, id.wK, id.pK, id.TA],
      );
      await db.query(
        `insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
           ($1, $3, $2, null, $3), ($4, $6, $5, null, $6)`,
        [id.wV, id.pV, id.TA, id.wZ, id.pZ, id.TB],
      );
      await db.query(
        `insert into private.party_restricted (party_id, tenant_id, legal_name, real_country, precise_location) values
           ($1, $4, 'Legal Kestrel', 'Country Kestrel', 'Place Kestrel'),
           ($2, $4, 'Legal Vale', 'Country Vale', 'Place Vale'),
           ($3, $5, 'Legal Zed', 'Country Zed', 'Place Zed')`,
        [id.pK, id.pV, id.pZ, id.TA, id.TB],
      );
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    it("worker_records gives an administrator the organization's workers with exactly the ten columns, whether a legal identity is recorded, and no legal name; with no argument as with NULL, and one worker by assignment (red: 42883)", async () => {
      const all = await records(admin);
      expect(all.code, all.message).toBeNull();
      const byAssignment = Object.fromEntries(
        all.rows.map((row) => [row.assignment_id as string, row]),
      );
      expect(Object.keys(byAssignment).sort()).toEqual(
        [id.mA, id.m2, id.wU, id.wK, id.wV].sort(),
      );
      for (const row of all.rows)
        expect(Object.keys(row).sort()).toEqual(COLUMNS);
      expect(byAssignment[id.wK]).toMatchObject({
        party_id: id.pK,
        display_name: "Worker Kestrel",
        public_alias: null,
        security_level: "standard",
        security_level_source: "manual",
        do_not_publish: false,
        has_legal_identity: true,
        has_login: false,
      });
      expect(byAssignment[id.wV]).toMatchObject({
        public_alias: "Birch",
        security_level: "restricted",
        has_legal_identity: true,
      });
      expect(byAssignment[id.wU]).toMatchObject({
        security_level_source: "unreviewed_default",
        has_legal_identity: false,
      });
      expect(byAssignment[id.mA]).toMatchObject({ has_login: true });
      absent(all.rows);
      expect((await records(admin, "null")).rows).toEqual(all.rows);
      const one = await records(admin, `'${id.wK}'`);
      expect(one.rows).toEqual([byAssignment[id.wK]]);
      expect((await records(admin, `'${id.wZ}'`)).rows).toEqual([]);
    });

    it("plain staff read the same workers with has_legal_identity NULL on every row, recorded identity included (R-P7)", async () => {
      const all = await records(plain);
      expect(all.code, all.message).toBeNull();
      expect(all.rows.map((row) => row.assignment_id).sort()).toEqual(
        [id.mA, id.m2, id.wU, id.wK, id.wV].sort(),
      );
      for (const row of all.rows) expect(row.has_legal_identity).toBeNull();
      absent(all.rows);
    });

    it("another organization's administrator, with its own header or a forged one, gets none of the organization's workers; a person with staff rows in both gets each organization's under its own header, never both", async () => {
      const b = await records(adminB);
      expect(b.code, b.message).toBeNull();
      expect(b.rows.map((row) => row.assignment_id).sort()).toEqual(
        [id.mB, id.wZ].sort(),
      );
      expect(b.rows.find((row) => row.assignment_id === id.wZ)).toMatchObject({
        has_legal_identity: true,
      });
      expect((await records(adminBforgedA)).rows).toEqual([]);
      const inA = (await records(dualA)).rows.map((r) => r.assignment_id);
      const inB = (await records(dualB)).rows.map((r) => r.assignment_id);
      expect(inA.sort()).toEqual([id.mA, id.m2, id.wU, id.wK, id.wV].sort());
      expect(inB.sort()).toEqual([id.mB, id.wZ].sort());
      for (const row of [...(await records(dualA)).rows])
        expect(row.has_legal_identity).toBeNull();
    });

    it("a donor, a missionary, a person with no membership, a platform operator and the staff of a suspended organization get no worker; anon and service_role may not execute it", async () => {
      for (const who of [donor, missionary, nobody, operator]) {
        const result = await records(who);
        expect(result.code, result.message).toBeNull();
        expect(result.rows).toEqual([]);
      }
      await db.query("savepoint suspended");
      try {
        await db.query(
          "update public.tenants set status = 'suspended' where id = $1",
          [id.TA],
        );
        expect((await records(admin)).rows).toEqual([]);
        expect((await records(plain)).rows).toEqual([]);
      } finally {
        await db.query("rollback to savepoint suspended");
      }
      for (const fn of [
        "public.worker_records(uuid)",
        "public.reveal_worker_identity(uuid,uuid,text)",
        "tenant_guard.reveal_worker_identity(uuid,uuid,text)",
      ]) {
        const grants = await db.query(
          "select has_function_privilege('anon', $1::regprocedure, 'EXECUTE') as anon, has_function_privilege('service_role', $1::regprocedure, 'EXECUTE') as service, has_function_privilege('authenticated', $1::regprocedure, 'EXECUTE') as signed_in",
          [fn],
        );
        expect(grants.rows[0], fn).toEqual({
          anon: false,
          service: false,
          signed_in: true,
        });
      }
    });

    it("the reveal gives an administrator K's legal name, country and location and writes exactly one worker_identity_revealed row whose details hold the reason and the assignment and no identity value (R2B-Q1)", async () => {
      await db.query("savepoint s");
      try {
        const before = await audits(id.pK);
        const result = await reveal(admin, id.pK, "  Field visit\u00a0check ");
        expect(result.code, result.message).toBeNull();
        expect(result.rows[0]!.r).toEqual({
          party_id: id.pK,
          legal_name: "Legal Kestrel",
          real_country: "Country Kestrel",
          precise_location: "Place Kestrel",
        });
        const after = await audits(id.pK);
        expect(after.length - before.length).toBe(1);
        const row = after.at(-1)!;
        expect(row.action).toBe("worker_identity_revealed");
        expect(row.details).toEqual({
          reason: "Field visit check",
          assignment_id: id.mS,
        });
        absent(after);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("the reveal refuses plain staff, a missing or another organization's header, a blank or invisible reason, another organization's worker, a worker with no identity, a suspended organization and a revoked administrator, each with no audit row", async () => {
      await db.query("savepoint s");
      try {
        const count = async () =>
          Number(
            (
              await db.query(
                "select count(*) as n from public.audit_logs where action = 'worker_identity_revealed' and tenant_id = any($1::uuid[])",
                [[id.TA, id.TB]],
              )
            ).rows[0].n,
          );
        const start = await count();
        const plainRefusal = await reveal(plain, id.pK, "check");
        expect(plainRefusal).toMatchObject({
          code: "42501",
          message: NO_CAPABILITY,
        });
        expect(
          (
            await reveal(
              { sub: "US", headers: { "x-asym-assignment": id.mS } },
              id.pK,
              "check",
            )
          ).code,
        ).toBe("42501");
        expect(
          (
            await reveal(
              {
                sub: "US",
                headers: { "x-asym-tenant": id.TB, "x-asym-assignment": id.mS },
              },
              id.pK,
              "check",
            )
          ).code,
        ).toBe("42501");
        for (const reason of ["", "   ", "\u200b ", "\u00a0\u2003"])
          expect(await reveal(admin, id.pK, reason)).toMatchObject({
            code: "22023",
            message: "A reason is required",
          });
        expect(await reveal(admin, id.pZ, "check")).toMatchObject({
          code: "P0002",
          message: "No Party with that id in this organization",
        });
        expect(await reveal(admin, id.pU, "check")).toMatchObject({
          code: "P0002",
          message: "No private identity for that worker",
        });
        await db.query("savepoint suspended");
        await db.query(
          "update public.tenants set status = 'suspended' where id = $1",
          [id.TA],
        );
        expect((await reveal(admin, id.pK, "check")).code).toBe("42501");
        await db.query("rollback to savepoint suspended");
        await db.query(
          "update authz.memberships set revoked_at = now(), is_active = false where id = $1",
          [id.mS],
        );
        expect((await reveal(admin, id.pK, "check")).code).toBe("42501");
        expect(await count()).toBe(start);
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("read_party_restricted has no signed-in grantee: every caller, the administrator included, is refused (R2B-Q1)", async () => {
      expect(
        (
          await db.query(
            "select has_function_privilege('authenticated', 'public.read_party_restricted(uuid)', 'EXECUTE') as x",
          )
        ).rows[0].x,
      ).toBe(false);
      for (const who of [admin, plain, adminB, donor]) {
        const result = await run(
          "authenticated",
          who as never,
          `select * from public.read_party_restricted('${id.pK}')`,
        );
        expect(result).toMatchObject({
          code: "42501",
          message: "permission denied for function read_party_restricted",
        });
      }
    });

    it("Q6: the service key may not write a Party's level, its source, the alias or do-not-publish, by INSERT or UPDATE; it inserts the other columns and updates the display name; a donor row inserted under the service key still gets its Party, because the fill trigger writes it as postgres (service_role holds only SELECT on donors, so the case grants it INSERT inside its rolled-back savepoint)", async () => {
      const asService = async (sql: string, params: unknown[] = []) => {
        await db.query("savepoint q6");
        try {
          await db.query("set local role service_role");
          const r = await db.query(sql, params);
          return { code: null as string | null, message: "", rows: r.rows };
        } catch (e) {
          const err = e as { code?: string; message?: string };
          return {
            code: err.code ?? "?",
            message: err.message ?? "",
            rows: [],
          };
        } finally {
          await db.query("rollback to savepoint q6");
        }
      };
      for (const [column, value] of [
        ["security_level", "'sensitive'"],
        ["security_level_source", "'manual'"],
        ["public_alias", "'Other'"],
        ["do_not_publish", "true"],
      ] as const) {
        expect(
          await asService(
            `update public.parties set ${column} = ${value} where id = $1`,
            [id.pK],
          ),
          `UPDATE ${column}`,
        ).toMatchObject({
          code: "42501",
          message: "permission denied for table parties",
        });
        expect(
          await asService(
            `insert into public.parties (tenant_id, display_name, ${column}) values ($1, 'Q6', ${value})`,
            [id.TA],
          ),
          `INSERT ${column}`,
        ).toMatchObject({
          code: "42501",
          message: "permission denied for table parties",
        });
      }
      expect(
        await asService(
          "insert into public.parties (id, tenant_id, display_name, import_batch_id, created_at, updated_at) values ($1, $2, 'Q6', null, now(), now()) returning security_level, security_level_source",
          [randomUUID(), id.TA],
        ),
      ).toMatchObject({
        code: null,
        rows: [
          {
            security_level: "standard",
            security_level_source: "unreviewed_default",
          },
        ],
      });
      expect(
        await asService(
          "update public.parties set display_name = 'Worker Kestrel Renamed', updated_at = now() where id = $1",
          [id.pK],
        ),
      ).toMatchObject({ code: null });
      const donorId = randomUUID();
      await db.query("savepoint q6donor");
      try {
        await db.query("grant insert on table public.donors to service_role");
        await db.query("set local role service_role");
        await db.query(
          "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Q6 donor', $3)",
          [donorId, id.TA, `q6-${donorId}@example.test`],
        );
        await db.query("reset role");
        expect(
          (
            await db.query(
              "select p.display_name from public.donors as d join public.parties as p on p.tenant_id = d.tenant_id and p.id = d.party_id where d.id = $1",
              [donorId],
            )
          ).rows,
        ).toEqual([{ display_name: "Q6 donor" }]);
      } finally {
        await db.query("rollback to savepoint q6donor");
      }
      expect(
        (
          await db.query(
            "select p.prosecdef, pg_get_userbyid(p.proowner) as owner from pg_proc as p where p.oid = 'public.donors_fill_party_after_insert_temp()'::regprocedure",
          )
        ).rows,
      ).toEqual([{ prosecdef: true, owner: "postgres" }]);
    });
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r2b1, the migration on a scratch database: the committed check, a second run and the Down",
  () => {
    const name = `acc2678r2b1_${randomUUID().replaceAll("-", "")}`;
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
    const committed = async () =>
      (await db.query(COMMITTED)).rows[0].committed as boolean;

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
        const result = psql(step);
        expect(
          result.status,
          `replay stopped at ${step}: ${result.stderr}`,
        ).toBe(0);
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

    it("the committed check is false before the file and true after; a second run stops at its first CREATE FUNCTION (42723) and changes nothing; the Down, as the header writes it, returns the catalog to the chain without the file, column privileges included", async () => {
      const base = captureFingerprint({ databaseUrl: url });
      expect(await committed(), "before the file").toBe(false);

      const first = psql(file);
      expect(first.status, first.stderr).toBe(0);
      expect(await committed(), "after the file").toBe(true);
      const applied = captureFingerprint({ databaseUrl: url });
      expect(diffFingerprints(base, applied)).toMatchObject({ equal: false });

      const again = await db.query(readFileSync(file, "utf8")).then(
        () => null,
        (e: { code?: string; message?: string }) => e,
      );
      await db.query("rollback");
      expect(again).toMatchObject({
        code: "42723",
        message:
          'function "worker_records" already exists with same argument types',
      });
      expect(
        diffFingerprints(applied, captureFingerprint({ databaseUrl: url })),
      ).toMatchObject({ equal: true });

      await db.query(downSql(file));
      expect(await committed(), "after the Down").toBe(false);
      expect(
        diffFingerprints(base, captureFingerprint({ databaseUrl: url })),
      ).toMatchObject({
        equal: true,
        missing: [],
        unexpected: [],
        changed: [],
      });
    }, 300_000);
  },
);
