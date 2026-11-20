import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The admin proxy as `apps/admin/proxy.ts` configures it carries Web Studio's
 * rules (plan 5.2; AL-2675, WP2b slice C, council C7). The rules themselves
 * are tested on a proxy built in the test (`middleware-web-studio.test.ts`);
 * this file runs the app's own proxy, so dropping the `webStudio` option
 * from it fails here, in the unit suite that gates a pull request.
 */

const USER = "00000000-0000-4000-8000-0000000000e1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const ORIGIN = "http://localhost:3330";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  rpcCalls: 0,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: state.userId ? { id: state.userId } : null },
      }),
    },
    rpc: async (fn: string) => {
      state.rpcCalls += 1;
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

const { proxy } = await import("../../../../apps/admin/proxy");

function staffRow(id: string, tenantId: string) {
  return {
    id,
    user_id: USER,
    tenant_id: tenantId,
    role: "staff",
    staff_role: "development",
    is_tenant_admin: false,
    updated_at: "2026-11-18T00:00:00.000000+00:00",
  };
}

beforeEach(() => {
  state.userId = null;
  state.rows = [];
  state.rpcCalls = 0;
});

describe("the admin proxy, as proxy.ts configures it", () => {
  it("passes a session-less call to Payload's REST routes through, with no Location and no role lookup", async () => {
    for (const method of ["GET", "PATCH"]) {
      const response = await proxy(
        new NextRequest(new URL("/web-studio/api/pages", ORIGIN), { method }),
      );
      expect(response.headers.get("x-middleware-next"), method).toBe("1");
      expect(response.headers.get("location"), method).toBeNull();
    }
    expect(state.rpcCalls).toBe(0);
  });

  it("sends a person in two organizations to the Web Studio chooser instead of refusing them", async () => {
    state.userId = USER;
    state.rows = [
      staffRow("00000000-0000-4000-8000-0000000000e2", TA),
      staffRow("00000000-0000-4000-8000-0000000000e3", TB),
    ];

    const response = await proxy(
      new NextRequest(new URL("/web-studio/collections/pages", ORIGIN)),
    );

    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/web-studio/organization",
    );
  });
});
