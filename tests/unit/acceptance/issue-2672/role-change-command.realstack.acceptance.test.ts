/**
 * WP0 (#2672) real-stack test for the role-change command,
 * `public.atomic_update_user_role_with_audit` (audit finding A01).
 *
 * Plan, section 12, WP0: the role mutation cannot grant a platform role or
 * target the caller, and its SQL function requires the caller to be an admin
 * of the target tenant. Until WP2 that check reads `profiles.role`.
 *
 * Runs against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL; without it the block skips, except in
 * the CI `migrate` job, where it fails. The function is called as
 * `service_role`, the only role granted EXECUTE, exactly as the GraphQL
 * resolver calls it. Every check runs in its own transaction, rolled back.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";
const FN = "public.atomic_update_user_role_with_audit";
const SIGNATURE = `${FN}(uuid,uuid,uuid,text,text,text)`;

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("WP0 role-change command (A01)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const tenantA = randomUUID();
  const tenantB = randomUUID();
  /** Profile IDs equal user IDs: the new-user trigger creates them that way. */
  const people = {
    adminA: randomUUID(),
    secondAdminA: randomUUID(),
    staffA: randomUUID(),
    donorA: randomUUID(),
    operatorA: randomUUID(),
    adminB: randomUUID(),
  };
  const roles: Record<keyof typeof people, [string, string]> = {
    adminA: [tenantA, "admin"],
    secondAdminA: [tenantA, "admin"],
    staffA: [tenantA, "staff"],
    donorA: [tenantA, "donor"],
    operatorA: [tenantA, "super_admin"],
    adminB: [tenantB, "admin"],
  };

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  /** One check = one transaction with fresh fixtures, always rolled back. */
  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      // Hosted simulation: hosted Supabase's default privileges give
      // service_role write access to public tables; the compat bootstrap
      // mirrors only SELECT. Grant the two writes the command makes, inside
      // the rolled-back transaction, so a refusal can only come from the
      // command's own checks.
      await db.query(
        "grant update on public.profiles to service_role; grant insert on public.audit_logs to service_role",
      );
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp0 A', 'wp0-' || $1::text), ($2::uuid, 'wp0 B', 'wp0-' || $2::text)",
        [tenantA, tenantB],
      );
      for (const [key, [tenant, role]] of Object.entries(roles)) {
        const id = people[key as keyof typeof people];
        await db.query(
          "insert into auth.users (id, email, raw_app_meta_data) values ($1, $2, jsonb_build_object('tenant_id', $3::text))",
          [id, `${key}-${id}@example.invalid`, tenant],
        );
        await db.query("update public.profiles set role = $2 where id = $1", [
          id,
          role,
        ]);
      }
      await fn();
    } finally {
      await db.query("rollback");
    }
  }

  /** Calls the command as service_role; returns the result or the SQLSTATE. */
  async function changeRole(input: {
    actor: string | null;
    target: string;
    tenant: string;
    role: string;
  }) {
    await db.query("savepoint call");
    try {
      await db.query("set local role service_role");
      const result = await db.query(
        `select ${FN}($1::uuid, $2::uuid, $3::uuid, $4::text) as result`,
        [input.target, input.tenant, input.actor, input.role],
      );
      await db.query("reset role");
      await db.query("release savepoint call");
      return { code: null, result: result.rows[0]?.result as unknown };
    } catch (error) {
      await db.query("rollback to savepoint call");
      await db.query("reset role");
      return {
        code: (error as { code?: string }).code ?? String(error),
        result: null,
      };
    }
  }

  async function roleOf(profileId: string) {
    const r = await db.query("select role from public.profiles where id = $1", [
      profileId,
    ]);
    return r.rows[0]?.role as string | undefined;
  }

  async function roleChangeAudits(profileId: string) {
    const r = await db.query(
      "select tenant_id, user_id, details from public.audit_logs where action = 'role_change' and resource_id = $1",
      [profileId],
    );
    return r.rows as Array<Record<string, unknown>>;
  }

  it("refuses a staff caller and changes no role", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.staffA,
        target: people.donorA,
        tenant: tenantA,
        role: "admin",
      });
      expect(outcome.code).toBe("42501");
      expect(await roleOf(people.donorA)).toBe("donor");
      expect(await roleChangeAudits(people.donorA)).toEqual([]);
    }));

  it("refuses a staff caller promoting themselves to a platform role", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.staffA,
        target: people.staffA,
        tenant: tenantA,
        role: "super_admin",
      });
      expect(outcome.code).toBe("42501");
      expect(await roleOf(people.staffA)).toBe("staff");
    }));

  it("refuses an admin of another tenant", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.adminB,
        target: people.donorA,
        tenant: tenantA,
        role: "staff",
      });
      expect(outcome.code).toBe("42501");
      expect(await roleOf(people.donorA)).toBe("donor");
    }));

  it("refuses a caller with no identity", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: null,
        target: people.donorA,
        tenant: tenantA,
        role: "staff",
      });
      expect(outcome.code).toBe("42501");
      expect(await roleOf(people.donorA)).toBe("donor");
    }));

  it("refuses an admin changing their own role", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.adminA,
        target: people.adminA,
        tenant: tenantA,
        role: "donor",
      });
      expect(outcome.code).toBe("42501");
      expect(await roleOf(people.adminA)).toBe("admin");
    }));

  it.each(["super_admin", "finance", "delivery", ""])(
    "refuses an admin granting the role %j, which is not a tenant role",
    (role) =>
      tx(async () => {
        const outcome = await changeRole({
          actor: people.adminA,
          target: people.donorA,
          tenant: tenantA,
          role,
        });
        expect(outcome.code).toBe("42501");
        expect(await roleOf(people.donorA)).toBe("donor");
        expect(await roleChangeAudits(people.donorA)).toEqual([]);
      }),
  );

  it("refuses an admin changing the role of a platform operator", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.adminA,
        target: people.operatorA,
        tenant: tenantA,
        role: "donor",
      });
      expect(outcome.code).toBe("42501");
      expect(await roleOf(people.operatorA)).toBe("super_admin");
    }));

  it("reports a profile outside the tenant as not found", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.adminA,
        target: people.adminB,
        tenant: tenantA,
        role: "donor",
      });
      expect(outcome.code).toBe("P0002");
      expect(await roleOf(people.adminB)).toBe("admin");
    }));

  it.each(["donor", "missionary", "staff", "admin"])(
    "lets an admin of the tenant grant the tenant role %s to someone else, with an audit row",
    (role) =>
      tx(async () => {
        const outcome = await changeRole({
          actor: people.adminA,
          target: people.staffA,
          tenant: tenantA,
          role,
        });
        expect(outcome.code).toBeNull();
        expect(outcome.result).toEqual({ profile_id: people.staffA, role });
        expect(await roleOf(people.staffA)).toBe(role);
        expect(await roleChangeAudits(people.staffA)).toEqual([
          {
            tenant_id: tenantA,
            user_id: people.adminA,
            details: { oldRole: "staff", newRole: role },
          },
        ]);
      }),
  );

  it("lets an admin demote another admin of the same tenant", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: people.adminA,
        target: people.secondAdminA,
        tenant: tenantA,
        role: "staff",
      });
      expect(outcome.code).toBeNull();
      expect(await roleOf(people.secondAdminA)).toBe("staff");
    }));

  it("stays callable only by service_role, with a fixed search path", async () => {
    const r = await db.query(
      `select p.proconfig,
         array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
               from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
               where a.privilege_type = 'EXECUTE' order by 1) as grantees
       from pg_proc p where p.oid = $1::regprocedure`,
      [SIGNATURE],
    );
    const row = r.rows[0] as { proconfig: string[] | null; grantees: string[] };
    expect(row.grantees.filter((g) => g !== "postgres")).toEqual([
      "service_role",
    ]);
    expect(row.proconfig).toContain('search_path=""');
  });
});
