import {
  buildDonorPortalSnapshot,
  isSettledDonationStatus,
  type DonorPortalDonationRow,
  type DonorPortalDonorRow,
  type DonorPortalFeedPreferencesRow,
  type DonorPortalPledgeRow,
  type DonorPortalProfileRow,
  type DonorPortalSnapshot,
} from "./model";
import { ApiHttpError } from "../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseError = {
  code?: string;
  message: string;
};

type SupabaseResult<T> = {
  data: T | null;
  error: SupabaseError | null;
};

const DONOR_SELECT = `
  id,
  tenant_id,
  profile_id,
  missionary_id,
  name,
  email,
  phone,
  mobile,
  preferred_contact,
  avatar_url,
  location,
  status,
  giving_preferences,
  total_given,
  first_gift_date,
  last_gift_date,
  last_gift_amount,
  gift_count,
  frequency,
  joined_date,
  receipt_email_frequency,
  default_update_frequency,
  preferred_language,
  do_not_contact,
  do_not_email,
  has_active_pledge,
  stripe_customer_id
`;

const DONATION_SELECT = `
  id,
  amount,
  currency,
  status,
  donation_type,
  payment_method,
  is_recurring,
  recurring_interval,
  gift_date,
  created_at,
  completed_at,
  processed_at,
  refunded_at,
  refund_amount,
  stripe_payment_intent_id,
  stripe_charge_id,
  fund:funds(id, name),
  missionary:missionaries(id, profile:profiles(id, display_name, full_name, first_name, last_name, avatar_url))
`;

const PLEDGE_SELECT = `
  id,
  amount,
  currency,
  frequency,
  status,
  start_date,
  end_date,
  next_payment_date,
  next_charge_at,
  stripe_subscription_id,
  stripe_payment_method_id,
  payment_method,
  total_paid,
  total_expected,
  payments_completed,
  payments_remaining,
  fund:funds(id, name),
  missionary:missionaries(id, profile:profiles(id, display_name, full_name, first_name, last_name, avatar_url))
`;

const PROFILE_SELECT =
  "id, email, first_name, last_name, full_name, display_name, phone, avatar_url";

const FEED_PREFERENCES_SELECT = `
  show_org_posts,
  show_missionary_posts,
  follow_org,
  email_org_posts,
  email_missionary_posts,
  push_org_posts,
  push_missionary_posts
`;

function assertResult<T>(
  result: SupabaseResult<T>,
  fallbackMessage: string,
): T {
  if (result.error?.code === "PGRST116") {
    throw new ApiHttpError(404, fallbackMessage);
  }

  if (result.error) {
    throw new ApiHttpError(500, result.error.message || fallbackMessage);
  }

  if (!result.data) {
    throw new ApiHttpError(404, fallbackMessage);
  }

  return result.data;
}

function assertArrayResult<T>(
  result: SupabaseResult<T[]>,
  fallbackMessage: string,
): T[] {
  if (result.error) {
    throw new ApiHttpError(500, result.error.message || fallbackMessage);
  }

  return result.data ?? [];
}

function normalizeJoinedOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function normalizeDonationRows(rows: DonorPortalDonationRow[]) {
  return rows.map((row) => ({
    ...row,
    fund: normalizeJoinedOne(row.fund),
    missionary: normalizeJoinedOne(row.missionary),
  }));
}

function normalizePledgeRows(rows: DonorPortalPledgeRow[]) {
  return rows.map((row) => ({
    ...row,
    fund: normalizeJoinedOne(row.fund),
    missionary: normalizeJoinedOne(row.missionary),
  }));
}

export type DonorPortalContext = {
  profile: DonorPortalProfileRow;
  donor: DonorPortalDonorRow;
};

