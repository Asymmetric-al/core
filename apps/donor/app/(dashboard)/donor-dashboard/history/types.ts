import type { DonorHistoryTransaction } from "@asym/database/hooks";

export type Transaction = DonorHistoryTransaction;

export const STATUS_VARIANTS: Record<
  Transaction["status"],
  "success" | "info" | "destructive" | "secondary"
> = {
  Paid: "success",
  Processing: "info",
  Failed: "destructive",
  Refunded: "secondary",
};

export const GIFT_TYPE_LABELS: Record<Transaction["type"], string> = {
  Recurring: "Monthly gift",
  "One-Time": "One-time gift",
};
