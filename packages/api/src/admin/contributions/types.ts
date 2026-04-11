import type {
  ContributionGridRow,
  ContributionReceiptStatus,
  ContributionGridStatus,
  ContributionGridType,
  ContributionGridPaymentMethod,
  ContributionGridSource,
} from "./model";
import type {
  AdminContributionsFilters,
  ContributionCursor,
  ContributionSortDirection,
  ContributionSortField,
} from "./query";

export type {
  AdminContributionsFilters,
  ContributionCursor,
  ContributionGridPaymentMethod,
  ContributionGridRow,
  ContributionGridSource,
  ContributionGridStatus,
  ContributionGridType,
  ContributionReceiptStatus,
  ContributionSortDirection,
  ContributionSortField,
};

export interface AdminContributionsListResponse {
  rows: ContributionGridRow[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
  sort: {
    field: ContributionSortField;
    direction: ContributionSortDirection;
  };
  filters: AdminContributionsFilters;
}

export interface AdminContributionsSummary {
  totalReceived: number;
  successfulCount: number;
  pendingAmount: number;
  pendingCount: number;
  averageGift: number;
  recurringCount: number;
}
