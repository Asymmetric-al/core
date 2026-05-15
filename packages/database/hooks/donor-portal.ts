"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type DonorPortalDonation = {
  id: string;
  date: string;
  amountCents: number;
  amount: number;
  currency: string;
  status: "Succeeded" | "Processing" | "Failed";
  type: "Recurring" | "One-Time";
  method: string;
  receiptUrl: string;
  statementYear: number;
  designation: {
    id: string | null;
    name: string;
    type: "missionary" | "fund" | "general";
    avatarUrl: string | null;
  };
};

export type DonorPortalRecurringGift = {
  id: string;
  amountCents: number;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  startedAt: string | null;
  endsAt: string | null;
  nextChargeAt: string | null;
  stripeSubscriptionId: string | null;
  paymentMethodLabel: string;
  totalPaidCents: number;
  totalExpectedCents: number;
  paymentsCompleted: number;
  paymentsRemaining: number | null;
  designation: DonorPortalDonation["designation"];
};

export type DonorPortalSnapshot = {
  profile: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  donor: {
    id: string;
    status: string;
    joinedDate: string | null;
    preferredContact: string;
    receiptEmailFrequency: string;
    defaultUpdateFrequency: string | null;
    preferredLanguage: string;
    doNotContact: boolean;
    doNotEmail: boolean;
    givingPreferences: Record<string, unknown>;
    stripeCustomerConfigured: boolean;
  };
  summary: {
    yearToDateCents: number;
    lifetimeGivenCents: number;
    giftCount: number;
    activeRecurringGiftCount: number;
    supportedDesignationCount: number;
    receiptCount: number;
    statementYears: number[];
    latestImpactLabel: string | null;
  };
  donations: DonorPortalDonation[];
  recurringGifts: DonorPortalRecurringGift[];
  paymentMethods: Array<{
    id: string;
    label: string;
    source: "stripe_subscription" | "donation_history";
    stripeManaged: boolean;
    recurringGiftIds: string[];
  }>;
  feedPreferences: {
    showOrgPosts: boolean;
    showMissionaryPosts: boolean;
    followOrg: boolean;
    emailOrgPosts: boolean;
    emailMissionaryPosts: boolean;
    pushOrgPosts: boolean;
    pushMissionaryPosts: boolean;
  };
};

export type DonorPortalPatch = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  preferredContact?: string;
  receiptEmailFrequency?: string;
  defaultUpdateFrequency?: string | null;
  preferredLanguage?: string;
  doNotContact?: boolean;
  doNotEmail?: boolean;
  givingPreferences?: Record<string, unknown>;
};

const DONOR_PORTAL_QUERY_KEY = ["donor", "portal"] as const;

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error || `Request failed with status ${response.status}`,
    );
  }

  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}

export async function fetchDonorPortalSnapshot(): Promise<DonorPortalSnapshot> {
  const response = await fetch("/api/donor/portal", {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  const payload = await parseJsonResponse<{ portal: DonorPortalSnapshot }>(
    response,
  );

  return payload.portal;
}

export function useDonorPortalSnapshot() {
  return useQuery({
    queryKey: DONOR_PORTAL_QUERY_KEY,
    queryFn: fetchDonorPortalSnapshot,
  });
}

export function useUpdateDonorPortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: DonorPortalPatch) => {
      const response = await fetch("/api/donor/portal", {
        body: JSON.stringify(patch),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      return parseJsonResponse<{ portal: DonorPortalSnapshot }>(response);
    },
    onSuccess: ({ portal }) => {
      queryClient.setQueryData(DONOR_PORTAL_QUERY_KEY, portal);
    },
  });
}

export function useCreateDonorBillingPortalSession() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/donor/billing-portal", {
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
        method: "POST",
      });

      return parseJsonResponse<{ url: string; stripeManaged: true }>(response);
    },
  });
}
