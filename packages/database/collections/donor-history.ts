"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-client";

// Route-backed transition collection. Donor history needs receipt/payment
// redaction from the donor portal server read model until the live query shape
// can prove equivalent behavior without exposing finance internals.
function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

const donorHistoryTransactionSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  amount: z.number(),
  /** The missionary the gift supports, or the fund when it has none. */
  recipient: z.string().min(1),
  recipientAvatar: z.string().optional(),
  /** The fund the gift was designated to, when it supports a missionary. */
  fund: z.string().nullable(),
  type: z.enum(["Recurring", "One-Time"]),
  /** How it was paid, in plain words ("Card", "Bank account (ACH)"). */
  method: z.string().min(1),
  status: z.enum(["Paid", "Processing", "Failed", "Refunded"]),
  receiptUrl: z.string().min(1),
});

export type DonorHistoryTransaction = z.infer<
  typeof donorHistoryTransactionSchema
>;

const DONOR_HISTORY_TRANSACTIONS_SEED: DonorHistoryTransaction[] = [
  {
    id: "TX-10492",
    date: "2024-10-24T10:30:00",
    amount: 100,
    recipient: "The Miller Family",
    fund: null,
    type: "Recurring",
    method: "Card",
    status: "Paid",
    receiptUrl: "#",
  },
  {
    id: "TX-10355",
    date: "2024-09-12T14:15:00",
    amount: 500,
    recipient: "Clean Water Initiative",
    fund: null,
    type: "One-Time",
    method: "Card",
    status: "Paid",
    receiptUrl: "#",
  },
  {
    id: "TX-10150",
    date: "2024-06-15T09:00:00",
    amount: 250,
    recipient: "The Miller Family",
    fund: "Refugee Winter Relief",
    type: "One-Time",
    method: "Bank account (ACH)",
    status: "Processing",
    receiptUrl: "#",
  },
  {
    id: "TX-9982",
    date: "2024-05-24T10:30:00",
    amount: 100,
    recipient: "The Miller Family",
    fund: null,
    type: "Recurring",
    method: "Card",
    status: "Failed",
    receiptUrl: "#",
  },
];

export type DonorPortalHistoryGift = {
  id: string;
  date: string;
  amount: number;
  designation: {
    name: string;
    type: "missionary" | "fund" | "general";
    avatarUrl: string | null;
  };
  missionary: { id: string; name: string; avatarUrl: string | null } | null;
  fund: { id: string; name: string } | null;
  type: "Recurring" | "One-Time";
  method: string;
  status: DonorHistoryTransaction["status"];
  receiptUrl: string;
};

type DonorPortalResponse = {
  portal: { donations: DonorPortalHistoryGift[] };
};

/**
 * One history row: who the gift supports (the missionary, else the fund or
 * general fund) and, separately, the fund a missionary gift went to.
 */
export function toDonorHistoryTransaction(
  donation: DonorPortalHistoryGift,
): DonorHistoryTransaction {
  const missionary = donation.missionary;
  return {
    id: donation.id,
    date: donation.date,
    amount: donation.amount,
    recipient: missionary?.name ?? donation.designation.name,
    recipientAvatar:
      (missionary ? missionary.avatarUrl : donation.designation.avatarUrl) ??
      undefined,
    fund: missionary ? (donation.fund?.name ?? null) : null,
    type: donation.type,
    method: donation.method,
    status: donation.status,
    receiptUrl: donation.receiptUrl,
  };
}

async function fetchDonorHistoryTransactions(): Promise<
  DonorHistoryTransaction[]
> {
  const response = await fetch("/api/donor/portal", {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Unable to load donor portal (${response.status})`);
  }

  const payload = (await response.json()) as DonorPortalResponse;

  return payload.portal.donations.map(toDonorHistoryTransaction);
}

export const donorHistoryTransactionsCollection = createCollection(
  queryCollectionOptions({
    id: "donor_history_transactions",
    queryKey: ["donor", "history", "transactions"],
    queryClient: getQueryClient(),
    schema: donorHistoryTransactionSchema,
    getKey: (item) => item.id,
    queryFn: async () => {
      if (process.env.NODE_ENV === "test") {
        return cloneValue(DONOR_HISTORY_TRANSACTIONS_SEED);
      }

      return fetchDonorHistoryTransactions();
    },
  }),
);
