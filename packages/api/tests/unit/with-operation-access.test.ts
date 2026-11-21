/**
 * AL-2675 (WP2a sweep): `withOperation` gates on a registry capability, the
 * tenant-administrator flag or a membership class. The real gate functions
 * run; only the verified session and the admin client are stubbed.
 */
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withOperation } from "../../src/shared/with-operation";

import type * as AuthModule from "@asym/auth/context";
import type { AuthContext } from "@asym/auth/context";
import type { AuthMembership } from "@asym/auth/permissions";

const h = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({ client: {}, error: null })),
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({})),
}));

vi.mock("../../src/shared/request-session-client", () => ({
  createRequestSessionClient: vi.fn(async () => ({})),
}));

const TENANT = "00000000-0000-4000-8000-0000000000a1";

function context(membership: Partial<AuthMembership> | null): AuthContext {
  const memberships: AuthMembership[] = membership
    ? [
        {
          tenantId: TENANT,
          role: "staff",
          staffRole: "development",
          isActive: true,
          isTenantAdmin: false,
          ...membership,
        },
      ]
    : [];
  return {
    userId: "00000000-0000-4000-8000-0000000000b1",
    email: null,
    tenantId: TENANT,
    role: membership?.isTenantAdmin ? "admin" : (membership?.role ?? "staff"),
    assignment: membership
      ? {
          assignmentId: "00000000-0000-4000-8000-000000000001",
          tenantId: TENANT,
          userId: "00000000-0000-4000-8000-0000000000b1",
          membershipRole: membership.role ?? "staff",
          staffRole:
            membership.staffRole === undefined
              ? "development"
              : membership.staffRole,
          isTenantAdmin: membership.isTenantAdmin ?? false,
          revision: "1",
        }
      : null,
    memberships,
    profileId: "00000000-0000-4000-8000-0000000000c1",
    isAuthenticated: true,
  };
}

const request = () => new NextRequest("https://admin.example.test/api/x");
const ok = vi.fn(async () => NextResponse.json({ ok: true }));

async function status(
  options: Parameters<typeof withOperation>[1],
  auth: AuthContext,
) {
  h.auth.mockResolvedValue(auth);
  return (await withOperation(ok, options)(request())).status;
}

beforeEach(() => vi.clearAllMocks());

describe("withOperation access options (AL-2675)", () => {
  it("does not run the caller handler without a resolved assignment", async () => {
    expect(await status({}, context(null))).toBe(403);
    expect(ok).not.toHaveBeenCalled();
  });
  it("capability: admits a holder and refuses a row whose bundle lacks it", async () => {
    const gate = { capability: "contributions.apply_corrections" } as const;
    expect(await status(gate, context({ staffRole: "finance" }))).toBe(200);
    expect(await status(gate, context({ staffRole: "mobilizer" }))).toBe(403);
    expect(
      await status(gate, context({ role: "donor", staffRole: null })),
    ).toBe(403);
  });

  it("tenantAdministrator: admits only the flagged staff row", async () => {
    const gate = { tenantAdministrator: true } as const;
    expect(await status(gate, context({ isTenantAdmin: true }))).toBe(200);
    expect(await status(gate, context({ isTenantAdmin: false }))).toBe(403);
  });

  it("roleClasses: admits a live membership of a listed class", async () => {
    const gate = { roleClasses: ["donor", "staff"] } as const;
    expect(
      await status(gate, context({ role: "donor", staffRole: null })),
    ).toBe(200);
    expect(await status(gate, context({}))).toBe(200);
    expect(
      await status(gate, context({ role: "missionary", staffRole: null })),
    ).toBe(403);
  });

  it("an unauthenticated caller gets 401 under every option", async () => {
    const anonymous: AuthContext = {
      ...context(null),
      isAuthenticated: false,
      userId: null,
      role: null,
    };
    for (const gate of [
      { capability: "admin.dashboard.access" as const },
      { tenantAdministrator: true as const },
      { roleClasses: ["staff" as const] },
    ]) {
      expect(await status(gate, anonymous)).toBe(401);
    }
    expect(ok).not.toHaveBeenCalled();
  });
});
