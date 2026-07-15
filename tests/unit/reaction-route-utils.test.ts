import { describe, expect, it, vi } from "vitest";

import { ApiHttpError } from "../../packages/api/src/shared/http-errors";
import { resolveReactionRouteContext } from "../../packages/api/src/posts/reaction-route-utils";

function createLookupMock(result: {
  data: { tenant_id: string | null } | null;
  error: unknown;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const query = { eq: vi.fn(), single };
  query.eq.mockReturnValue(query);
  const select = vi.fn().mockReturnValue(query);
  return { select, eq: query.eq, single };
}

function createReactionContextMock({
  profile = { data: { tenant_id: "tenant-1" }, error: null },
  post = { data: { tenant_id: "tenant-1" }, error: null },
}: {
  profile?: {
    data: { tenant_id: string | null } | null;
    error: unknown;
  };
  post?: {
    data: { tenant_id: string | null } | null;
    error: unknown;
  };
} = {}) {
  const profileLookup = createLookupMock(profile);
  const postLookup = createLookupMock(post);
  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return { select: profileLookup.select };
    }
    if (table === "posts") {
      return { select: postLookup.select };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  return { from, profileLookup, postLookup };
}

describe("reaction route utils", () => {
  it("throws unauthorized when auth user is missing", async () => {
    const lookup = createReactionContextMock();
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
      from: lookup.from,
    };

    await expect(
      resolveReactionRouteContext(
        supabase as never,
        Promise.resolve({ postId: crypto.randomUUID() }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      status: 401,
      message: "Unauthorized",
    });
    expect(lookup.from).not.toHaveBeenCalled();
  });

  it("validates postId route params", async () => {
    const lookup = createReactionContextMock();
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: lookup.from,
    };

    await expect(
      resolveReactionRouteContext(
        supabase as never,
        Promise.resolve({ postId: "invalid-post-id" }),
      ),
    ).rejects.toThrow("Invalid post ID");
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
    expect(lookup.from).not.toHaveBeenCalled();
  });

  it("fails closed when the authenticated user has no profile", async () => {
    const lookup = createReactionContextMock({
      profile: { data: null, error: { code: "PGRST116" } },
    });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: lookup.from,
    };

    await expect(
      resolveReactionRouteContext(
        supabase as never,
        Promise.resolve({ postId: crypto.randomUUID() }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      status: 404,
      message: "Profile not found",
    });
    expect(lookup.profileLookup.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(lookup.postLookup.select).not.toHaveBeenCalled();
  });

  it("fails closed when the authenticated profile has no tenant", async () => {
    const lookup = createReactionContextMock({
      profile: { data: { tenant_id: null }, error: null },
    });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: lookup.from,
    };

    await expect(
      resolveReactionRouteContext(
        supabase as never,
        Promise.resolve({ postId: crypto.randomUUID() }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      status: 404,
      message: "Profile not found",
    });
    expect(lookup.postLookup.select).not.toHaveBeenCalled();
  });

  it("fails closed when the post does not belong to the profile tenant", async () => {
    const postId = crypto.randomUUID();
    const lookup = createReactionContextMock({
      post: { data: null, error: { code: "PGRST116" } },
    });
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: lookup.from,
    };

    await expect(
      resolveReactionRouteContext(
        supabase as never,
        Promise.resolve({ postId }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      status: 404,
      message: "Post not found",
    });
    expect(lookup.postLookup.eq).toHaveBeenNthCalledWith(1, "id", postId);
    expect(lookup.postLookup.eq).toHaveBeenNthCalledWith(
      2,
      "tenant_id",
      "tenant-1",
    );
  });

  it("returns post/user/tenant context when inputs are valid", async () => {
    const postId = crypto.randomUUID();
    const lookup = createReactionContextMock();
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1" } },
          error: null,
        }),
      },
      from: lookup.from,
    };

    await expect(
      resolveReactionRouteContext(
        supabase as never,
        Promise.resolve({ postId }),
      ),
    ).resolves.toEqual({
      postId,
      userId: "user-1",
      tenantId: "tenant-1",
    });
    expect(lookup.from).toHaveBeenNthCalledWith(1, "profiles");
    expect(lookup.profileLookup.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(lookup.from).toHaveBeenNthCalledWith(2, "posts");
    expect(lookup.postLookup.eq).toHaveBeenNthCalledWith(1, "id", postId);
    expect(lookup.postLookup.eq).toHaveBeenNthCalledWith(
      2,
      "tenant_id",
      "tenant-1",
    );
  });
});
