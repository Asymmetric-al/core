"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { parseJsonResponse } from "../http/parse-json-response";
import { getQueryClient } from "../providers/query-client";

export type DonorPortalDonation = {
  id: string;
  date: string;
  amountCents: number;
  amount: number;
  currency: string;
  /** Paid, Processing, Failed or Refunded (glossary status words). */
  status: "Paid" | "Processing" | "Failed" | "Refunded";
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
  /** The missionary the gift supports, when it supports one. */
  missionary: DonorPortalGiftMissionary | null;
  /** The fund it was designated to, when it has one. */
  fund: DonorPortalGiftFund | null;
};

export type DonorPortalGiftMissionary = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type DonorPortalGiftFund = {
  id: string;
  name: string;
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
  missionary: DonorPortalGiftMissionary | null;
  fund: DonorPortalGiftFund | null;
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
    address: DonorPortalAddress | null;
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
  /**
   * False when only the newest gifts were loaded, so totals over `donations`
   * can miss older gifts. Absent means the list is complete.
   */
  donationsComplete?: boolean;
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

export type DonorPortalAddress = {
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
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
  address?: Partial<DonorPortalAddress> | null;
};

const DONOR_PORTAL_QUERY_KEY = ["donor", "portal"] as const;

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

/**
 * A missionary the signed-in donor already gives to, from portal data this
 * visit has loaded. It never fetches, so public pages such as checkout make
 * no account request for anonymous visitors.
 */
export function knownDonorRecipient(missionaryId: string | null) {
  if (!missionaryId) return null;
  const snapshot = getQueryClient().getQueryData<DonorPortalSnapshot>(
    DONOR_PORTAL_QUERY_KEY,
  );
  const gifts = [
    ...(snapshot?.donations ?? []),
    ...(snapshot?.recurringGifts ?? []),
  ];
  return (
    gifts.find((gift) => gift.missionary?.id === missionaryId)?.missionary ??
    null
  );
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
  // Creates a Stripe Billing Portal session and returns its redirect URL; it
  // changes no cached donor data, and the return trip is a full navigation.
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation
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

/** A saved payment method as the wallet shows it (read from Stripe). */
export type DonorWalletPaymentMethod = {
  id: string;
  kind: "card" | "bank";
  brand: string;
  last4: string;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
  recurringGiftIds: string[];
};

export type DonorWallet =
  | { status: "linked"; methods: DonorWalletPaymentMethod[] }
  | { status: "not_linked"; methods: [] };

const DONOR_WALLET_QUERY_KEY = ["donor", "wallet"] as const;

/** The donor's saved payment methods. Changes happen in Stripe's portal. */
export function useDonorWallet() {
  return useQuery({
    queryKey: DONOR_WALLET_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/donor/payment-methods", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        method: "GET",
      });
      return parseJsonResponse<DonorWallet>(response);
    },
  });
}
