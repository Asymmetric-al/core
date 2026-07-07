/**
 * Map a live `DonorPortalRecurringGift` (snapshot.recurringGifts) to the shape
 * the pledges view renders — flattening the designation and normalizing the
 * free-string frequency/status (stored lowercase) to Title case. Pure.
 */

export interface RecurringGiftInput {
  id: string;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  startedAt: string | null;
  endsAt: string | null;
  nextChargeAt: string | null;
  stripeSubscriptionId: string | null;
  paymentMethodLabel: string;
  totalPaidCents: number;
  totalExpectedCents: number;
  paymentsCompleted: number;
  paymentsRemaining: number | null;
  designation: {
    id: string | null;
    name: string;
    type: "missionary" | "fund" | "general";
    avatarUrl: string | null;
  };
}

export interface PledgeView {
  id: string;
  recipientName: string;
  recipientCategory: "Missionary" | "Fund" | "General";
  recipientAvatar: string | null;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  startedAt: string | null;
  endsAt: string | null;
  nextChargeDate: string | null;
  stripeSubscriptionId: string | null;
  paymentMethodLabel: string;
  totalPaid: number;
  totalExpected: number;
  paymentsCompleted: number;
  paymentsRemaining: number | null;
}

function titleCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const CATEGORY: Record<
  RecurringGiftInput["designation"]["type"],
  PledgeView["recipientCategory"]
> = {
  missionary: "Missionary",
  fund: "Fund",
  general: "General",
};

export function mapRecurringGiftToPledgeView(
  gift: RecurringGiftInput,
): PledgeView {
  return {
    id: gift.id,
    recipientName: gift.designation.name,
    recipientCategory: CATEGORY[gift.designation.type] ?? "General",
    recipientAvatar: gift.designation.avatarUrl,
    amount: gift.amount,
    currency: gift.currency,
    frequency: titleCase(gift.frequency),
    status: titleCase(gift.status),
    startedAt: gift.startedAt,
    endsAt: gift.endsAt,
    nextChargeDate: gift.nextChargeAt,
    stripeSubscriptionId: gift.stripeSubscriptionId,
    paymentMethodLabel: gift.paymentMethodLabel,
    totalPaid: Math.round(gift.totalPaidCents) / 100,
    totalExpected: Math.round(gift.totalExpectedCents) / 100,
    paymentsCompleted: gift.paymentsCompleted,
    paymentsRemaining: gift.paymentsRemaining,
  };
}
