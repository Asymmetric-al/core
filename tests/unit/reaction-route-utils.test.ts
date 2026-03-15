import { describe, expect, it, vi } from "vitest";

import { ApiHttpError } from "../../packages/api/src/shared/http-errors";
import { resolveReactionRouteContext } from "../../packages/api/src/posts/reaction-route-utils";

function createPostsLookupMock(result: {
  data: { tenant_id: string } | null;
  error: unknown;
}) {
  const single = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  return { from, select, eq, single };
}

describe("reaction route utils", () => {
  it("throws unauthorized when auth user is missing", async () => {
    const lookup = createPostsLookupMock({
      data: { tenant_id: "tenant-1" },
      error: null,
    });
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
  });

  it("validates postId route params", async () => {
    const lookup = createPostsLookupMock({
      data: { tenant_id: "tenant-1" },
      error: null,
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
        Promise.resolve({ postId: "invalid-post-id" }),
      ),
    ).rejects.toThrow("Invalid post ID");
  });

  it("returns post/user/tenant context when inputs are valid", async () => {
    const postId = crypto.randomUUID();
    const lookup = createPostsLookupMock({
      data: { tenant_id: "tenant-1" },
      error: null,
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
    ).resolves.toEqual({
      postId,
      userId: "user-1",
      tenantId: "tenant-1",
    });
    expect(lookup.eq).toHaveBeenCalledWith("id", postId);
  });
});
