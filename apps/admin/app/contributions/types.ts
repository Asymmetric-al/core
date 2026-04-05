export type ContributionStatus =
  | "completed"
  | "pending"
  | "failed"
  | "refunded";

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

export interface Contribution {
  id: string;
  donorId: string;
  donorName: string | null;
  donorEmail: string;
  donorAvatar?: string | null;
  amount: number;
  date: string;
  status: ContributionStatus;
  type: ContributionType;
  paymentMethod: PaymentMethod;
  source: ContributionSource;
  fundCode: string | null;
  fundName: string | null;
  missionaryId?: string | null;
  missionaryName?: string;
  transactionId: string | null;
  notes?: string;
  isAnonymous: boolean;
  receiptSent: boolean;
  createdAt: string;
  updatedAt: string;
}
