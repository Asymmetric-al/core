/**
 * Reaction routes resolve their tenant from the membership the request acts
 * under. Rewritten by the WP2a sweep (AL-2675; plan 12 WP2, the WP2a
 * paragraph; NR-68): the route read `profiles.tenant_id`, which a person who
 * belongs to two organizations has for one at most. The old cases (no
 * profile, no profile tenant, a post of another tenant, the happy path) map
 * to: no resolved assignment, a post of another tenant than the assignment's,
 * and the happy path for the assignment's tenant, which for a person in two
 * tenants is the selected one. Profiles are never read.
 */
import { describe, expect, it, vi } from "vitest";

import { resolveReactionRouteContext } from "../../packages/api/src/posts/reaction-route-utils";
import { ApiHttpError } from "../../packages/api/src/shared/http-errors";
import { membershipsForRole } from "../fixtures/auth-memberships";

import type { AuthContext } from "../../packages/auth/context";

function donorIn(tenantId: string): AuthContext {
  return {
    userId: "user-1",
    email: null,
    tenantId,
    role: "donor",
    memberships: membershipsForRole("donor", tenantId),
    profileId: "profile-1",
    isAuthenticated: true,
  };
}

function client(post: { data: { tenant_id: string } | null; error: unknown }) {
  const single = vi.fn().mockResolvedValue(post);
  const query = { eq: vi.fn(), single };
  query.eq.mockReturnValue(query);
  const select = vi.fn().mockReturnValue(query);
  const from = vi.fn((table: string) => {
    if (table === "posts") return { select };
    throw new Error(`Unexpected table: ${table}`);
  });
  return { supabase: { from } as never, from, eq: query.eq };
}

describe("reaction route utils", () => {
  it("refuses with 401 when no assignment resolved, before any lookup", async () => {
    const c = client({ data: { tenant_id: "tenant-1" }, error: null });
    await expect(
      resolveReactionRouteContext(
        { ...donorIn("tenant-1"), isAuthenticated: false, userId: null },
        c.supabase,
        Promise.resolve({ postId: crypto.randomUUID() }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      status: 401,
      message: "Unauthorized",
    });
    expect(c.from).not.toHaveBeenCalled();
  });

  it("validates postId route params before any lookup", async () => {
    const c = client({ data: { tenant_id: "tenant-1" }, error: null });
    await expect(
      resolveReactionRouteContext(
        donorIn("tenant-1"),
        c.supabase,
        Promise.resolve({ postId: "not-a-uuid" }),
      ),
    ).rejects.toThrow("Invalid post ID");
    expect(c.from).not.toHaveBeenCalled();
  });

  it("fails closed when the post is not in the assignment's tenant", async () => {
    const postId = crypto.randomUUID();
    const c = client({ data: null, error: { code: "PGRST116" } });
    await expect(
      resolveReactionRouteContext(
        donorIn("tenant-1"),
        c.supabase,
        Promise.resolve({ postId }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      status: 404,
      message: "Post not found",
    });
    expect(c.eq).toHaveBeenNthCalledWith(1, "id", postId);
    expect(c.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-1");
  });

  it("acts in the selected tenant for a person in two organizations, never reading profiles", async () => {
    const postId = crypto.randomUUID();
    const c = client({ data: { tenant_id: "tenant-2" }, error: null });
    await expect(
      resolveReactionRouteContext(
        donorIn("tenant-2"),
        c.supabase,
        Promise.resolve({ postId }),
      ),
    ).resolves.toEqual({ postId, userId: "user-1", tenantId: "tenant-2" });
    expect(c.from).toHaveBeenCalledTimes(1);
    expect(c.from).toHaveBeenCalledWith("posts");
    expect(c.eq).toHaveBeenNthCalledWith(2, "tenant_id", "tenant-2");
  });
});
