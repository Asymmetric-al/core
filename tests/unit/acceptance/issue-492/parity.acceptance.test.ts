/** #492 done criteria 4, 5: parity with the incumbent resolvers (spec r1). Owned by Acceptance. */
import { describe, expect, it } from "vitest";

import { CONTRIB, STAFF, SUBROLES, T, load, resolveFor } from "./harness";
import { resolveContributionCapabilities } from "../../../../packages/api/src/admin/contribution-operations/permissions";
import { STAFF_SUBROLE_CAPABILITIES } from "../../../../packages/auth/permissions";

import type { AuthenticatedContext } from "@asym/auth/context";

type Membership = AuthenticatedContext["memberships"][number];
const m = (role: string, staffRole: string | null = null) =>
  ({ tenantId: T, role, staffRole, isActive: true }) as Membership;
const auth = (
  role: AuthenticatedContext["role"],
  ...memberships: Membership[]
) =>
  ({
    userId: "u",
    email: null,
    tenantId: T,
    profileId: "p",
    role,
    profileRole: role,
    memberships,
    isAuthenticated: true,
  }) as AuthenticatedContext;

/** Single-hat incumbent fixture -> [auth, matching registry subject] (criterion 4 table). */
const FIXTURES: [string, AuthenticatedContext, string][] = [
  ...SUBROLES.map((s): [string, AuthenticatedContext, string] => [
    `staff/${s}`,
    auth("staff", m("staff", s)),
    `staff:${s}`,
  ]),
  ["profileRole admin", auth("admin"), "tenant_admin"],
  ["profileRole super_admin", auth("super_admin"), "platform_admin"],
  ["donor", auth("donor", m("donor")), "member:donor"],
  ["missionary", auth("missionary", m("missionary")), "member:missionary"],
];

describe("#492 criterion 4: contribution parity for single-hat fixtures", () => {
  it.each(FIXTURES)("criterion 4: %s matches %s", async (_name, a, subject) => {
    const mine = (await resolveFor(subject)).filter((c) => CONTRIB.includes(c));
    expect(new Set(mine)).toEqual(new Set(resolveContributionCapabilities(a)));
  });
});

describe("#492 criterion 5: staff_base parity with STAFF_SUBROLE_CAPABILITIES", () => {
  it.each(SUBROLES)("criterion 5: staff:%s", async (s) => {
    const { CAPABILITY_BUNDLES: B } = await load("bundles");
    const mine = (await resolveFor(`staff:${s}`)).filter((c) =>
      B.staff_base.includes(c),
    );
    const incumbent =
      STAFF_SUBROLE_CAPABILITIES[s as keyof typeof STAFF_SUBROLE_CAPABILITIES];
    expect(new Set(mine)).toEqual(new Set(incumbent));
    expect(new Set(incumbent)).toEqual(new Set(STAFF));
  });
});
