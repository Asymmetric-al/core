import {
  addMinistryUpdateComment,
  type MinistryUpdateCommentRpcInvoker,
} from "@asym/api/posts/ministry-update-comment";
import {
  applyMinistryUpdateReaction,
  type MinistryUpdateReactionKind,
  type MinistryUpdateReactionRpcInvoker,
} from "@asym/api/posts/ministry-update-reaction";

export type GraphQLMinistryUpdateReactionKind = Exclude<
  MinistryUpdateReactionKind,
  "fire" | "unfire"
>;

export type ApplyGraphQLMinistryUpdateReactionInput = {
  rpc: MinistryUpdateReactionRpcInvoker;
  kind: GraphQLMinistryUpdateReactionKind;
  postId: string;
  userId: string;
  tenantId: string;
};

export type AddGraphQLMinistryUpdateCommentInput = {
  rpc: MinistryUpdateCommentRpcInvoker;
  postId: string;
  userId: string;
  tenantId: string;
  content: string;
};

export async function applyGraphQLMinistryUpdateReaction(
  input: ApplyGraphQLMinistryUpdateReactionInput,
): Promise<true> {
  const result = await applyMinistryUpdateReaction({
    rpc: input.rpc,
    kind: input.kind,
    postId: input.postId,
    userId: input.userId,
    tenantId: input.tenantId,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return true;
}

export async function addGraphQLMinistryUpdateComment(
  input: AddGraphQLMinistryUpdateCommentInput,
): Promise<string> {
  const result = await addMinistryUpdateComment({
    rpc: input.rpc,
    postId: input.postId,
    userId: input.userId,
    tenantId: input.tenantId,
    content: input.content,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  return result.commentId;
}
