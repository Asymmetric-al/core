import { ApiHttpError } from "../../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type AdminSupabase = AdminSupabaseClient;

/** PostgREST returns at most this many rows per request. */
export const CRM_TAG_SCAN_PAGE_SIZE = 1000;
/** Upper bound on the scan (50,000 records), so one request stays bounded. */
const CRM_TAG_SCAN_MAX_PAGES = 50;

/**
 * Every tag in use on the tenant's CRM records, sorted, each once. The CRM
 * grid loads records a page at a time; its Tag filter offers these instead
 * of only the tags on the records loaded so far.
 */
export async function listAdminCrmTagOptions(
  supabaseAdmin: AdminSupabase,
  tenantId: string,
): Promise<string[]> {
  const tags = new Set<string>();
  for (let page = 0; page < CRM_TAG_SCAN_MAX_PAGES; page += 1) {
    const from = page * CRM_TAG_SCAN_PAGE_SIZE;
    const { data, error } = await supabaseAdmin
      .from("donors")
      .select("tags")
      .eq("tenant_id", tenantId)
      .not("tags", "is", null)
      .order("id", { ascending: true })
      .range(from, from + CRM_TAG_SCAN_PAGE_SIZE - 1);
    if (error) {
      throw new ApiHttpError(500, error.message);
    }
    const rows = (data ?? []) as Array<{ tags: unknown }>;
    for (const row of rows) {
      if (!Array.isArray(row.tags)) continue;
      for (const tag of row.tags) {
        if (typeof tag === "string" && tag.trim() !== "") tags.add(tag);
      }
    }
    if (rows.length < CRM_TAG_SCAN_PAGE_SIZE) break;
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
