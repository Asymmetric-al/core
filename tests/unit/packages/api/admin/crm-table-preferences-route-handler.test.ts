import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Behavioral handler tests for the CRM table-preferences PUT route (#271).
 *
 * The write RPC runs on the request's session client (#2402): the database
 * takes the acting profile from auth.uid() and checks the tenant against it.
 * The handler still scopes the tenant from the authenticated context, never
 * from the request body, sends no profile, and rejects unknown pinned
 * operation ids before persistence.
 */

const {
  AUTH_TENANT_ID,
  AUTH_PROFILE_ID,
  adminRpcCalls,
  bearerClientOptions,
  rpcCalls,
  sessionClient,
} = vi.hoisted(() => {
  const rpcCalls: Array<{ name: string; params: Record<string, unknown> }> = [];
  return {
    AUTH_TENANT_ID: "11111111-1111-4111-8111-111111111111",
    AUTH_PROFILE_ID: "22222222-2222-4222-8222-222222222222",
    adminRpcCalls: [] as string[],
    bearerClientOptions: [] as unknown[],
    rpcCalls,
    sessionClient: {
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
  };
});

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      rpc: async (name: string) => {
        adminRpcCalls.push(name);
        throw new Error(`Unexpected service-role RPC: ${name}`);
      },
    },
    error: null,
  }),
}));

// Cookie sessions use the shared server client; bearer sessions get an
// anon-key client that forwards the caller's token.
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => sessionClient,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, options: unknown) => {
    bearerClientOptions.push(options);
    return sessionClient;
  },
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

function putRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest("http://localhost/api/admin/crm/table-preferences", {
    method: "PUT",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("admin/crm/table-preferences PUT handler", () => {
  beforeEach(() => {
    adminRpcCalls.length = 0;
    bearerClientOptions.length = 0;
    rpcCalls.length = 0;
  });

  it("scopes the tenant from the authenticated context, never the body, and sends no profile", async () => {
    const response = await PUT(
      putRequest({
        tableId: "crm.giftHistory",
        pinnedActionId: "resend_receipt",
        // Attacker-supplied scoping fields must be ignored: zod strips them
        // and the handler only ever uses the requireCrmAccess(auth) tenant.
        tenantId: "99999999-9999-4999-8999-999999999999",
        profileId: "88888888-8888-4888-8888-888888888888",
        tenant_id: "99999999-9999-4999-8999-999999999999",
        profile_id: "88888888-8888-4888-8888-888888888888",
      }),
    );

    expect(response.status).toBe(200);
    expect(adminRpcCalls).toEqual([]);
    expect(rpcCalls).toHaveLength(1);
    const call = rpcCalls[0]!;
    expect(call.name).toBe("save_crm_user_table_preference");
    expect(call.params.p_tenant_id).toBe(AUTH_TENANT_ID);
    expect(call.params.p_pinned_action_id).toBe("resend_receipt");
    expect(Object.values(call.params)).not.toContain(AUTH_PROFILE_ID);
    expect(
      Object.keys(call.params).filter((key) => /profile|actor/.test(key)),
    ).toEqual([]);

    const payload = (await response.json()) as {
      user: { actionId: string | null };
    };
    expect(payload.user.actionId).toBe("resend_receipt");
    expect(bearerClientOptions).toEqual([]);
  });

  it("forwards a bearer session to the RPC client", async () => {
    const response = await PUT(
      putRequest(
        { tableId: "crm.giftHistory", pinnedActionId: "resend_receipt" },
        { authorization: "Bearer caller-access-token" },
      ),
    );

    expect(response.status).toBe(200);
    expect(adminRpcCalls).toEqual([]);
    expect(rpcCalls.map((call) => call.name)).toEqual([
      "save_crm_user_table_preference",
    ]);
    expect(bearerClientOptions).toHaveLength(1);
    expect(bearerClientOptions[0]).toMatchObject({
      global: { headers: { Authorization: "Bearer caller-access-token" } },
    });
  });

  it("rejects unknown pinned operation ids with 400 before persistence", async () => {
    const response = await PUT(
      putRequest({
        tableId: "crm.giftHistory",
        pinnedActionId: "legacy_unknown_action",
      }),
    );

    expect(response.status).toBe(400);
    expect(adminRpcCalls).toEqual([]);
    expect(rpcCalls).toHaveLength(0);
    const payload = (await response.json()) as { error: string };
    expect(payload.error).toContain("Unknown operation id");
  });
});
