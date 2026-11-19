import type { AssignmentReader, AssignmentRow } from "./types";

/** The one call this reader makes; a user-JWT Supabase client satisfies it. */
export interface AssignmentRpcClient {
  rpc(
    fn: "current_user_assignments",
  ): PromiseLike<{ data: unknown; error: unknown }>;
}

export class AssignmentReaderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AssignmentReaderError";
  }
}

/**
 * `AssignmentReader` over `public.current_user_assignments()`. The RPC scopes
 * rows to `auth.uid()`, so the client must carry the caller's own JWT. Rows
 * come back unchanged; the resolver validates every one of them.
 */
export function createRpcAssignmentReader(
  client: AssignmentRpcClient,
): AssignmentReader {
  return {
    async listActiveAssignments() {
      const { data, error } = await client.rpc("current_user_assignments");
      if (error) {
        throw new AssignmentReaderError("current_user_assignments failed", {
          cause: error,
        });
      }
      if (!Array.isArray(data)) {
        throw new AssignmentReaderError(
          "current_user_assignments returned a non-array result",
        );
      }
      return data as AssignmentRow[];
    },
  };
}
