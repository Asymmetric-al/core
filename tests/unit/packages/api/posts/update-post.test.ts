import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

import { PATCH } from "../../../../../packages/api/src/posts/post";

const state = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => ({ userId: "user-1", tenantId: "tenant-1" }),
  requireRole: vi.fn(),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: {
      from: () => {
        const query = {
          select: () => query,
          eq: () => query,
          single: async () => ({
            data: { missionary_id: "profile-1" },
            error: null,
          }),
        };
        return query;
      },
      rpc: state.rpc,
    },
  }),
}));
vi.mock("../../../../../packages/api/src/shared/queries", () => ({
  findProfileByUserId: async () => ({ data: { id: "profile-1" }, error: null }),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const version = "2026-11-11T12:00:00.000Z";
const postId = "11111111-2222-4333-8444-555555555555";
const request = (body: Record<string, unknown>) =>
  new NextRequest(`http://localhost/api/posts/${postId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const params = { params: Promise.resolve({ postId }) };
beforeEach(() => state.rpc.mockReset());

it("passes draft and revision preconditions into the atomic autosave", async () => {
  state.rpc.mockResolvedValue({ error: null });
  const response = await PATCH(
    request({
      content: "<p>New draft text</p>",
      status: "draft",
      autosave: true,
      expected_updated_at: version,
    }),
    params,
  );
  expect(response.status).toBe(200);
  expect(state.rpc).toHaveBeenCalledWith(
    "atomic_update_post_with_audit",
    expect.objectContaining({
      p_post_id: postId,
      p_tenant_id: "tenant-1",
      p_actor_user_id: "user-1",
      p_updates: expect.objectContaining({
        expected_status: "draft",
        expected_updated_at: version,
      }),
    }),
  );
});

it("returns a conflict for a stale atomic write", async () => {
  state.rpc.mockResolvedValue({
    error: { code: "40001", message: "Post changed" },
  });
  const response = await PATCH(
    request({ status: "draft", autosave: true, expected_updated_at: version }),
    params,
  );
  expect(response.status).toBe(409);
});

it("refuses an autosave without its revision or with a published status", async () => {
  for (const body of [
    { autosave: true, status: "draft" },
    { autosave: true, status: "published", expected_updated_at: version },
  ]) {
    const response = await PATCH(request(body), params);
    expect(response.status).toBe(400);
  }
  expect(state.rpc).not.toHaveBeenCalled();
});
