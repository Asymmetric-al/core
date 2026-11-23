import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const ADMIN_ROW = "00000000-0000-4000-8000-00000000a0a1";
const STAFF_ROW = "00000000-0000-4000-8000-00000000a0a2";
const TARGET_ROW = "00000000-0000-4000-8000-00000000a0a3";
const INV_ID = "00000000-0000-4000-8000-00000000b0b1";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  session: vi.fn(),
  serviceKeyUsed: vi.fn(),
  captureError: vi.fn(),
  auditLog: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: new Proxy(
      {},
      {
        get: (_target, key) => {
          h.serviceKeyUsed(String(key));
          throw new Error(`service-key client used: ${String(key)}`);
        },
      },
    ),
    error: null,
  }),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: h.auditLog,
  })),
}));

vi.mock("@asym/lib/monitoring/sentry", () => ({
  captureError: h.captureError,
}));

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<
      typeof import("../../../../../packages/api/src/shared/request-session-client")
    >()),
    createRequestSessionClient: h.session,
  }),
);

import {
  GET as invitationsGET,
  POST as invitationsPOST,
} from "../../../../../packages/api/src/admin/members/invitations";
import { POST as revokeMembershipPOST } from "../../../../../packages/api/src/admin/members/revoke";
import { POST as revokeInvitationPOST } from "../../../../../packages/api/src/admin/members/revoke-invitation";
import { POST as changeRolePOST } from "../../../../../packages/api/src/admin/members/role";
import { GET as usersGET } from "../../../../../packages/api/src/admin/users";

