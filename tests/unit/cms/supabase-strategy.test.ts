import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

let createSupabaseAuthStrategy: typeof import("../../../apps/admin/src/cms/auth/supabase-strategy").createSupabaseAuthStrategy;

beforeAll(async () => {
  const module = await import(
    "../../../apps/admin/src/cms/auth/supabase-strategy"
  );
  createSupabaseAuthStrategy = module.createSupabaseAuthStrategy;
});

function createSupabaseClientMock({
  role = "staff",
  tenantId = "tenant_1",
  userId = "supabase-user-1",
  email = "staff@example.org",
}: {
  role?: string | null;
  tenantId?: string | null;
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
      role && tenantId
        ? {
            role,
            tenant_id: tenantId,
          }
        : null,
  });
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  const createServerClientMock = vi.fn().mockReturnValue({
    auth: { getUser },
    from,
  });

  return { createServerClientMock, getUser, from };
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
    const { createServerClientMock } = createSupabaseClientMock({});

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
    const { createServerClientMock } = createSupabaseClientMock({});

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
      role: "admin",
      tenantId: "tenant_2",
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
        role: "admin",
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
          role: "admin",
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
});
