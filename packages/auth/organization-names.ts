/**
 * The names of the signed-in person's organizations, for the organization
 * chooser (plan 5.2; AL-2675, D-26 as the coordinator's ruling amends it).
 *
 * `public.current_user_organizations()` returns the id and name of each
 * tenant in which the session caller holds a live membership row, and nothing
 * else, so the client must carry the caller's own token. A failed read or a
 * malformed row throws: the chooser then reports that it could not read the
 * person's organizations instead of showing them unnamed.
 */

/** The one call this reader makes; a user-token Supabase client satisfies it. */
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

/** Each of the caller's organizations by tenant id. */
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
