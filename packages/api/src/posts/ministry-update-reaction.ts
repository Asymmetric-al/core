import { CACHE_TAGS, revalidateTags } from "../shared/cache-tags";
import { parseRpcObject } from "../shared/parse-rpc-object";

export type MinistryUpdateReactionKind =
  | "like"
  | "unlike"
  | "pray"
  | "unpray"
  | "fire"
  | "unfire";

export type MinistryUpdateReactionRpcName =
  | "atomic_like_post"
  | "atomic_unlike_post"
  | "atomic_pray_for_post"
  | "atomic_unpray_for_post"
  | "atomic_fire_post"
  | "atomic_unfire_post";

export type MinistryUpdateReactionRpcInvoker = (
  name: MinistryUpdateReactionRpcName,
  args: { p_post_id: string; p_user_id: string; p_tenant_id: string },
) => Promise<{
  data: unknown;
  error: { code?: string; message: string } | null;
}>;

export type ApplyMinistryUpdateReactionInput = {
  rpc: MinistryUpdateReactionRpcInvoker;
  kind: MinistryUpdateReactionKind;
  postId: string;
  userId: string;
  tenantId: string;
};

export type ApplyMinistryUpdateReactionResult =
  | { ok: true; applied: boolean }
  | { ok: false; code: "not_found"; message: string }
  | { ok: false; code: "failed"; message: string };

type ReactionRpcPayload = {
  applied?: unknown;
};

function rpcNameForKind(
  kind: MinistryUpdateReactionKind,
): MinistryUpdateReactionRpcName {
  switch (kind) {
    case "like":
      return "atomic_like_post";
    case "unlike":
      return "atomic_unlike_post";
    case "pray":
      return "atomic_pray_for_post";
    case "unpray":
      return "atomic_unpray_for_post";
    case "fire":
      return "atomic_fire_post";
    case "unfire":
      return "atomic_unfire_post";
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown Ministry Update reaction kind: ${_exhaustive}`);
    }
  }
}

export async function applyMinistryUpdateReaction(
  input: ApplyMinistryUpdateReactionInput,
): Promise<ApplyMinistryUpdateReactionResult> {
  const rpcName = rpcNameForKind(input.kind);
  const { data, error } = await input.rpc(rpcName, {
    p_post_id: input.postId,
    p_user_id: input.userId,
    p_tenant_id: input.tenantId,
  });

  if (error) {
    if (error.code === "P0002") {
      return { ok: false, code: "not_found", message: "Post not found" };
    }
    return { ok: false, code: "failed", message: error.message };
  }

  const parsed = parseRpcObject<ReactionRpcPayload>(data);
  const applied = parsed?.applied === true;
  if (applied) {
    revalidateTags([
      CACHE_TAGS.tenantPosts(input.tenantId),
      CACHE_TAGS.post(input.postId),
    ]);
  }

  return { ok: true, applied };
}
