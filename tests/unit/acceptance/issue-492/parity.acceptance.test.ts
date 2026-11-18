/** #492 done criteria 4, 5: parity with the incumbent resolvers (spec r1). Owned by Acceptance.
 * Amended by AL-2675 (WP2a): `platform_admin` is retired with `super_admin`, and
 * the incumbent table gives an administrator the contribution-settings set the
 * registry's `tenant_admin` now holds. The WP2a sweep (AL-2675) retired the
 * incumbent table: `resolveContributionCapabilities` reads the registry by the
 * one selected membership. Criterion 4 therefore pins that the contribution
 * projection of each selected row equals its registry subject's, and the
 * administrator fixture is the flagged staff row (a role name alone resolves
 * nothing), so the comparison stays exact per fixture.
 * Amended by AL-2675 (council round 1 on WP2a, F12): `STAFF_SUBROLE_CAPABILITIES`
 * is retired, because nothing but tests used it and plan 5.1 allows one
 * capability vocabulary. Criterion 5 compares each sub-role's `staff_base`
 * projection with the incumbent set itself, the harness's `STAFF` (the four
 * `admin.*` capabilities the map gave every sub-role), as strictly as before. */
import { describe, expect, it } from "vitest";

import {
  BUNDLES,
  CONTRIB,
  STAFF,
  SUBROLES,
  T,
  assignment,
  ctx,
  load,
  resolveFor,
  sorted,
} from "./harness";
import { resolveContributionCapabilities } from "../../../../packages/api/src/admin/contribution-operations/permissions";

import type { AuthenticatedContext } from "@asym/auth/context";

type Membership = AuthenticatedContext["memberships"][number];
const m = (role: string, staffRole: string | null = null) =>
  ({
    tenantId: T,
    role,
    staffRole,
    isActive: true,
    isTenantAdmin: false,
  }) as Membership;
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
  [
    "tenant administrator (flagged staff row)",
    auth("admin", { ...m("staff", "development"), isTenantAdmin: true }),
    "tenant_admin",
  ],
  ["donor", auth("donor", m("donor")), "member:donor"],
  ["missionary", auth("missionary", m("missionary")), "member:missionary"],
];

describe("#492 criterion 4: contribution parity for single-hat fixtures", () => {
  it.each(FIXTURES)("criterion 4: %s matches %s", async (_name, a, subject) => {
    const mine = (await resolveFor(subject)).filter((c) => CONTRIB.includes(c));
    expect(new Set(mine)).toEqual(new Set(resolveContributionCapabilities(a)));
  });

  it("criterion 4 pin (Samson, 6388725367): staff with no subrole resolves to exactly donor_care, as today", async () => {
    const { resolveEffectiveCapabilities: r } = await load(
      "effective-capabilities",
    );
    const out = r(ctx(assignment("staff", null)));
    expect(out).toEqual(sorted(BUNDLES.donor_care!));
    const today = resolveContributionCapabilities(auth("staff", m("staff")));
    expect(new Set(out)).toEqual(new Set(today));
  });
});

describe("#492 criterion 5: staff_base parity with the incumbent staff set", () => {
  it.each(SUBROLES)("criterion 5: staff:%s", async (s) => {
    const { CAPABILITY_BUNDLES: B } = await load("bundles");
    const mine = (await resolveFor(`staff:${s}`)).filter((c) =>
      B.staff_base.includes(c),
    );
    expect(new Set(mine)).toEqual(new Set(STAFF));
  });
});
