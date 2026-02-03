export type ContributionStatus =
  | "Succeeded"
  | "Pending"
  | "Failed"
  | "Refunded"
  | "Disputed";

export type ContributionType = "One-time" | "Recurring" | "Pledge" | "In-kind";

export type PaymentMethod =
  | "Credit Card"
  | "Bank Transfer"
  | "Check"
  | "Cash"
  | "PayPal"
  | "Other";

export type ContributionSource =
  | "Online"
  | "Mobile"
  | "In-person"
  | "Mail"
  | "Phone"
  | "Import";

export interface Donor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Contribution {
  id: string;
  donor: Donor;
  amount: number;
  date: string;
  status: ContributionStatus;
  type: ContributionType;
  paymentMethod: PaymentMethod;
  source: ContributionSource;
  fundCode: string;
  fundName: string;
  missionaryId?: string;
  missionaryName?: string;
  transactionId: string;
  notes?: string;
  isAnonymous: boolean;
  receiptSent: boolean;
  createdAt: string;
  updatedAt: string;
}
