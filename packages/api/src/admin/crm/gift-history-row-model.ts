import {
  hasSharedContributionIssue,
  matchesSharedContributionFilter,
} from "../contribution-shared";

import type {
  CrmGiftHistoryFiltersSortSettings,
  CrmGiftHistoryRow,
} from "@asym/database/types";

export function deriveGiftHistoryRows({
  filtersSort,
  gifts,
}: {
  filtersSort: CrmGiftHistoryFiltersSortSettings;
  gifts: CrmGiftHistoryRow[];
}): CrmGiftHistoryRow[] {
  const filtered = gifts.filter((gift) => {
    const shared = gift.shared;
    const paymentMatches =
      filtersSort.paymentStatus === "all" ||
      matchesSharedContributionFilter(
        { shared },
        { id: "payment_status", value: filtersSort.paymentStatus },
      );

    if (!paymentMatches) {
      return false;
    }

    return matchesIssueFilter(gift, filtersSort.issue);
  });

  return [...filtered].sort((left, right) => {
    const leftValue = getSortValue(left, filtersSort.sortField);
    const rightValue = getSortValue(right, filtersSort.sortField);

    return filtersSort.sortDirection === "asc"
      ? leftValue - rightValue
      : rightValue - leftValue;
  });
}

function matchesIssueFilter(
  gift: CrmGiftHistoryRow,
  issue: CrmGiftHistoryFiltersSortSettings["issue"],
): boolean {
  const shared = gift.shared;

  switch (issue) {
    case "all":
      return true;
    case "needs_attention":
      return hasSharedContributionIssue({ shared });
    case "receipt_affected":
      return matchesSharedContributionFilter(
        { shared },
        { id: "receipt_affected" },
      );
    case "pending_correction":
      return matchesSharedContributionFilter(
        { shared },
        { id: "pending_correction" },
      );
    default: {
      const exhaustiveIssue: never = issue;
      return exhaustiveIssue;
    }
  }
}

function getSortValue(
  gift: CrmGiftHistoryRow,
  sortField: CrmGiftHistoryFiltersSortSettings["sortField"],
): number {
  switch (sortField) {
    case "amountCents":
      return gift.amountCents;
    case "giftDate":
      return new Date(gift.giftDate ?? 0).getTime();
    default: {
      const exhaustiveSortField: never = sortField;
      return exhaustiveSortField;
    }
  }
}
