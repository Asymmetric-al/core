import { commandClient, type CommandRefusal } from "./command-client";
import { normalizeStoredPostContent } from "./content";
import { FEED_POST_SELECT } from "./select";

import type { FeedPostRow } from "./select";
import type { PostWriteInput } from "../schemas/posts";
import type { RequestSessionClient } from "../shared/request-session-client";
import type { AuthenticatedContext } from "@asym/auth/context";

type CreatePostResult =
  | { ok: true; post: FeedPostRow }
  | { ok: false; status: number; error: string };

function refused(error: CommandRefusal): CreatePostResult {
  if (error.code === "42501")
    return { ok: false, status: 403, error: "Forbidden" };
  if (error.code === "22023")
    return {
      ok: false,
      status: 400,
      error: error.message ?? "Invalid update",
    };
  return { ok: false, status: 500, error: error.message ?? "Internal error" };
}

export async function createMissionaryPost({
  supabase,
  auth,
  input,
}: {
  supabase: RequestSessionClient;
  auth: AuthenticatedContext;
  input: PostWriteInput;
}): Promise<CreatePostResult> {
  const { data, error } = await commandClient(supabase).rpc(
    "submit_ministry_update",
    {
      p_tenant_id: auth.tenantId,
      p_post_id: null,
      p_title: input.title ?? null,
      p_content: normalizeStoredPostContent(input.content),
      p_media: input.media,
      p_visibility: input.visibility,
      p_post_type: input.post_type,
      p_publish: input.status === "published",
    },
  );
  if (error) return refused(error);
  if (typeof data !== "string" || data === "") {
    return { ok: false, status: 500, error: "Failed to create post" };
  }

  const { data: post, error: readError } = await supabase
    .from("posts")
    .select(FEED_POST_SELECT)
    .eq("id", data)
    .single();
  if (readError || !post) {
    return {
      ok: false,
      status: 500,
      error: readError?.message ?? "Post not found",
    };
  }

  return { ok: true, post: post as unknown as FeedPostRow };
}
