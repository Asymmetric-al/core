import { addMinistryUpdateComment } from "@asym/api/posts/ministry-update-comment";
import {
  applyMinistryUpdateReaction,
  type MinistryUpdateReactionKind,
} from "@asym/api/posts/ministry-update-reaction";

type GraphQLEngagementRpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
};

export type GraphQLMinistryUpdateReactionKind = Exclude<
  MinistryUpdateReactionKind,
  "fire" | "unfire"
>;

export type ApplyGraphQLMinistryUpdateReactionInput = {
  supabaseAdmin: GraphQLEngagementRpcClient;
  kind: GraphQLMinistryUpdateReactionKind;
  postId: string;
  userId: string;
  tenantId: string;
};

export type AddGraphQLMinistryUpdateCommentInput = {
  supabaseAdmin: GraphQLEngagementRpcClient;
  postId: string;
  userId: string;
  tenantId: string;
  content: string;
};

export async function applyGraphQLMinistryUpdateReaction(
  input: ApplyGraphQLMinistryUpdateReactionInput,
): Promise<true> {
  const result = await applyMinistryUpdateReaction({
    rpc: async (name, rpcArgs) => {
      const response = await input.supabaseAdmin.rpc(name, rpcArgs);
      return { data: response.data, error: response.error };
    },
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
    rpc: async (fn, rpcArgs) => {
      const response = await input.supabaseAdmin.rpc(fn, rpcArgs);
      return { data: response.data, error: response.error };
    },
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
