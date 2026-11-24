import { createE2EAuthCookieValue } from "@asym/auth/e2e-auth";
import {
  signWebStudioSelection,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

type Strategy = {
  authenticate: (args: {
    headers: Headers;
    payload: unknown;
    req?: { method?: string; context: Record<string, unknown> };
    isGraphQL?: boolean;
  }) => Promise<{ user: Record<string, unknown> | null }>;
};

const SECRET = "unit-test-strategy-name-secret";
const USER = "00000000-0000-4000-8000-0000000000c1";
const TA = "00000000-0000-0000-0000-000000000001";
const TB = "00000000-0000-0000-0000-000000000002";
const NAME = "x-asym-name-tenant";

let nextId = 0x900;
function row(tenant: string, role: "staff" | "missionary" = "staff") {
  nextId += 1;
  return {
    id: `00000000-0000-4000-8000-${nextId.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role,
    staff_role: role === "staff" ? "development" : null,
    is_tenant_admin: false,
    updated_at: "2026-11-25T09:00:00.000000+00:00",
  };
}

let createSupabaseAuthStrategy: (deps?: Record<string, unknown>) => Strategy;
let readWebStudioRefusal: (req: unknown) => string | null;

beforeAll(async () => {
  ({ createSupabaseAuthStrategy } =
    (await import("../../../apps/admin/src/cms/auth/supabase-strategy")) as never);
  ({ readWebStudioRefusal } =
    (await import("../../../apps/admin/src/cms/auth/web-studio-refusal")) as never);
});

function fakes(rows: ReturnType<typeof row>[], signedIn = true) {
  const client = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: signedIn ? { id: USER, email: "s@example.org" } : null },
      })),
    },
    rpc: vi.fn(async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: rows, error: null };
    }),
    from: vi.fn(),
  };
  const tenants = vi.fn(() => {
    let id = "";
    const chain = {
      select: () => chain,
      eq: (_column: string, value: string) => {
        id = value;
        return chain;
      },
      maybeSingle: async () => ({
        data: {
          id,
          name: id === TA ? "Alpha" : "Bravo",
          slug: id === TA ? "alpha" : "bravo",
        },
      }),
    };
    return chain;
  });
  const payload = {
    find: vi.fn(
      async (options: {
        collection: string;
        where?: { slug?: { equals?: string } };
      }) =>
        options.collection === "tenants"
          ? {
              docs: [{ id: options.where?.slug?.equals === "alpha" ? 11 : 22 }],
            }
          : { docs: [] },
    ),
    create: vi.fn(async (options: { data: object }) => ({
      id: 5,
      ...options.data,
    })),
    update: vi.fn(async (options: { id: unknown; data: object }) => ({
      id: options.id,
      ...options.data,
    })),
  };
  const strategy = createSupabaseAuthStrategy({
    createSupabaseClient: vi.fn(() => client),
    createSupabaseDataClient: vi.fn(() => ({ from: tenants })),
  });
  return { strategy, payload };
}

async function studioCookie(tenantId: string, assignmentId: string) {
  return `${WEB_STUDIO_TENANT_COOKIE}=${await signWebStudioSelection({ tenantId, assignmentId }, SECRET)}`;
}

function req(method: string) {
  return { method, context: {} as Record<string, unknown> };
}

const P_DEV_A = row(TA);
const P_DEV_B = row(TB);
const P = [P_DEV_A, P_DEV_B];

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("PAYLOAD_SECRET", SECRET);
  vi.stubEnv("E2E_AUTH_BYPASS", undefined);
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: Payload's strategy reads the name from its own headers", () => {
  it("refuses a REST read and a write with a cookie for B on name A (no_selection)", async () => {
    const { strategy, payload } = fakes(P);
    for (const method of ["GET", "POST"]) {
      const request = req(method);
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie: `sb=1; ${await studioCookie(TB, P_DEV_B.id)}`,
          [NAME]: TA,
          "x-asym-tenant": TB,
          "x-asym-assignment": P_DEV_B.id,
        }),
        payload,
        req: request,
      });
      expect(user, method).toBeNull();
      expect(readWebStudioRefusal(request), method).toBe("no_selection");
    }
  });

  it("narrows an absent cookie to the name: P resolves in B on name B", async () => {
    const { strategy, payload } = fakes(P);
    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie: "sb=1", [NAME]: TB }),
      payload,
    });
    expect(user).toMatchObject({ publicTenantId: TB });
  });

  it.each([
    ["absent", {}],
    ["invalid", { [NAME]: "not-a-uuid" }],
  ] as const)(
    "fails closed when the name is %s: no_selection",
    async (_l, headers) => {
      const { strategy, payload } = fakes([P_DEV_A]);
      const request = req("GET");
      const { user } = await strategy.authenticate({
        headers: new Headers({
          cookie: `sb=1; ${await studioCookie(TA, P_DEV_A.id)}`,
          ...headers,
        }),
        payload,
        req: request,
      });
      expect(user).toBeNull();
      expect(readWebStudioRefusal(request)).toBe("no_selection");
    },
  );

  it("answers no_selection on name B for a person whose rows there are suspended or revoked", async () => {
    const { strategy, payload } = fakes([P_DEV_A]);
    const request = req("GET");
    const { user } = await strategy.authenticate({
      headers: new Headers({ cookie: "sb=1", [NAME]: TB }),
      payload,
      req: request,
    });
    expect(user).toBeNull();
    expect(readWebStudioRefusal(request)).toBe("no_selection");
  });

  it("refuses the E2E bypass identity's cookie for B on name A too", async () => {
    const e2e = await bypassCookie();
    const { strategy, payload } = fakes([], false);
    const request = req("GET");
    const { user } = await strategy.authenticate({
      headers: new Headers({
        cookie: `${e2e}; ${await studioCookie(TB, P_DEV_B.id)}`,
        host: "localhost:3030",
        [NAME]: TA,
      }),
      payload,
      req: request,
    });
    expect(user).toBeNull();
    expect(readWebStudioRefusal(request)).toBe("no_selection");
  });

  it.each([
    ["absent", {}],
    ["invalid", { [NAME]: "not-a-uuid" }],
  ] as const)(
    "refuses the E2E bypass identity when the name is %s (no_selection), and admits it on name A",
    async (_l, headers) => {
      const e2e = await bypassCookie();
      const cookie = `${e2e}; ${await studioCookie(TA, P_DEV_A.id)}`;
      const { strategy, payload } = fakes([], false);
      const request = req("GET");
      const refusedUser = await strategy.authenticate({
        headers: new Headers({ cookie, host: "localhost:3030", ...headers }),
        payload,
        req: request,
      });
      expect(refusedUser.user).toBeNull();
      expect(readWebStudioRefusal(request)).toBe("no_selection");
      const admitted = await strategy.authenticate({
        headers: new Headers({ cookie, host: "localhost:3030", [NAME]: TA }),
        payload,
      });
      expect(admitted.user).toMatchObject({ publicTenantId: TA });
    },
  );
});

async function bypassCookie() {
  vi.stubEnv("E2E_AUTH_BYPASS", "true");
  vi.stubEnv("E2E_AUTH_SECRET", "cms-strategy-name-secret");
  vi.stubEnv("E2E_AUTH_ALLOWED_SUPABASE_REFS", "example");
  const memberships = [P_DEV_A, P_DEV_B].map((assignment) => ({
    id: assignment.id,
    tenantId: assignment.tenant_id,
    role: "staff" as const,
    staffRole: "development" as const,
    isTenantAdmin: false,
  }));
  return `asym_e2e_auth_admin=${await createE2EAuthCookieValue({
    userId: USER,
    role: "staff",
    tenantId: TA,
    memberships,
  })}`;
}

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): the name header changes nothing",
  (_label, value) => {
    beforeEach(() => {
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it("resolves the cookie's row as without the header", async () => {
      const { strategy, payload } = fakes(P);
      const cookie = `sb=1; ${await studioCookie(TB, P_DEV_B.id)}`;
      const without = await strategy.authenticate({
        headers: new Headers({ cookie }),
        payload,
      });
      const withName = await strategy.authenticate({
        headers: new Headers({ cookie, [NAME]: TA }),
        payload,
      });
      expect(withName.user).toMatchObject({ publicTenantId: TB });
      expect(withName.user?.publicTenantId).toBe(without.user?.publicTenantId);
    });
  },
);
