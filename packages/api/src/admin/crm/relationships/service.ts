import {
  encodeCrmRelationshipCursor,
  type AdminCrmRelationshipsParams,
} from "./query";
import { assertCrmTenantAccess } from "../../../crm/auth/access";
import { ApiHttpError } from "../../../shared/api-http-error";

import type { ActorContext } from "../../../crm/types";
import type { RequestSessionClient } from "../../../shared/request-session-client";
import type {
  AdminCrmRelationshipsListResponse,
  CrmRelationshipReport,
  CrmRelationshipRow,
} from "@asym/database/types";

export type RelationshipsClient = Pick<RequestSessionClient, "rpc">;

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
} as const;

const SOURCE_SYSTEMS: CrmRelationshipReport["sourceSystems"] = {
  auth: "Mission Control session and tenant membership.",
  care: "Non-sensitive Member Care activity is listed; sensitive care activity is always left out.",
  crm: "Asym Postgres owns relationship context.",
  finance: "Asym finance summary is a local read-only overlay.",
};

type RelationshipsPage = {
  totalCount: number;
  rows: CrmRelationshipRow[];
  report: Omit<CrmRelationshipReport, "sourceSystems">;
};

function readPage(data: unknown): RelationshipsPage {
  const page = data as Partial<RelationshipsPage> | null;
  if (
    !page ||
    typeof page.totalCount !== "number" ||
    !Array.isArray(page.rows) ||
    !page.report ||
    typeof page.report !== "object"
  ) {
    throw new ApiHttpError(500, "Invalid CRM relationships page.");
  }
  return page as RelationshipsPage;
}

export async function listMissionControlCrmRelationships(options: {
  actor: ActorContext;
  supabase: RelationshipsClient;
  params: AdminCrmRelationshipsParams;
  now?: string;
}): Promise<AdminCrmRelationshipsListResponse> {
  assertCrmTenantAccess(options.actor);

  const { actor, supabase, params } = options;
  const offset = params.cursor?.offset ?? 0;
  const { data, error } = await supabase.rpc("crm_relationships_page", {
    p_tenant_id: actor.tenantId,
    p_search: params.search,
    p_domains: params.domains,
    p_sort: params.sort.field,
    p_descending: params.sort.direction !== "asc",
    p_offset: offset,
    p_limit: params.limit,
    p_now: options.now ?? new Date().toISOString(),
  });
  if (error) {
    throw new ApiHttpError(
      500,
      `Failed to load CRM relationships: ${error.message}`,
    );
  }
  const page = readPage(data);
  const nextOffset = offset + page.rows.length;
  const hasMore = nextOffset < page.totalCount;

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
    report: { ...page.report, sourceSystems: SOURCE_SYSTEMS },
    rollback: ROLLBACK_CONTRACT,
    rows: page.rows,
    sort: params.sort,
    totalCount: page.totalCount,
  };
}
