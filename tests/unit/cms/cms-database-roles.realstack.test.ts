/**
 * WP1 (AL-2674): Payload's database roles, plan 7.2 and the "Payload
 * confinement" row of section 13.
 *
 * The static checks always run. The real-stack checks run against the migrated
 * disposable database named by TENANT_GUARD_IT_ADMIN_DATABASE_URL (a superuser
 * URL, as in CI's `migrate` job) and skip without it. They set a random
 * password on both roles for the run, as local and CI setups do, and clear it
 * afterwards; the migration itself never sets one.
 */
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const ROLE_MIGRATION = readdirSync(MIGRATIONS_DIR).find((name) =>
  /^\d{14}_cms_database_roles\.sql$/.test(name),
);
const PROBE = `cms_role_probe_${randomBytes(4).toString("hex")}`;

const INSUFFICIENT_PRIVILEGE = "42501";
const TOO_MANY_CONNECTIONS = "53300";

function roleMigrationSql() {
  expect(ROLE_MIGRATION, "the CMS role migration exists").toBeDefined();
  return readFileSync(path.join(MIGRATIONS_DIR, ROLE_MIGRATION!), "utf8");
}

function loginUrl(role: string, password: string) {
  const url = new URL(ADMIN_URL);
  url.username = role;
  url.password = password;
  return url.toString();
}

async function errorCode(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    return (error as { code?: string }).code ?? "no-code";
  }
  return "succeeded";
}

describe("CMS role migration source", () => {
  it("creates both login roles and the runtime connection limit", () => {
    const sql = roleMigrationSql();
    expect(sql).toMatch(/CREATE ROLE %I LOGIN/);
    expect(sql).toMatch(/ARRAY\['cms_owner', 'cms_runtime'\]/);
    expect(sql).toMatch(/ALTER ROLE cms_runtime[^;]*CONNECTION LIMIT 10;/);
  });

  it("holds no password: the release job and local setups set them", () => {
    const code = roleMigrationSql()
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");
    expect(code).not.toMatch(/\bPASSWORD\b/i);
  });
});

