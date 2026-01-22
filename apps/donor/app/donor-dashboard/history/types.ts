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

export const STATUS_COLORS: Record<Transaction["status"], string> = {
  Succeeded:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400",
  Processing:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400",
  Failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400",
};
