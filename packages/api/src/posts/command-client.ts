export interface CommandRefusal {
  code?: string;
  message?: string;
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
