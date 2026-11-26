import { NextRequest } from "next/server";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

const h = vi.hoisted(() => ({
  hasSession: vi.fn(),
  createSessionClient: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    throw new Error("service-key client used");
  },
}));

vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  () => ({
    requestCarriesSupabaseSession: h.hasSession,
    createRequestSessionClient: h.createSessionClient,
  }),
);

import { POST } from "../../../../../packages/api/src/invitations/accept";

const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const USER = "00000000-0000-4000-8000-0000000000b2";

let rpc: ReturnType<typeof vi.fn>;

function accepted(tenantId: string) {
  return {
    data: {
      invitation_id: "00000000-0000-4000-8000-0000000000c2",
      tenant_id: tenantId,
      membership_id: "00000000-0000-4000-8000-0000000000d2",
      user_id: USER,
      role: "staff",
      staff_role: "finance",
      is_tenant_admin: false,
      revived: false,
      accepted_at: "2026-11-26T09:00:00.000Z",
    },
    error: null,
  };
}

function accept(headers: Record<string, string> = {}) {
  return POST(
    new NextRequest("http://localhost:25361/admin/api/invitations/accept", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({
        selector: "a".repeat(32),
        verifier: "b".repeat(43),
      }),
    }),
  );
}

beforeEach(() => {
  h.hasSession.mockReturnValue(true);
  rpc = vi.fn().mockResolvedValue(accepted(TA));
  h.createSessionClient.mockResolvedValue({
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: USER } }, error: null }),
    },
    rpc,
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  expect(network.reached.splice(0)).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("on: an accepted invitation lands on the name's address", () => {
  beforeEach(() => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  });

  it.each([
    ["absent", {}],
    ["invalid", { "x-asym-name-tenant": "not-a-uuid" }],
  ] as const)(
    "refuses a name state that is %s with 403 INVITATION_INVALID, before the database",
    async (_label, headers) => {
      const response = await accept(headers);
      expect(response.status).toBe(403);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({
        error: "Invitation is invalid or no longer available",
        code: "INVITATION_INVALID",
      });
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it("sends an invitation of the name's organization to /", async () => {
    const response = await accept({ "x-asym-name-tenant": TA });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      tenant_id: TA,
      redirectPath: "/",
    });
  });

  it("sends an invitation of another organization to /no-access", async () => {
    rpc.mockResolvedValue(accepted(TB));
    const response = await accept({ "x-asym-name-tenant": TA });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      tenant_id: TB,
      redirectPath: "/no-access",
    });
  });
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)("off (switch %s): today's address (guard)", (_label, value) => {
  it("answers /<tenant>, whatever name header a client sends", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
    vi.stubEnv("CORE_APP_BASE_PATH", "");
    for (const headers of [{}, { "x-asym-name-tenant": TB }]) {
      const response = await accept(headers);
      expect(await response.json()).toMatchObject({ redirectPath: `/${TA}` });
    }
  });
});
