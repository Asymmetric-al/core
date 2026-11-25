import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadWorkerPublicNames(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
  ids: ReadonlyArray<string | null | undefined>,
): Promise<ReadonlyMap<string, string | null>> {
  const queryable = [
    ...new Set(
      ids.filter(
        (id): id is string => typeof id === "string" && UUID_PATTERN.test(id),
      ),
    ),
  ];
  const names = new Map<string, string | null>();
  if (queryable.length === 0) {
    return names;
  }

  const { data, error } = await supabaseAdmin
    .from("missionaries")
    .select("id, worker_public_name")
    .eq("tenant_id", tenantId)
    .in("id", queryable);

  if (error) {
    throw new Error(error.message || "Failed to load worker public names.");
  }

  for (const row of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    if (typeof row.id === "string") {
      names.set(
        row.id,
        typeof row.worker_public_name === "string"
          ? row.worker_public_name
          : null,
      );
    }
  }
  return names;
}
