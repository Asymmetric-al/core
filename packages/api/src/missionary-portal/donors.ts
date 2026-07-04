import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";

import { isAnonymousToRecipient, type GivingPreferences } from "./redaction";
import { ApiHttpError } from "../shared/http-errors";
import { withOperation } from "../shared/with-operation";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Server-side, REDACTED "Partners" (donor relationships) list for the missionary
 * app. Replaces the previous client-side `.select("*")` on `donors` so a missionary
 * client NEVER receives raw identity for a donor who is anonymous to them.
 * Spec DONOR_ANONYMITY_GUEST_GIVING_SPEC §7.2 / §12.1. Business logic lives here;
 * the app route is a thin re-export.
 */

export interface MissionaryDonorAddress {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface MissionaryDonorActivity {
  id: string;
  type: string;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  status?: string;
  gift_type?: string;
  note?: string;
}

export interface MissionaryRecurringDonation {
  id: string;
  amount: number;
  frequency: string;
  status: string;
  start_date: string;
  end_date?: string;
  next_payment_date?: string;
  total_paid: number;
  total_expected: number;
  payments_completed: number;
  payments_remaining: number;
  payment_method?: string;
}

export interface MissionaryDonorRow {
  id: string;
  name: string;
  initials: string;
  type: "Individual" | "Organization" | "Church";
  status: "Active" | "Lapsed" | "New" | "At Risk";
  total_given: number;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  frequency: string;
  email: string;
  phone: string;
  mobile?: string;
  work_phone?: string;
  preferred_contact: "email" | "phone" | "text";
  avatar_url?: string;
  location: string;
  address: MissionaryDonorAddress;
  work_address?: MissionaryDonorAddress;
  website?: string;
  organization?: string;
  title?: string;
  joined_date: string;
  birthday?: string;
  anniversary?: string;
  spouse?: string;
  notes?: string;
  tags: string[];
  score: number;
  activities: MissionaryDonorActivity[];
  recurring_donations: MissionaryRecurringDonation[];
  has_active_pledge: boolean;
  /** True when redacted (donor is anonymous to this missionary). */
  is_anonymous: boolean;
}

export interface MissionaryDonorSourceRow {
  id: string;
  missionary_id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  work_phone?: string | null;
  preferred_contact?: string | null;
  avatar_url?: string | null;
  location?: string | null;
  address?: unknown;
  work_address?: unknown;
  website?: string | null;
  organization?: string | null;
  title?: string | null;
  type?: string | null;
  status?: string | null;
  total_given?: number | null;
  last_gift_date?: string | null;
  last_gift_amount?: number | null;
  frequency?: string | null;
  joined_date?: string | null;
  created_at?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
  spouse?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  score?: number | null;
  has_active_pledge?: boolean | null;
  giving_preferences?: GivingPreferences | null;
}

export interface DonorActivitySourceRow {
  id: string;
  donor_id: string | null;
  type?: string | null;
  date?: string | null;
  created_at: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  status?: string | null;
  gift_type?: string | null;
  note?: string | null;
}

export interface DonorPledgeSourceRow {
  id: string;
  donor_id: string | null;
  missionary_id?: string | null;
  amount: number;
  frequency?: string | null;
  status?: string | null;
  start_date?: string | null;
  created_at: string;
  end_date?: string | null;
  next_payment_date?: string | null;
  total_paid: number;
  total_expected: number;
  payments_completed?: number | null;
  payments_remaining?: number | null;
  payment_method?: string | null;
}

const ANONYMOUS_DONOR_NAME = "Anonymous donor";

function normalizeDonorType(value: string | null | undefined): MissionaryDonorRow["type"] {
  return value === "Organization" || value === "Church" ? value : "Individual";
}

function normalizeDonorStatus(value: string | null | undefined): MissionaryDonorRow["status"] {
  return value === "Lapsed" || value === "New" || value === "At Risk"
    ? value
    : "Active";
}

function normalizePreferredContact(
  value: string | null | undefined,
): MissionaryDonorRow["preferred_contact"] {
  return value === "phone" || value === "text" ? value : "email";
}

function createInitials(name: string | null | undefined) {
  return (
    (name ?? "")
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

function mapActivity(activity: DonorActivitySourceRow): MissionaryDonorActivity {
  return {
    id: activity.id,
    type: activity.type ?? "note",
    date: activity.date ?? activity.created_at,
    title: activity.title,
    description: activity.description ?? undefined,
    amount: activity.amount ?? undefined,
    status: activity.status ?? undefined,
    gift_type: activity.gift_type ?? undefined,
    note: activity.note ?? undefined,
  };
}

function mapPledge(pledge: DonorPledgeSourceRow): MissionaryRecurringDonation {
  return {
    id: pledge.id,
    amount: pledge.amount,
    frequency: pledge.frequency ?? "Monthly",
    status: pledge.status ?? "active",
    start_date: pledge.start_date ?? pledge.created_at,
    end_date: pledge.end_date ?? undefined,
    next_payment_date: pledge.next_payment_date ?? undefined,
    total_paid: pledge.total_paid,
    total_expected: pledge.total_expected,
    payments_completed: pledge.payments_completed ?? 0,
    payments_remaining: pledge.payments_remaining ?? 0,
    payment_method: pledge.payment_method ?? undefined,
  };
}

/**
 * Build the redacted donor rows for a missionary. Pure — unit-testable with no
 * DB. Scopes to `missionaryProfileId`, then for each donor that is anonymous to
 * the recipient (§8.2 donor default; per-gift override lands with the Track B
 * column) strips EVERY identifier + free-text (name/email/phone/address/notes/
 * tags/activities), keeping only aggregate support stats (§7.2).
 */
export function buildMissionaryDonorRows(input: {
  missionaryProfileId: string;
  donors: MissionaryDonorSourceRow[];
  activities: DonorActivitySourceRow[];
  pledges: DonorPledgeSourceRow[];
}): MissionaryDonorRow[] {
  const activitiesByDonor = new Map<string, MissionaryDonorActivity[]>();
  for (const activity of input.activities) {
    if (!activity.donor_id) continue;
    const list = activitiesByDonor.get(activity.donor_id) ?? [];
    list.push(mapActivity(activity));
    activitiesByDonor.set(activity.donor_id, list);
  }

  const pledgesByDonor = new Map<string, MissionaryRecurringDonation[]>();
  for (const pledge of input.pledges) {
    if (!pledge.donor_id || pledge.missionary_id !== input.missionaryProfileId) {
      continue;
    }
    const list = pledgesByDonor.get(pledge.donor_id) ?? [];
    list.push(mapPledge(pledge));
    pledgesByDonor.set(pledge.donor_id, list);
  }

  return input.donors
    .filter((donor) => donor.missionary_id === input.missionaryProfileId)
    .map((donor) => {
      const anonymous = isAnonymousToRecipient({
        givingPreferences: donor.giving_preferences,
      });

      // Support stats stay visible for both named and anonymous donors (§7.2).
      const stats = {
        id: donor.id,
        type: normalizeDonorType(donor.type),
        status: normalizeDonorStatus(donor.status),
        total_given: donor.total_given ?? 0,
        last_gift_date: donor.last_gift_date ?? null,
        last_gift_amount: donor.last_gift_amount ?? null,
        frequency: donor.frequency ?? "One-Time",
        score: donor.score ?? 0,
        recurring_donations: pledgesByDonor.get(donor.id) ?? [],
        has_active_pledge: donor.has_active_pledge ?? false,
        joined_date: donor.joined_date ?? donor.created_at ?? "",
      };

      if (anonymous) {
        return {
          ...stats,
          name: ANONYMOUS_DONOR_NAME,
          initials: createInitials(ANONYMOUS_DONOR_NAME),
          email: "",
          phone: "",
          mobile: undefined,
          work_phone: undefined,
          preferred_contact: "email" as const,
          avatar_url: undefined,
          location: "",
          address: {},
          work_address: undefined,
          website: undefined,
          organization: undefined,
          title: undefined,
          birthday: undefined,
          anniversary: undefined,
          spouse: undefined,
          notes: undefined,
          tags: [],
          activities: [], // free-text / PII — never expose for anonymous donors
          is_anonymous: true,
        };
      }

      return {
        ...stats,
        name: donor.name ?? donor.email ?? "Unnamed donor",
        initials: createInitials(donor.name ?? donor.email),
        email: donor.email ?? "",
        phone: donor.phone ?? "",
        mobile: donor.mobile ?? undefined,
        work_phone: donor.work_phone ?? undefined,
        preferred_contact: normalizePreferredContact(donor.preferred_contact),
        avatar_url: donor.avatar_url ?? undefined,
        location: donor.location ?? "",
        address: (donor.address ?? {}) as MissionaryDonorAddress,
        work_address: donor.work_address
          ? (donor.work_address as MissionaryDonorAddress)
          : undefined,
        website: donor.website ?? undefined,
        organization: donor.organization ?? undefined,
        title: donor.title ?? undefined,
        birthday: donor.birthday ?? undefined,
        anniversary: donor.anniversary ?? undefined,
        spouse: donor.spouse ?? undefined,
        notes: donor.notes ?? undefined,
        tags: donor.tags ?? [],
        activities: activitiesByDonor.get(donor.id) ?? [],
        is_anonymous: false,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

const DONOR_SELECT = `
  id, missionary_id, name, email, phone, mobile, work_phone, preferred_contact,
  avatar_url, location, address, work_address, website, organization, title,
  type, status, total_given, last_gift_date, last_gift_amount, frequency,
  joined_date, created_at, birthday, anniversary, spouse, notes, tags, score,
  has_active_pledge, giving_preferences
`;

/** Fetch + build the redacted donor rows for the authenticated missionary. */
export async function getMissionaryDonorRows(input: {
  supabaseAdmin: AdminSupabaseClient;
  profileId: string;
  tenantId: string;
}): Promise<MissionaryDonorRow[]> {
  const [donorsRes, activitiesRes, pledgesRes] = await Promise.all([
    input.supabaseAdmin
      .from("donors")
      .select(DONOR_SELECT)
      .eq("tenant_id", input.tenantId)
      .eq("missionary_id", input.profileId)
      .limit(500),
    input.supabaseAdmin
      .from("donor_activities")
      .select("id, donor_id, type, date, created_at, title, description, amount, status, gift_type, note")
      .eq("tenant_id", input.tenantId)
      .limit(2000),
    input.supabaseAdmin
      .from("donor_pledges")
      .select(
        "id, donor_id, missionary_id, amount, frequency, status, start_date, created_at, end_date, next_payment_date, total_paid, total_expected, payments_completed, payments_remaining, payment_method",
      )
      .eq("tenant_id", input.tenantId)
      .limit(2000),
  ]);

  if (donorsRes.error) {
    throw new ApiHttpError(500, donorsRes.error.message || "Unable to load donors");
  }

  return buildMissionaryDonorRows({
    missionaryProfileId: input.profileId,
    donors: (donorsRes.data ?? []) as unknown as MissionaryDonorSourceRow[],
    activities: (activitiesRes.data ?? []) as unknown as DonorActivitySourceRow[],
    pledges: (pledgesRes.data ?? []) as unknown as DonorPledgeSourceRow[],
  });
}

export const GET = withOperation(
  async ({ supabaseAdmin, auth }) => {
    const ctx = auth as AuthenticatedContext;
    const donors = await getMissionaryDonorRows({
      supabaseAdmin,
      profileId: ctx.profileId,
      tenantId: ctx.tenantId,
    });
    return NextResponse.json({ donors });
  },
  { roles: ["missionary"] },
);
