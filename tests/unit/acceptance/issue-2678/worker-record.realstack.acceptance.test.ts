import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { BLANK_ALIASES, REAL_ALIAS, codePoints } from "./blank-aliases";
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
import { normalizesToNothing } from "../../../../packages/api/src/admin/workers/safety-text";
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
const RESTRICT = "tenant_guard.restrict_worker_publication";
const PART_ONE = "20261125050400_worker_safety_room.sql";
const ALIAS_EDITS = [
  ["  v_after RECORD;\nBEGIN\n", "  v_after RECORD;\n  v_alias TEXT;\nBEGIN\n"],
  [
    "    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';\n  END IF;\n",
    "    RAISE EXCEPTION 'A reason is required' USING ERRCODE = '22023';\n  END IF;\n  v_alias := private.normalize_safety_text(p_public_alias);\n",
  ],
  [
    "p_security_level IS NULL AND p_public_alias IS NULL AND p_do_not_publish IS NULL",
    "p_security_level IS NULL AND v_alias IS NULL AND p_do_not_publish IS NULL",
  ],
  [
    "CASE WHEN p_public_alias IS NULL THEN p.public_alias ELSE private.normalize_safety_text(p_public_alias) END",
    "COALESCE(v_alias, p.public_alias)",
  ],
] as const;
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

function functionText(text: string, from: number) {
  return text.slice(from, text.indexOf("\n$$;", from) + "\n$$;".length);
}

