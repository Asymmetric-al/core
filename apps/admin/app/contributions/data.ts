import type { Contribution } from "./types";

/** Live-query page reads from TanStack DB; keep empty for typing / fallbacks. */
export const mockContributions: Contribution[] = [];

const fixtureNow = new Date().toISOString();

/** Synthetic rows for Boneyard capture, unit tests, and skeleton fixtures only. */
export const boneyardContributionsFixture: Contribution[] = [
  {
    id: "by-c1",
    donorId: "by-d1",
    donorName: "Sarah Mitchell",
    donorEmail: "sarah.mitchell@example.com",
    donorAvatar: null,
    amount: 250,
    date: fixtureNow,
    status: "completed",
    type: "One-time",
    paymentMethod: "Credit Card",
    source: "Online",
    fundCode: "GEN",
    fundName: "General Fund",
    transactionId: "pi_fixture_1",
    isAnonymous: false,
    receiptSent: true,
    createdAt: fixtureNow,
    updatedAt: fixtureNow,
  },
  {
    id: "by-c2",
    donorId: "by-d2",
    donorName: "James Chen",
    donorEmail: "james.chen@example.com",
    donorAvatar: null,
    amount: 100,
    date: fixtureNow,
    status: "pending",
    type: "Recurring",
    paymentMethod: "Bank Transfer",
    source: "Mobile",
    fundCode: "OUT",
    fundName: "Outreach",
    transactionId: null,
    isAnonymous: false,
    receiptSent: false,
    createdAt: fixtureNow,
    updatedAt: fixtureNow,
  },
];

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
