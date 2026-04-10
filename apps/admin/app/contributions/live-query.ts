"use client";

import {
  donationsCollection,
  donorsCollection,
  fundsCollection,
  profilesCollection,
} from "@asym/database/collections";
import { supabaseTableQueryKeys } from "@asym/database/query-keys";
import { eq, type InitialQueryBuilder } from "@tanstack/db";

import type { Contribution } from "./types";

export type ContributionLiveRow = Contribution;

function donorDisplayName(profile: {
  display_name?: string | null;
  first_name: string;
  last_name: string;
  email: string;
}): string | null {
  if (profile.display_name?.trim()) return profile.display_name.trim();
  const full = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || profile.email || null;
}

export function buildContributionsLiveQuery(q: InitialQueryBuilder) {
  const donations = donationsCollection.value as any;
  const donors = donorsCollection.value as any;
  const profiles = profilesCollection.value as any;
  const funds = fundsCollection.value as any;

  return q
    .from({ donation: donations })
    .join({ donor: donors }, ({ donation, donor }: any) =>
      eq(donation.donor_id, donor.id),
    )
    .join({ profile: profiles }, ({ donor, profile }: any) =>
      eq(donor.profile_id, profile.id),
    )
    .leftJoin({ fund: funds }, ({ donation, fund }: any) =>
      eq(donation.fund_id, fund.id),
    )
    .select(({ donation, donor, profile, fund }: any) => ({
      id: donation.id,
      donorId: donor.id,
      donorName: donorDisplayName(profile),
      donorEmail: profile.email,
      donorAvatar: profile.avatar_url,
      amount: donation.amount,
      date: donation.created_at,
      status: donation.status,
      type: "One-time" as const,
      paymentMethod: "Other" as const,
      source: "Online" as const,
      fundCode: fund?.id ?? null,
      fundName: fund?.name ?? null,
      missionaryId: donation.missionary_id,
      transactionId: donation.stripe_payment_intent_id,
      isAnonymous: false,
      receiptSent: false,
      createdAt: donation.created_at,
      updatedAt: donation.created_at,
    }))
    .orderBy(({ donation }: any) => donation.created_at, "desc");
}

export const contributionsLiveQueryKey = [...supabaseTableQueryKeys.donations];