export async function resolveDonorPortalContext(
  supabaseAdmin: AdminSupabaseClient,
  profileId: string,
  tenantId: string,
): Promise<DonorPortalContext> {
  const profile = assertResult(
    (await supabaseAdmin
      .from("profiles")
      .select(PROFILE_SELECT)
      .eq("id", profileId)
      .eq("tenant_id", tenantId)
      .single()) as SupabaseResult<DonorPortalProfileRow>,
    "Donor profile not found",
  );

  const donor = assertResult(
    (await supabaseAdmin
      .from("donors")
      .select(DONOR_SELECT)
      .eq("profile_id", profileId)
      .eq("tenant_id", tenantId)
      .single()) as SupabaseResult<DonorPortalDonorRow>,
    "Donor record not found",
  );

  return { profile, donor };
}

export async function getDonorPortalSnapshot(input: {
  supabaseAdmin: AdminSupabaseClient;
  profileId: string;
  tenantId: string;
}): Promise<DonorPortalSnapshot> {
  const { profile, donor } = await resolveDonorPortalContext(
    input.supabaseAdmin,
    input.profileId,
    input.tenantId,
  );

  const [donationsResult, pledgesResult, preferencesResult] = await Promise.all(
    [
      input.supabaseAdmin
        .from("donations")
        .select(DONATION_SELECT)
        .eq("tenant_id", input.tenantId)
        .eq("donor_id", donor.id)
        .order("gift_date", { ascending: false })
        .limit(250) as unknown as Promise<
        SupabaseResult<DonorPortalDonationRow[]>
      >,
      input.supabaseAdmin
        .from("donor_pledges")
        .select(PLEDGE_SELECT)
        .eq("tenant_id", input.tenantId)
        .eq("donor_id", donor.id)
        .order("created_at", { ascending: false })
        .limit(100) as unknown as Promise<
        SupabaseResult<DonorPortalPledgeRow[]>
      >,
      input.supabaseAdmin
        .from("donor_feed_preferences")
        .select(FEED_PREFERENCES_SELECT)
        .eq("tenant_id", input.tenantId)
        .eq("donor_id", donor.id)
        .maybeSingle() as unknown as Promise<
        SupabaseResult<DonorPortalFeedPreferencesRow>
      >,
    ],
  );

  const donations = normalizeDonationRows(
    assertArrayResult(donationsResult, "Unable to load donor giving history"),
  );
  const pledges = normalizePledgeRows(
    assertArrayResult(pledgesResult, "Unable to load donor recurring gifts"),
  );

  if (preferencesResult.error && preferencesResult.error.code !== "PGRST116") {
    throw new ApiHttpError(
      500,
      preferencesResult.error.message || "Unable to load donor preferences",
    );
  }

  return buildDonorPortalSnapshot({
    profile,
    donor,
    donations,
    pledges,
    feedPreferences: preferencesResult.data,
  });
}

export async function getOwnedDonation(input: {
  supabaseAdmin: AdminSupabaseClient;
  donationId: string;
  donorId: string;
  tenantId: string;
}): Promise<DonorPortalDonationRow> {
  const donation = assertResult(
    (await input.supabaseAdmin
      .from("donations")
      .select(DONATION_SELECT)
      .eq("id", input.donationId)
      .eq("tenant_id", input.tenantId)
      .eq("donor_id", input.donorId)
      .single()) as SupabaseResult<DonorPortalDonationRow>,
    "Donation not found",
  );

  return normalizeDonationRows([donation])[0] as DonorPortalDonationRow;
}

export async function getOwnedStatementDonations(input: {
  supabaseAdmin: AdminSupabaseClient;
  donorId: string;
  tenantId: string;
  year: number;
}): Promise<DonorPortalDonationRow[]> {
  const start = `${input.year}-01-01T00:00:00.000Z`;
  const end = `${input.year + 1}-01-01T00:00:00.000Z`;
  const result = (await input.supabaseAdmin
    .from("donations")
    .select(DONATION_SELECT)
    .eq("tenant_id", input.tenantId)
    .eq("donor_id", input.donorId)
    .gte("gift_date", start)
    .lt("gift_date", end)
    .order("gift_date", {
      ascending: true,
    })) as SupabaseResult<DonorPortalDonationRow[]>;

  return normalizeDonationRows(
    assertArrayResult(result, "Unable to load donor statement gifts"),
  ).filter((donation) => isSettledDonationStatus(donation.status));
}
