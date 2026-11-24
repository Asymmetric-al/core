import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { GET, PATCH, POST } from "../../src/admin/source-codes/route";

const authState = vi.hoisted(() => ({
  tenantId: "00000000-0000-0000-0000-000000000001",
  userId: "11111111-1111-1111-1111-111111111111",
  sessionClient: null as unknown,
  capturedCapabilities: [] as Array<string | undefined>,
}));

vi.mock("../../src/shared/with-operation", () => ({
  withOperation: (
    handler: (ctx: {
      auth: { tenantId: string; userId: string };
      request: NextRequest;
      requestId: string;
      sessionClient: unknown;
    }) => Promise<Response>,
    options?: { capability?: string },
  ) => {
    authState.capturedCapabilities.push(options?.capability);
    return async (request: NextRequest) =>
      handler({
        auth: { tenantId: authState.tenantId, userId: authState.userId },
        request,
        requestId: "req-source-codes-test",
        sessionClient: authState.sessionClient,
      });
  },
}));

function makeFakeSession(options: {
  rows?: Array<Record<string, unknown>>;
  rpcHandler?: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
}) {
  const rows = options.rows ?? [];
  const builder = {
    select: () => builder,
    order: () => builder,
    then: (
      resolve: (value: { data: unknown[]; error: null }) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve({ data: rows, error: null }).then(resolve, reject),
  };
  return {
    from: vi.fn((table: string) => {
      if (table !== "giving_source_codes") {
        throw new Error(`Unexpected table ${table}`);
      }
      return builder;
    }),
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      if (options.rpcHandler) return options.rpcHandler(fn, args);
      return { data: null, error: null };
    }),
  };
}

describe("Mission Control giving source codes route (Item 8)", () => {
  it("guards all handlers with contributions.manage_settings on the caller lane", () => {
    expect(authState.capturedCapabilities).toEqual([
      "contributions.manage_settings",
      "contributions.manage_settings",
      "contributions.manage_settings",
    ]);
  });

  it("lists tenant source codes on GET via sessionClient", async () => {
    authState.sessionClient = makeFakeSession({
      rows: [
        {
          id: "00000000-0000-0000-0000-000000000201",
          tenant_id: authState.tenantId,
          code: "spring_2026",
          label: "Spring Appeal",
          is_active: true,
          created_at: "2026-11-23T00:00:00Z",
          updated_at: "2026-11-23T00:00:00Z",
        },
      ],
    });
    const res = await GET(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes"),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      sourceCodes: Array<{ code: string; label: string }>;
    };
    expect(body.sourceCodes).toHaveLength(1);
    expect(body.sourceCodes[0]).toMatchObject({
      code: "spring_2026",
      label: "Spring Appeal",
    });
  });

  it("creates a source code via create_giving_source_code RPC and maps validation/conflict errors", async () => {
    const rpc = vi.fn(async (_fn: string, args: Record<string, unknown>) => {
      if (args.p_code === "duplicate") {
        return {
          data: null,
          error: { code: "23505", message: "duplicate code" },
        };
      }
      return {
        data: {
          source_code_id: "00000000-0000-0000-0000-000000000202",
          tenant_id: args.p_tenant_id,
          code: String(args.p_code).trim().toLowerCase(),
          label: args.p_label,
          is_active: true,
        },
        error: null,
      };
    });
    authState.sessionClient = makeFakeSession({ rpcHandler: rpc });

    const created = await POST(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: "Spring_2026",
          label: "Spring Mailer",
          reason: "Launch spring appeal",
        }),
      }),
    );
    expect(created.status).toBe(201);
    expect(rpc).toHaveBeenCalledWith("create_giving_source_code", {
      p_tenant_id: authState.tenantId,
      p_code: "Spring_2026",
      p_label: "Spring Mailer",
      p_reason: "Launch spring appeal",
    });

    const dup = await POST(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: "duplicate",
          label: "Dup",
          reason: "Test conflict",
        }),
      }),
    );
    expect(dup.status).toBe(409);

    const blankReason = await POST(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: "autumn",
          label: "Autumn",
          reason: "   ",
        }),
      }),
    );
    expect(blankReason.status).toBe(400);
  });

  it("updates label or active state via update_giving_source_code RPC and maps 404/403", async () => {
    const missingId = "00000000-0000-0000-0000-000000000999";
    const okId = "00000000-0000-0000-0000-000000000201";
    const rpc = vi.fn(async (_fn: string, args: Record<string, unknown>) => {
      if (args.p_source_code_id === missingId) {
        return { data: null, error: { code: "P0002", message: "not found" } };
      }
      return {
        data: {
          changed: true,
          source_code_id: args.p_source_code_id,
          tenant_id: args.p_tenant_id,
          code: "spring_2026",
          label: args.p_label ?? "Spring Appeal",
          is_active: args.p_is_active ?? true,
        },
        error: null,
      };
    });
    authState.sessionClient = makeFakeSession({ rpcHandler: rpc });

    const patched = await PATCH(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: okId,
          is_active: false,
          reason: "Retire campaign",
        }),
      }),
    );
    expect(patched.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("update_giving_source_code", {
      p_tenant_id: authState.tenantId,
      p_source_code_id: okId,
      p_label: null,
      p_is_active: false,
      p_reason: "Retire campaign",
    });

    const notFound = await PATCH(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: missingId,
          label: "Renamed",
          reason: "Update label",
        }),
      }),
    );
    expect(notFound.status).toBe(404);

    const noFields = await PATCH(
      new NextRequest("https://admin.asymmetric.al/api/admin/source-codes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: okId,
          reason: "Nothing changed",
        }),
      }),
    );
    expect(noFields.status).toBe(400);
  });
});
