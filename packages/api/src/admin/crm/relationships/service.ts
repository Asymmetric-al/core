import {
  CRM_RELATIONSHIP_OBJECTS,
  buildCrmRelationshipReport,
  dedupeCrmRelationshipRows,
  filterCrmRelationshipsForTenant,
  normalizeTwentyRelationshipResponseWithStats,
  sortCrmRelationships,
} from "./model";
import {
  encodeCrmRelationshipCursor,
  type AdminCrmRelationshipsParams,
} from "./query";
import {
  loadTwentyClientConfig,
  resolveTwentyRuntimeConfig,
} from "../../../crm/client/config";
import { TwentyCoreClient } from "../../../crm/client/core";

import type { TwentyEnvInput } from "../../../crm/client/config";
import type { ActorContext } from "../../../crm/types";
import type { AdminCrmRelationshipsListResponse } from "@asym/database/types";

export interface ListMissionControlCrmRelationshipsOptions {
  actor: ActorContext;
  params: AdminCrmRelationshipsParams;
  env?: TwentyEnvInput;
  fetchImpl?: typeof fetch;
  coreClient?: Pick<TwentyCoreClient, "listRecords">;
}

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
  hidePath: "/crm/relationships",
  pauseDomains: [
    "people",
    "companies",
    "churches",
    "households",
    "ministry_activities",
    "relationship_commitments",
  ],
} as const;

function buildTwentyListQuery(
  params: AdminCrmRelationshipsParams,
  tenantId: string,
) {
  return {
    limit: 100,
    ...(params.search ? { search: params.search } : {}),
    orderBy: "updatedAt:desc",
    filter: JSON.stringify({
      asymTenantId: {
        eq: tenantId,
      },
    }),
  };
}

export async function listMissionControlCrmRelationships(
  options: ListMissionControlCrmRelationshipsOptions,
): Promise<AdminCrmRelationshipsListResponse> {
  const env = options.env ?? {};
  const config = resolveTwentyRuntimeConfig(env);

  const baseResponse = {
    filters: {
      domains: options.params.domains,
      search: options.params.search,
    },
    limit: options.params.limit,
    rollback: ROLLBACK_CONTRACT,
    sort: options.params.sort,
  };

  if (!config.configured) {
    return {
      ...baseResponse,
      configured: false,
      hasMore: false,
      missing: config.missing,
      mode: "not_configured",
      nextCursor: null,
      report: buildCrmRelationshipReport([]),
      rows: [],
    };
  }

  const clientConfig = loadTwentyClientConfig(env);
  const core =
    options.coreClient ??
    (clientConfig
      ? new TwentyCoreClient({
          apiBaseUrl: clientConfig.apiBaseUrl,
          apiKey: clientConfig.apiKey,
          fetchImpl: options.fetchImpl,
          rateLimitRpm: clientConfig.rateLimitRpm,
        })
      : null);
  if (!core) {
    return {
      ...baseResponse,
      configured: false,
      hasMore: false,
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      mode: "not_configured",
      nextCursor: null,
      report: buildCrmRelationshipReport([]),
      rows: [],
    };
  }

  const query = buildTwentyListQuery(options.params, options.actor.tenantId);
  const responses = await Promise.all(
    CRM_RELATIONSHIP_OBJECTS.map(async (objectName) => ({
      objectName,
      response: await core.listRecords(objectName, query),
    })),
  );

  let excludedCareActivityCount = 0;
  const normalizedRows = responses.flatMap(({ objectName, response }) => {
    const normalized = normalizeTwentyRelationshipResponseWithStats(
      objectName,
      response,
    );
    excludedCareActivityCount += normalized.stats.excludedCareActivityCount;
    return normalized.rows;
  });

  const deduped = dedupeCrmRelationshipRows(normalizedRows);
  const filtered = filterCrmRelationshipsForTenant(
    deduped.rows,
    options.actor.tenantId,
    options.params.search,
    options.params.domains,
  );
  const sorted = sortCrmRelationships(filtered, options.params.sort);
  const offset = options.params.cursor?.offset ?? 0;
  const pageRows = sorted.slice(offset, offset + options.params.limit);
  const nextOffset = offset + pageRows.length;
  const hasMore = nextOffset < sorted.length;

  return {
    ...baseResponse,
    configured: true,
    hasMore,
    missing: [],
    mode: "twenty",
    nextCursor: hasMore
      ? encodeCrmRelationshipCursor({ offset: nextOffset })
      : null,
    report: buildCrmRelationshipReport(filtered, {
      duplicateCompanyCandidates: deduped.stats.duplicateCompanyCandidates,
      excludedCareActivityCount,
    }),
    rows: pageRows,
  };
}
