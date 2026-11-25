import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DEMO_TENANT_ID } from "../../../packages/auth/constants";
import {
  createE2EAuthCookieValue,
  E2E_BYPASS_ASSIGNMENT_ID,
  parseE2EAuthCookieValue,
  type E2EAuthMembership,
} from "../../../packages/auth/e2e-auth";
import { listE2EAuthAssignments } from "../../../packages/auth/principal/e2e-assignments";

const SECOND_TENANT = "00000000-0000-0000-0000-000000000002";
const FINANCE: E2EAuthMembership = {
  id: "00000000-0000-4000-8000-0000000e2e01",
  tenantId: DEMO_TENANT_ID,
  role: "staff",
  staffRole: "finance",
  isTenantAdmin: false,
};
const CARE: E2EAuthMembership = {
  ...FINANCE,
  id: "00000000-0000-4000-8000-0000000e2e02",
  staffRole: "member_care",
};

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSecret = process.env.E2E_AUTH_SECRET;

beforeEach(() => {
  // The placeholder datasource uses the public fallback key, as Playwright does.
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  delete process.env.E2E_AUTH_SECRET;
});

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  if (originalSecret === undefined) delete process.env.E2E_AUTH_SECRET;
  else process.env.E2E_AUTH_SECRET = originalSecret;
});

describe("E2E bypass sessions with several memberships (AL-2675)", () => {
  it("signs and returns the memberships a session names", async () => {
    const value = await createE2EAuthCookieValue({
      userId: "e2e-two-rows-user",
      role: "staff",
      tenantId: DEMO_TENANT_ID,
      memberships: [FINANCE, CARE],
    });
    const session = await parseE2EAuthCookieValue(value);
    expect(session?.memberships).toEqual([FINANCE, CARE]);
    expect(listE2EAuthAssignments(session!)).toEqual([
      {
        assignmentId: FINANCE.id,
        userId: "e2e-two-rows-user",
        tenantId: DEMO_TENANT_ID,
        revision: "e2e-bypass",
        membershipRole: "staff",
        staffRole: "finance",
        isTenantAdmin: false,
      },
      {
        assignmentId: CARE.id,
        userId: "e2e-two-rows-user",
        tenantId: DEMO_TENANT_ID,
        revision: "e2e-bypass",
        membershipRole: "staff",
        staffRole: "member_care",
        isTenantAdmin: false,
      },
    ]);
  });

  it.each([
    ["a non-UUID id", { ...FINANCE, id: "row-1" }],
    ["a non-UUID tenant", { ...FINANCE, tenantId: "demo" }],
    ["a staff row without a sub-role", { ...FINANCE, staffRole: null }],
    ["a donor row with a sub-role", { ...FINANCE, role: "donor" }],
    [
      "a flagged donor row",
      { ...FINANCE, role: "donor", staffRole: null, isTenantAdmin: true },
    ],
    ["an unknown sub-role", { ...FINANCE, staffRole: "admin" }],
  ])("refuses the whole session for %s", async (_label, membership) => {
    const value = await createE2EAuthCookieValue({
      userId: "e2e-bad-user",
      role: "staff",
      tenantId: DEMO_TENANT_ID,
      memberships: [membership as E2EAuthMembership],
    });
    await expect(parseE2EAuthCookieValue(value)).resolves.toBeNull();
  });

  it("gives a session without a list the one membership its role implies, in its own canonical tenant only (AL-2676)", () => {
    expect(
      listE2EAuthAssignments({
        userId: "e2e-admin-user",
        role: "admin",
        tenantId: SECOND_TENANT,
      }),
    ).toEqual([
      {
        assignmentId: E2E_BYPASS_ASSIGNMENT_ID,
        userId: "e2e-admin-user",
        tenantId: SECOND_TENANT,
        revision: "e2e-bypass",
        membershipRole: "staff",
        staffRole: "development",
        isTenantAdmin: true,
      },
    ]);
    expect(
      listE2EAuthAssignments({
        userId: "e2e-missionary-user",
        role: "missionary",
        tenantId: null,
      }),
    ).toEqual([]);
  });
});
