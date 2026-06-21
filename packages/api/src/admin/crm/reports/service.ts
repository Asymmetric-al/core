import { ApiHttpError } from "../../../shared/http-errors";

import type { AdminCrmReportParams } from "./query";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type {
  AdminCrmReportResponse,
  CrmReportRow,
} from "@asym/database/types";

type SupabaseAdmin = AdminSupabaseClient;

interface DonationRow {
  id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number | string | null;
  status: string | null;
  created_at: string | null;
}

interface DonorRow {
  id: string;
  name: string | null;
  organization: string | null;
  status: string | null;
}

interface LabelRow {
  id: string;
  name?: string | null;
  profile?: {
    display_name?: string | null;
    full_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

interface FailureRow {
  id: string;
  status: string | null;
  last_error: string | null;
  updated_at: string | null;
}

function assertNoError(
  error: { message?: string } | null,
  fallback: string,
): void {
  if (error) {
    throw new ApiHttpError(500, error.message ?? fallback);
  }
}

function toCents(value: number | string | null | undefined): number {
  if (value == null) {
    return 0;
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : 0;
}

function uniq(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => !!value)),
  );
}

function matchesSearch(label: string, search: string | null) {
  return !search || label.toLowerCase().includes(search.toLowerCase());
}

function profileName(row: LabelRow): string {
  const profile = row.profile ?? {};
  return (
    profile.display_name?.trim() ||
    profile.full_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
    row.name?.trim() ||
    "Unassigned"
  );
}

async function fetchDonations(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
  params: AdminCrmReportParams,
) {
  let query = supabaseAdmin
    .from("donations")
    .select("id, donor_id, missionary_id, fund_id, amount, status, created_at")
    .eq("tenant_id", tenantId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (params.filters.dateFrom) {
    query = query.gte("created_at", params.filters.dateFrom);
  }

  if (params.filters.dateTo) {
    query = query.lte("created_at", params.filters.dateTo);
  }

  const { data, error } = await query;
  assertNoError(error, "Failed to load CRM report donations.");
  return (data ?? []) as DonationRow[];
}

async function fetchFundLabels(
  supabaseAdmin: SupabaseAdmin,
  ids: string[],
): Promise<Map<string, LabelRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("funds")
    .select("id, name")
    .in("id", ids);
  assertNoError(error, "Failed to load fund labels.");
  return new Map(((data ?? []) as LabelRow[]).map((row) => [row.id, row]));
}

async function fetchMissionaryLabels(
  supabaseAdmin: SupabaseAdmin,
  ids: string[],
): Promise<Map<string, LabelRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("missionaries")
    .select(
      "id, profile:profiles!missionaries_profile_id_fkey(display_name, full_name, first_name, last_name)",
    )
    .in("id", ids);
  assertNoError(error, "Failed to load missionary labels.");
  return new Map(((data ?? []) as LabelRow[]).map((row) => [row.id, row]));
}

async function fetchDonors(
  supabaseAdmin: SupabaseAdmin,
  ids: string[],
): Promise<Map<string, DonorRow>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabaseAdmin
    .from("donors")
    .select("id, name, organization, status")
    .in("id", ids);
  assertNoError(error, "Failed to load donor labels.");
  return new Map(((data ?? []) as DonorRow[]).map((row) => [row.id, row]));
}

function aggregateDonations(input: {
  donations: DonationRow[];
  getGroupId: (row: DonationRow) => string | null;
  getLabel: (id: string | null) => string;
  getStatus?: (id: string | null) => string | null;
  search: string | null;
}): CrmReportRow[] {
  const rows = new Map<string, CrmReportRow & { donorIds: Set<string> }>();

  for (const donation of input.donations) {
    const groupId = input.getGroupId(donation) ?? "unassigned";
    const label = input.getLabel(groupId === "unassigned" ? null : groupId);
    const row = rows.get(groupId) ?? {
      amountCents: 0,
      donorCount: 0,
      donorIds: new Set<string>(),
      giftCount: 0,
      id: groupId,
      label,
      lastGiftAt: null,
      metadata: {},
      status:
        input.getStatus?.(groupId === "unassigned" ? null : groupId) ?? null,
    };

    row.amountCents += toCents(donation.amount);
    row.giftCount += 1;
    if (donation.donor_id) {
      row.donorIds.add(donation.donor_id);
    }
    if (
      donation.created_at &&
      (!row.lastGiftAt ||
        new Date(donation.created_at).getTime() >
          new Date(row.lastGiftAt).getTime())
    ) {
      row.lastGiftAt = donation.created_at;
    }
    row.donorCount = row.donorIds.size;
    rows.set(groupId, row);
  }

  return Array.from(rows.values())
    .filter((row) => matchesSearch(row.label, input.search))
    .map(({ donorIds: _donorIds, ...row }) => row)
    .sort((left, right) => right.amountCents - left.amountCents);
}

