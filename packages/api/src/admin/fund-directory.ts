import { NextResponse } from "next/server";

import { withOperation } from "../shared/with-operation";

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SEARCH_LENGTH = 100;

/** `%`, `_` and `\` are LIKE wildcards; a search for them means the text. */
function likeContainsPattern(search: string) {
  return `%${search.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
}

/**
 * Fund directory for admin pickers. `q` searches fund names on the server so
 * funds beyond one page stay findable. `tenantId` narrows a super admin's
 * cross-tenant directory to one organization; everyone else is always held
 * to their own tenant, whatever they ask for.
 */
export const GET = withOperation(
  async ({ supabaseAdmin, auth: ctx, request }) => {
    const { searchParams } = new URL(request.url);
    const rawLimit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const rawOffset = Number.parseInt(searchParams.get("offset") || "0", 10);
    const limit = Number.isNaN(rawLimit)
      ? 50
      : Math.min(Math.max(rawLimit, 1), 200);
    const offset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);
    const search = (searchParams.get("q") ?? "")
      .trim()
      .slice(0, MAX_SEARCH_LENGTH);
    const requestedTenantId = searchParams.get("tenantId")?.trim() || null;

    if (requestedTenantId && !GUID_PATTERN.test(requestedTenantId)) {
      return NextResponse.json({ error: "Invalid tenant." }, { status: 400 });
    }

    let query = supabaseAdmin
      .from("funds")
      .select("id, name, description, missionary_id, tenant_id")
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (ctx.role !== "super_admin") {
      query = query.eq("tenant_id", ctx.tenantId);
    } else if (requestedTenantId) {
      query = query.eq("tenant_id", requestedTenantId);
    }

    if (search) {
      query = query.ilike("name", likeContainsPattern(search));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ funds: data ?? [] });
  },
  { roles: ["staff", "admin", "super_admin"] },
);
