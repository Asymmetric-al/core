/**
 * WP0 (#2672) real-stack test for the role-change command (audit finding A01).
 *
 * Plan, section 12, WP0: the role mutation cannot grant a platform role or
 * target the caller, and its SQL function requires the caller to be an admin
 * of the target tenant. Until WP2 that check reads `profiles.role`.
 *
 * Rewritten when WP2a joined stage 1 (AL-2675; plan WP0 and WP2a,
 * 20261117160400_role_change_reads_tenant_admin_membership.sql): the check
 * read the caller's live staff membership in the tenant and its
 * `people.manage_members` capability (the tenant-administrator flag), and the
 * target was found by membership in the tenant, not by `profiles.tenant_id`.
 *
 * Council round 1 on WP2a (F2) and the review of PR #2714 reached the same
 * rule: the role written was the person's global `profiles.role`, which every
 * tenant's restricted-note policies then read, so a target who was a live
 * member of another tenant was refused (historical record D-40).
 *
 * Rewritten again by AL-2675 (WP2c, part 1; plan 5.4 and 12 WP2c; record
 * section 9 and D-18). WP2c deletes GraphQL `updateUserRole` and drops
 * `public.atomic_update_user_role_with_audit`; a member's sub-role and
 * tenant-administrator flag change only through the human commands
 * `public.change_membership_role` and `public.revoke_membership`, on the
 * caller's own token, which write the membership and never `profiles.role`.
 * Every case below is the case WP0 and WP2a proved, run on the command that
 * replaces the function, with the same refusal code, the same "changes
 * nothing" and "writes no audit row" assertions, and the admitted changes
 * asserted on the membership and its audit row in place of the profile role.
 * Changes of form, each kept as strong:
 *   - a role is a staff sub-role with a flag: `admin` is a staff row with the
 *     flag, `staff` one without it;
 *   - the review of WP2c part 1 (WC5, the coordinator's ruling) makes the
 *     command change staff rows only: a change of class is refused, so the
 *     cases that granted `donor` or `missionary` now prove that refusal, and
 *     every other case targets a staff row;
 *   - the platform role a target could hold is now the operator list (record
 *     section 9), so the operator fixture is on the list, with a staff row;
 *   - the cross-organization cases ran on two versions of the retired
 *     function, the chain's final one and stage 1's, re-created inside the
 *     transaction. Both versions are dropped, so the cases run once, on the
 *     command. On the joined WP2b chain, only this tenant's row changes;
 *     another tenant's membership neither grants authority nor bars a change;
 *   - the last case pinned that only `service_role` could execute the
 *     function; it now pins that the function is gone and that the commands
 *     are executed by signed-in users only, never by `service_role`.
 *
 * Runs against the migrated database named by
 * TENANT_GUARD_IT_ADMIN_DATABASE_URL; without it the block skips, except in
 * the CI `migrate` job, where it fails. Every check runs in its own
 * transaction, rolled back.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";

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
    adminProfileOnlyA: randomUUID(),
    flaggedDonorProfileA: randomUUID(),
  };
  type Person = keyof typeof people;
  /** [tenant, profile role, staff row in that tenant: flagged, unflagged or none] */
  const roles: Record<
    Person,
    [string, string, "flagged" | "unflagged" | null]
  > = {
    adminA: [tenantA, "admin", "flagged"],
    secondAdminA: [tenantA, "admin", "flagged"],
    staffA: [tenantA, "staff", "unflagged"],
    donorA: [tenantA, "donor", null],
    operatorA: [tenantA, "super_admin", "unflagged"],
    adminB: [tenantB, "admin", "flagged"],
    adminProfileOnlyA: [tenantA, "admin", "unflagged"],
    flaggedDonorProfileA: [tenantA, "donor", "flagged"],
  };

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  /** One check = one transaction with fresh fixtures, always rolled back. */
  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp0 A', 'wp0-' || $1::text), ($2::uuid, 'wp0 B', 'wp0-' || $2::text)",
        [tenantA, tenantB],
      );
      for (const [key, [tenant, role, staffRow]] of Object.entries(roles)) {
        const id = people[key as Person];
        // The sign-up trigger gives the login a donor membership in the demo
        // tenant; each person here holds a donor row in `tenant` instead.
        await db.query("insert into auth.users (id, email) values ($1, $2)", [
          id,
          `${key}-${id}@example.invalid`,
        ]);
        await db.query("delete from authz.memberships where user_id = $1", [
          id,
        ]);
        await db.query("update public.profiles set role = $2 where id = $1", [
          id,
          role,
        ]);
        await db.query(
          "insert into authz.memberships (user_id, tenant_id, role, is_active) values ($1, $2, 'donor', true)",
          [id, tenant],
        );
        if (staffRow)
          await db.query(
            "insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, 'staff', 'development', $3, true)",
            [id, tenant, staffRow === "flagged"],
          );
      }
      // The platform role a target can hold is the operator list (WP2c).
      await db.query(
        "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acceptance', 'WP0 fixture')",
        [people.operatorA],
      );
      await fn();
    } finally {
      await db.query("rollback");
    }
  }

  /** The id of a person's row of a class in a tenant, live or not. */
  async function rowOf(
    person: Person,
    role: "donor" | "staff",
    tenant = tenantA,
  ) {
    const r = await db.query(
      "select id from authz.memberships where user_id = $1 and tenant_id = $2 and role = $3 order by is_active desc limit 1",
      [people[person], tenant, role],
    );
    return r.rows[0]?.id as string | undefined;
  }

  /**
   * Runs one command on the caller's own token, as PostgREST does, under the
   * caller's staff row in the tenant (or donor row when it has none), and keeps
   * what it wrote until the transaction is rolled back.
   */
  async function asCaller(caller: Person | null, tenant: string, sql: string) {
    const assignment = caller
      ? ((await rowOf(caller, "staff", tenant)) ??
        (await rowOf(caller, "donor", tenant)))
      : undefined;
    await db.query("savepoint call");
    try {
      await db.query("set local role authenticated");
      await db.query(
        `select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true),
                set_config('request.headers', $2, true)`,
        [
          caller
            ? JSON.stringify({ sub: people[caller], role: "authenticated" })
            : "",
          assignment ? JSON.stringify({ "x-asym-assignment": assignment }) : "",
        ],
      );
      const result = await db.query(sql);
      await db.query("reset role");
      await db.query(
        "select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true), set_config('app.current_tenant_id', '', true)",
      );
      await db.query("release savepoint call");
      return {
        code: null,
        message: null,
        result: result.rows[0]?.result as Record<string, unknown> | undefined,
      };
    } catch (error) {
      await db.query("rollback to savepoint call");
      return {
        code: (error as { code?: string }).code ?? String(error),
        message: (error as { message?: string }).message ?? null,
        result: undefined,
      };
    }
  }

  /**
   * A role as WP0 named it, as the command takes it: `admin` is a development
   * staff row with the flag, `staff` a finance staff row without it. (The
   * fixture's staff rows are development rows, so granting `staff` to one is
   * a real change, as it was when the role was a profile column.) `donor` and
   * `missionary` are classes, which the command refuses to change into.
   */
  function asMembership(role: string) {
    if (role === "admin")
      return { role: "staff", staff: "development", admin: true };
    if (role === "staff")
      return { role: "staff", staff: "finance", admin: false };
    return { role, staff: null as string | null, admin: false };
  }

  const lit = (v: string | null) =>
    v === null ? "null" : `'${v.replace(/'/g, "''")}'`;

  /** Changes `target`'s row of `fromClass` (staff unless named) in `tenant` to `role`, as `actor`. */
  async function changeRole(input: {
    actor: Person | null;
    target: Person;
    fromClass?: "donor" | "staff";
    tenant: string;
    role: string;
  }) {
    const kind = input.fromClass ?? "staff";
    const row =
      (await rowOf(input.target, kind, input.tenant)) ??
      (await rowOf(input.target, kind, tenantA)) ??
      (await rowOf(input.target, kind, tenantB));
    const m = asMembership(input.role);
    return asCaller(
      input.actor,
      input.tenant,
      `select public.change_membership_role('${input.tenant}', '${row}', ${lit(m.role)}, ${lit(m.staff)}, ${m.admin}, 'WP0 case') as result`,
    );
  }

  /** A platform operator is not a target. */
  const PROTECTED = "This person's role cannot be changed here";
  /** Nobody changes their own row. */
  const SELF = "Administrators cannot change their own role";
  const CLASS_CHANGE =
    "A role change keeps the row's class: change the sub-role or the administrator flag of a staff row. Give a row of another class by invitation, and end one with revoke_membership";

  /** Gives `person` another membership, beside the ones the fixture made. */
  async function addMembership(
    person: Person,
    tenant: string,
    kind: "staff" | "donor",
    isActive = true,
  ) {
    await db.query(
      "insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active) values ($1, $2, $3::authz.membership_role, $4::authz.staff_role, $5) on conflict do nothing",
      [people[person], tenant, kind, kind === "staff" ? "hr" : null, isActive],
    );
  }

  /** The person's live rows in a tenant, as `role` names: admin, staff, donor or missionary. */
  async function rolesOf(person: Person, tenant = tenantA) {
    const r = await db.query(
      `select case when role = 'staff' and is_tenant_admin then 'admin' else role::text end as r
         from authz.memberships where user_id = $1 and tenant_id = $2 and is_active order by 1`,
      [people[person], tenant],
    );
    return r.rows.map((x) => x.r as string);
  }

  async function membershipsIn(person: Person, tenant: string) {
    return (
      await db.query(
        "select * from authz.memberships where user_id = $1 and tenant_id = $2 order by id",
        [people[person], tenant],
      )
    ).rows;
  }

  async function profileRoleOf(person: Person) {
    const r = await db.query("select role from public.profiles where id = $1", [
      people[person],
    ]);
    return r.rows[0]?.role as string | undefined;
  }

  async function roleChangeAudits(person: Person) {
    const r = await db.query(
      `select tenant_id, user_id, details -> 'from' ->> 'role' as from_role,
              details -> 'to' ->> 'role' as to_role, (details -> 'to' ->> 'is_tenant_admin')::boolean as to_admin
         from public.audit_logs
        where action = 'membership_role_changed' and details ->> 'target_user_id' = $1`,
      [people[person]],
    );
    return r.rows as Array<Record<string, unknown>>;
  }

  it("refuses a staff caller and changes no role", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: "staffA",
        target: "secondAdminA",
        tenant: tenantA,
        role: "staff",
      });
      expect(outcome.code).toBe("42501");
      expect(await rolesOf("secondAdminA")).toEqual(["admin", "donor"]);
      expect(await roleChangeAudits("secondAdminA")).toEqual([]);
    }));

  it("refuses a staff caller promoting themselves to a platform role", () =>
    tx(async () => {
      const outcome = await asCaller(
        "staffA",
        tenantA,
        `select public.change_membership_role('${tenantA}', '${await rowOf("staffA", "staff")}', 'super_admin', null, false, 'x') as result`,
      );
      expect(outcome.code).toBe("42501");
      expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
    }));

  it("refuses an admin of another tenant", () =>
    tx(async () => {
      const outcome = await asCaller(
        "adminB",
        tenantA,
        `select public.change_membership_role('${tenantA}', '${await rowOf("staffA", "staff")}', 'staff', 'development', true, 'x') as result`,
      );
      expect(outcome.code).toBe("42501");
      expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
    }));

  it("refuses a caller with no identity", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: null,
        target: "staffA",
        tenant: tenantA,
        role: "admin",
      });
      expect(outcome.code).toBe("42501");
      expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
    }));

  it("refuses an admin changing their own role", () =>
    tx(async () => {
      for (const [fromClass, role] of [
        ["staff", "staff"],
        ["donor", "donor"],
      ] as const) {
        const outcome = await changeRole({
          actor: "adminA",
          target: "adminA",
          fromClass,
          tenant: tenantA,
          role,
        });
        // The refusal of one's own row, by its message: the donor row would
        // also be refused, with the same code, as a change of class, and that
        // must not stand in for this rule (review 4650094369 on #2741).
        expect([outcome.code, outcome.message]).toEqual(["42501", SELF]);
      }
      expect(await rolesOf("adminA")).toEqual(["admin", "donor"]);
    }));

  it.each(["super_admin", "finance", "delivery", ""])(
    "refuses an admin granting the role %j, which is not a tenant role",
    (role) =>
      tx(async () => {
        const outcome = await asCaller(
          "adminA",
          tenantA,
          `select public.change_membership_role('${tenantA}', '${await rowOf("staffA", "staff")}', ${lit(role)}, null, false, 'x') as result`,
        );
        expect(outcome.code).toBe("42501");
        expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
        expect(await roleChangeAudits("staffA")).toEqual([]);
      }),
  );

  it("refuses an admin changing the role of a platform operator", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: "adminA",
        target: "operatorA",
        tenant: tenantA,
        role: "admin",
      });
      expect([outcome.code, outcome.message]).toEqual(["42501", PROTECTED]);
      expect(await rolesOf("operatorA")).toEqual(["donor", "staff"]);
      expect(await profileRoleOf("operatorA")).toBe("super_admin");
      expect(await roleChangeAudits("operatorA")).toEqual([]);
    }));

  it("reports a member of another tenant as not found", () =>
    tx(async () => {
      const outcome = await asCaller(
        "adminA",
        tenantA,
        `select public.change_membership_role('${tenantA}', '${await rowOf("adminB", "staff", tenantB)}', 'staff', 'finance', false, 'x') as result`,
      );
      expect(outcome.code).toBe("P0002");
      expect(await rolesOf("adminB", tenantB)).toEqual(["admin", "donor"]);
    }));

  it.each(["staff", "admin"])(
    "lets an admin of the tenant grant the tenant role %s to someone else, with an audit row",
    (role) =>
      tx(async () => {
        const outcome = await changeRole({
          actor: "adminA",
          target: "staffA",
          tenant: tenantA,
          role,
        });
        expect(outcome.code, outcome.message ?? "").toBeNull();
        const m = asMembership(role);
        expect(outcome.result).toMatchObject({
          changed: true,
          user_id: people.staffA,
          role: m.role,
          staff_role: m.staff,
          is_tenant_admin: m.admin,
        });
        // The staff row became the role; the donor row stays.
        expect(await rolesOf("staffA")).toEqual([role, "donor"].sort());
        expect(await roleChangeAudits("staffA")).toEqual([
          {
            tenant_id: tenantA,
            user_id: people.adminA,
            from_role: "staff",
            to_role: m.role,
            to_admin: m.admin,
          },
        ]);
        // The profile role is display data now; the command never writes it.
        expect(await profileRoleOf("staffA")).toBe("staff");
      }),
  );

  // WC5: `donor` and `missionary` are classes. A change of class is refused
  // either way, and the rows stay as they were.
  it.each([
    ["donor", "staff"],
    ["missionary", "staff"],
    ["admin", "donor"],
    ["staff", "donor"],
  ] as const)(
    "refuses to give the tenant role %s to the person's %s row, a change of class",
    (role, fromClass) =>
      tx(async () => {
        const target = fromClass === "staff" ? "staffA" : "donorA";
        const before = await rolesOf(target);
        const outcome = await changeRole({
          actor: "adminA",
          target,
          fromClass,
          tenant: tenantA,
          role,
        });
        expect([outcome.code, outcome.message]).toEqual([
          "42501",
          CLASS_CHANGE,
        ]);
        expect(await rolesOf(target)).toEqual(before);
        expect(await roleChangeAudits(target)).toEqual([]);
      }),
  );

  describe("across organizations", () => {
    it.each([
      ["(a) promote a member", "staffA", "staff", "admin"],
      ["(b) demote an administrator", "secondAdminA", "staff", "staff"],
      ["promote a member who is a donor elsewhere", "staffA", "donor", "admin"],
    ] as const)(
      "can %s without changing the other tenant",
      (_case, target, otherClass, role) =>
        tx(async () => {
          await addMembership(target, tenantB, otherClass);
          const before = await membershipsIn(target, tenantB);
          const outcome = await changeRole({
            actor: "adminA",
            target,
            tenant: tenantA,
            role,
          });
          expect(outcome.code, outcome.message ?? "").toBeNull();
          expect(await rolesOf(target)).toEqual(["donor", role].sort());
          expect(await membershipsIn(target, tenantB)).toEqual(before);
          expect(await roleChangeAudits(target)).toEqual([
            {
              tenant_id: tenantA,
              user_id: people.adminA,
              from_role: "staff",
              to_role: "staff",
              to_admin: role === "admin",
            },
          ]);
        }),
    );

    it.each(["staff", "admin"])(
      "(c) still grants %s to someone whose memberships are all in this organization",
      (role) =>
        tx(async () => {
          const tenants = await db.query(
            "select distinct tenant_id from authz.memberships where user_id = $1",
            [people.staffA],
          );
          expect(tenants.rows).toEqual([{ tenant_id: tenantA }]);
          const outcome = await changeRole({
            actor: "adminA",
            target: "staffA",
            tenant: tenantA,
            role,
          });
          expect(outcome.code, outcome.message ?? "").toBeNull();
          const m = asMembership(role);
          const liveStaff = await db.query(
            `select staff_role, is_tenant_admin from authz.memberships
             where user_id = $1 and tenant_id = $2 and role = 'staff'
               and is_active and revoked_at is null`,
            [people.staffA, tenantA],
          );
          expect(liveStaff.rows).toEqual([
            { staff_role: m.staff, is_tenant_admin: m.admin },
          ]);
          expect(await roleChangeAudits("staffA")).toEqual([
            {
              tenant_id: tenantA,
              user_id: people.adminA,
              from_role: "staff",
              to_role: m.role,
              to_admin: m.admin,
            },
          ]);
        }),
    );

    it("(d) does not refuse for an inactive membership in another organization", () =>
      tx(async () => {
        await addMembership("staffA", tenantB, "staff", false);
        const outcome = await changeRole({
          actor: "adminA",
          target: "staffA",
          tenant: tenantA,
          role: "admin",
        });
        expect(outcome.code, outcome.message ?? "").toBeNull();
        expect(await rolesOf("staffA")).toEqual(["admin", "donor"]);
        expect(await roleChangeAudits("staffA")).toEqual([
          {
            tenant_id: tenantA,
            user_id: people.adminA,
            from_role: "staff",
            to_role: "staff",
            to_admin: true,
          },
        ]);
      }));
  });

  // WP2a's own case (council round 2 on WP2a, R8b): the target is another
  // tenant's administrator who also holds a row here.
  it("changes the local row without altering the other tenant's administrator", () =>
    tx(async () => {
      await addMembership("adminB", tenantA, "staff");
      const outcome = await changeRole({
        actor: "adminA",
        target: "adminB",
        tenant: tenantA,
        role: "admin",
      });
      expect(outcome.code, outcome.message ?? "").toBeNull();
      expect(await rolesOf("adminB", tenantB)).toEqual(["admin", "donor"]);
      expect(await rolesOf("adminB")).toEqual(["admin"]);
      expect(await roleChangeAudits("adminB")).toEqual([
        {
          tenant_id: tenantA,
          user_id: people.adminA,
          from_role: "staff",
          to_role: "staff",
          to_admin: true,
        },
      ]);
    }));

  it("lets an admin demote another admin of the same tenant", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: "adminA",
        target: "secondAdminA",
        tenant: tenantA,
        role: "staff",
      });
      expect(outcome.code, outcome.message ?? "").toBeNull();
      expect(await rolesOf("secondAdminA")).toEqual(["donor", "staff"]);
    }));

  it("refuses a caller whose profile role is admin but whose staff row has no flag (WP2a)", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: "adminProfileOnlyA",
        target: "staffA",
        tenant: tenantA,
        role: "admin",
      });
      expect(outcome.code).toBe("42501");
      expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
      expect(await roleChangeAudits("staffA")).toEqual([]);
    }));

  it("admits a flagged staff row whatever the caller's profile role says (WP2a)", () =>
    tx(async () => {
      const outcome = await changeRole({
        actor: "flaggedDonorProfileA",
        target: "staffA",
        tenant: tenantA,
        role: "staff",
      });
      expect(outcome.code, outcome.message ?? "").toBeNull();
      expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
      expect(await roleChangeAudits("staffA")).toEqual([
        {
          tenant_id: tenantA,
          user_id: people.flaggedDonorProfileA,
          from_role: "staff",
          to_role: "staff",
          to_admin: false,
        },
      ]);
    }));

  it("refuses an administrator whose flagged staff row is revoked (WP2a)", () =>
    tx(async () => {
      await db.query(
        "update authz.memberships set is_active = false where user_id = $1 and role = 'staff'",
        [people.adminA],
      );
      const outcome = await changeRole({
        actor: "adminA",
        target: "staffA",
        tenant: tenantA,
        role: "admin",
      });
      expect(outcome.code).toBe("42501");
      expect(await rolesOf("staffA")).toEqual(["donor", "staff"]);
    }));

  it("finds the target by membership when its profile's tenant column names another organization (WP2a)", () =>
    tx(async () => {
      await db.query(
        "update public.profiles set tenant_id = $2 where id = $1",
        [people.staffA, tenantB],
      );
      const outcome = await changeRole({
        actor: "adminA",
        target: "staffA",
        tenant: tenantA,
        role: "admin",
      });
      expect(outcome.code, outcome.message ?? "").toBeNull();
      expect(await rolesOf("staffA")).toEqual(["admin", "donor"]);
    }));

  it("is gone, and its commands are executed by signed-in users only, with a fixed search path", async () => {
    const gone = await db.query(
      "select to_regprocedure('public.atomic_update_user_role_with_audit(uuid,uuid,uuid,text,text,text)') as fn",
    );
    expect(gone.rows).toEqual([{ fn: null }]);
    for (const signature of [
      "public.change_membership_role(uuid,uuid,text,text,boolean,text)",
      "public.revoke_membership(uuid,uuid,text)",
      "tenant_guard.change_membership_role(uuid,uuid,text,text,boolean,text)",
      "tenant_guard.revoke_membership(uuid,uuid,text)",
    ]) {
      const r = await db.query(
        `select p.proconfig,
           array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                 from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                 where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner order by 1) as grantees
         from pg_proc p where p.oid = $1::regprocedure`,
        [signature],
      );
      const row = r.rows[0] as {
        proconfig: string[] | null;
        grantees: string[];
      };
      expect([signature, row.grantees]).toEqual([signature, ["authenticated"]]);
      expect(row.proconfig).toContain('search_path=""');
    }
  });
});
