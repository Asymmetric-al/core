import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidateTagMock } = vi.hoisted(() => ({
  revalidateTagMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import { applyMinistryUpdateReaction } from "../../src/posts/ministry-update-reaction";

import type {
  MinistryUpdateReactionKind,
  MinistryUpdateReactionRpcInvoker,
} from "../../src/posts/ministry-update-reaction";

const POST_ID = "post-1";
const USER_ID = "user-1";
const TENANT_ID = "tenant-1";

const KIND_TO_RPC: Array<{
  kind: MinistryUpdateReactionKind;
  rpcName: string;
}> = [
  { kind: "like", rpcName: "atomic_like_post" },
  { kind: "unlike", rpcName: "atomic_unlike_post" },
  { kind: "pray", rpcName: "atomic_pray_for_post" },
  { kind: "unpray", rpcName: "atomic_unpray_for_post" },
  { kind: "fire", rpcName: "atomic_fire_post" },
  { kind: "unfire", rpcName: "atomic_unfire_post" },
];

function mockRpc(
  result: Awaited<ReturnType<MinistryUpdateReactionRpcInvoker>>,
): MinistryUpdateReactionRpcInvoker {
  return vi.fn().mockResolvedValue(result);
}

describe("applyMinistryUpdateReaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(KIND_TO_RPC)("maps $kind to $rpcName", async ({ kind, rpcName }) => {
    const rpc = mockRpc({ data: { applied: true }, error: null });

    const result = await applyMinistryUpdateReaction({
      rpc,
      kind,
      postId: POST_ID,
      userId: USER_ID,
      tenantId: TENANT_ID,
    });

    expect(result).toEqual({ ok: true, applied: true });
    expect(rpc).toHaveBeenCalledWith(rpcName, {
      p_post_id: POST_ID,
      p_user_id: USER_ID,
      p_tenant_id: TENANT_ID,
    });
  });

  it("revalidates tenant and post tags when applied", async () => {
    const rpc = mockRpc({ data: { applied: true }, error: null });

    await applyMinistryUpdateReaction({
      rpc,
      kind: "like",
      postId: POST_ID,
      userId: USER_ID,
      tenantId: TENANT_ID,
    });

    expect(revalidateTagMock).toHaveBeenNthCalledWith(
      1,
      `posts:tenant:${TENANT_ID}`,
      "max",
    );
    expect(revalidateTagMock).toHaveBeenNthCalledWith(
      2,
      `post:${POST_ID}`,
      "max",
    );
  });

  it("does not revalidate when applied is false", async () => {
    const rpc = mockRpc({ data: { applied: false }, error: null });

    await expect(
      applyMinistryUpdateReaction({
        rpc,
        kind: "like",
        postId: POST_ID,
        userId: USER_ID,
        tenantId: TENANT_ID,
      }),
    ).resolves.toEqual({ ok: true, applied: false });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("parses an array-shaped applied payload", async () => {
    const rpc = mockRpc({ data: [{ applied: true }], error: null });

    await expect(
      applyMinistryUpdateReaction({
        rpc,
        kind: "pray",
        postId: POST_ID,
        userId: USER_ID,
        tenantId: TENANT_ID,
      }),
    ).resolves.toEqual({ ok: true, applied: true });
    expect(revalidateTagMock).toHaveBeenCalled();
  });

  it("maps P0002 to not_found with Post not found", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "P0002", message: "no rows" },
    });

    await expect(
      applyMinistryUpdateReaction({
        rpc,
        kind: "like",
        postId: POST_ID,
        userId: USER_ID,
        tenantId: TENANT_ID,
      }),
    ).resolves.toEqual({
      ok: false,
      code: "not_found",
      message: "Post not found",
    });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("maps other RPC errors to failed with the RPC message", async () => {
    const rpc = mockRpc({
      data: null,
      error: { code: "XX000", message: "database exploded" },
    });

    await expect(
      applyMinistryUpdateReaction({
        rpc,
        kind: "like",
        postId: POST_ID,
        userId: USER_ID,
        tenantId: TENANT_ID,
      }),
    ).resolves.toEqual({
      ok: false,
      code: "failed",
      message: "database exploded",
    });
  });
});
