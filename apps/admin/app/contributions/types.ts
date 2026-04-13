import type {
  ContributionGridPaymentMethod,
  ContributionGridRow,
  ContributionGridSource,
  ContributionGridStatus,
  ContributionGridType,
} from "@asym/api/admin/contributions/types";

export type ContributionStatus = ContributionGridStatus;
export type ContributionType = ContributionGridType;
export type PaymentMethod = ContributionGridPaymentMethod;
export type ContributionSource = ContributionGridSource;
export type Contribution = ContributionGridRow;
