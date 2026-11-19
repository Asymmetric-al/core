import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

/**
 * WP2b, AL-2675 (council round 1 on slice B, SB14): the missionary metrics
 * route reads on the service-key client when the environment has one, and
 * otherwise on the caller's own session. That fallback is a session client
 * like every other, so its Data API requests carry the tenant and the
 * assignment the resolver selected, never the caller's headers. After the
 * second release a read with neither returns nothing.
 */
const TENANT = "00000000-0000-4000-8000-0000000000b1";
const ROW = "00000000-0000-4000-8000-00000000b0b1";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  clientOptions: [] as Array<{ global?: { headers?: Record<string, string> } }>,
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null, error: null }),
}));
vi.mock("@asym/env", () => ({
  serverEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { global?: { headers?: Record<string, string> } },
  ) => {
    h.clientOptions.push(options);
    return {
      from: () => ({
        select: () => ({
          or: () => ({
            // The lookup is filtered by the resolved tenant (JB14).
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      }),
    };
  },
}));

import { GET } from "../../../../packages/api/src/missionaries/metrics";

beforeEach(() => {
  h.clientOptions.length = 0;
  h.auth.mockResolvedValue({
    isAuthenticated: true,
    userId: "00000000-0000-4000-9000-0000000000b1",
    email: null,
    tenantId: TENANT,
    role: "admin",
    profileId: "00000000-0000-4000-8000-0000000000b9",
    memberships: [
      {
        tenantId: TENANT,
        role: "staff",
        staffRole: "development",
        isActive: true,
        isTenantAdmin: true,
      },
    ],
    assignment: {
      assignmentId: ROW,
      userId: "00000000-0000-4000-9000-0000000000b1",
      tenantId: TENANT,
      revision: "1",
      membershipRole: "staff",
      staffRole: "development",
      isTenantAdmin: true,
    },
    assignmentDenial: null,
  } as AuthContext);
});

describe("the missionary metrics route without a service-key client", () => {
  it("reads on a session client that sends the resolved tenant and assignment, not the caller's", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/missionaries/m-1/metrics", {
        headers: {
          // A forged pair: the route must send the resolved row instead.
          "x-asym-tenant": "00000000-0000-4000-8000-0000000000ff",
          "x-asym-assignment": "00000000-0000-4000-8000-00000000ffff",
        },
      }),
      { params: Promise.resolve({ id: "m-1" }) },
    );

    expect(response.status).toBe(404);
    const readers = h.clientOptions.filter(
      (options) => options.global?.headers?.["x-asym-tenant"],
    );
    expect(readers).toHaveLength(1);
    expect(readers[0]?.global?.headers).toMatchObject({
      "x-asym-tenant": TENANT,
      "x-asym-assignment": ROW,
    });
  });
});
