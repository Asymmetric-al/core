import { describe, expect, it, vi } from "vitest";

import { addMinistryUpdateComment } from "../../src/posts/ministry-update-comment";

import type { MinistryUpdateCommentRpcInvoker } from "../../src/posts/ministry-update-comment";

function mockRpc(
  result: Awaited<ReturnType<MinistryUpdateCommentRpcInvoker>>,
): MinistryUpdateCommentRpcInvoker {
  return vi.fn().mockResolvedValue(result);
}

describe("addMinistryUpdateComment", () => {
  it("returns the comment id from atomic_add_post_comment", async () => {
    const rpc = mockRpc({
      data: { comment_id: "comment-1" },
      error: null,
    });

    const result = await addMinistryUpdateComment({
      rpc,
      postId: "post-1",
      userId: "user-1",
      tenantId: "tenant-1",
      content: "Praying with you",
    });

    expect(result).toEqual({ ok: true, commentId: "comment-1" });
    expect(rpc).toHaveBeenCalledWith("atomic_add_post_comment", {
      p_post_id: "post-1",
      p_user_id: "user-1",
      p_tenant_id: "tenant-1",
      p_content: "Praying with you",
    });
  });

  it("parses an array-shaped comment payload", async () => {
    const rpc = mockRpc({
      data: [{ comment_id: "comment-2" }],
      error: null,
    });

    await expect(
      addMinistryUpdateComment({
        rpc,
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
        content: "Amen",
      }),
    ).resolves.toEqual({ ok: true, commentId: "comment-2" });
  });

  it("maps P0002 to not_found", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "P0002", message: "no rows" },
    });

    await expect(
      addMinistryUpdateComment({
        rpc,
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
        content: "Hello",
      }),
    ).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "Post not found",
    });
  });

  it("maps other RPC errors to failed with the RPC message", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "XX000", message: "database exploded" },
    });

    await expect(
      addMinistryUpdateComment({
        rpc,
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
        content: "Hello",
      }),
    ).resolves.toEqual({
      ok: false,
      code: "failed",
      message: "database exploded",
    });
  });

  it("treats a missing comment_id as incomplete", async () => {
    const rpc = mockRpc({ data: {}, error: null });

    await expect(
      addMinistryUpdateComment({
        rpc,
        postId: "post-1",
        userId: "user-1",
        tenantId: "tenant-1",
        content: "Hello",
      }),
    ).resolves.toEqual({
      ok: false,
      code: "incomplete",
      message: "Failed to create comment",
    });
  });
});
