import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createE2EAuthCookieValue } from "@asym/auth/e2e-auth";

/**
 * AL-2675 (WP2a; plan 5.1; A08): Web Studio acts on the caller's one live
 * staff membership, resolved on the caller's own session through
 * `public.current_user_assignments()`. The profile is not read, the `authz`
 * schema is never queried, and the trusted data client reads tenants only.
 */
type SupabaseAuthStrategyFactory = (dependencies?: {
  createSupabaseDataClient?: unknown;
  createSupabaseClient?: unknown;
}) => {
  authenticate: (...args: unknown[]) => Promise<{ user: unknown }>;
};

const USER = "00000000-0000-4000-8000-0000000000a1";
const TENANT_1 = "00000000-0000-4000-8000-000000000101";
const TENANT_2 = "00000000-0000-4000-8000-000000000102";
const DEFAULT_SUPER_ADMIN_TENANT = "00000000-0000-0000-0000-000000000001";

let next = 0x200;
function assignment(
  tenant: string,
  role: "donor" | "missionary" | "staff",
  staffRole: string | null = null,
  isTenantAdmin = false,
) {
  next += 1;
  return {
    id: `00000000-0000-4000-8000-${next.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role,
    staff_role: staffRole,
    is_tenant_admin: isTenantAdmin,
    updated_at: "2026-11-17T09:00:00.000000+00:00",
  };
}

type SupabaseClientMockOptions = {
  assignments?: ReturnType<typeof assignment>[];
  userId?: string;
  email?: string;
  publicTenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

let createSupabaseAuthStrategy: SupabaseAuthStrategyFactory;

beforeAll(async () => {
  const module =
    await import("../../../apps/admin/src/cms/auth/supabase-strategy");
  createSupabaseAuthStrategy = module.createSupabaseAuthStrategy;
});

function createQueryChain(result: unknown) {
  const chain = {
    eq: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
  };

  return { select: vi.fn(() => chain), chain };
}

function createSupabaseClientMock({
  assignments = [assignment(TENANT_1, "staff", "member_care")],
  userId = USER,
  email = "staff@example.org",
  publicTenant,
}: SupabaseClientMockOptions = {}) {
  const getUser = vi.fn().mockResolvedValue({
    data: { user: userId ? { id: userId, email } : null },
  });
  const resolvedPublicTenant =
    publicTenant === undefined
      ? {
          id: assignments[0]?.tenant_id ?? TENANT_1,
          name: "Tenant One",
          slug: "tenant-one",
        }
      : publicTenant;
  const publicTenantQuery = createQueryChain({ data: resolvedPublicTenant });
  const from = vi.fn((table: string) => {
    if (table === "tenants") return { select: publicTenantQuery.select };
    throw new Error(`unexpected table read: ${table}`);
  });
  const rpc = vi.fn(async () => ({ data: assignments, error: null }));
  const schema = vi.fn(() => {
    throw new Error("authz is not exposed by the Data API");
  });

  const createServerClientMock = vi.fn().mockReturnValue({
    auth: { getUser },
    from,
    rpc,
    schema,
  });

  return {
    createServerClientMock,
    getUser,
    from,
    rpc,
    schema,
    publicTenantQuery,
  };
}

function createPayloadMock({
  existingUser,
  cmsTenant = { id: 17, name: "Tenant One", slug: "tenant-one" },
}: {
  existingUser?: Record<string, unknown>;
  cmsTenant?: Record<string, unknown> | null;
} = {}) {
  const find = vi.fn(async (options: { collection?: string }) => {
    if (options.collection === "tenants") {
      return { docs: cmsTenant ? [cmsTenant] : [] };
    }

    if (options.collection === "cms-users") {
      return { docs: existingUser ? [existingUser] : [] };
    }

    return { docs: [] };
  });
  const create = vi.fn(
    async (options: { collection?: string; data?: object }) =>
      options.collection === "tenants"
        ? {
            id: 17,
            ...(options.data ?? {}),
          }
        : {
            createdAt: "2026-05-14T00:00:00.000Z",
            id: "cms_user_1",
            updatedAt: "2026-05-14T00:00:00.000Z",
            ...(options.data ?? {}),
          },
  );
  const update = vi.fn(async (options: { id?: unknown; data?: object }) => ({
    createdAt: "2026-05-14T00:00:00.000Z",
    id: options.id,
    updatedAt: "2026-05-14T00:00:00.000Z",
    ...(options.data ?? {}),
  }));

  return { create, find, update };
}

function createStrategyWithMocks(
  mock: ReturnType<typeof createSupabaseClientMock>,
  extra?: Omit<
    Parameters<SupabaseAuthStrategyFactory>[0],
    "createSupabaseClient"
  >,
) {
  const dataClient = { from: mock.from };

  return createSupabaseAuthStrategy({
    createSupabaseClient: mock.createServerClientMock as never,
    createSupabaseDataClient: vi.fn(() => dataClient) as never,
    ...extra,
  });
}

const authenticate = (
  strategy: ReturnType<SupabaseAuthStrategyFactory>,
  payload: ReturnType<typeof createPayloadMock>,
) =>
  strategy.authenticate({
    headers: new Headers({ cookie: "sb-access-token=test" }),
    payload,
  } as never);

describe("createSupabaseAuthStrategy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.E2E_AUTH_SECRET = "cms-strategy-test-secret";
    process.env.E2E_AUTH_ALLOWED_SUPABASE_REFS = "example";
    delete process.env.E2E_AUTH_BYPASS;
    delete process.env.ASYM_E2E_AUTH_SURFACE;
    // Keep unit tests on injected clients even when a developer shell exports the service role key.
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns null when Supabase env is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const strategy = createSupabaseAuthStrategy();
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers(),
      payload,
    } as never);

    expect(result.user).toBeNull();
  });

  it("authenticates admin E2E bypass cookies through normal Payload users (AL-2676: the cookie names its tenant)", async () => {
    process.env.E2E_AUTH_BYPASS = "true";
    const supabaseMock = createSupabaseClientMock({ userId: "" });
    const e2eCookie = await createE2EAuthCookieValue({
      role: "admin",
      tenantId: DEFAULT_SUPER_ADMIN_TENANT,
      userId: "e2e-admin-user",
    });

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers({
        cookie: `asym_e2e_auth_admin=${e2eCookie}`,
        host: "localhost:3030",
      }),
      payload,
    } as never);

    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "cms-users",
        data: expect.objectContaining({
          email: "e2e-admin-user@e2e.asym.local",
          role: "admin",
          supabaseUserId: "e2e-admin-user",
          tenantId: "17",
        }),
      }),
    );
    expect(result.user).toMatchObject({
      _strategy: "cms-users-supabase-session-e2e",
      collection: "cms-users",
      publicTenantId: DEFAULT_SUPER_ADMIN_TENANT,
      role: "admin",
      tenantId: "17",
    });
  });

  it("rejects donor E2E bypass cookies for the Payload admin surface", async () => {
    process.env.E2E_AUTH_BYPASS = "true";
    const supabaseMock = createSupabaseClientMock({ userId: "" });
    const e2eCookie = await createE2EAuthCookieValue({
      role: "donor",
      tenantId: null,
      userId: "e2e-donor-user",
    });

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers({
        cookie: `asym_e2e_auth_admin=${e2eCookie}`,
        host: "localhost:3030",
      }),
      payload,
    } as never);

    expect(result.user).toBeNull();
    expect(payload.find).not.toHaveBeenCalled();
    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
  });

  it("creates a CMS user against the mirrored Payload tenant of the caller's staff membership", async () => {
    const supabaseMock = createSupabaseClientMock();

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock();

    const result = await authenticate(strategy, payload);

    expect(supabaseMock.createServerClientMock).toHaveBeenCalledTimes(1);
    expect(supabaseMock.rpc).toHaveBeenCalledExactlyOnceWith(
      "current_user_assignments",
    );
    expect(supabaseMock.schema).not.toHaveBeenCalled();
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "cms-users",
        data: expect.objectContaining({
          role: "staff",
          tenantId: "17",
        }),
      }),
    );
    expect(payload.update).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      collection: "cms-users",
      id: "cms_user_1",
      publicTenantId: TENANT_1,
      role: "staff",
      tenantId: "17",
    });
  });

  it("skips write operations when the existing user is already in sync", async () => {
    const supabaseMock = createSupabaseClientMock();

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock({
      existingUser: {
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: USER,
        tenantId: "17",
      },
    });

    const result = await authenticate(strategy, payload);

    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      collection: "cms-users",
      id: "cms_user_1",
      publicTenantId: TENANT_1,
      tenantId: "17",
    });
  });

  it("updates the CMS user when the caller's staff membership is in another tenant", async () => {
    const supabaseMock = createSupabaseClientMock({
      assignments: [assignment(TENANT_2, "staff", "finance")],
      publicTenant: { id: TENANT_2, name: "Tenant Two", slug: "tenant-two" },
    });

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock({
      cmsTenant: { id: 22, name: "Tenant Two", slug: "tenant-two" },
      existingUser: {
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: USER,
        tenantId: "17",
      },
    });

    await authenticate(strategy, payload);

    expect(payload.update).toHaveBeenCalledTimes(1);
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "cms-users",
        data: expect.objectContaining({
          role: "staff",
          tenantId: "22",
        }),
        id: "cms_user_1",
      }),
    );
  });

  it.each([
    ["no membership", []],
    ["only a donor membership", [assignment(TENANT_1, "donor")]],
    [
      "two staff rows in one tenant (until WP2b's chooser)",
      [
        assignment(TENANT_1, "staff", "finance"),
        assignment(TENANT_1, "staff", "hr"),
      ],
    ],
    [
      "staff rows in two tenants (until WP2b's tenant cookie)",
      [
        assignment(TENANT_1, "staff", "finance"),
        assignment(TENANT_2, "staff", "hr"),
      ],
    ],
  ])("rejects a caller with %s", async (_name, assignments) => {
    const supabaseMock = createSupabaseClientMock({ assignments });

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock();

    const result = await authenticate(strategy, payload);

    expect(result.user).toBeNull();
    expect(payload.find).not.toHaveBeenCalled();
  });

  it("makes a staff member with the tenant-administrator flag a CMS admin", async () => {
    const supabaseMock = createSupabaseClientMock({
      assignments: [assignment(TENANT_1, "staff", "development", true)],
    });

    const strategy = createStrategyWithMocks(supabaseMock);
    const payload = createPayloadMock();

    const result = await authenticate(strategy, payload);

    expect(result.user).toMatchObject({
      collection: "cms-users",
      publicTenantId: TENANT_1,
      role: "admin",
      tenantId: "17",
    });
  });

  it("acts on the staff row of a person who is also a donor there", async () => {
    const supabaseMock = createSupabaseClientMock({
      assignments: [
        assignment(TENANT_1, "donor"),
        assignment(TENANT_1, "staff", "finance"),
      ],
    });

    const strategy = createStrategyWithMocks(supabaseMock);
    const result = await authenticate(strategy, createPayloadMock());

    expect(result.user).toMatchObject({ role: "staff" });
  });

  it("uses a trusted data client for the tenant lookup only", async () => {
    const sessionClient = createSupabaseClientMock({ publicTenant: null });
    const trustedDataClient = createSupabaseClientMock({
      publicTenant: { id: TENANT_1, name: "Tenant One", slug: "tenant-one" },
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: sessionClient.createServerClientMock as never,
      createSupabaseDataClient: vi.fn(() => ({
        from: trustedDataClient.from,
      })) as never,
    });
    const payload = createPayloadMock();

    const result = await authenticate(strategy, payload);

    expect(sessionClient.getUser).toHaveBeenCalledTimes(1);
    expect(sessionClient.rpc).toHaveBeenCalledOnce();
    expect(trustedDataClient.rpc).not.toHaveBeenCalled();
    expect(trustedDataClient.from).toHaveBeenCalledExactlyOnceWith("tenants");
    expect(result.user).toMatchObject({
      collection: "cms-users",
      publicTenantId: TENANT_1,
      role: "staff",
      tenantId: "17",
    });
  });

  it("completes cookie auth when service role env is set if data client is injected", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "unit-test-service-role-key";
    const sessionClient = createSupabaseClientMock({
      assignments: [assignment(TENANT_1, "staff", "development", true)],
    });
    const trustedDataClient = createSupabaseClientMock({
      publicTenant: { id: TENANT_1, name: "Tenant One", slug: "tenant-one" },
    });
    const createSupabaseDataClient = vi.fn(() => ({
      from: trustedDataClient.from,
    }));

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: sessionClient.createServerClientMock as never,
      createSupabaseDataClient: createSupabaseDataClient as never,
    });
    const payload = createPayloadMock();

    const result = await authenticate(strategy, payload);

    expect(createSupabaseDataClient).toHaveBeenCalledTimes(1);
    expect(result.user).toMatchObject({
      collection: "cms-users",
      role: "admin",
      publicTenantId: TENANT_1,
    });
  });
});
