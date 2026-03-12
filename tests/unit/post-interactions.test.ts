import { describe, expect, it, vi } from "vitest";

import {
  fetchUserPostInteractions,
  fetchUserPostInteractionSets,
  toUserPostInteractionSets,
  type UserPostInteractionRow,
} from "../../packages/database/supabase/post-interactions";

describe("post interaction helpers", () => {
  it("normalizes post IDs before calling the RPC", async () => {
    const rows: UserPostInteractionRow[] = [
      {
        post_id: "post-1",
        user_liked: true,
        user_prayed: false,
        user_fired: true,
      },
    ];
    const rpc = vi.fn().mockResolvedValue({ data: rows, error: null });
    const supabaseAdmin = { rpc };

    const result = await fetchUserPostInteractions(
      supabaseAdmin as never,
      "user-1",
      [" post-1 ", "post-1", "", "post-2"],
    );

    expect(rpc).toHaveBeenCalledWith("get_user_post_interactions", {
      p_user_id: "user-1",
      p_post_ids: ["post-1", "post-2"],
    });
    expect(result).toEqual(rows);
  });

  it("returns early when user or post IDs are missing", async () => {
    const rpc = vi.fn();
    const supabaseAdmin = { rpc };

    await expect(
      fetchUserPostInteractions(supabaseAdmin as never, "", ["post-1"]),
    ).resolves.toEqual([]);
    await expect(
      fetchUserPostInteractions(supabaseAdmin as never, "user-1", []),
    ).resolves.toEqual([]);

    expect(rpc).not.toHaveBeenCalled();
  });

  it("throws when the RPC returns an error", async () => {
    const rpcError = new Error("rpc failed");
    const rpc = vi.fn().mockResolvedValue({ data: null, error: rpcError });
    const supabaseAdmin = { rpc };

    await expect(
      fetchUserPostInteractions(supabaseAdmin as never, "user-1", ["post-1"]),
    ).rejects.toThrow("rpc failed");
  });

  it("maps rows to membership sets", async () => {
    const rows: UserPostInteractionRow[] = [
      {
        post_id: "post-1",
        user_liked: true,
        user_prayed: false,
        user_fired: true,
      },
      {
        post_id: "post-2",
        user_liked: false,
        user_prayed: true,
        user_fired: false,
      },
    ];
    const rpc = vi.fn().mockResolvedValue({ data: rows, error: null });
    const supabaseAdmin = { rpc };

    const setsFromRows = toUserPostInteractionSets(rows);
    const setsFromFetch = await fetchUserPostInteractionSets(
      supabaseAdmin as never,
      "user-1",
      ["post-1", "post-2"],
    );

    expect(setsFromRows.likedPostIds.has("post-1")).toBe(true);
    expect(setsFromRows.prayedPostIds.has("post-2")).toBe(true);
    expect(setsFromRows.firedPostIds.has("post-1")).toBe(true);

    expect(Array.from(setsFromFetch.likedPostIds)).toEqual(["post-1"]);
    expect(Array.from(setsFromFetch.prayedPostIds)).toEqual(["post-2"]);
    expect(Array.from(setsFromFetch.firedPostIds)).toEqual(["post-1"]);
  });
});
