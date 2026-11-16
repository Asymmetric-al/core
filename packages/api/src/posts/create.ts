import { normalizeStoredPostContent } from "./content";
import { findProfileByUserId } from "../shared/queries";

import type { PostWriteInput } from "../schemas/posts";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type CreatePostResult =
  | { ok: true; post: Record<string, unknown> }
  | { ok: false; status: number; error: string };

/**
 * Creates a missionary's own ministry update. The post and its audit entry
 * are written by one RPC with every attribute (title, type, visibility,
 * status), so a draft or partners-only update is never briefly public.
 * `posts.missionary_id` references `profiles.id`, so the author is the
 * caller's profile in this tenant.
 */
export async function createMissionaryPost({
  supabaseAdmin,
  auth,
  input,
  request,
}: {
  supabaseAdmin: AdminSupabaseClient;
  auth: AuthenticatedContext;
  input: PostWriteInput;
  request: Request;
}): Promise<CreatePostResult> {
  const { data: profile } = await findProfileByUserId(
    supabaseAdmin,
    auth.userId,
    auth.tenantId,
  );
  if (!profile) {
    return { ok: false, status: 404, error: "Profile not found" };
  }

  const { data, error } = await supabaseAdmin.rpc(
    "atomic_create_post_with_audit",
    {
      p_tenant_id: auth.tenantId,
      p_missionary_id: profile.id,
      p_title: input.title ?? null,
      p_content: normalizeStoredPostContent(input.content),
      p_media: input.media,
      p_post_type: input.post_type,
      p_visibility: input.visibility,
      p_status: input.status,
      p_actor_user_id: auth.userId,
      p_ip_address: request.headers.get("x-forwarded-for"),
      p_user_agent: request.headers.get("user-agent"),
    },
  );
  if (error) {
    return { ok: false, status: 500, error: error.message };
  }

  const postId = (data as { post_id?: string } | null)?.post_id;
  if (!postId) {
    return { ok: false, status: 500, error: "Failed to create post" };
  }

  const { data: post, error: readError } = await supabaseAdmin
    .from("posts")
    .select(
      `
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `,
    )
    .eq("id", postId)
    .single();
  if (readError || !post) {
    return {
      ok: false,
      status: 500,
      error: readError?.message ?? "Post not found",
    };
  }

  return { ok: true, post: post as Record<string, unknown> };
}
