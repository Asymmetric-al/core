"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-client";

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

const donorHistoryTransactionSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  amount: z.number(),
  recipient: z.string().min(1),
  recipientAvatar: z.string().optional(),
  category: z.string().min(1),
  type: z.enum(["Recurring", "One-Time"]),
  method: z.string().min(1),
  last4: z.string().min(1),
  status: z.enum(["Succeeded", "Processing", "Failed"]),
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
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10355",
    date: "2024-09-12T14:15:00",
    amount: 500,
    recipient: "Clean Water Initiative",
    recipientAvatar:
      "https://images.unsplash.com/photo-1538300342682-cf57afb97285?fit=crop&w=256&h=256&q=80",
    category: "Project",
    type: "One-Time",
    method: "Mastercard",
    last4: "8821",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10290",
    date: "2024-08-24T10:30:00",
    amount: 100,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10150",
    date: "2024-06-15T09:00:00",
    amount: 250,
    recipient: "Refugee Crisis Fund",
    recipientAvatar:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?fit=crop&w=256&h=256&q=80",
    category: "Emergency",
    type: "One-Time",
    method: "Bank",
    last4: "9921",
    status: "Processing",
    receiptUrl: "#",
  },
  {
    id: "TX-9982",
    date: "2024-05-24T10:30:00",
    amount: 100,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Failed",
    receiptUrl: "#",
  },
];

type DonorPortalResponse = {
  portal: {
    donations: Array<{
      id: string;
      date: string;
      amount: number;
      designation: {
        name: string;
        type: "missionary" | "fund" | "general";
        avatarUrl: string | null;
      };
      type: "Recurring" | "One-Time";
      method: string;
      status: "Succeeded" | "Processing" | "Failed";
      receiptUrl: string;
    }>;
  };
};

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

  return payload.portal.donations.map((donation) => ({
    id: donation.id,
    date: donation.date,
    amount: donation.amount,
    recipient: donation.designation.name,
    recipientAvatar: donation.designation.avatarUrl ?? undefined,
    category:
      donation.designation.type === "fund"
        ? "Project"
        : donation.designation.type === "missionary"
          ? "Missionary"
          : "General",
    type: donation.type,
    method: donation.method,
    last4: "Stripe",
    status: donation.status,
    receiptUrl: donation.receiptUrl,
  }));
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
