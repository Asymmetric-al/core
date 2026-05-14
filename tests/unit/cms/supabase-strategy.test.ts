import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createE2EAuthCookieValue } from "@asym/auth/e2e-auth";

type SupabaseAuthStrategyFactory = (dependencies?: {
  createSupabaseClient?: unknown;
}) => {
  authenticate: (...args: unknown[]) => Promise<{ user: unknown }>;
};

type SupabaseClientMockOptions = {
  role?: string | null;
  tenantId?: string | null;
  staffMembershipRole?: string | null;
  userId?: string;
  email?: string;
  publicTenant?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

const DEFAULT_SUPER_ADMIN_TENANT = "00000000-0000-0000-0000-000000000001";

let createSupabaseAuthStrategy: SupabaseAuthStrategyFactory;

beforeAll(async () => {
  const module =
    await import("../../../apps/admin/src/cms/auth/supabase-strategy");
  createSupabaseAuthStrategy = module.createSupabaseAuthStrategy;
});

function createQueryChain(result: unknown, terminal: "single" | "maybeSingle") {
  const chain = {
    eq: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
  };

  return {
    select: vi.fn(() => chain),
    chain,
    terminal: chain[terminal],
  };
}

function createSupabaseClientMock({
  role = "staff",
  tenantId = "tenant_1",
  staffMembershipRole = null,
  userId = "supabase-user-1",
  email = "staff@example.org",
  publicTenant,
}: SupabaseClientMockOptions = {}) {
  const getUser = vi.fn().mockResolvedValue({
    data: {
      user: userId
        ? {
            id: userId,
            email,
          }
        : null,
    },
  });
  const profileQuery = createQueryChain(
    {
      data:
        role || tenantId
          ? {
              role,
              tenant_id: tenantId,
            }
          : null,
    },
    "single",
  );
  const resolvedPublicTenant =
    publicTenant === undefined
      ? {
          id: tenantId ?? DEFAULT_SUPER_ADMIN_TENANT,
          name: "Tenant One",
          slug: "tenant-one",
        }
      : publicTenant;
  const publicTenantQuery = createQueryChain(
    {
      data: resolvedPublicTenant,
    },
    "maybeSingle",
  );
  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return { select: profileQuery.select };
    }

    if (table === "tenants") {
      return { select: publicTenantQuery.select };
    }

    return {
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })),
    };
  });

  const membershipQuery = createQueryChain(
    {
      data:
        typeof staffMembershipRole === "string"
          ? { staff_role: staffMembershipRole }
          : null,
    },
    "maybeSingle",
  );
  const schema = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: membershipQuery.select,
    }),
  });

  const createServerClientMock = vi.fn().mockReturnValue({
    auth: { getUser },
    from,
    schema,
  });

  return {
    createServerClientMock,
    getUser,
    from,
    schema,
    profileQuery,
    publicTenantQuery,
    membershipQuery,
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

describe("createSupabaseAuthStrategy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    delete process.env.E2E_AUTH_BYPASS;
    delete process.env.ASYM_E2E_AUTH_SURFACE;
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

  it("authenticates admin E2E bypass cookies through normal Payload users", async () => {
    process.env.E2E_AUTH_BYPASS = "true";
    const { createServerClientMock } = createSupabaseClientMock({
      userId: "",
    });
    const e2eCookie = createE2EAuthCookieValue({
      role: "admin",
      tenantId: null,
      userId: "e2e-admin-user",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
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
    const { createServerClientMock } = createSupabaseClientMock({
      userId: "",
    });
    const e2eCookie = createE2EAuthCookieValue({
      role: "donor",
      tenantId: null,
      userId: "e2e-donor-user",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
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

  it("creates a CMS user against the mirrored Payload tenant", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
      staffMembershipRole: "member_care",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(createServerClientMock).toHaveBeenCalledTimes(1);
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
      publicTenantId: "tenant_1",
      role: "staff",
      tenantId: "17",
    });
  });

  it("skips write operations when the existing user is already in sync", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
      staffMembershipRole: "member_care",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock({
      existingUser: {
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: "supabase-user-1",
        tenantId: "17",
      },
    });

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      collection: "cms-users",
      id: "cms_user_1",
      publicTenantId: "tenant_1",
      tenantId: "17",
    });
  });

  it("updates the CMS user when Supabase profile data changes tenant", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
      tenantId: "tenant_2",
      staffMembershipRole: "finance",
      publicTenant: {
        id: "tenant_2",
        name: "Tenant Two",
        slug: "tenant-two",
      },
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock({
      cmsTenant: { id: 22, name: "Tenant Two", slug: "tenant-two" },
      existingUser: {
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: "supabase-user-1",
        tenantId: "17",
      },
    });

    await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

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

  it("rejects non-staff profile roles", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(result.user).toBeNull();
    expect(payload.find).not.toHaveBeenCalled();
  });

  it("accepts active staff membership even when profile role is donor", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
      staffMembershipRole: "finance",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(result.user).toMatchObject({
      collection: "cms-users",
      publicTenantId: "tenant_1",
      role: "staff",
      tenantId: "17",
    });
  });

  it("accepts admin profile roles without giving them CRM ownership", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "admin",
      staffMembershipRole: null,
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock();

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(result.user).toMatchObject({
      collection: "cms-users",
      publicTenantId: "tenant_1",
      role: "admin",
      tenantId: "17",
    });
  });

  it("accepts tenantless super admins using the default tenant context", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "super_admin",
      tenantId: null,
      publicTenant: {
        id: DEFAULT_SUPER_ADMIN_TENANT,
        name: "Default Tenant",
        slug: "default",
      },
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = createPayloadMock({
      cmsTenant: { id: 17, name: "Default Tenant", slug: "default" },
    });

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(result.user).toMatchObject({
      collection: "cms-users",
      publicTenantId: DEFAULT_SUPER_ADMIN_TENANT,
      role: "super_admin",
      tenantId: "17",
    });
  });
});
