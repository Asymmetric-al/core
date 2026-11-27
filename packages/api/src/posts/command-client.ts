export interface CommandRefusal {
  code?: string;
  message?: string;
  hint?: string;
}

export interface CommandClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: CommandRefusal | null }>;
}

export function commandClient(client: unknown): CommandClient {
  return client as CommandClient;
}

export const WORKER_NOT_LINKED =
  "Your worker record is not linked to your sign-in yet: ask your organization’s staff.";

export const UPDATE_NOT_SAVED =
  "Couldn’t save that update. Nothing was changed.";

export function isWorkerNotLinked(error: CommandRefusal) {
  return error.code === "42501" && error.hint === "worker_not_linked";
}
