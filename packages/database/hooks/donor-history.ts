"use client";

import { useLiveQuery } from "@tanstack/react-db";

import { donorHistoryTransactionsCollection } from "../collections/donor-history";

export type { DonorHistoryTransaction } from "../collections/donor-history";

export function useDonorHistoryTransactions() {
  return useLiveQuery(donorHistoryTransactionsCollection);
}
