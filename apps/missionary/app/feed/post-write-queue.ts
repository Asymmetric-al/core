import { fetchJsonResult } from "@asym/lib/http/fetch-result";

import type { Post } from "./feed-model";

type PostWrite = Pick<
  Post,
  "title" | "content" | "post_type" | "visibility" | "status" | "media"
> & {
  autosave?: true;
};
type PendingWrite = { tail: Promise<unknown>; revision: string | null };

// Shared across composer mounts so an old autosave cannot race a new editor.
const pendingWrites = new Map<string, PendingWrite>();

export function writeExistingPost(
  postId: string,
  updates: PostWrite,
  revision: string | null,
  canDispatch: () => boolean,
) {
  const pending = pendingWrites.get(postId) ?? {
    tail: Promise.resolve(),
    revision,
  };
  const write = async () => {
    // A discard or access change can invalidate a request while it waits.
    if (!canDispatch())
      return {
        ok: false as const,
        error: {
          kind: "network" as const,
          cause: null,
          message: "The editor no longer permits this save.",
        },
      };
    const result = await fetchJsonResult<{ post: Post }>(
      `/api/posts/${postId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          expected_updated_at: pending.revision,
        }),
      },
    );
    if (result.ok) pending.revision = result.data.post.updated_at ?? null;
    return result;
  };
  const request = pending.tail.then(write, write);
  pending.tail = request;
  pendingWrites.set(postId, pending);
  const clear = () => {
    if (pendingWrites.get(postId)?.tail === request)
      pendingWrites.delete(postId);
  };
  void request.then(clear, clear);
  return request;
}
