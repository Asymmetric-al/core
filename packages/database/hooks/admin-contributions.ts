"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import {
  donationsCollection,
  donorsCollection,
  fundsCollection,
  profilesCollection,
} from "../collections";
import {
  invalidateAdminSurfaceQuery,
  invalidateSupabaseTableQuery,
} from "../query-keys";

type ContributionStatus = "completed" | "pending" | "failed" | "refunded";

export interface ContributionLiveRow {
  id: string;
  donorId: string;
  donorName: string | null;
  donorEmail: string;
  donorAvatar?: string | null;
  amount: number;
  date: string;
  status: ContributionStatus;
  type: "One-time" | "Recurring" | "Pledge" | "In-kind";
  paymentMethod:
    | "Credit Card"
    | "Bank Transfer"
    | "Check"
    | "Cash"
    | "PayPal"
    | "Other";
  source: "Online" | "Mobile" | "In-person" | "Mail" | "Phone" | "Import";
  fundCode: string | null;
  fundName: string | null;
  missionaryId?: string | null;
  missionaryName?: string;
  transactionId: string | null;
  notes?: string;
  isAnonymous: boolean;
  receiptSent: boolean;
  createdAt: string;
  updatedAt: string;
}

function donorDisplayName(profile?: {
  display_name: string | null;
  first_name: string;
  last_name: string;
  email: string;
}): string | null {
  if (!profile) {
    return null;
  }

  if (profile.display_name?.trim()) {
    return profile.display_name.trim();
  }

  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || profile.email || null;
}

function normalizeContributionStatus(status: string): ContributionStatus {
  if (status === "processing") {
    return "pending";
  }

  if (
    status === "completed" ||
    status === "pending" ||
    status === "failed" ||
    status === "refunded"
  ) {
    return status;
  }

  return "pending";
}

function getQueryError(
  query:
    | {
        collection?: {
          utils?: {
            lastError?: unknown;
          };
        };
        isError?: boolean;
      }
    | undefined,
): Error | null {
  if (!query?.isError) {
    return null;
  }

  const lastError = query.collection?.utils?.lastError;
  if (lastError instanceof Error) {
    return lastError;
  }

  if (lastError) {
    return new Error(String(lastError));
  }

  return new Error("Live query failed.");
}

export function useContributionsLiveRows() {
  const queryClient = useQueryClient();
  const donationsQuery = useLiveQuery(donationsCollection.value);
  const donorsQuery = useLiveQuery(donorsCollection.value);
  const profilesQuery = useLiveQuery(profilesCollection.value);
  const fundsQuery = useLiveQuery(fundsCollection.value);

  const data = React.useMemo(() => {
    const donorsById = new Map(
      (donorsQuery.data ?? []).map((donor) => [donor.id, donor]),
    );
    const profilesById = new Map(
      (profilesQuery.data ?? []).map((profile) => [profile.id, profile]),
    );
    const fundsById = new Map(
      (fundsQuery.data ?? []).map((fund) => [fund.id, fund]),
    );

    return (donationsQuery.data ?? []).map((donation) => {
      const donor = donation.donor_id
        ? donorsById.get(donation.donor_id)
        : undefined;
      const profile =
        donor?.profile_id != null
          ? profilesById.get(donor.profile_id)
          : undefined;
      const fund =
        donation.fund_id != null ? fundsById.get(donation.fund_id) : undefined;
      const donorEmail = profile?.email?.trim() ?? "";
      const donorName =
        donorDisplayName(profile) ??
        (donation.donor_id ? "Unknown donor" : "Anonymous");
      const donorId = donor?.id ?? donation.donor_id ?? `orphan:${donation.id}`;
      const isAnonymous = !donation.donor_id || !profile;

      return {
        id: donation.id,
        donorId,
        donorName,
        donorEmail,
        donorAvatar: profile?.avatar_url,
        amount: donation.amount,
        date: donation.created_at,
        status: normalizeContributionStatus(donation.status),
        type: "One-time",
        paymentMethod: "Other",
        source: "Online",
        fundCode: fund?.id ?? null,
        fundName: fund?.name ?? null,
        missionaryId: donation.missionary_id,
        transactionId: donation.stripe_payment_intent_id,
        isAnonymous,
        receiptSent: false,
        createdAt: donation.created_at,
        updatedAt: donation.updated_at,
      } satisfies ContributionLiveRow;
    });
  }, [
    donationsQuery.data,
    donorsQuery.data,
    fundsQuery.data,
    profilesQuery.data,
  ]);

  const error = React.useMemo(
    () =>
      getQueryError(donationsQuery) ??
      getQueryError(donorsQuery) ??
      getQueryError(profilesQuery) ??
      getQueryError(fundsQuery),
    [donationsQuery, donorsQuery, profilesQuery, fundsQuery],
  );

  const isLoading =
    donationsQuery.isLoading ||
    donorsQuery.isLoading ||
    profilesQuery.isLoading ||
    fundsQuery.isLoading;

  const refetch = React.useCallback(async () => {
    await Promise.all([
      invalidateSupabaseTableQuery(queryClient, "donations"),
      invalidateSupabaseTableQuery(queryClient, "donors"),
      invalidateSupabaseTableQuery(queryClient, "profiles"),
      invalidateSupabaseTableQuery(queryClient, "funds"),
      invalidateAdminSurfaceQuery(queryClient, "contributions"),
    ]);
  }, [queryClient]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
