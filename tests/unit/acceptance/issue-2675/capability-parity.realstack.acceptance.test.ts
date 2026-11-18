/**
 * AL-2675 real-stack acceptance (WP2a; plan 5.1 "Capabilities", 5.4; audit
 * B05, A06): the SQL capability function `authz.assignment_capabilities` and
 * the code registry (`packages/auth/capabilities`) return the same
 * capabilities for every grant subject, that is for every bundle a subject
 * holds, and for the tenant-administrator flag on each staff sub-role. Each
 * new capability of 5.4 is held by its default holder and refused to a
 * sub-role that is not one, in both.
 *
 * Runs against TENANT_GUARD_IT_ADMIN_DATABASE_URL (see ./harness.ts).
 */
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";
import {
  CAPABILITY_BUNDLES,
  ROLE_DEFAULT_BUNDLES,
} from "../../../../packages/auth/capabilities/bundles";
import { resolveAssignmentCapabilities } from "../../../../packages/auth/capabilities/effective-capabilities";
import { CAPABILITY_REGISTRY } from "../../../../packages/auth/capabilities/registry";

import type { MembershipRole, StaffSubrole } from "@asym/database/types";

const SUBROLES: StaffSubrole[] = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
];

/** Every assignment shape a membership row can take, with the flag on staff rows. */
const SHAPES: {
  label: string;
  role: MembershipRole;
  staffRole: StaffSubrole | null;
  isTenantAdmin: boolean;
}[] = [
  {
    label: "member:donor",
    role: "donor",
    staffRole: null,
    isTenantAdmin: false,
  },
  {
    label: "member:missionary",
    role: "missionary",
    staffRole: null,
    isTenantAdmin: false,
  },
  ...SUBROLES.flatMap((s) =>
    [false, true].map((isTenantAdmin) => ({
      label: `staff:${s}${isTenantAdmin ? " + tenant_admin" : ""}`,
      role: "staff" as const,
      staffRole: s,
      isTenantAdmin,
    })),
  ),
];

/** Plan 5.4: each new capability and its default holders. */
const NEW_CAPABILITIES: Record<
  string,
  (shape: (typeof SHAPES)[number]) => boolean
> = {
  "people.manage_members": (s) => s.isTenantAdmin,
  "people.erase": (s) => s.isTenantAdmin,
  "sites.manage": (s) => s.isTenantAdmin,
  "payments.manage_account": (s) => s.isTenantAdmin,
  "web_studio.edit": (s) => s.role === "staff",
  "web_studio.publish": (s) => s.staffRole === "development" || s.isTenantAdmin,
  "updates.review": (s) => s.role === "staff",
  "safety.restrict_publication": (s) => s.isTenantAdmin,
  "care.access": (s) => s.staffRole === "member_care",
  "imports.commit": (s) => s.isTenantAdmin,
};

const registryFor = (shape: (typeof SHAPES)[number], tenantId: string) => [
  ...resolveAssignmentCapabilities({
    assignmentId: randomUUID(),
    tenantId,
    membershipRole: shape.role,
    staffRole: shape.staffRole,
    isTenantAdmin: shape.isTenantAdmin,
  }),
];

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe("the registry's subjects (no database)", () => {
  it("retires platform_admin and gives the flag the contribution-settings bundle", () => {
    expect(Object.keys(ROLE_DEFAULT_BUNDLES).sort()).toEqual(
      [
        "member:donor",
        "member:missionary",
        ...SUBROLES.map((s) => `staff:${s}`),
        "tenant_admin",
      ].sort(),
    );
    expect(ROLE_DEFAULT_BUNDLES.tenant_admin).toContain("contribution_admin");
    expect(CAPABILITY_BUNDLES.contribution_admin).toContain(
      "contributions.manage_settings",
    );
  });

  it("gives each staff sub-role a bundle of its own (B05)", () => {
    const own = SUBROLES.map((s) =>
      ROLE_DEFAULT_BUNDLES[`staff:${s}`].filter((b) => b !== "staff_base"),
    );
    expect(own).toEqual(SUBROLES.map((s) => [`staff_${s}`]));
  });

  it("registers every new capability of plan 5.4", () => {
    for (const capability of Object.keys(NEW_CAPABILITIES))
      expect(Object.keys(CAPABILITY_REGISTRY)).toContain(capability);
  });
});

describe.skipIf(!ADMIN_URL)(
  "AL-2675 SQL capability function and registry (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const tenant = randomUUID();
    const sql: Record<string, string[]> = {};

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(
        "insert into public.tenants (id, name, slug) values ($1, 'acc2675 parity', $2)",
        [tenant, `acc2675-parity-${tenant}`],
      );
      for (const shape of SHAPES) {
        const user = randomUUID();
        await db.query("insert into auth.users (id) values ($1)", [user]);
        await db.query("delete from authz.memberships where user_id = $1", [
          user,
        ]);
        await db.query(
          `insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
           values ($1, $2, $3, $4, $5)`,
          [user, tenant, shape.role, shape.staffRole, shape.isTenantAdmin],
        );
        const again = await db.query(
          "select authz.assignment_capabilities(id) caps from authz.memberships where user_id = $1",
          [user],
        );
        sql[shape.label] = again.rows[0].caps as string[];
      }
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    it.each(SHAPES.map((s) => [s.label, s] as const))(
      "%s: the SQL function equals the registry",
      (label, shape) => {
        expect(sql[label]).toEqual(registryFor(shape, tenant));
      },
    );

    it.each(Object.entries(NEW_CAPABILITIES))(
      "%s is held by its default holders and refused to every other sub-role",
      (capability, holds) => {
        for (const shape of SHAPES) {
          const expected = holds(shape);
          expect(sql[shape.label]!.includes(capability), shape.label).toBe(
            expected,
          );
          expect(
            registryFor(shape, tenant).includes(capability),
            shape.label,
          ).toBe(expected);
        }
      },
    );

    it("a tenant administrator holds contributions.manage_settings; staff without the flag do not", () => {
      for (const shape of SHAPES)
        expect(
          sql[shape.label]!.includes("contributions.manage_settings"),
          shape.label,
        ).toBe(shape.isTenantAdmin);
    });

    it("no subject can approve a widening (no holder until Phase 12)", () => {
      for (const shape of SHAPES)
        expect(sql[shape.label]).not.toContain("permissions.approve_widening");
    });
  },
);
