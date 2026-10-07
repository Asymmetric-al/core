export interface Transaction {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  recipientAvatar?: string;
  category: string;
  type: "Recurring" | "One-Time";
  method: string;
  last4: string;
  status: "Succeeded" | "Processing" | "Failed";
  receiptUrl: string;
}

export const STATUS_VARIANTS: Record<
  Transaction["status"],
  "success" | "info" | "destructive"
> = {
  Succeeded: "success",
  Processing: "info",
  Failed: "destructive",
};
