import { parseRpcObject } from "../shared/parse-rpc-object";

export type MinistryUpdateCommentRpcInvoker = (
  fn: "atomic_add_post_comment",
  args: {
    p_post_id: string;
    p_user_id: string;
    p_tenant_id: string;
    p_content: string;
  },
) => Promise<{
  data: unknown;
  error: { code?: string; message: string } | null;
}>;

export type AddMinistryUpdateCommentInput = {
  rpc: MinistryUpdateCommentRpcInvoker;
  postId: string;
  userId: string;
  tenantId: string;
  content: string;
};

export type AddMinistryUpdateCommentResult =
  | { ok: true; commentId: string }
  | { ok: false; code: "not_found"; message: string }
  | { ok: false; code: "incomplete"; message: string }
  | { ok: false; code: "failed"; message: string };

type AddCommentPayload = {
  comment_id?: unknown;
};

export async function addMinistryUpdateComment(
  input: AddMinistryUpdateCommentInput,
): Promise<AddMinistryUpdateCommentResult> {
  const { data, error } = await input.rpc("atomic_add_post_comment", {
    p_post_id: input.postId,
    p_user_id: input.userId,
    p_tenant_id: input.tenantId,
    p_content: input.content,
  });

  if (error) {
    if (error.code === "P0002") {
      return { ok: false, code: "not_found", message: "Post not found" };
    }
    return { ok: false, code: "failed", message: error.message };
  }

  const parsed = parseRpcObject<AddCommentPayload>(data);
  const commentId = parsed?.comment_id;
  if (typeof commentId !== "string" || commentId.length === 0) {
    return {
      ok: false,
      code: "incomplete",
      message: "Failed to create comment",
    };
  }

  return { ok: true, commentId };
}
