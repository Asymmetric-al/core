import {
  commandClient,
  isWorkerNotLinked,
  UPDATE_NOT_SAVED,
  WORKER_NOT_LINKED,
  WORKER_NOT_LINKED_CODE,
  type CommandRefusal,
} from "./command-client";
import { normalizeStoredPostContent } from "./content";
import { FEED_POST_SELECT } from "./select";

import type { FeedPostRow } from "./select";
import type { PostWriteInput } from "../schemas/posts";
import type { RequestSessionClient } from "../shared/request-session-client";
import type { AuthenticatedContext } from "@asym/auth/context";

type CreatePostResult =
  | { ok: true; post: FeedPostRow }
  | { ok: false; status: number; error: string; code?: string };

function refused(error: CommandRefusal): CreatePostResult {
  if (isWorkerNotLinked(error))
    return {
      ok: false,
      status: 403,
      error: WORKER_NOT_LINKED,
      code: WORKER_NOT_LINKED_CODE,
    };
  if (error.code === "42501")
    return { ok: false, status: 403, error: "Forbidden" };
  if (error.code === "22023")
    return {
      ok: false,
      status: 400,
      error: error.message ?? "Invalid update",
    };
  console.error("[posts] submit_ministry_update failed", error);
  return { ok: false, status: 500, error: UPDATE_NOT_SAVED };
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
      p_expected_updated_at: null,
      p_expected_draft: false,
    },
  );
  if (error) return refused(error);
  if (typeof data !== "string" || data === "") {
    console.error("[posts] submit_ministry_update returned no id", data);
    return { ok: false, status: 500, error: UPDATE_NOT_SAVED };
  }

  const { data: post, error: readError } = await supabase
    .from("posts")
    .select(FEED_POST_SELECT)
    .eq("id", data)
    .single();
  if (readError || !post) {
    console.error("[posts] reading back a submitted update failed", readError);
    return { ok: true, post: { id: data } };
  }

  return { ok: true, post: post as unknown as FeedPostRow };
}
