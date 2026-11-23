export interface OrganizationNamesRpcClient {
  rpc(
    fn: "current_user_organizations",
  ): PromiseLike<{ data: unknown; error: unknown }>;
}

export class OrganizationNamesReadError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OrganizationNamesReadError";
  }
}

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function readOrganizationNames(
  client: OrganizationNamesRpcClient,
): Promise<ReadonlyMap<string, string>> {
  const { data, error } = await client.rpc("current_user_organizations");
  if (error) {
    throw new OrganizationNamesReadError("current_user_organizations failed", {
      cause: error,
    });
  }
  if (!Array.isArray(data)) {
    throw new OrganizationNamesReadError(
      "current_user_organizations returned a non-array result",
    );
  }
  const names = new Map<string, string>();
  for (const row of data as unknown[]) {
    const { tenant_id: tenantId, name } = (row ?? {}) as Record<
      string,
      unknown
    >;
    if (
      typeof tenantId !== "string" ||
      !CANONICAL_UUID.test(tenantId) ||
      typeof name !== "string"
    ) {
      throw new OrganizationNamesReadError(
        "current_user_organizations returned a malformed row",
      );
    }
    names.set(tenantId, name);
  }
  return names;
}
