import { getInitials } from "@asym/lib/utils";

import type { Contribution, ContributionStatus } from "./types";

export const contributionStatusDotColor: Record<ContributionStatus, string> = {
  Succeeded: "bg-emerald-500",
  Pending: "bg-amber-500",
  Failed: "bg-destructive",
  Refunded: "bg-muted-foreground",
  Disputed: "bg-orange-500",
};

export function getContributionDonorName(
  contribution: Contribution,
  anonymousLabel = "Anonymous",
) {
  return contribution.isAnonymous ? anonymousLabel : contribution.donor.name;
}

export function getContributionDonorInitials(contribution: Contribution) {
  return contribution.isAnonymous ? "?" : getInitials(contribution.donor.name);
}

export function formatContributionDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatContributionTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getContributionReceiptLabel(receiptSent: boolean) {
  return receiptSent ? "Sent" : "Pending";
}

export function getContributionReceiptDotColor(receiptSent: boolean) {
  return receiptSent ? "bg-emerald-500" : "bg-muted-foreground/40";
}
