import { postIdParamSchema } from "../schemas/posts";
import { ApiHttpError } from "../shared/http-errors";

import type { AuthContext } from "@asym/auth/context";
import type { createClient } from "@asym/database/supabase/server";

type PostsRouteSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface ReactionRouteContext {
  postId: string;
  userId: string;
  tenantId: string;
}

/**
 * The post, actor and tenant of a reaction. The tenant is the one the
 * request's resolved assignment acts in (AL-2675, NR-68), never
 * the profile's tenant column, which a person in two organizations has for one at
 * most. The post must be in that tenant.
 */
export async function resolveReactionRouteContext(
  auth: AuthContext,
  supabase: PostsRouteSupabaseClient,
  params: Promise<{ postId: string }>,
): Promise<ReactionRouteContext> {
  if (!auth.isAuthenticated || !auth.userId || !auth.tenantId) {
    throw new ApiHttpError(401, "Unauthorized");
  }
  const { postId } = postIdParamSchema.parse(await params);

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("tenant_id")
    .eq("id", postId)
    .eq("tenant_id", auth.tenantId)
    .single();

  if (postError || post?.tenant_id !== auth.tenantId) {
    throw new ApiHttpError(404, "Post not found");
  }

  return {
    postId,
    userId: auth.userId,
    tenantId: auth.tenantId,
  };
}
