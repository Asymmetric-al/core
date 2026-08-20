import {
  buildCrmRelationshipReport,
  CRM_RELATIONSHIP_DOMAINS,
  filterCrmRelationshipsForTenant,
  mapLocalCrmRelationshipRows,
  sortCrmRelationships,
} from "./model";
import {
  encodeCrmRelationshipCursor,
  type AdminCrmRelationshipsParams,
} from "./query";
import { assertCrmTenantAccess } from "../../../crm/auth/access";
import { ApiHttpError } from "../../../shared/api-http-error";

import type { ActorContext } from "../../../crm/types";
import type { AdminCrmRelationshipsListResponse } from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

type RelationshipsFilter = {
  eq: (field: string, value: unknown) => RelationshipsFilter;
  then: (
    resolve: (value: {
      data: JsonRecord[] | null;
      error: { message?: string } | null;
    }) => unknown,
  ) => unknown;
};

export type RelationshipsClient = {
  from: (table: string) => {
    select: (columns?: string) => RelationshipsFilter;
  };
};

const PLEDGE_SELECT =
  "id, tenant_id, donor_id, amount, frequency, currency, start_date, created_at";

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
} as const;

export async function listMissionControlCrmRelationships(options: {
  actor: ActorContext;
  supabase: RelationshipsClient;
  params: AdminCrmRelationshipsParams;
  now?: string;
}): Promise<AdminCrmRelationshipsListResponse> {
  assertCrmTenantAccess(options.actor);

  const { actor, supabase, params } = options;
  const now = options.now ?? new Date().toISOString();
  const tenantId = actor.tenantId;

  const [donors, missionaries, profiles, pledges, activities] =
    await Promise.all([
      selectTenantRows(supabase, "donors", tenantId),
      selectTenantRows(supabase, "missionaries", tenantId),
      selectTenantRows(supabase, "profiles", tenantId),
      selectTenantRows(supabase, "donor_pledges", tenantId, PLEDGE_SELECT),
      selectTenantRows(supabase, "member_care_activities", tenantId),
    ]);

  const mapped = mapLocalCrmRelationshipRows({
    activities,
    donors,
    missionaries,
    now,
    pledges,
    profiles,
    tenantId,
  });
  const selectedDomains =
    params.domains.length > 0 ? params.domains : CRM_RELATIONSHIP_DOMAINS;
  const scoped = mapped.rows.filter((row) =>
    selectedDomains.includes(row.domain),
  );
  const visible = filterCrmRelationshipsForTenant(
    scoped,
    tenantId,
    params.search,
  );
  const sorted = sortCrmRelationships(visible, params.sort);
  const offset = params.cursor?.offset ?? 0;
  const pageRows = sorted.slice(offset, offset + params.limit);
  const nextOffset = offset + pageRows.length;
  const hasMore = nextOffset < sorted.length;

  return {
    configured: true,
    filters: {
      domains: params.domains,
      search: params.search,
    },
    hasMore,
    limit: params.limit,
    missing: [],
    mode: "local",
    nextCursor: hasMore
      ? encodeCrmRelationshipCursor({ offset: nextOffset })
      : null,
    report: buildCrmRelationshipReport(mapped.rows, {
      excludedCareActivityCount: mapped.excludedCareActivityCount,
    }),
    rollback: ROLLBACK_CONTRACT,
    rows: pageRows,
    sort: params.sort,
  };
}

async function selectTenantRows(
  supabase: RelationshipsClient,
  table: string,
  tenantId: string,
  columns = "*",
): Promise<JsonRecord[]> {
  const query = supabase.from(table).select(columns).eq("tenant_id", tenantId);
  const { data, error } = await query;
  if (error) {
    throw new ApiHttpError(500, `Failed to load ${table}: ${error.message}`);
  }
  return Array.isArray(data) ? data : [];
}
