"use client";

import {
  donationsCollection,
  donorsCollection,
  fundsCollection,
  profilesCollection,
} from "@asym/database/collections";
import { supabaseTableQueryKeys } from "@asym/database/query-keys";
import { eq, type Collection, type InitialQueryBuilder } from "@tanstack/db";

import type { Contribution } from "./types";

export type ContributionLiveRow = Contribution;

type DonationRow = {
  id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

type DonorRow = {
  id: string;
  profile_id: string | null;
};

type ProfileRow = {
  id: string;
  display_name?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string | null;
};

type FundRow = {
  id: string;
  name?: string | null;
};

export function buildContributionsLiveQuery(q: InitialQueryBuilder) {
  const donations = donationsCollection.value as unknown as Collection<
    DonationRow,
    string
  >;
  const donors = donorsCollection.value as unknown as Collection<
    DonorRow,
    string
  >;
  const profiles = profilesCollection.value as unknown as Collection<
    ProfileRow,
    string
  >;
  const funds = fundsCollection.value as unknown as Collection<FundRow, string>;

  return q
    .from({ donation: donations })
    .innerJoin({ donor: donors }, ({ donation, donor }) =>
      eq(donation.donor_id, donor.id),
    )
    .innerJoin({ profile: profiles }, ({ donor, profile }) =>
      eq(donor.profile_id, profile.id),
    )
    .leftJoin({ fund: funds }, ({ donation, fund }) =>
      eq(donation.fund_id, fund.id),
    )
    .select(({ donation, donor, profile, fund }) => ({
      id: donation.id,
      donorId: donor.id,
      donorName: profile.display_name ?? profile.email,
      donorEmail: profile.email,
      donorAvatar: profile.avatar_url ?? null,
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
    .orderBy(({ donation }) => donation.created_at, "desc");
}

export const contributionsLiveQueryKey = [...supabaseTableQueryKeys.donations];
