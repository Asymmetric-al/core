import { revalidateTag } from "next/cache";

import { postIdParamSchema } from "../schemas/posts";
import { CACHE_TAGS } from "../shared/cache-tags";
import { ApiHttpError } from "../shared/http-errors";

import type { createClient } from "@asym/database/supabase/server";

type PostsRouteSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type ReactionTableName = "post_likes" | "post_prayers" | "post_fires";

export interface ReactionRouteContext {
  postId: string;
  userId: string;
  tenantId: string;
}

export async function resolveReactionRouteContext(
  supabase: PostsRouteSupabaseClient,
  params: Promise<{ postId: string }>,
): Promise<ReactionRouteContext> {
  const { postId } = postIdParamSchema.parse(await params);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new ApiHttpError(401, "Unauthorized");
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("tenant_id")
    .eq("id", postId)
    .single();

  if (postError || !post?.tenant_id) {
    throw new ApiHttpError(404, "Post not found");
  }

  return {
    postId,
    userId: user.id,
    tenantId: post.tenant_id,
  };
}

export function revalidatePostReactionTags({
  postId,
  tenantId,
}: Pick<ReactionRouteContext, "postId" | "tenantId">) {
  revalidateTag(CACHE_TAGS.tenantPosts(tenantId), "max");
  revalidateTag(CACHE_TAGS.post(postId), "max");
}
