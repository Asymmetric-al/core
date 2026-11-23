import type { AssignmentReader, AssignmentRow } from "./types";

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