describe.skipIf(!ADMIN_URL)("CMS database roles (real stack)", () => {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  const ownerPassword = randomBytes(24).toString("hex");
  const runtimePassword = randomBytes(24).toString("hex");
  let owner: pg.Client;
  let runtime: pg.Client;

  beforeAll(async () => {
    await admin.connect();
    await admin.query(
      `ALTER ROLE cms_owner PASSWORD ${admin.escapeLiteral(ownerPassword)}`,
    );
    await admin.query(
      `ALTER ROLE cms_runtime PASSWORD ${admin.escapeLiteral(runtimePassword)}`,
    );
    owner = new pg.Client({
      connectionString: loginUrl("cms_owner", ownerPassword),
    });
    runtime = new pg.Client({
      connectionString: loginUrl("cms_runtime", runtimePassword),
    });
    await owner.connect();
    await runtime.connect();
    // A table that cms_owner creates, as a Payload migration would.
    await owner.query(
      `CREATE TABLE cms.${PROBE} (id serial PRIMARY KEY, note text)`,
    );
  });

  afterAll(async () => {
    await owner?.query(`DROP TABLE IF EXISTS cms.${PROBE}`).catch(() => {});
    await runtime?.end().catch(() => {});
    await owner?.end().catch(() => {});
    await admin.query("ALTER ROLE cms_owner PASSWORD NULL").catch(() => {});
    await admin.query("ALTER ROLE cms_runtime PASSWORD NULL").catch(() => {});
    await admin.end();
  });

  it("gives both roles login and nothing privileged", async () => {
    const { rows } = await admin.query(
      `SELECT rolname, rolcanlogin, rolsuper, rolcreaterole, rolcreatedb,
              rolreplication, rolbypassrls, rolconnlimit,
              (SELECT count(*)::int FROM pg_auth_members m WHERE m.member = r.oid) AS memberships
         FROM pg_roles r
        WHERE rolname IN ('cms_owner', 'cms_runtime')
        ORDER BY rolname`,
    );
    expect(rows).toEqual([
      {
        rolname: "cms_owner",
        rolcanlogin: true,
        rolsuper: false,
        rolcreaterole: false,
        rolcreatedb: false,
        rolreplication: false,
        rolbypassrls: false,
        rolconnlimit: 2,
        memberships: 0,
      },
      {
        rolname: "cms_runtime",
        rolcanlogin: true,
        rolsuper: false,
        rolcreaterole: false,
        rolcreatedb: false,
        rolreplication: false,
        rolbypassrls: false,
        rolconnlimit: 10,
        memberships: 0,
      },
    ]);
  });

  it("makes cms_owner the owner of schema cms and of everything in it", async () => {
    const { rows } = await admin.query(
      `SELECT pg_get_userbyid(nspowner) AS owner FROM pg_namespace WHERE nspname = 'cms'`,
    );
    expect(rows).toEqual([{ owner: "cms_owner" }]);
    const strays = await admin.query(
      `SELECT c.relname, pg_get_userbyid(c.relowner) AS owner
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'cms' AND c.relowner <> 'cms_owner'::regrole`,
    );
    expect(strays.rows).toEqual([]);
  });

  it("closes schema cms to anon, authenticated and service_role (plan 7.1)", async () => {
    const { rows } = await admin.query(
      `SELECT r.rolname,
              has_schema_privilege(r.oid, 'cms', 'USAGE') AS usage,
              has_schema_privilege(r.oid, 'cms', 'CREATE') AS create
         FROM pg_roles r
        WHERE r.rolname IN ('anon', 'authenticated', 'service_role')
        ORDER BY r.rolname`,
    );
    expect(rows).toEqual(
      ["anon", "authenticated", "service_role"].map((rolname) => ({
        rolname,
        usage: false,
        create: false,
      })),
    );
  });

  it("leaves no grant or default privilege in cms for the API roles or PUBLIC", async () => {
    const { rows } = await admin.query(
      `WITH api(grantee) AS (
         SELECT 0::oid
         UNION ALL SELECT oid FROM pg_roles
          WHERE rolname IN ('anon', 'authenticated', 'service_role')
       )
       SELECT 'schema' AS kind, n.nspname::text AS name
         FROM pg_namespace n CROSS JOIN LATERAL aclexplode(n.nspacl) a
        WHERE n.nspname = 'cms' AND a.grantee IN (SELECT grantee FROM api)
       UNION ALL
       SELECT 'relation', c.relname::text
         FROM pg_class c CROSS JOIN LATERAL aclexplode(c.relacl) a
        WHERE c.relnamespace = 'cms'::regnamespace
          AND a.grantee IN (SELECT grantee FROM api)
       UNION ALL
       SELECT 'default ' || d.defaclobjtype::text,
              pg_get_userbyid(d.defaclrole)::text
         FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a
        WHERE (d.defaclnamespace = 'cms'::regnamespace
               OR d.defaclrole = 'cms_owner'::regrole)
          AND a.grantee IN (SELECT grantee FROM api)`,
    );
    expect(rows).toEqual([]);
  });

  it("refuses each API role a read of a cms table", async () => {
    for (const role of ["anon", "authenticated", "service_role"]) {
      const code = await errorCode(async () => {
        await admin.query("BEGIN");
        try {
          await admin.query(`SET LOCAL ROLE ${role}`);
          await admin.query(`SELECT 1 FROM cms.${PROBE}`);
        } finally {
          await admin.query("ROLLBACK");
        }
      });
      expect(code, role).toBe(INSUFFICIENT_PRIVILEGE);
    }
  });

  it("keeps the Payload migration ledger read-only for cms_runtime", async (context) => {
    const { rows } = await admin.query(
      "SELECT to_regclass('cms.payload_migrations') IS NOT NULL AS present",
    );
    // The ledger exists once Payload's own migrations have run.
    if (!rows[0].present) context.skip();
    const privileges = await admin.query(
      `SELECT p AS privilege,
              has_table_privilege('cms_runtime', 'cms.payload_migrations', p) AS held
         FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p`,
    );
    expect(privileges.rows).toEqual([
      { privilege: "SELECT", held: true },
      { privilege: "INSERT", held: false },
      { privilege: "UPDATE", held: false },
      { privilege: "DELETE", held: false },
    ]);
    expect(
      await errorCode(() =>
        runtime.query(
          "INSERT INTO cms.payload_migrations (name, batch) VALUES ('forged', 99)",
        ),
      ),
    ).toBe(INSUFFICIENT_PRIVILEGE);
  });

  it("connects Payload's runtime as current_user = cms_runtime", async () => {
    const { rows } = await runtime.query(
      "SELECT current_user, session_user, current_setting('is_superuser') AS su",
    );
    expect(rows).toEqual([
      { current_user: "cms_runtime", session_user: "cms_runtime", su: "off" },
    ]);
  });

  it("refuses cms_runtime a select from public.donors", async () => {
    expect(
      await errorCode(() => runtime.query("SELECT 1 FROM public.donors")),
    ).toBe(INSUFFICIENT_PRIVILEGE);
  });

  it("refuses cms_runtime a new table, in cms or in public, and a new schema", async () => {
    for (const statement of [
      "CREATE TABLE cms.cms_runtime_probe (id int)",
      "CREATE TABLE public.cms_runtime_probe (id int)",
      "CREATE SCHEMA cms_runtime_probe",
    ]) {
      expect(await errorCode(() => runtime.query(statement)), statement).toBe(
        INSUFFICIENT_PRIVILEGE,
      );
    }
  });

  it("refuses cms_runtime a dropped column, a dropped table and a truncate", async () => {
    for (const statement of [
      `ALTER TABLE cms.${PROBE} DROP COLUMN note`,
      `DROP TABLE cms.${PROBE}`,
      `TRUNCATE cms.${PROBE}`,
      `CREATE INDEX ON cms.${PROBE} (note)`,
    ]) {
      expect(await errorCode(() => runtime.query(statement)), statement).toBe(
        INSUFFICIENT_PRIVILEGE,
      );
    }
    const { rows } = await admin.query(
      `SELECT count(*)::int AS columns FROM pg_attribute
        WHERE attrelid = 'cms.${PROBE}'::regclass AND attname = 'note' AND NOT attisdropped`,
    );
    expect(rows).toEqual([{ columns: 1 }]);
  });

  it("lets cms_runtime read and write rows in tables that later Payload migrations create", async () => {
    await runtime.query(`INSERT INTO cms.${PROBE} (note) VALUES ('a')`);
    await runtime.query(`UPDATE cms.${PROBE} SET note = 'b'`);
    const { rows } = await runtime.query(`SELECT note FROM cms.${PROBE}`);
    expect(rows).toEqual([{ note: "b" }]);
    await runtime.query(`DELETE FROM cms.${PROBE}`);
  });

  it("keeps cms_owner inside cms: no public.donors, no table in public, no new schema", async () => {
    expect(
      await errorCode(() => owner.query("SELECT 1 FROM public.donors")),
    ).toBe(INSUFFICIENT_PRIVILEGE);
    for (const statement of [
      "CREATE TABLE public.cms_owner_probe (id int)",
      "CREATE SCHEMA cms_owner_probe",
    ]) {
      expect(await errorCode(() => owner.query(statement)), statement).toBe(
        INSUFFICIENT_PRIVILEGE,
      );
    }
  });

  it("stops the eleventh cms_runtime connection at the role's limit", async () => {
    const extra: pg.Client[] = [];
    try {
      // One runtime connection is already open.
      for (let index = 0; index < 9; index += 1) {
        const client = new pg.Client({
          connectionString: loginUrl("cms_runtime", runtimePassword),
        });
        await client.connect();
        extra.push(client);
      }
      const eleventh = new pg.Client({
        connectionString: loginUrl("cms_runtime", runtimePassword),
      });
      expect(await errorCode(() => eleventh.connect())).toBe(
        TOO_MANY_CONNECTIONS,
      );
      await eleventh.end().catch(() => {});
    } finally {
      await Promise.all(extra.map((client) => client.end()));
    }
  });
});