async function buildSyncFailureRows(
  supabaseAdmin: SupabaseAdmin,
  tenantId: string,
  params: AdminCrmReportParams,
): Promise<CrmReportRow[]> {
  const [jobsResult, linksResult] = await Promise.all([
    supabaseAdmin
      .from("crm_outbound_jobs")
      .select("id, status, last_error, updated_at")
      .eq("tenant_id", tenantId)
      .in("status", ["failed", "dead_letter"])
      .limit(250),
    supabaseAdmin
      .from("donation_crm_links")
      .select("id, link_status, updated_at")
      .eq("tenant_id", tenantId)
      .eq("scope", "parent")
      .in("link_status", ["queued", "failed"])
      .limit(250),
  ]);
  assertNoError(jobsResult.error, "Failed to load failed CRM jobs.");
  assertNoError(linksResult.error, "Failed to load drifted CRM gift links.");

  const jobRows = ((jobsResult.data ?? []) as FailureRow[]).map((row) => ({
    amountCents: 0,
    donorCount: 0,
    giftCount: 0,
    id: row.id,
    label: row.last_error ?? "CRM outbound job failure",
    lastGiftAt: row.updated_at,
    metadata: { source: "crm_outbound_jobs" },
    status: row.status,
  }));
  const linkRows = (
    (linksResult.data ?? []) as Array<{
      id: string;
      link_status: string | null;
      updated_at: string | null;
    }>
  ).map((row) => ({
    amountCents: 0,
    donorCount: 0,
    giftCount: 0,
    id: row.id,
    label: "Donation CRM link requires reconciliation",
    lastGiftAt: row.updated_at,
    metadata: { source: "donation_crm_links" },
    status: row.link_status,
  }));

  return [...jobRows, ...linkRows].filter((row) =>
    matchesSearch(row.label, params.filters.search),
  );
}

export async function buildAdminCrmReport(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  params: AdminCrmReportParams;
}): Promise<AdminCrmReportResponse> {
  if (input.params.slice === "sync-failures") {
    const rows = await buildSyncFailureRows(
      input.supabaseAdmin,
      input.tenantId,
      input.params,
    );
    return buildReportResponse(input.params, rows);
  }

  const donations = await fetchDonations(
    input.supabaseAdmin,
    input.tenantId,
    input.params,
  );

  if (input.params.slice === "funds") {
    const labels = await fetchFundLabels(
      input.supabaseAdmin,
      uniq(donations.map((donation) => donation.fund_id)),
    );
    return buildReportResponse(
      input.params,
      aggregateDonations({
        donations,
        getGroupId: (donation) => donation.fund_id,
        getLabel: (id) =>
          id ? (labels.get(id)?.name ?? "Unnamed fund") : "Unassigned fund",
        search: input.params.filters.search,
      }),
    );
  }

  if (input.params.slice === "missionaries") {
    const labels = await fetchMissionaryLabels(
      input.supabaseAdmin,
      uniq(donations.map((donation) => donation.missionary_id)),
    );
    return buildReportResponse(
      input.params,
      aggregateDonations({
        donations,
        getGroupId: (donation) => donation.missionary_id,
        getLabel: (id) =>
          id ? profileName(labels.get(id) ?? { id }) : "Unassigned missionary",
        search: input.params.filters.search,
      }),
    );
  }

  const donors = await fetchDonors(
    input.supabaseAdmin,
    uniq(donations.map((donation) => donation.donor_id)),
  );
  return buildReportResponse(
    input.params,
    aggregateDonations({
      donations,
      getGroupId: (donation) => donation.donor_id,
      getLabel: (id) => {
        if (!id) {
          return "Anonymous donor";
        }
        const donor = donors.get(id);
        return donor?.name ?? donor?.organization ?? "Unnamed donor";
      },
      getStatus: (id) => (id ? (donors.get(id)?.status ?? null) : null),
      search: input.params.filters.search,
    }),
  );
}

export function buildReportResponse(
  params: AdminCrmReportParams,
  rows: CrmReportRow[],
): AdminCrmReportResponse {
  const donorIds = rows.map((row) => row.donorCount);
  return {
    audit: {
      exportRequired: true,
      loggedEvents: ["actor", "tenant", "filters", "rowCount", "timestamp"],
    },
    filters: params.filters,
    rows,
    slice: params.slice,
    totals: {
      amountCents: rows.reduce((sum, row) => sum + row.amountCents, 0),
      donorCount: donorIds.reduce((sum, count) => sum + count, 0),
      giftCount: rows.reduce((sum, row) => sum + row.giftCount, 0),
      rowCount: rows.length,
    },
  };
}

function csvCell(value: unknown) {
  const stringValue =
    value == null
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export function serializeAdminCrmReportCsv(report: AdminCrmReportResponse) {
  const headers = [
    "id",
    "label",
    "amount_cents",
    "gift_count",
    "donor_count",
    "last_gift_at",
    "status",
    "metadata",
  ];
  const rows = report.rows.map((row) =>
    [
      row.id,
      row.label,
      row.amountCents,
      row.giftCount,
      row.donorCount,
      row.lastGiftAt,
      row.status,
      row.metadata,
    ]
      .map(csvCell)
      .join(","),
  );

  return [headers.map(csvCell).join(","), ...rows].join("\n");
}
