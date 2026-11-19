/**
 * AL-2675 real-stack acceptance (council round 2 on WP2a, R1; plan 5.1, 5.5,
 * 7.4): the SQL that re-checks an actor the application hands it reads
 * membership, as the application has since WP2a
 * (20261118093000_eve_actor_checks_read_membership.sql).
 *
 * The application sends the actor role `admin` for a live staff row with the
 * tenant-administrator flag, whatever the profile says. Each case is called
 * as the service role, exactly as the application calls the command, with the
 * actor role the application would send. CI's `migrate` job runs this file
 * (tests/unit/acceptance/issue-26[78][0-9]/*.realstack.acceptance.test.ts).
 *
 * Amended by AL-2675 (WP2c, part 1; record section 9 and D-18;
 * 20261119031554_wp2c_eve_actor_checks_operator_list.sql): the three cases
 * that kept the `super_admin` actor on the profile "until WP2c" now prove the
 * operator list and a live row in the tenant, and the triggers on the
 * notification recipients and the two grant tables read membership.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL; without it the block
 * skips, except in the CI `migrate` job, where it fails. Every check runs in
 * its own transaction, rolled back.
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)("Eve actor checks read membership (R1)", () => {
  const db = new pg.Client({ connectionString: ADMIN_URL });
  const TA = randomUUID();
  const TB = randomUUID();
  /** Profile ids equal login ids: the sign-up trigger creates them that way. */
  const people = {
    superAdminFlagged: randomUUID(),
    staffProfileFlagged: randomUUID(),
    otherTenantProfileFlagged: randomUUID(),
    unflagged: randomUUID(),
    adminOfB: randomUUID(),
    revoked: randomUUID(),
    platformOwner: randomUUID(),
    platformOwnerNoTenant: randomUUID(),
  };
  type Person = keyof typeof people;
  /**
   * [profile role, profile tenant column, staff row: tenant, flagged, live].
   * Every login also gets the donor row the sign-up trigger writes in its
   * profile's tenant, except platformOwnerNoTenant, which holds no row.
   */
  const fixture: Record<
    Person,
    [string, string | null, [string, boolean, boolean] | null]
  > = {
    superAdminFlagged: ["super_admin", TA, [TA, true, true]],
    staffProfileFlagged: ["staff", TA, [TA, true, true]],
    otherTenantProfileFlagged: ["admin", TB, [TA, true, true]],
    unflagged: ["admin", TA, [TA, false, true]],
    adminOfB: ["admin", TB, [TB, true, true]],
    revoked: ["admin", TA, [TA, true, false]],
    platformOwner: ["super_admin", TA, null],
    platformOwnerNoTenant: ["super_admin", null, null],
  };

  beforeAll(() => db.connect());
  afterAll(() => db.end());

  async function tx(fn: () => Promise<void>) {
    await db.query("begin");
    try {
      // Hosted Supabase's default privileges give service_role write access
      // to public tables; the compat bootstrap mirrors only SELECT.
      await db.query(
        "grant update on public.profiles to service_role; grant insert on public.audit_logs to service_role",
      );
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'r1 A', 'r1-' || $1::text), ($2::uuid, 'r1 B', 'r1-' || $2::text)",
        [TA, TB],
      );
      for (const [key, [role, tenant, staff]] of Object.entries(fixture)) {
        const id = people[key as Person];
        await db.query(
          "insert into auth.users (id, email, raw_app_meta_data) values ($1, $2, jsonb_build_object('tenant_id', $3::text))",
          [id, `${key}-${id}@example.invalid`, tenant ?? TA],
        );
        await db.query(
          "update public.profiles set role = $2, tenant_id = $3 where id = $1",
          [id, role, tenant],
        );
        if (tenant === null)
          await db.query("delete from authz.memberships where user_id = $1", [
            id,
          ]);
        if (staff) {
          const [staffTenant, flagged, live] = staff;
          await db.query(
            "insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, 'staff', 'development', $3, true)",
            [id, staffTenant, flagged],
          );
          if (!live)
            await db.query(
              "update authz.memberships set is_active = false where user_id = $1 and role = 'staff'",
              [id],
            );
        }
      }
      await fn();
    } finally {
      await db.query("rollback");
    }
  }

  /** Runs `sql` as the service role, as the application does; returns the error, if any. */
  async function asService(sql: string, params: unknown[]) {
    await db.query("savepoint call");
    try {
      await db.query("set local role service_role");
      await db.query(
        `select set_config('request.jwt.claims', '{"role":"service_role"}', true),
                set_config('request.jwt.claim.role', 'service_role', true)`,
      );
      await db.query(sql, params);
      await db.query("reset role");
      await db.query("release savepoint call");
      return null;
    } catch (error) {
      await db.query("rollback to savepoint call");
      await db.query("reset role");
      return (error as { message?: string }).message ?? String(error);
    }
  }

  async function emergencyOff(person: Person, tenant: string, role = "admin") {
    const state = await db.query(
      "select state_version from public.eve_governance_state where id = 'global'",
    );
    return asService(
      `select public.set_eve_release_safety_control($1::uuid, 'emergency_off', $2::bigint,
         'incident drill', gen_random_uuid(), $3::text, $4::uuid, $5::text,
         'authenticated_admin', $3::text)`,
      [
        tenant,
        state.rows[0]!.state_version,
        people[person],
        people[person],
        role,
      ],
    );
  }
  const emergencyIsOff = async () =>
    (
      await db.query(
        "select emergency_off from public.eve_governance_state where id = 'global'",
      )
    ).rows[0]!.emergency_off as boolean;

  const hold = (person: Person, tenant: string, role = "admin") =>
    asService(
      `select public.set_eve_retention_hold($1::uuid, $2::uuid, $3::text,
         'incident', 'category', 'audit_record', 'incident drill')`,
      [tenant, people[person], role],
    );
  /** Puts a person on the platform operator list (WP2c), as the operator script would. */
  const onList = (person: Person) =>
    db.query(
      "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acceptance', 'R1 fixture')",
      [people[person]],
    );
  const holds = async (person: Person) =>
    (
      await db.query(
        "select count(*)::int as n from public.eve_retention_holds where set_by_profile_id = $1",
        [people[person]],
      )
    ).rows[0]!.n as number;

  describe("emergency off (set_eve_release_safety_control)", () => {
    it.each([
      ["a person whose profile role is super_admin", "superAdminFlagged"],
      ["an administrator whose profile role is staff", "staffProfileFlagged"],
      [
        "an administrator whose profile names another tenant",
        "otherTenantProfileFlagged",
      ],
    ] as const)(
      "is engaged by %s who holds a live flagged staff row",
      (_who, person) =>
        tx(async () => {
          expect(await emergencyIsOff()).toBe(false);
          expect(await emergencyOff(person, TA)).toBeNull();
          expect(await emergencyIsOff()).toBe(true);
        }),
    );

    it.each([
      ["a staff row without the flag", "unflagged", TA],
      ["an administrator of another tenant", "adminOfB", TA],
      ["a revoked row", "revoked", TA],
    ] as const)(
      "is refused to %s, and nothing changes",
      (_who, person, tenant) =>
        tx(async () => {
          expect(await emergencyOff(person, tenant)).toMatch(
            /eve_launch_profile_tenant_mismatch/,
          );
          expect(await emergencyIsOff()).toBe(false);
        }),
    );

    // Rewritten by AL-2675 (WP2c, part 1; record section 9 and D-18): the
    // super_admin actor role is a platform operator now. WP2a kept it on the
    // profile's role and tenant until WP2c; it is judged by the operator list
    // and a live row in the tenant, and the profile no longer decides.
    it("judges the super_admin actor role by the operator list and a live row in the tenant (WP2c)", () =>
      tx(async () => {
        // A super_admin profile that is not on the list is refused.
        expect(await emergencyOff("platformOwner", TA, "super_admin")).toMatch(
          /eve_launch_profile_tenant_mismatch/,
        );
        // On the list, with no live row in the tenant: refused.
        await onList("platformOwnerNoTenant");
        expect(
          await emergencyOff("platformOwnerNoTenant", TA, "super_admin"),
        ).toMatch(/eve_launch_profile_tenant_mismatch/);
        expect(await emergencyIsOff()).toBe(false);
        // On the list with a live row there, whatever the profile says.
        await onList("staffProfileFlagged");
        expect(
          await emergencyOff("staffProfileFlagged", TA, "super_admin"),
        ).toBeNull();
        expect(await emergencyIsOff()).toBe(true);
      }));
  });

  describe("a retention hold (set_eve_retention_hold)", () => {
    it.each([
      ["a person whose profile role is super_admin", "superAdminFlagged"],
      ["an administrator whose profile role is staff", "staffProfileFlagged"],
      [
        "an administrator whose profile names another tenant",
        "otherTenantProfileFlagged",
      ],
    ] as const)(
      "is placed by %s who holds a live flagged staff row",
      (_who, person) =>
        tx(async () => {
          expect(await hold(person, TA)).toBeNull();
          expect(await holds(person)).toBe(1);
        }),
    );

    it.each([
      ["a staff row without the flag", "unflagged"],
      ["an administrator of another tenant", "adminOfB"],
      ["a revoked row", "revoked"],
    ] as const)("is refused to %s, and nothing changes", (_who, person) =>
      tx(async () => {
        expect(await hold(person, TA)).toMatch(
          /eve_retention_actor_tenant_mismatch/,
        );
        expect(await holds(person)).toBe(0);
      }),
    );

    // Council round 2 on WP2a, R8a: the person's profile names this tenant,
    // so the old test (`NULL NOT IN (...) OR NOT EXISTS (profile in the
    // tenant)` is `NULL OR false`, which raises nothing) let the call
    // through; only the refusal of a missing role stops it now.
    it("refuses a call that names no actor role, even for a member whose profile names the tenant", () =>
      tx(async () => {
        expect(
          await asService(
            `select public.set_eve_retention_hold($1::uuid, $2::uuid, null,
               'incident', 'category', 'audit_record', 'incident drill')`,
            [TA, people.staffProfileFlagged],
          ),
        ).toMatch(/eve_retention_actor_tenant_mismatch/);
        expect(await holds("staffProfileFlagged")).toBe(0);
      }));

    // Rewritten by AL-2675 (WP2c, part 1; record D-18), as for emergency off.
    it("judges the super_admin actor role by the operator list and a live row in the tenant (WP2c)", () =>
      tx(async () => {
        expect(await hold("platformOwner", TA, "super_admin")).toMatch(
          /eve_retention_actor_tenant_mismatch/,
        );
        await onList("platformOwnerNoTenant");
        expect(await hold("platformOwnerNoTenant", TA, "super_admin")).toMatch(
          /eve_retention_actor_tenant_mismatch/,
        );
        await onList("platformOwner");
        expect(await hold("platformOwner", TA, "super_admin")).toBeNull();
        expect(await holds("platformOwner")).toBe(1);
        expect(await holds("platformOwnerNoTenant")).toBe(0);
      }));
  });

  describe("the policy actor and the assistant-memory owner", () => {
    // Both are executable by their owner only: the commands that reach them
    // (policy approvals, the budget override, the assistant-memory commands)
    // are definers owned by postgres. Call them as the owner.
    async function check(fn: string, person: Person, tenant: string) {
      await db.query("savepoint own");
      try {
        await db.query(`select public.${fn}($1::uuid, $2::uuid)`, [
          tenant,
          people[person],
        ]);
        await db.query("release savepoint own");
        return null;
      } catch (e) {
        await db.query("rollback to savepoint own");
        return (e as { message?: string }).message ?? String(e);
      }
    }

    it.each([
      "assert_eve_policy_actor_tenant",
      "assert_eve_admin_memory_owner",
    ])(
      "%s admits a live member whose profile names another tenant, and refuses a revoked row and a stranger",
      (fn) =>
        tx(async () => {
          expect(await check(fn, "otherTenantProfileFlagged", TA)).toBeNull();
          expect(await check(fn, "unflagged", TA)).toBeNull();
          expect(await check(fn, "adminOfB", TA)).toMatch(/_mismatch/);
          await db.query(
            "update authz.memberships set is_active = false where user_id = $1",
            [people.revoked],
          );
          expect(await check(fn, "revoked", TA)).toMatch(/_mismatch/);
        }),
    );

    // Rewritten by AL-2675 (WP2c, part 1; record D-18). WP2a kept a
    // super_admin profile with no tenant as a policy actor in every tenant
    // until WP2c. The branch is gone, not moved to the operator list: an
    // operator acts in a tenant only through a live row there (plan 12 WP2c,
    // "Nothing in this package admits an operator to a tenant's data"), and a
    // live row passes the membership test already.
    it("no longer admits a platform owner with no row in the tenant as the policy actor, on the operator list or not (WP2c)", () =>
      tx(async () => {
        for (const listed of [false, true]) {
          if (listed) await onList("platformOwnerNoTenant");
          expect(
            await check(
              "assert_eve_policy_actor_tenant",
              "platformOwnerNoTenant",
              TA,
            ),
          ).toMatch(/eve_policy_actor_tenant_mismatch/);
          expect(
            await check(
              "assert_eve_admin_memory_owner",
              "platformOwnerNoTenant",
              TA,
            ),
          ).toMatch(/eve_admin_memory_owner_tenant_mismatch/);
        }
        // A super_admin profile with a live row in the tenant passes by the row.
        expect(
          await check("assert_eve_policy_actor_tenant", "platformOwner", TA),
        ).toBeNull();
      }));
  });

  // AL-2675 (WP2c, part 1; record section 9): the three triggers that judged
  // a person by the profile's role or tenant read membership. The recipient
  // rule is the one the application already applies (a live tenant
  // administrator with an email), opened in the same release as the
  // recipient PATCH, whose gate moves to the operator check.
  describe("the notification recipient and the two grant tables (WP2c)", () => {
    async function write(sql: string, params: unknown[]) {
      await db.query("savepoint w");
      try {
        await db.query(sql, params);
        await db.query("release savepoint w");
        return null;
      } catch (e) {
        await db.query("rollback to savepoint w");
        return (e as { message?: string }).message ?? String(e);
      }
    }
    const recipient = (person: Person, tenant = TA) =>
      write(
        "insert into public.eve_notification_recipient_configs (tenant_id, profile_id) values ($1, $2)",
        [tenant, people[person]],
      );
    const aiGrant = (person: Person, tenant = TA) =>
      write(
        "insert into public.eve_ai_settings_grants (tenant_id, profile_id) values ($1, $2)",
        [tenant, people[person]],
      );
    const policyGrant = (person: Person, granter: Person, tenant = TA) =>
      write(
        "insert into public.eve_policy_permission_grants (tenant_id, profile_id, permission, granted_by_profile_id) values ($1, $2, 'approval.policy.manage', $3)",
        [tenant, people[person], people[granter]],
      );

    it("admits as a notification recipient a live administrator of the tenant with an email, whatever the profile says", () =>
      tx(async () => {
        for (const person of [
          "staffProfileFlagged",
          "otherTenantProfileFlagged",
          "superAdminFlagged",
        ] as const)
          expect([person, await recipient(person)]).toEqual([person, null]);
      }));

    it("refuses as a notification recipient a super_admin profile, an operator, a member without the flag, a revoked row, another tenant's administrator, and one with no email", () =>
      tx(async () => {
        await onList("platformOwner");
        await db.query(
          "update public.profiles set email = null where id = $1",
          [people.staffProfileFlagged],
        );
        for (const person of [
          "platformOwner",
          "unflagged",
          "revoked",
          "adminOfB",
          "staffProfileFlagged",
        ] as const)
          expect([person, await recipient(person)]).toEqual([
            person,
            expect.stringMatching(/eve_notification_platform_owner_required/),
          ]);
      }));

    /** Revokes every row of the `revoked` person, whose donor row the sign-up trigger left live. */
    const revokeAll = () =>
      db.query(
        "update authz.memberships set is_active = false where user_id = $1",
        [people.revoked],
      );

    it("admits an AI-settings grant for a live member of the tenant, and refuses one for a person with no live row there", () =>
      tx(async () => {
        await revokeAll();
        expect(await aiGrant("otherTenantProfileFlagged")).toBeNull();
        expect(await aiGrant("unflagged")).toBeNull();
        for (const person of [
          "adminOfB",
          "revoked",
          "platformOwnerNoTenant",
        ] as const)
          expect([person, await aiGrant(person)]).toEqual([
            person,
            expect.stringMatching(
              /eve_ai_settings_grant_profile_tenant_mismatch/,
            ),
          ]);
      }));

    // As WP2a's contribution triggers do (NR-49): a reference an update leaves
    // unchanged is not judged again, so a later revocation never freezes a
    // grant, which must stay possible to switch off.
    it("lets a grant of a person revoked since be switched off, and judges a changed grantee again", () =>
      tx(async () => {
        expect(await aiGrant("unflagged")).toBeNull();
        expect(
          await policyGrant("unflagged", "staffProfileFlagged"),
        ).toBeNull();
        await db.query(
          "update authz.memberships set is_active = false where user_id = $1",
          [people.unflagged],
        );
        expect(
          await write(
            "update public.eve_ai_settings_grants set is_active = false where profile_id = $1",
            [people.unflagged],
          ),
        ).toBeNull();
        expect(
          await write(
            "update public.eve_policy_permission_grants set is_active = false where profile_id = $1",
            [people.unflagged],
          ),
        ).toBeNull();
        expect(
          await write(
            "update public.eve_ai_settings_grants set profile_id = $2 where profile_id = $1",
            [people.unflagged, people.adminOfB],
          ),
        ).toMatch(/eve_ai_settings_grant_profile_tenant_mismatch/);
      }));

    it("admits a policy-permission grant when the grantee and the granter are live members of the tenant, and refuses it otherwise", () =>
      tx(async () => {
        await revokeAll();
        expect(
          await policyGrant("otherTenantProfileFlagged", "staffProfileFlagged"),
        ).toBeNull();
        for (const [grantee, granter] of [
          ["adminOfB", "staffProfileFlagged"],
          ["unflagged", "adminOfB"],
          ["revoked", "staffProfileFlagged"],
        ] as const)
          expect([
            grantee,
            granter,
            await policyGrant(grantee, granter),
          ]).toEqual([
            grantee,
            granter,
            expect.stringMatching(
              /eve_policy_permission_profile_tenant_mismatch/,
            ),
          ]);
      }));
  });

  describe("a person's own profile edit (atomic_update_profile_with_audit)", () => {
    const edit = (person: Person, tenant: string) =>
      asService(
        `select public.atomic_update_profile_with_audit($1::uuid, $2::uuid, $1::uuid,
           '{"first_name": "Edited"}'::jsonb)`,
        [people[person], tenant],
      );
    const firstName = async (person: Person) =>
      (
        await db.query("select first_name from public.profiles where id = $1", [
          people[person],
        ])
      ).rows[0]!.first_name as string | null;

    it("edits the profile of a live member whose profile names another tenant", () =>
      tx(async () => {
        expect(await edit("otherTenantProfileFlagged", TA)).toBeNull();
        expect(await firstName("otherTenantProfileFlagged")).toBe("Edited");
      }));

    it("reports the profile of someone with no live row in the tenant as not found", () =>
      tx(async () => {
        expect(await edit("adminOfB", TA)).toMatch(/Profile not found/);
        expect(await firstName("adminOfB")).not.toBe("Edited");
      }));

    // Council round 2 on WP2a, R8c: the profile still names the tenant, so
    // the old test (the profile's tenant column) let a revoked member edit.
    it("refuses a person whose membership in the tenant is revoked", () =>
      tx(async () => {
        await db.query(
          "update authz.memberships set is_active = false where user_id = $1",
          [people.revoked],
        );
        expect(await edit("revoked", TA)).toMatch(/Profile not found/);
        expect(await firstName("revoked")).not.toBe("Edited");
      }));
  });
});
