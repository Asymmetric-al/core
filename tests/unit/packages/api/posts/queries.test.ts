import { describe, expect, it, vi } from "vitest";

import { getPostReactionStatus } from "../../../../../packages/api/src/posts/queries";

function createReactionQueryMock(result: {
  data: Array<{ post_id: string }> | null;
  error: { message: string } | null;
}) {
  const eq = vi.fn().mockResolvedValue(result);
  const inFn = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  return { select, in: inFn, eq, inFn };
}

describe("api/posts/queries", () => {
  it("returns reaction sets for a user (happy path)", async () => {
    const likes = createReactionQueryMock({
      data: [{ post_id: "post-1" }],
      error: null,
    });
    const prayers = createReactionQueryMock({
      data: [{ post_id: "post-2" }],
      error: null,
    });
    const fires = createReactionQueryMock({
      data: [{ post_id: "post-3" }],
      error: null,
    });

    const from = vi.fn((table: string) => {
      if (table === "post_likes") return likes;
      if (table === "post_prayers") return prayers;
      if (table === "post_fires") return fires;
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from };

    const result = await getPostReactionStatus(
      supabase,
      ["post-1", "post-2", "post-3"],
      "user-1",
    );

    expect(result.likedSet.has("post-1")).toBe(true);
    expect(result.prayedSet.has("post-2")).toBe(true);
    expect(result.firedSet.has("post-3")).toBe(true);
    expect(likes.select).toHaveBeenCalledWith("post_id");
    expect(likes.inFn).toHaveBeenCalledWith("post_id", [
      "post-1",
      "post-2",
      "post-3",
    ]);
    expect(likes.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("returns empty sets when queries return no rows", async () => {
    const likes = createReactionQueryMock({ data: null, error: null });
    const prayers = createReactionQueryMock({ data: null, error: null });
    const fires = createReactionQueryMock({ data: null, error: null });

    const from = vi.fn((table: string) => {
      if (table === "post_likes") return likes;
      if (table === "post_prayers") return prayers;
      if (table === "post_fires") return fires;
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from };

    const result = await getPostReactionStatus(supabase, ["post-1"], "user-1");

    expect(result.likedSet.size).toBe(0);
    expect(result.prayedSet.size).toBe(0);
    expect(result.firedSet.size).toBe(0);
  });

  it("returns partial sets when one query errors", async () => {
    const likes = createReactionQueryMock({
      data: null,
      error: { message: "likes query failed" },
    });
    const prayers = createReactionQueryMock({
      data: [{ post_id: "post-2" }],
      error: null,
    });
    const fires = createReactionQueryMock({
      data: [{ post_id: "post-3" }],
      error: null,
    });

    const from = vi.fn((table: string) => {
      if (table === "post_likes") return likes;
      if (table === "post_prayers") return prayers;
      if (table === "post_fires") return fires;
      throw new Error(`Unexpected table: ${table}`);
    });
    const supabase = { from };

    const result = await getPostReactionStatus(
      supabase,
      ["post-2", "post-3"],
      "user-1",
    );

    expect(result.likedSet.size).toBe(0);
    expect(result.prayedSet.has("post-2")).toBe(true);
    expect(result.firedSet.has("post-3")).toBe(true);
  });
});
