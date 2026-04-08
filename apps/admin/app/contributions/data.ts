import type { Contribution } from "./types";

/** Live-query page reads from TanStack DB; keep empty for typing / fallbacks. */
export const mockContributions: Contribution[] = [];

export const contributionStatusOptions = [
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export const contributionTypeOptions = [
  { label: "One-time", value: "One-time" },
  { label: "Recurring", value: "Recurring" },
  { label: "Pledge", value: "Pledge" },
  { label: "In-kind", value: "In-kind" },
];

export const paymentMethodOptions = [
  { label: "Credit Card", value: "Credit Card" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "Check", value: "Check" },
  { label: "Cash", value: "Cash" },
  { label: "PayPal", value: "PayPal" },
  { label: "Other", value: "Other" },
];

export const sourceOptions = [
  { label: "Online", value: "Online" },
  { label: "Mobile", value: "Mobile" },
  { label: "In-person", value: "In-person" },
  { label: "Mail", value: "Mail" },
  { label: "Phone", value: "Phone" },
  { label: "Import", value: "Import" },
];
