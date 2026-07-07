import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

/**
 * TDD — finding 06 Gap 3: posts/comments GET reads post_comments (+ joined
 * profiles) via the user-scoped client with no explicit auth call. Add an
 * explicit auth check rather than relying on RLS alone.
 */

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET } from "../../src/posts/comments";

function ctx(postId = "post-1") {
  return { params: Promise.resolve({ postId }) };
}
const request = new Request(
  "https://example.com/api/posts/post-1/comments",
) as unknown as NextRequest;

function mockClient(user: { id: string } | null) {
  const order = vi.fn().mockResolvedValue({ data: [], error: null });
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  createClientMock.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from,
  });
  return { from };
}

describe("posts/comments GET — explicit auth check (finding 06 Gap 3)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 for an unauthenticated caller and never queries comments", async () => {
    const { from } = mockClient(null);
    const res = await GET(request, ctx());
    expect(res.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns comments for an authenticated caller (feature still works)", async () => {
    const { from } = mockClient({ id: "user-1" });
    const res = await GET(request, ctx());
    expect(res.status).toBe(200);
    expect(from).toHaveBeenCalledWith("post_comments");
  });
});
