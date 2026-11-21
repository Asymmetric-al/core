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
import { isRecord } from "../../../shared/json-coerce";
import { loadCrmMemberLabels } from "../member-labels";

import type { ActorContext } from "../../../crm/types";
import type { RequestSessionClient } from "../../../shared/request-session-client";
import type { AdminCrmRelationshipsListResponse } from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

export type RelationshipsClient = Pick<RequestSessionClient, "from" | "rpc">;

const PLEDGE_SELECT =
  "id, tenant_id, donor_id, amount, frequency, currency, status, start_date, created_at";

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

  const [donors, missionaries, pledges, activities] = await Promise.all([
    selectTenantRows(
      supabase,
      "donors",
      tenantId,
      "id,name,organization,type,spouse,status,location,created_at,updated_at",
    ),
    selectTenantRows(
      supabase,
      "missionaries",
      tenantId,
      "id,profile_id,location,created_at,updated_at",
    ),
    selectTenantRows(supabase, "donor_pledges", tenantId, PLEDGE_SELECT),
    selectTenantRows(
      supabase,
      "member_care_activities",
      tenantId,
      "id,type,title,description,occurred_at,created_at",
    ),
  ]);
  const names = await loadCrmMemberLabels(
    supabase,
    tenantId,
    missionaries
      .map((row) => row.profile_id)
      .filter((id): id is string => typeof id === "string"),
  );
  const profiles = Array.from(names, ([id, display_name]) => ({
    id,
    display_name,
  }));

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
  columns: string,
): Promise<JsonRecord[]> {
  const query = supabase.from(table).select(columns).eq("tenant_id", tenantId);
  const { data, error } = await query;
  if (error) {
    throw new ApiHttpError(500, `Failed to load ${table}: ${error.message}`);
  }
  const rows: unknown = data ?? [];
  if (!Array.isArray(rows) || !rows.every(isRecord)) {
    throw new ApiHttpError(500, `Invalid ${table} row data.`);
  }
  return rows;
}
