import { buildContributionGridRow } from "./model";
import {
  encodeContributionCursor,
  type AdminContributionsParams,
  type ContributionSortField,
} from "./query";
import { ApiHttpError } from "../../shared/http-errors";
import {
  applyEffectiveContributionToDonation,
  loadSharedContributionRowInputs,
} from "../contribution-shared/row-inputs";

import type {
  AdminContributionsListResponse,
  AdminContributionsSummary,
} from "./types";
import type {
  AdminSupabaseFluentFilterBuilder,
  SupabaseColumn,
} from "../shared/supabase-filter-builder";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { Donation } from "@asym/database/types";

type AdminSupabase = AdminSupabaseClient;

type DonationRow = {
  id: string;
  tenant_id: string | null;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string;
  status: string | null;
  donation_type: string | null;
  payment_method: string | null;
  is_recurring: boolean | null;
  recurring_interval: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  gift_date: string;
  campaign_id: string | null;
  pledge_id: string | null;
  processed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  stripe_charge_id: string | null;
  refunded_at: string | null;
  refund_amount: number;
  source: string | null;
  created_at: string;
  updated_at: string;
};

type DonorRow = {
  id: string;
  profile_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  type: string | null;
  location: string | null;
  organization: string | null;
  notes: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type StagedGiftRow = {
  id: string;
  donation_id: string;
  fund_id: string | null;
  missionary_id: string | null;
  status: string | null;
  review_reason: string | null;
  receipt_status: string | null;
  receipt_send_log_id: string | null;
  crm_post_status: string | null;
};

const PENDING_STATUSES = ["pending", "processing"] as const;
type DonationColumn = SupabaseColumn<Donation>;

const SORT_COLUMN_BY_FIELD = {
  giftDate: "gift_date",
  createdAt: "created_at",
  amount: "amount",
  status: "status",
  paymentMethod: "payment_method",
  source: "source",
} satisfies Record<ContributionSortField, DonationColumn>;

function escapeSearchValue(value: string) {
  return value.replace(/[%(),]/g, " ");
}

function normalizeSearchIds(ids: Iterable<string>) {
  return Array.from(new Set(ids)).filter(Boolean);
}

async function resolveMatchingDonorIds(
  supabaseAdmin: AdminSupabase,
  tenantId: string,
  search: string | null,
) {
  if (!search) {
    return [];
  }

  const term = escapeSearchValue(search);
  const [donorsResult, profilesResult] = await Promise.all([
    supabaseAdmin
      .from("donors")
      .select("id, profile_id")
      .eq("tenant_id", tenantId)
      .or(
        `name.ilike.%${term}%,email.ilike.%${term}%,organization.ilike.%${term}%`,
      )
      .limit(200),
    supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("tenant_id", tenantId)
      .or(
        `display_name.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%,full_name.ilike.%${term}%,email.ilike.%${term}%`,
      )
      .limit(200),
  ]);

  if (donorsResult.error) {
    throw new ApiHttpError(500, donorsResult.error.message);
  }
  if (profilesResult.error) {
    throw new ApiHttpError(500, profilesResult.error.message);
  }

  const donorIds = new Set<string>(
    ((donorsResult.data ?? []) as { id: string }[]).map((row) => row.id),
  );
  const profileIds = normalizeSearchIds(
    ((profilesResult.data ?? []) as { id: string }[]).map((row) => row.id),
  );

  if (profileIds.length > 0) {
    const donorsByProfileResult = await supabaseAdmin
      .from("donors")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("profile_id", profileIds)
      .limit(200);

    if (donorsByProfileResult.error) {
      throw new ApiHttpError(500, donorsByProfileResult.error.message);
    }

    for (const donor of donorsByProfileResult.data ?? []) {
      donorIds.add(donor.id);
    }
  }

  return Array.from(donorIds);
}

type ContributionQueryBuilder<TQuery> = AdminSupabaseFluentFilterBuilder<
  Donation,
  TQuery
>;

function applyBaseFilters<TQuery extends ContributionQueryBuilder<TQuery>>(
  query: TQuery,
  params: AdminContributionsParams,
  directSearchableDonorIds: string[],
): TQuery {
  const { filters, search } = params;

  if (filters.statuses.length > 0) {
    const statuses = filters.statuses.flatMap((status) =>
      status === "pending" ? [...PENDING_STATUSES] : [status],
    );
    query = query.in("status", Array.from(new Set(statuses)));
  }

  if (filters.contributionTypes.length > 0) {
    query = query.in("donation_type", filters.contributionTypes);
  }

  if (filters.paymentMethods.length > 0) {
    query = query.in("payment_method", filters.paymentMethods);
  }

  if (filters.sources.length > 0) {
    query = query.in("source", filters.sources);
  }

  if (filters.fundIds.length > 0) {
    query = query.in("fund_id", filters.fundIds);
  }

  if (filters.missionaryIds.length > 0) {
    query = query.in("missionary_id", filters.missionaryIds);
  }

  if (filters.dateFrom) {
    query = query.gte("gift_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("gift_date", filters.dateTo);
  }

  if (filters.amountMin != null) {
    query = query.gte("amount", filters.amountMin);
  }

  if (filters.amountMax != null) {
    query = query.lte("amount", filters.amountMax);
  }

  if (filters.anonymousOnly) {
    query = query.is("donor_id", null);
  }

  if (filters.receiptStatuses.length > 0) {
    if (
      filters.receiptStatuses.includes("failed") &&
      !filters.receiptStatuses.includes("pending")
    ) {
      query = query.eq("status", "failed");
    } else if (
      filters.receiptStatuses.includes("pending") &&
      !filters.receiptStatuses.includes("failed")
    ) {
      query = query.neq("status", "failed");
    } else if (
      !filters.receiptStatuses.includes("pending") &&
      !filters.receiptStatuses.includes("failed")
    ) {
      query = query.eq("id", "__no_receipt_match__");
    }
  }

  if (search) {
    const searchConditions = [
      `stripe_payment_intent_id.ilike.%${escapeSearchValue(search)}%`,
      `stripe_charge_id.ilike.%${escapeSearchValue(search)}%`,
    ];

    if (directSearchableDonorIds.length > 0) {
      query = query.or(
        `donor_id.in.(${directSearchableDonorIds.join(",")}),${searchConditions.join(",")}`,
      );
    } else {
      query = query.or(searchConditions.join(","));
    }
  }

  return query;
}

function applyCursor<TQuery extends ContributionQueryBuilder<TQuery>>(
  query: TQuery,
  params: AdminContributionsParams,
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
      : cursor.value.replace(/,/g, " ");
  const valueComparator = sort.direction === "desc" ? "lt" : "gt";

  return query.or(
    `${column}.${valueComparator}.${cursorValue},and(${column}.eq.${cursorValue},id.${tieComparator}.${cursor.id})`,
  );
}

function getCursorValue(row: DonationRow, field: ContributionSortField) {
  switch (field) {
    case "amount":
      return row.amount;
    case "createdAt":
      return row.created_at;
    case "status":
      return row.status;
    case "paymentMethod":
      return row.payment_method;
    case "source":
      return row.source;
    case "giftDate":
    default:
      return row.gift_date;
  }
}

async function fetchContributionRelations(
  supabaseAdmin: AdminSupabase,
  tenantId: string,
  rows: DonationRow[],
) {
  const donorIds = normalizeSearchIds(rows.map((row) => row.donor_id || ""));
  const donationIds = normalizeSearchIds(rows.map((row) => row.id));

  // Tenant-scope even though ids come from tenant-filtered donations: these
  // run on the service-role client where RLS cannot backstop a foreign id.
  const [donorsResult, stagedGiftsResult] = await Promise.all([
    donorIds.length > 0
      ? supabaseAdmin
          .from("donors")
          .select(
            "id, profile_id, name, email, phone, type, location, organization, notes",
          )
          .eq("tenant_id", tenantId)
          .in("id", donorIds)
      : Promise.resolve({ data: [], error: null }),
    donationIds.length > 0
      ? supabaseAdmin
          .from("staged_gifts")
          .select(
            "id, donation_id, fund_id, missionary_id, status, review_reason, receipt_status, receipt_send_log_id, crm_post_status",
          )
          .eq("tenant_id", tenantId)
          .in("donation_id", donationIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (donorsResult.error) {
    throw new ApiHttpError(500, donorsResult.error.message);
  }
  if (stagedGiftsResult.error) {
    throw new ApiHttpError(500, stagedGiftsResult.error.message);
  }

  const donorRows = (donorsResult.data ?? []) as DonorRow[];
  const profileIds = normalizeSearchIds(
    donorRows.map((donor) => donor.profile_id || ""),
  );

  const profilesResult =
    profileIds.length > 0
      ? await supabaseAdmin
          .from("profiles")
          .select(
            "id, display_name, first_name, last_name, full_name, email, avatar_url",
          )
          .in("id", profileIds)
      : { data: [], error: null };

  if (profilesResult.error) {
    throw new ApiHttpError(500, profilesResult.error.message);
  }

  const stagedGiftRows = (stagedGiftsResult.data ?? []) as StagedGiftRow[];

  return {
    donorsById: new Map(donorRows.map((donor) => [donor.id, donor])),
    profilesById: new Map(
      ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ]),
    ),
    stagedGiftRows,
    stagedGiftsByDonationId: new Map(
      stagedGiftRows.map((gift) => [gift.donation_id, gift]),
    ),
  };
}

async function fetchFilteredDonationRows(
  supabaseAdmin: AdminSupabase,
  tenantId: string,
  params: AdminContributionsParams,
  limit: number,
) {
  const matchingDonorIds = await resolveMatchingDonorIds(
    supabaseAdmin,
    tenantId,
    params.search,
  );

  if (params.search && matchingDonorIds.length === 0) {
    const transactionSearchOnly =
      params.search.startsWith("pi_") || params.search.startsWith("ch_");
    if (!transactionSearchOnly) {
      return [] as DonationRow[];
    }
  }

  let query = supabaseAdmin
    .from("donations")
    .select(
      "id, tenant_id, donor_id, missionary_id, fund_id, amount, currency, status, donation_type, payment_method, is_recurring, recurring_interval, notes, stripe_payment_intent_id, gift_date, campaign_id, pledge_id, processed_at, completed_at, failed_at, error_code, error_message, stripe_charge_id, refunded_at, refund_amount, source, created_at, updated_at",
    )
    .eq("tenant_id", tenantId);

  query = applyBaseFilters(query, params, matchingDonorIds);

  const sortColumn = SORT_COLUMN_BY_FIELD[params.sort.field];
  query = query.order(sortColumn, {
    ascending: params.sort.direction === "asc",
    nullsFirst: false,
  });
  query = query.order("id", {
    ascending: params.sort.direction === "asc",
  });
  query = applyCursor(query, params);

  const { data, error } = await query.limit(limit);
  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return (data ?? []) as DonationRow[];
}

export async function listAdminContributions(
  supabaseAdmin: AdminSupabase,
  tenantId: string,
  params: AdminContributionsParams,
): Promise<AdminContributionsListResponse> {
  const rows = await fetchFilteredDonationRows(
    supabaseAdmin,
    tenantId,
    params,
    params.limit + 1,
  );

  const pageRows = rows.slice(0, params.limit);
  const hasMore = rows.length > params.limit;
  const relationData = await fetchContributionRelations(
    supabaseAdmin,
    tenantId,
    pageRows,
  );

  // Corrections, adjustment-derived effective values, and designation sets
  // come from the same shared loader CRM gift history uses, so both surfaces
  // display identical shared row fields for the same gift (ADR-CD-032, #256).
  const sharedInputs = await loadSharedContributionRowInputs(supabaseAdmin, {
    tenantId,
    donations: pageRows,
    stagedGifts: relationData.stagedGiftRows,
  });

  const gridRows = pageRows.map((donationRow) => {
    const donation = applyEffectiveContributionToDonation(
      donationRow,
      sharedInputs.effectiveByDonationId,
    );
    const donor = donation.donor_id
      ? (relationData.donorsById.get(donation.donor_id) ?? null)
      : null;
    const donorProfile =
      donor?.profile_id != null
        ? (relationData.profilesById.get(donor.profile_id) ?? null)
        : null;
    const fund =
      donation.fund_id != null
        ? {
            id: donation.fund_id,
            name: sharedInputs.fundNamesById.get(donation.fund_id) ?? null,
          }
        : null;
    const missionary =
      donation.missionary_id != null
        ? {
            id: donation.missionary_id,
            display_name:
              sharedInputs.missionaryLabelsById.get(donation.missionary_id) ??
              null,
          }
        : null;
    const stagedGift = relationData.stagedGiftsByDonationId.get(donation.id);

    return buildContributionGridRow({
      donation,
      donor,
      profile: donorProfile,
      fund,
      missionary,
      stagedGift: stagedGift ?? null,
      corrections: sharedInputs.correctionsByDonationId.get(donation.id),
      designationSet: sharedInputs.designationSetByDonationId.get(donation.id),
    });
  });

  const nextCursor =
    hasMore && pageRows.length > 0
      ? encodeContributionCursor({
          id: pageRows[pageRows.length - 1]!.id,
          field: params.sort.field,
          direction: params.sort.direction,
          value: getCursorValue(
            pageRows[pageRows.length - 1]!,
            params.sort.field,
          ),
        })
      : null;

  return {
    rows: gridRows,
    nextCursor,
    hasMore,
    limit: params.limit,
    sort: params.sort,
    filters: params.filters,
  };
}

export async function summarizeAdminContributions(
  supabaseAdmin: AdminSupabase,
  tenantId: string,
  _params: AdminContributionsParams,
): Promise<AdminContributionsSummary> {
  const { data, error } = await supabaseAdmin.rpc(
    "admin_contributions_summary",
    {
      p_tenant_id: tenantId,
    },
  );

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  const summary = Array.isArray(data) ? data[0] : data;

  return {
    totalReceived: Number(summary?.total_received ?? 0),
    successfulCount: Number(summary?.successful_count ?? 0),
    pendingAmount: Number(summary?.pending_amount ?? 0),
    pendingCount: Number(summary?.pending_count ?? 0),
    averageGift: Number(summary?.average_gift ?? 0),
    recurringCount: Number(summary?.recurring_count ?? 0),
  };
}
