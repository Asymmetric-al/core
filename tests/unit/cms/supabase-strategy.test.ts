import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type SupabaseAuthStrategyFactory = (dependencies?: {
  createSupabaseClient?: unknown;
}) => {
  authenticate: (...args: unknown[]) => Promise<{ user: unknown }>;
};

let createSupabaseAuthStrategy: SupabaseAuthStrategyFactory;

beforeAll(async () => {
  const module =
    await import("../../../apps/admin/src/cms/auth/supabase-strategy");
  createSupabaseAuthStrategy = module.createSupabaseAuthStrategy;
});

function createSupabaseClientMock({
  role = "staff",
  tenantId = "tenant_1",
  staffMembershipRole = null,
  userId = "supabase-user-1",
  email = "staff@example.org",
}: {
  role?: string | null;
  tenantId?: string | null;
  staffMembershipRole?: string | null;
  userId?: string;
  email?: string;
}) {
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
  const single = vi.fn().mockResolvedValue({
    data:
      role || tenantId
        ? {
            role,
            tenant_id: tenantId,
          }
        : null,
  });
  const profileEq = vi.fn().mockReturnThis();
  const profileSelect = vi.fn().mockReturnValue({
    eq: profileEq,
    single,
  });
  const from = vi.fn().mockReturnValue({ select: profileSelect });

  const membershipMaybeSingle = vi.fn().mockResolvedValue({
    data:
      typeof staffMembershipRole === "string"
        ? { staff_role: staffMembershipRole }
        : null,
  });
  const membershipEq = vi.fn().mockReturnThis();
  const membershipLimit = vi.fn().mockReturnThis();
  const membershipSelect = vi.fn().mockReturnValue({
    eq: membershipEq,
    limit: membershipLimit,
    maybeSingle: membershipMaybeSingle,
  });
  const schema = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: membershipSelect,
    }),
  });

  const createServerClientMock = vi.fn().mockReturnValue({
    auth: { getUser },
    from,
    schema,
  });

  return { createServerClientMock, getUser, from, schema };
}

describe("createSupabaseAuthStrategy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("returns null when Supabase env is missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const strategy = createSupabaseAuthStrategy();
    const payload = {
      create: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
    };

    const result = await strategy.authenticate({
      headers: new Headers(),
      payload,
    } as never);

    expect(result.user).toBeNull();
  });

  it("creates a CMS user when no synced user exists", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
      staffMembershipRole: "member_care",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = {
      create: vi.fn().mockResolvedValue({
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: "supabase-user-1",
        tenantId: "tenant_1",
      }),
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn(),
    };

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(createServerClientMock).toHaveBeenCalledTimes(1);
    expect(payload.create).toHaveBeenCalledTimes(1);
    expect(payload.update).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      collection: "cms-users",
      id: "cms_user_1",
      role: "staff",
      tenantId: "tenant_1",
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
    const payload = {
      create: vi.fn(),
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            email: "staff@example.org",
            id: "cms_user_1",
            role: "staff",
            supabaseUserId: "supabase-user-1",
            tenantId: "tenant_1",
          },
        ],
      }),
      update: vi.fn(),
    };

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
    expect(result.user).toMatchObject({
      collection: "cms-users",
      id: "cms_user_1",
    });
  });

  it("updates the CMS user when Supabase profile data changes", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "donor",
      tenantId: "tenant_2",
      staffMembershipRole: "finance",
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = {
      create: vi.fn(),
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            email: "staff@example.org",
            id: "cms_user_1",
            role: "staff",
            supabaseUserId: "supabase-user-1",
            tenantId: "tenant_1",
          },
        ],
      }),
      update: vi.fn().mockResolvedValue({
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: "supabase-user-1",
        tenantId: "tenant_2",
      }),
    };

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
          tenantId: "tenant_2",
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
    const payload = {
      create: vi.fn(),
      find: vi.fn(),
      update: vi.fn(),
    };

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
    const payload = {
      create: vi.fn().mockResolvedValue({
        email: "staff@example.org",
        id: "cms_user_1",
        role: "staff",
        supabaseUserId: "supabase-user-1",
        tenantId: "tenant_1",
      }),
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn(),
    };

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(result.user).toMatchObject({
      collection: "cms-users",
      role: "staff",
      tenantId: "tenant_1",
    });
  });

  it("accepts tenantless super admins using the default tenant context", async () => {
    const { createServerClientMock } = createSupabaseClientMock({
      role: "super_admin",
      tenantId: null,
    });

    const strategy = createSupabaseAuthStrategy({
      createSupabaseClient: createServerClientMock as never,
    });
    const payload = {
      create: vi.fn().mockResolvedValue({
        email: "staff@example.org",
        id: "cms_user_1",
        role: "super_admin",
        supabaseUserId: "supabase-user-1",
        tenantId: "00000000-0000-0000-0000-000000000001",
      }),
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn(),
    };

    const result = await strategy.authenticate({
      headers: new Headers({ cookie: "sb-access-token=test" }),
      payload,
    } as never);

    expect(result.user).toMatchObject({
      collection: "cms-users",
      role: "super_admin",
      tenantId: "00000000-0000-0000-0000-000000000001",
    });
  });
});
