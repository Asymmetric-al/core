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

/**
 * `reader`, keeping the cause of a failed read for the
 * `membership_query_failed` diagnostic (access-diagnostics.ts), which logs
 * only its safe error code. The resolver and the proxy's membership read both
 * say only `reader_error`; without this the cause is lost (council round 1,
 * A5). The read and its result are unchanged.
 */
export function withReadErrorCause(reader: AssignmentReader): {
  readonly reader: AssignmentReader;
  readonly readError: () => unknown;
} {
  let readError: unknown;
  return {
    reader: {
      async listActiveAssignments() {
        try {
          return await reader.listActiveAssignments();
        } catch (error) {
          readError =
            error instanceof AssignmentReaderError && error.cause !== undefined
              ? error.cause
              : error;
          throw error;
        }
      },
    },
    readError: () => readError,
  };
}
