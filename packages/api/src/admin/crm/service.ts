import { expandStoredValueSpellings } from "./filter-variants";
import { loadCrmMemberLabels } from "./member-labels";
import { buildCrmGridRow } from "./model";
import {
  encodeCrmCursor,
  type AdminCrmParams,
  type CrmSortField,
} from "./query";
import { ApiHttpError } from "../../shared/http-errors";

import type { AdminCrmListResponse } from "./types";
import type { RequestSessionClient } from "../../shared/request-session-client";
import type {
  AdminSupabaseFluentFilterBuilder,
  SupabaseColumn,
} from "../shared/supabase-filter-builder";
import type { Donor } from "@asym/database/types";

type DonorRow = Parameters<typeof buildCrmGridRow>[0];
type DonorColumn = SupabaseColumn<Donor>;

const SORT_COLUMN_BY_FIELD = {
  updatedAt: "updated_at",
  createdAt: "created_at",
  name: "name",
  recordType: "type",
  lifecycleStatus: "status",
  lifetimeGiving: "total_given",
  lastGiftAt: "last_gift_date",
} satisfies Record<CrmSortField, DonorColumn>;

function escapeSearchValue(value: string) {
  return value.replace(/[%(),]/g, " ").replaceAll("*", "%");
}

function normalizeIds(ids: Iterable<string>) {
  return Array.from(new Set(ids)).filter(Boolean);
}

type DonorQueryBuilder<TQuery> = AdminSupabaseFluentFilterBuilder<
  Donor,
  TQuery
>;

function applyBaseFilters<TQuery extends DonorQueryBuilder<TQuery>>(
  query: TQuery,
  params: AdminCrmParams,
): TQuery {
  const { filters } = params;

  // Writers stored these columns in several spellings (`at_risk`, `At Risk`),
  // so each filter value matches all of them.
  if (filters.recordTypes.length > 0) {
    query = query.in("type", expandStoredValueSpellings(filters.recordTypes));
  }

  if (filters.lifecycleStatuses.length > 0) {
    query = query.in(
      "status",
      expandStoredValueSpellings(filters.lifecycleStatuses),
    );
  }

  if (filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags);
  }

  if (filters.hasPortal === true) {
    query = query.not("profile_id", "is", null);
  } else if (filters.hasPortal === false) {
    query = query.is("profile_id", null);
  }

  return query;
}

function applyCursor<TQuery extends DonorQueryBuilder<TQuery>>(
  query: TQuery,
  params: AdminCrmParams,
): TQuery {
  const { cursor, sort } = params;
  if (!cursor) {
    return query;
  }

  const column = SORT_COLUMN_BY_FIELD[sort.field];
  const tieComparator = sort.direction === "desc" ? "lt" : "gt";

  if (cursor.value == null) {
    return query[tieComparator]("id", cursor.id);
  }

  const cursorValue =
    typeof cursor.value === "number"
      ? String(cursor.value)
      : String(cursor.value).replace(/,/g, " ");
  const valueComparator = sort.direction === "desc" ? "lt" : "gt";

  return query.or(
    `${column}.${valueComparator}.${cursorValue},and(${column}.eq.${cursorValue},id.${tieComparator}.${cursor.id})`,
  );
}

function getCursorValue(donor: DonorRow, field: CrmSortField) {
  switch (field) {
    case "lifetimeGiving":
      return typeof donor.total_given === "number"
        ? donor.total_given
        : Number(donor.total_given) || 0;
    case "createdAt":
      return donor.created_at;
    case "name":
      return donor.name;
    case "recordType":
      return donor.type;
    case "lifecycleStatus":
      return donor.status;
    case "lastGiftAt":
      return donor.last_gift_date;
    case "updatedAt":
    default:
      return donor.updated_at;
  }
}

async function fetchFilteredDonorRows(
  sessionClient: RequestSessionClient,
  tenantId: string,
  params: AdminCrmParams,
  limit: number,
) {
  const textOrder = ["name", "recordType", "lifecycleStatus"].includes(
    params.sort.field,
  );
  let donors;
  if (params.search) {
    donors = sessionClient.rpc("search_crm_donors", {
      p_tenant_id: tenantId,
      p_term: escapeSearchValue(params.search),
    });
  } else if (textOrder) {
    donors = sessionClient.rpc("crm_donors_for_text_order", {
      p_tenant_id: tenantId,
    });
  } else {
    donors = sessionClient.from("donors");
  }
  let query = donors
    .select(
      "id, profile_id, missionary_id, name, email, phone, avatar_url, location, type, status, total_given, last_gift_date, tags, organization, title, notes, created_at, updated_at",
    )
    .eq("tenant_id", tenantId);

  query = applyBaseFilters(query, params);

  const sortColumn = SORT_COLUMN_BY_FIELD[params.sort.field];
  const nullsFirst =
    params.sort.field === "lastGiftAt"
      ? params.sort.direction === "asc"
      : false;

  query = query.order(sortColumn, {
    ascending: params.sort.direction === "asc",
    nullsFirst,
  });
  query = query.order("id", {
    ascending: params.sort.direction === "asc",
  });
  query = applyCursor(query, params);

  const { data, error } = await query.limit(limit);
  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return (data ?? []) as DonorRow[];
}

export async function listAdminCrmRecords(
  sessionClient: RequestSessionClient,
  tenantId: string,
  params: AdminCrmParams,
): Promise<AdminCrmListResponse> {
  const rows = await fetchFilteredDonorRows(
    sessionClient,
    tenantId,
    params,
    params.limit + 1,
  );

  const pageRows = rows.slice(0, params.limit);
  const hasMore = rows.length > params.limit;

  const missionaryIds = normalizeIds(
    pageRows.map((d) => d.missionary_id || ""),
  );
  const missionaryNames = await loadCrmMemberLabels(
    sessionClient,
    tenantId,
    missionaryIds,
  );

  const gridRows = pageRows.map((donor) => {
    const missionaryName = donor.missionary_id
      ? (missionaryNames.get(donor.missionary_id) ?? null)
      : null;
    return buildCrmGridRow(donor, missionaryName);
  });

  let nextCursor: string | null = null;
  if (hasMore && pageRows.length > 0) {
    const last = pageRows[pageRows.length - 1]!;
    nextCursor = encodeCrmCursor({
      id: last.id,
      field: params.sort.field,
      direction: params.sort.direction,
      value: getCursorValue(last, params.sort.field),
    });
  }

  return {
    rows: gridRows,
    nextCursor,
    hasMore,
    limit: params.limit,
    sort: params.sort,
    filters: params.filters,
  };
}
