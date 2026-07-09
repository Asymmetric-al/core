import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Behavioral handler tests for the CRM table-preferences PUT route (#271).
 *
 * The service-role Supabase client bypasses RLS, so the tenant/profile
 * scoping applied by the handler is load-bearing: identifiers must come from
 * the authenticated context, never from the request body, and unknown pinned
 * operation ids must be rejected before persistence.
 */

const { AUTH_TENANT_ID, AUTH_PROFILE_ID, rpcCalls } = vi.hoisted(() => ({
  AUTH_TENANT_ID: "11111111-1111-4111-8111-111111111111",
  AUTH_PROFILE_ID: "22222222-2222-4222-8222-222222222222",
  rpcCalls: [] as Array<{ name: string; params: Record<string, unknown> }>,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      rpc: async (name: string, params: Record<string, unknown>) => {
        rpcCalls.push({ name, params });
        if (name === "save_crm_user_table_preference") {
          return {
            data: {
              pinned_action_id: params.p_pinned_action_id,
              schema_version: params.p_schema_version,
              settings: null,
            },
            error: null,
          };
        }
        throw new Error(`Unexpected RPC: ${name}`);
      },
    },
    error: null,
  }),
}));

vi.mock("@asym/auth/context", () => {
  const auth = {
    isAuthenticated: true,
    userId: "user-1",
    tenantId: AUTH_TENANT_ID,
    profileId: AUTH_PROFILE_ID,
    role: "admin",
    profileRole: "admin",
    memberships: [],
  };
  return {
    getAuthContext: async () => auth,
    requireAuth: () => {},
    requireRole: () => {},
  };
});

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({}),
}));

import { PUT } from "../../../../../packages/api/src/admin/crm/table-preferences/route";

function putRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/admin/crm/table-preferences", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("admin/crm/table-preferences PUT handler", () => {
  beforeEach(() => {
    rpcCalls.length = 0;
  });

  it("derives tenant and profile from the authenticated context, never the body", async () => {
    const response = await PUT(
      putRequest({
        tableId: "crm.giftHistory",
        pinnedActionId: "resend_receipt",
        // Attacker-supplied scoping fields must be ignored: zod strips them
        // and the handler only ever uses requireCrmAccess(auth) identifiers.
        tenantId: "99999999-9999-4999-8999-999999999999",
        profileId: "88888888-8888-4888-8888-888888888888",
        tenant_id: "99999999-9999-4999-8999-999999999999",
        profile_id: "88888888-8888-4888-8888-888888888888",
      }),
    );

    expect(response.status).toBe(200);
    expect(rpcCalls).toHaveLength(1);
    const call = rpcCalls[0]!;
    expect(call.name).toBe("save_crm_user_table_preference");
    expect(call.params.p_tenant_id).toBe(AUTH_TENANT_ID);
    expect(call.params.p_profile_id).toBe(AUTH_PROFILE_ID);
    expect(call.params.p_pinned_action_id).toBe("resend_receipt");

    const payload = (await response.json()) as {
      user: { actionId: string | null };
    };
    expect(payload.user.actionId).toBe("resend_receipt");
  });

  it("rejects unknown pinned operation ids with 400 before persistence", async () => {
    const response = await PUT(
      putRequest({
        tableId: "crm.giftHistory",
        pinnedActionId: "legacy_unknown_action",
      }),
    );

    expect(response.status).toBe(400);
    expect(rpcCalls).toHaveLength(0);
    const payload = (await response.json()) as { error: string };
    expect(payload.error).toContain("Unknown operation id");
  });
});