function makeAuth(
  membershipRole: "staff" | "missionary" | "donor",
  opts?: {
    staffRole?: "development" | "finance" | null;
    isTenantAdmin?: boolean;
  },
): AuthContext {
  const isTenantAdmin = opts?.isTenantAdmin ?? false;
  const staffRole =
    membershipRole === "staff" ? (opts?.staffRole ?? "development") : null;
  const assignmentId = isTenantAdmin ? ADMIN_ROW : STAFF_ROW;
  return {
    userId: "00000000-0000-4000-9000-000000000001",
    email: "member@example.org",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : membershipRole,
    memberships: [
      {
        tenantId: TENANT,
        role: membershipRole,
        staffRole,
        isActive: true,
        isTenantAdmin,
      },
    ],
    assignment: {
      assignmentId,
      userId: "00000000-0000-4000-9000-000000000001",
      tenantId: TENANT,
      revision: "1",
      membershipRole,
      staffRole,
      isTenantAdmin,
    },
    assignmentDenial: null,
    profileId: "00000000-0000-4000-8000-000000000001",
    isAuthenticated: true,
  } as AuthContext;
}

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`https://admin.example.test${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer member-command-fixture",
    },
    body: JSON.stringify(body),
  });
}

describe("AL-2676 WP3c item 7: member directory access and member management command routes", () => {
  beforeEach(() => {
    h.auth.mockReset();
    h.session.mockReset();
    h.serviceKeyUsed.mockReset();
    h.captureError.mockReset();
    h.auditLog.mockReset();
  });

  it("R3: opens GET /api/admin/users to all live staff assignments and refuses missionary and donor sessions", async () => {
    const query = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    h.session.mockResolvedValue({ rpc: vi.fn().mockReturnValue(query) });

    h.auth.mockResolvedValue(makeAuth("staff", { isTenantAdmin: false }));
    const staffRes = await usersGET(
      new NextRequest("https://admin.example.test/api/admin/users?limit=50", {
        headers: { authorization: "Bearer member-command-fixture" },
      }),
    );
    expect(staffRes.status).toBe(200);

    for (const deniedRole of ["missionary", "donor"] as const) {
      h.auth.mockResolvedValue(makeAuth(deniedRole));
      const deniedRes = await usersGET(
        new NextRequest("https://admin.example.test/api/admin/users?limit=50", {
          headers: { authorization: "Bearer member-command-fixture" },
        }),
      );
      expect(deniedRes.status, deniedRole).toBe(403);
    }
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("refuses a non-admin staff member on every member-management route", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", { isTenantAdmin: false }));
    const rpc = vi.fn();
    h.session.mockResolvedValue({ rpc });

    expect(
      (
        await invitationsGET(
          new NextRequest(
            "https://admin.example.test/api/admin/members/invitations",
            { headers: { authorization: "Bearer member-command-fixture" } },
          ),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await invitationsPOST(
          jsonRequest("/api/admin/members/invitations", {
            email: "new@example.org",
            role: "staff",
            staffRole: "finance",
            isTenantAdmin: false,
            reason: "Onboarding",
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await revokeInvitationPOST(
          jsonRequest(`/api/admin/members/invitations/${INV_ID}/revoke`, {
            reason: "Mistyped",
          }),
          { params: Promise.resolve({ invitationId: INV_ID }) },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await changeRolePOST(
          jsonRequest("/api/admin/members/role", {
            membershipId: TARGET_ROW,
            role: "staff",
            staffRole: "finance",
            isTenantAdmin: false,
            reason: "Reassigned",
            expectedUpdatedAt: "2026-11-23T09:00:00.000Z",
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await revokeMembershipPOST(
          jsonRequest("/api/admin/members/revoke", {
            membershipId: TARGET_ROW,
            reason: "Departed",
          }),
        )
      ).status,
    ).toBe(403);

    expect(rpc).not.toHaveBeenCalled();
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("executes invite, list invitations, revoke invitation, change role (with p_expected_updated_at), and revoke membership on sessionClient for admins", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", { isTenantAdmin: true }));

    const rpc = vi.fn(async (fn: string) => {
      if (fn === "tenant_membership_invitations") {
        return {
          data: [
            {
              id: INV_ID,
              tenant_id: TENANT,
              email: "new@example.org",
              role: "staff",
              staff_role: "finance",
              is_tenant_admin: false,
              purpose: "member_invite",
              delivery_mode: "email",
              status: "issued",
              expires_at: "2026-11-30T00:00:00.000Z",
              created_at: "2026-11-23T00:00:00.000Z",
            },
          ],
          error: null,
        };
      }
      if (fn === "invite_member") {
        return {
          data: {
            invitation_id: INV_ID,
            tenant_id: TENANT,
            selector: "a".repeat(32),
            verifier: "b".repeat(43),
            expires_at: "2026-11-30T00:00:00.000Z",
            role: "staff",
            staff_role: "finance",
            is_tenant_admin: false,
          },
          error: null,
        };
      }
      if (fn === "revoke_membership_invitation") {
        return {
          data: {
            invitation_id: INV_ID,
            tenant_id: TENANT,
            status: "revoked",
            revoked_at: "2026-11-23T09:05:00.000Z",
          },
          error: null,
        };
      }
      if (fn === "change_membership_role") {
        return {
          data: {
            changed: true,
            tenant_id: TENANT,
            membership_id: TARGET_ROW,
            role: "staff",
            staff_role: "hr",
            is_tenant_admin: true,
            updated_at: "2026-11-23T09:06:00.000Z",
          },
          error: null,
        };
      }
      if (fn === "revoke_membership") {
        return {
          data: {
            changed: true,
            tenant_id: TENANT,
            membership_id: TARGET_ROW,
            revoked_at: "2026-11-23T09:07:00.000Z",
          },
          error: null,
        };
      }
      return { data: null, error: { message: `unexpected rpc ${fn}` } };
    });
    h.session.mockResolvedValue({ rpc });

    const listRes = await invitationsGET(
      new NextRequest(
        "https://admin.example.test/api/admin/members/invitations",
        { headers: { authorization: "Bearer member-command-fixture" } },
      ),
    );
    expect(listRes.status).toBe(200);
    expect((await listRes.json()).invitations).toHaveLength(1);

    const inviteRes = await invitationsPOST(
      jsonRequest("/api/admin/members/invitations", {
        email: "new@example.org",
        role: "staff",
        staffRole: "finance",
        isTenantAdmin: false,
        reason: "Onboarding",
      }),
    );
    expect(inviteRes.status).toBe(201);
    expect(inviteRes.headers.get("cache-control")).toBe(
      "private, no-store, no-transform, max-age=0",
    );
    expect(inviteRes.headers.get("cdn-cache-control")).toBe("no-store");
    expect(inviteRes.headers.get("vercel-cdn-cache-control")).toBe("no-store");
    expect(inviteRes.headers.get("referrer-policy")).toBe("no-referrer");
    expect(await inviteRes.json()).toMatchObject({
      invitePath: `/invite/${"a".repeat(32)}#${"b".repeat(43)}`,
    });

    const revInvRes = await revokeInvitationPOST(
      jsonRequest(`/api/admin/members/invitations/${INV_ID}/revoke`, {
        reason: "Mistyped",
      }),
      { params: Promise.resolve({ invitationId: INV_ID }) },
    );
    expect(revInvRes.status).toBe(200);

    const roleRes = await changeRolePOST(
      jsonRequest("/api/admin/members/role", {
        membershipId: TARGET_ROW,
        role: "staff",
        staffRole: "hr",
        isTenantAdmin: true,
        reason: "Co-admin promotion",
        expectedUpdatedAt: "2026-11-23T09:00:00.000Z",
      }),
    );
    expect(roleRes.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("change_membership_role", {
      p_tenant_id: TENANT,
      p_membership_id: TARGET_ROW,
      p_role: "staff",
      p_staff_role: "hr",
      p_is_tenant_admin: true,
      p_reason: "Co-admin promotion",
      p_expected_updated_at: "2026-11-23T09:00:00.000Z",
    });

    const revMemRes = await revokeMembershipPOST(
      jsonRequest("/api/admin/members/revoke", {
        membershipId: TARGET_ROW,
        reason: "Departed",
      }),
    );
    expect(revMemRes.status).toBe(200);
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("maps optimistic concurrency conflict (40001) to HTTP 409 and rejects missing expectedUpdatedAt with 400", async () => {
    h.auth.mockResolvedValue(makeAuth("staff", { isTenantAdmin: true }));
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "40001",
        message:
          "This membership was changed by someone else; reload and try again",
      },
    });
    h.session.mockResolvedValue({ rpc });

    const missingTs = await changeRolePOST(
      jsonRequest("/api/admin/members/role", {
        membershipId: TARGET_ROW,
        role: "staff",
        staffRole: "finance",
        isTenantAdmin: false,
        reason: "No timestamp",
      }),
    );
    expect(missingTs.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();

    const conflict = await changeRolePOST(
      jsonRequest("/api/admin/members/role", {
        membershipId: TARGET_ROW,
        role: "staff",
        staffRole: "finance",
        isTenantAdmin: false,
        reason: "Stale timestamp",
        expectedUpdatedAt: "2026-11-23T09:00:00.000Z",
      }),
    );
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({
      code: "CONCURRENT_MODIFICATION",
    });
  });

  it("R13: marks invite responses private/no-store for browser and CDN and never writes raw verifier or link to logs, Sentry, or error bodies", async () => {
    const sentinelSelector = "r13sel" + "a".repeat(26);
    const sentinelVerifier = "r13ver" + "b".repeat(37);
    const sentinelLink = `/invite/${sentinelSelector}#${sentinelVerifier}`;
    const consoleSpies = [
      vi.spyOn(console, "log").mockImplementation(() => {}),
      vi.spyOn(console, "info").mockImplementation(() => {}),
      vi.spyOn(console, "warn").mockImplementation(() => {}),
      vi.spyOn(console, "error").mockImplementation(() => {}),
      vi.spyOn(console, "debug").mockImplementation(() => {}),
    ];

    try {
      h.auth.mockResolvedValue(makeAuth("staff", { isTenantAdmin: true }));
      h.session.mockResolvedValue({
        rpc: vi.fn().mockResolvedValue({
          data: {
            invitation_id: INV_ID,
            tenant_id: TENANT,
            selector: sentinelSelector,
            verifier: sentinelVerifier,
            expires_at: "2026-11-30T00:00:00.000Z",
            role: "staff",
            staff_role: "finance",
            is_tenant_admin: false,
          },
          error: null,
        }),
      });

      const okRes = await invitationsPOST(
        jsonRequest("/api/admin/members/invitations", {
          email: "r13@example.org",
          role: "staff",
          staffRole: "finance",
          isTenantAdmin: false,
          reason: "R13 privacy proof",
        }),
      );
      expect(okRes.status).toBe(201);
      expect(okRes.headers.get("cache-control")).toBe(
        "private, no-store, no-transform, max-age=0",
      );
      expect(okRes.headers.get("cdn-cache-control")).toBe("no-store");
      expect(okRes.headers.get("vercel-cdn-cache-control")).toBe("no-store");
      expect(okRes.headers.get("referrer-policy")).toBe("no-referrer");
      const okPayload = await okRes.json();
      expect(okPayload.invitePath).toBe(sentinelLink);

      h.session.mockResolvedValue({
        rpc: vi
          .fn()
          .mockRejectedValue(
            new Error(
              `unexpected rpc crash with ${sentinelVerifier} and ${sentinelLink}`,
            ),
          ),
      });
      const thrownRes = await invitationsPOST(
        jsonRequest("/api/admin/members/invitations", {
          email: "r13@example.org",
          role: "staff",
          staffRole: "finance",
          isTenantAdmin: false,
          reason: "R13 thrown crash proof",
        }),
      );
      expect(thrownRes.status).toBe(500);
      const thrownText = await thrownRes.text();
      expect(thrownText).not.toContain(sentinelVerifier);
      expect(thrownText).not.toContain(sentinelLink);

      h.session.mockResolvedValue({
        rpc: vi.fn().mockResolvedValue({
          data: null,
          error: {
            code: "XX000",
            message: `db failure echoing ${sentinelVerifier} and ${sentinelLink}`,
          },
        }),
      });
      const rpcErrRes = await invitationsPOST(
        jsonRequest("/api/admin/members/invitations", {
          email: "r13@example.org",
          role: "staff",
          staffRole: "finance",
          isTenantAdmin: false,
          reason: "R13 rpc 500 proof",
        }),
      );
      expect(rpcErrRes.status).toBe(500);
      expect(rpcErrRes.headers.get("cache-control")).toBe(
        "private, no-store, no-transform, max-age=0",
      );
      expect(rpcErrRes.headers.get("cdn-cache-control")).toBe("no-store");
      const rpcErrText = await rpcErrRes.text();
      expect(rpcErrText).not.toContain(sentinelVerifier);
      expect(rpcErrText).not.toContain(sentinelLink);

      const serializedDiagnostics = JSON.stringify([
        ...consoleSpies.flatMap((spy) => spy.mock.calls),
        ...h.captureError.mock.calls.map(([err, ctx, tags]) => ({
          name: err instanceof Error ? err.name : null,
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : null,
          ctx,
          tags,
        })),
        ...h.auditLog.mock.calls,
      ]);
      expect(serializedDiagnostics).not.toContain(sentinelVerifier);
      expect(serializedDiagnostics).not.toContain(sentinelLink);
      expect(h.captureError).toHaveBeenCalledTimes(1);
    } finally {
      for (const spy of consoleSpies) spy.mockRestore();
    }
  });
});
