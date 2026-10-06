import type {
  ContributionGridPaymentMethod,
  ContributionGridRow,
  ContributionGridSource,
  ContributionGridStatus,
} from "@asym/api/admin/contributions/types";

export type ContributionStatus = ContributionGridStatus;
export type PaymentMethod = ContributionGridPaymentMethod;
export type ContributionSource = ContributionGridSource;
export type Contribution = ContributionGridRow;