function downSql(file: string) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.findIndex((line) => line.startsWith("-- Down "));
  if (start < 0) throw new Error(`${file} has no Down`);
  const body: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("--   ")) body.push(line.slice("--   ".length));
    else if (line === "--" && body.length) body.push("");
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
          "pS",
          "pX",
          "pY",
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
        | "wZ"
        | "pS"
        | "pX"
        | "pY",
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
        `insert into public.parties (id, tenant_id, display_name, security_level, security_level_source, public_alias) values
           ($1, $4, 'Worker Sorrel', 'standard', 'manual', 'Ash'),
           ($2, $4, 'Worker Xylem', 'restricted', 'manual', 'Elm'),
           ($3, $4, 'Worker Yew', 'standard', 'manual', null)`,
        [id.pS, id.pX, id.pY, id.TA],
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

    const sqlText = (value: string | null) =>
      value === null ? "null" : `'${value.replaceAll("'", "''")}'`;
    const restrictDirect = (
      party: string,
      level: string | null,
      alias: string,
      doNotPublish: boolean | null,
      reason = "last round",
    ) =>
      keep(
        "authenticated",
        admin,
        `select tenant_guard.restrict_worker_publication('${id.TA}', '${party}', ${sqlText(level)}, ${sqlText(alias)}, ${doNotPublish === null ? "null" : String(doNotPublish)}, ${sqlText(reason)}) as r`,
      );
    const liftDirect = (party: string, level: string | null, clear: boolean) =>
      keep(
        "authenticated",
        admin,
        `select tenant_guard.lift_worker_restriction('${id.TA}', '${party}', ${sqlText(level)}, ${String(clear)}, 'reset') as r`,
      );
    const partyRow = async (party: string) =>
      (
        await db.query(
          "select security_level, public_alias, do_not_publish from public.parties where id = $1",
          [party],
        )
      ).rows[0];
    const inSavepoint = async (body: () => Promise<void>) => {
      await db.query("savepoint s");
      try {
        await body();
      } finally {
        await db.query("rollback to savepoint s");
      }
    };

    it("A1 (r2b1 last round) the aliases below are blank to the database and to normalizesToNothing alike", async () => {
      for (const alias of BLANK_ALIASES) {
        expect(normalizesToNothing(alias), codePoints(alias)).toBe(true);
        expect(
          (
            await db.query(
              "select private.normalize_safety_text($1) is null as blank",
              [alias],
            )
          ).rows[0].blank,
          codePoints(alias),
        ).toBe(true);
      }
    });

    it("A1 (a) called directly, with a level and an alias the database reduces to nothing, restrict raises the level and keeps the stored alias", () =>
      inSavepoint(async () => {
        for (const alias of BLANK_ALIASES) {
          const label = codePoints(alias);
          const raised = await restrictDirect(id.pS, "sensitive", alias, null);
          expect(raised.code, `${label}: ${raised.message}`).toBeNull();
          expect(await partyRow(id.pS), label).toEqual({
            security_level: "sensitive",
            public_alias: "Ash",
            do_not_publish: false,
          });
          const lowered = await liftDirect(id.pS, "standard", false);
          expect(lowered.code, lowered.message).toBeNull();
        }
      }));

    it("A1 (b) called directly with only such an alias, restrict is 22023 Nothing to change and the stored alias stays", () =>
      inSavepoint(async () => {
        for (const alias of BLANK_ALIASES) {
          const label = codePoints(alias);
          const nothing = await restrictDirect(id.pS, null, alias, null);
          expect(
            { code: nothing.code, message: nothing.message },
            label,
          ).toEqual({ code: "22023", message: "Nothing to change" });
          expect(await partyRow(id.pS), label).toEqual({
            security_level: "standard",
            public_alias: "Ash",
            do_not_publish: false,
          });
        }
      }));

    it("A1 (c) called directly with such an alias and do-not-publish, a restricted worker keeps its stored alias and no 23514 is raised", () =>
      inSavepoint(async () => {
        for (const alias of BLANK_ALIASES) {
          const label = codePoints(alias);
          const kept = await restrictDirect(id.pX, null, alias, true);
          expect(kept.code, `${label}: ${kept.message}`).toBeNull();
          expect(await partyRow(id.pX), label).toEqual({
            security_level: "restricted",
            public_alias: "Elm",
            do_not_publish: true,
          });
          const cleared = await liftDirect(id.pX, null, true);
          expect(cleared.code, cleared.message).toBeNull();
        }
      }));

    it("A1 (d) called directly with a real alias between invisible characters, restrict stores it normalized", () =>
      inSavepoint(async () => {
        const real = await restrictDirect(id.pY, null, REAL_ALIAS, null);
        expect(real.code, real.message).toBeNull();
        expect(await partyRow(id.pY)).toEqual({
          security_level: "standard",
          public_alias: "Oak Two",
          do_not_publish: false,
        });
      }));

    it("A1 (e) the audit row of each case (a) records no alias change", () =>
      inSavepoint(async () => {
        for (const alias of BLANK_ALIASES) {
          const raised = await restrictDirect(
            id.pS,
            "sensitive",
            alias,
            null,
            "audit (e)",
          );
          expect(raised.code, raised.message).toBeNull();
          const lowered = await liftDirect(id.pS, "standard", false);
          expect(lowered.code, lowered.message).toBeNull();
        }
        expect(
          (
            await db.query(
              "select details->'alias_changed' as changed from public.audit_logs where resource_id = $1 and action = 'worker_publication_restricted' and details->>'reason' = 'audit (e)' order by created_at, id",
              [id.pS],
            )
          ).rows.map((r) => r.changed as boolean),
        ).toEqual(BLANK_ALIASES.map(() => false));
      }));
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

    it("A1 (r2b1 last round): the file replaces tenant_guard.restrict_worker_publication with part 1's text and exactly the alias edits, restating part 1's grants; owner, security, search_path, comment and grants stay; tenant_guard is left with CREATE on no schema; the Down, as the header writes it, restores part 1's definition byte for byte", async () => {
      const partOne = readFileSync(`${MIG}/${PART_ONE}`, "utf8");
      const written = functionText(
        partOne,
        partOne.indexOf(`CREATE FUNCTION ${RESTRICT}(`),
      ).replace("CREATE FUNCTION", "CREATE OR REPLACE FUNCTION");
      let expected = written;
      for (const [from, to] of ALIAS_EDITS) {
        expect(expected.split(from).length - 1, from).toBe(1);
        expected = expected.replace(from, to);
      }
      const text = readFileSync(file, "utf8");
      const at = text.indexOf(`\nCREATE OR REPLACE FUNCTION ${RESTRICT}(`);
      expect(at, "the file replaces the function").toBeGreaterThan(-1);
      expect(functionText(text, at + 1)).toBe(expected);
      for (const line of [
        `REVOKE ALL ON FUNCTION ${RESTRICT}(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated, service_role;`,
        `GRANT EXECUTE ON FUNCTION ${RESTRICT}(UUID, UUID, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;`,
      ]) {
        expect(partOne).toContain(line);
        expect(text.slice(text.indexOf("\nBEGIN;"))).toContain(line);
      }
      const down = downSql(file);
      const downAt = down.indexOf(`CREATE OR REPLACE FUNCTION ${RESTRICT}(`);
      expect(downAt, "the Down restores the function").toBeGreaterThan(-1);
      expect(functionText(down, downAt)).toBe(written);

      const catalog = async () =>
        (
          await db.query(
            `select pg_get_functiondef(p.oid) as def, pg_get_userbyid(p.proowner) as owner, p.prosecdef, p.proconfig,
                    p.proacl::text[] as acl, obj_description(p.oid, 'pg_proc') as comment
               from pg_proc as p where p.oid = '${RESTRICT}(uuid,uuid,text,text,boolean,text)'::regprocedure`,
          )
        ).rows[0] as Record<string, unknown>;
      const schemasWithCreate = async () =>
        (
          await db.query(
            "select n.nspname from pg_namespace as n where has_schema_privilege('tenant_guard', n.oid, 'CREATE') order by 1",
          )
        ).rows;
      expect(await committed(), "before the file").toBe(false);
      const base = await catalog();
      expect(base.owner).toBe("tenant_guard");
      const createBase = await schemasWithCreate();
      expect(createBase).not.toContainEqual({ nspname: "tenant_guard" });

      const applied = psql(file);
      expect(applied.status, applied.stderr).toBe(0);
      const after = await catalog();
      expect(after.def).not.toBe(base.def);
      expect(after.def).toContain(
        "v_alias := private.normalize_safety_text(p_public_alias);",
      );
      expect({ ...after, def: null }).toEqual({ ...base, def: null });
      expect(await schemasWithCreate()).toEqual(createBase);

      await db.query(down);
      expect(await committed(), "after the Down").toBe(false);
      expect(await catalog()).toEqual(base);
      expect(await schemasWithCreate()).toEqual(createBase);
    }, 300_000);
  },
);
