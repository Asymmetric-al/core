import type { LineBasedGiftLine } from "../shared/line-based-gifts";
const SETTLED_DONATION_STATUSES = new Set([
  "completed",
  "succeeded",
  "success",
]);
const FAILED_DONATION_STATUSES = new Set(["failed"]);
const REFUNDED_DONATION_STATUSES = new Set(["refunded"]);

export type JsonRecord = Record<string, unknown>;

export type DonorPortalProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type DonorPortalDonorRow = {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  missionary_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  preferred_contact: string | null;
  avatar_url: string | null;
  location: string | null;
  status: string | null;
  giving_preferences: JsonRecord | null;
  total_given: number | null;
  first_gift_date: string | null;
  last_gift_date: string | null;
  last_gift_amount: number | null;
  gift_count: number | null;
  frequency: string | null;
  joined_date: string | null;
  receipt_email_frequency: string | null;
  default_update_frequency: string | null;
  preferred_language: string | null;
  do_not_contact: boolean | null;
  do_not_email: boolean | null;
  has_active_pledge: boolean | null;
  stripe_customer_id: string | null;
  address?: unknown;
};

export type DonorPortalDonationRow = {
  id: string;
  amount: number;
  /** Cents returned by refunds; a partly refunded gift stays settled. */
  refund_amount?: number | null;
  currency: string | null;
  status: string | null;
  donation_type: string | null;
  payment_method: string | null;
  is_recurring: boolean | null;
  recurring_interval: string | null;
  gift_date: string | null;
  created_at: string | null;
  completed_at: string | null;
  processed_at: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  fund: { id: string; name: string | null } | null;
  missionary: DonorPortalWorkerRow | null;
  intake_format?: string | null;
  staged_gift?: { status: string | null } | null;
  lines?: LineBasedGiftLine[];
};

export type DonorPortalWorkerRow = {
  id: string;
  worker_public_name: string | null;
  profile: { id: string; avatar_url: string | null } | null;
};

export type DonorPortalPledgeRow = {
  id: string;
  amount: number;
  currency: string | null;
  frequency: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  next_payment_date: string | null;
  next_charge_at: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_method_id: string | null;
  payment_method: string | null;
  total_paid: number | null;
  total_expected: number | null;
  payments_completed: number | null;
  payments_remaining: number | null;
  fund: { id: string; name: string | null } | null;
  missionary: DonorPortalWorkerRow | null;
};

export type DonorPortalFeedPreferencesRow = {
  show_org_posts: boolean | null;
  show_missionary_posts: boolean | null;
  follow_org: boolean | null;
  email_org_posts: boolean | null;
  email_missionary_posts: boolean | null;
  push_org_posts: boolean | null;
  push_missionary_posts: boolean | null;
};

export type DonorPortalSnapshot = {
  profile: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  donor: {
    id: string;
    status: string;
    joinedDate: string | null;
    preferredContact: string;
    receiptEmailFrequency: string;
    defaultUpdateFrequency: string | null;
    preferredLanguage: string;
    doNotContact: boolean;
    doNotEmail: boolean;
    givingPreferences: JsonRecord;
    stripeCustomerConfigured: boolean;
    address: DonorPortalAddress | null;
  };
  summary: {
    yearToDateCents: number;
    lifetimeGivenCents: number;
    giftCount: number;
    activeRecurringGiftCount: number;
    supportedDesignationCount: number;
    receiptCount: number;
    statementYears: number[];
    latestImpactLabel: string | null;
  };
  donations: DonorPortalDonation[];
  /**
   * False when only the newest gifts were loaded, so totals over `donations`
   * can miss older gifts. Absent means the list is complete.
   */
  donationsComplete?: boolean;
  recurringGifts: DonorPortalRecurringGift[];
  /**
   * False when only the newest recurring gifts were loaded, so a total over
   * them can miss an older active gift. Absent means the list is complete.
   */
  recurringGiftsComplete?: boolean;
  paymentMethods: DonorPortalPaymentMethod[];
  feedPreferences: {
    showOrgPosts: boolean;
    showMissionaryPosts: boolean;
    followOrg: boolean;
    emailOrgPosts: boolean;
    emailMissionaryPosts: boolean;
    pushOrgPosts: boolean;
    pushMissionaryPosts: boolean;
  };
};

export type DonorPortalDonation = {
  id: string;
  date: string;
  amountCents: number;
  amount: number;
  /** Refunded so far, in cents and dollars; 0 when nothing was returned. */
  refundedAmountCents: number;
  refundedAmount: number;
  currency: string;
  /** Glossary status words: Paid, Received, Processing, Failed, Refunded. */
  status: "Paid" | "Received" | "Processing" | "Failed" | "Refunded";
  type: "Recurring" | "One-Time";
  method: string;
  receiptUrl: string | null;
  statementYear: number | null;
  designation: {
    id: string | null;
    name: string;
    type: "missionary" | "fund" | "general";
    avatarUrl: string | null;
  };
  /** The missionary the gift supports, when it supports one. */
  missionary: DonorPortalGiftMissionary | null;
  /** The fund it was designated to, when it has one. */
  fund: DonorPortalGiftFund | null;
};

export type DonorPortalGiftMissionary = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type DonorPortalGiftFund = {
  id: string;
  name: string;
};

export type DonorPortalRecurringGift = {
  id: string;
  amountCents: number;
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
  designation: DonorPortalDonation["designation"];
  missionary: DonorPortalGiftMissionary | null;
  fund: DonorPortalGiftFund | null;
};

export type DonorPortalPaymentMethod = {
  id: string;
  label: string;
  source: "stripe_subscription" | "donation_history";
  stripeManaged: boolean;
  recurringGiftIds: string[];
};

function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

function normalizeCurrency(currency: string | null | undefined): string {
  return (currency || "usd").toUpperCase();
}

function displayNameFromParts(row: {
  display_name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}) {
  const direct = row.display_name || row.full_name;
  if (direct?.trim()) return direct.trim();

  const parts = [row.first_name, row.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim());

  return parts.join(" ");
}

function donorLine(donation: DonorPortalDonationRow) {
  return (donation.lines ?? []).find((line) => !line.is_fee_cover) ?? null;
}

function designationFromDonation(
  donation: DonorPortalDonationRow,
): DonorPortalDonation["designation"] {
  const line = donorLine(donation);
  if (line?.missionary_id)
    return {
      id: line.missionary_id,
      name: line.worker_public_name?.trim() || "Missionary support",
      type: "missionary",
      avatarUrl: null,
    };
  if (line?.fund_id)
    return {
      id: line.fund_id,
      name: line.fund_name?.trim() || "Designated fund",
      type: "fund",
      avatarUrl: null,
    };
  if (donation.fund) {
    return {
      id: donation.fund.id,
      name: donation.fund.name || "Designated fund",
      type: "fund",
      avatarUrl: null,
    };
  }

  if (donation.missionary) {
    return {
      id: donation.missionary.id,
      name: workerPublicName(donation.missionary) || "Missionary support",
      type: "missionary",
      avatarUrl: donation.missionary.profile?.avatar_url ?? null,
    };
  }

  return {
    id: null,
    name: "General fund",
    type: "general",
    avatarUrl: null,
  };
}

type GiftTargetRow = {
  fund: DonorPortalDonationRow["fund"];
  missionary: DonorPortalDonationRow["missionary"];
};

function workerPublicName(worker: DonorPortalWorkerRow): string {
  return worker.worker_public_name?.trim() ?? "";
}

function giftMissionary(row: GiftTargetRow): DonorPortalGiftMissionary | null {
  if (!row.missionary) return null;
  const name = workerPublicName(row.missionary);
  return {
    id: row.missionary.id,
    // Without a public name, the fund says more than a generic label.
    name: name || row.fund?.name || "Missionary support",
    avatarUrl: row.missionary.profile?.avatar_url ?? null,
  };
}

function lineMissionary(
  donation: DonorPortalDonationRow,
): DonorPortalGiftMissionary | null {
  const line = donorLine(donation);
  if (!line?.missionary_id) return null;
  return {
    id: line.missionary_id,
    name: line.worker_public_name?.trim() || "Missionary support",
    avatarUrl: null,
  };
}

function lineFund(
  donation: DonorPortalDonationRow,
): DonorPortalGiftFund | null {
  const line = donorLine(donation);
  if (!line?.fund_id) return null;
  return {
    id: line.fund_id,
    name: line.fund_name?.trim() || "Designated fund",
  };
}

function giftFund(row: GiftTargetRow): DonorPortalGiftFund | null {
  if (!row.fund) return null;
  return { id: row.fund.id, name: row.fund.name || "Designated fund" };
}

function designationFromPledge(
  pledge: DonorPortalPledgeRow,
): DonorPortalRecurringGift["designation"] {
  if (pledge.fund) {
    return {
      id: pledge.fund.id,
      name: pledge.fund.name || "Designated fund",
      type: "fund",
      avatarUrl: null,
    };
  }

  if (pledge.missionary) {
    return {
      id: pledge.missionary.id,
      name: workerPublicName(pledge.missionary) || "Missionary support",
      type: "missionary",
      avatarUrl: pledge.missionary.profile?.avatar_url ?? null,
    };
  }

  return {
    id: null,
    name: "General fund",
    type: "general",
    avatarUrl: null,
  };
}

function donationStatus(
  donation: DonorPortalDonationRow,
): DonorPortalDonation["status"] {
  const normalized = donation.status?.toLowerCase() ?? "";
  if (
    donation.intake_format === "line_based" &&
    normalized === "completed" &&
    donation.staged_gift?.status !== "posted"
  )
    return "Received";
  if (SETTLED_DONATION_STATUSES.has(normalized)) return "Paid";
  if (FAILED_DONATION_STATUSES.has(normalized)) return "Failed";
  if (REFUNDED_DONATION_STATUSES.has(normalized)) return "Refunded";
  return "Processing";
}

function donationType(
  donation: DonorPortalDonationRow,
): DonorPortalDonation["type"] {
  const type = donation.donation_type?.toLowerCase() ?? "";
  if (
    donation.is_recurring ||
    type.includes("recurring") ||
    donation.recurring_interval
  ) {
    return "Recurring";
  }
  return "One-Time";
}

function donationDate(donation: DonorPortalDonationRow): string {
  return (
    donation.gift_date ||
    donation.completed_at ||
    donation.processed_at ||
    donation.created_at ||
    new Date(0).toISOString()
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  card: "Card",
  ach: "Bank account (ACH)",
  us_bank_account: "Bank account (ACH)",
  bank_transfer: "Bank transfer",
  check: "Check",
  cash: "Cash",
};

/** Plain words for how a gift was paid; never a processor's name. */
function paymentLabel(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "Saved payment method";
  return PAYMENT_LABELS[trimmed.toLowerCase()] ?? trimmed;
}

export function buildDonorPortalSnapshot(input: {
  profile: DonorPortalProfileRow;
  donor: DonorPortalDonorRow;
  donations: DonorPortalDonationRow[];
  pledges: DonorPortalPledgeRow[];
  feedPreferences: DonorPortalFeedPreferencesRow | null;
  now?: Date;
  lifetime?: { givenCents: number; giftCount: number };
}): DonorPortalSnapshot {
  const now = input.now ?? new Date();
  const currentYear = now.getUTCFullYear();
  const lineBased = new Set(
    input.donations
      .filter((donation) => donation.intake_format === "line_based")
      .map((donation) => donation.id),
  );
  const donationModels = input.donations.map((donation) => {
    const date = donationDate(donation);
    const amountCents = donation.amount ?? 0;
    const receipted = !lineBased.has(donation.id);
    return {
      id: donation.id,
      date,
      amountCents,
      amount: centsToDollars(amountCents),
      refundedAmountCents: Math.max(0, donation.refund_amount ?? 0),
      refundedAmount: centsToDollars(Math.max(0, donation.refund_amount ?? 0)),
      currency: normalizeCurrency(donation.currency),
      status: donationStatus(donation),
      type: donationType(donation),
      method: paymentLabel(donation.payment_method),
      receiptUrl: receipted ? `/api/donor/receipts/${donation.id}` : null,
      statementYear: receipted ? new Date(date).getUTCFullYear() : null,
      designation: designationFromDonation(donation),
      missionary: lineMissionary(donation) ?? giftMissionary(donation),
      fund: lineFund(donation) ?? giftFund(donation),
    } satisfies DonorPortalDonation;
  });

  const recurringGifts = input.pledges.map((pledge) => {
    const amountCents = pledge.amount ?? 0;
    return {
      id: pledge.id,
      amountCents,
      amount: centsToDollars(amountCents),
      currency: normalizeCurrency(pledge.currency),
      frequency: pledge.frequency || "monthly",
      status: pledge.status || "active",
      startedAt: pledge.start_date,
      endsAt: pledge.end_date,
      nextChargeAt: pledge.next_charge_at || pledge.next_payment_date,
      stripeSubscriptionId: pledge.stripe_subscription_id,
      paymentMethodLabel: paymentLabel(pledge.payment_method),
      totalPaidCents: pledge.total_paid ?? 0,
      totalExpectedCents: pledge.total_expected ?? 0,
      paymentsCompleted: pledge.payments_completed ?? 0,
      paymentsRemaining: pledge.payments_remaining,
      designation: designationFromPledge(pledge),
      missionary: giftMissionary(pledge),
      fund: giftFund(pledge),
    } satisfies DonorPortalRecurringGift;
  });

  const settledDonations = donationModels.filter(
    (donation) => donation.status === "Paid" || donation.status === "Received",
  );
  const settledLegacy = settledDonations.filter(
    (donation) => !lineBased.has(donation.id),
  );
  const settledLineBased = settledDonations.filter((donation) =>
    lineBased.has(donation.id),
  );
  const centsOf = (donations: DonorPortalDonation[]) =>
    donations.reduce((sum, donation) => sum + donation.amountCents, 0);
  const yearOf = (donation: DonorPortalDonation) =>
    new Date(donation.date).getUTCFullYear();
  const yearToDateCents = centsOf(
    settledDonations.filter((donation) => yearOf(donation) === currentYear),
  );
  const activeRecurringGiftCount = recurringGifts.filter((gift) =>
    ["active", "processing", "trialing"].includes(gift.status.toLowerCase()),
  ).length;
  const statementYears = [...new Set(settledLegacy.map(yearOf))].sort(
    (a, b) => b - a,
  );
  const supportedDesignations = new Set<string>();

  settledDonations.forEach((donation) => {
    supportedDesignations.add(
      `${donation.designation.type}:${donation.designation.id ?? donation.designation.name}`,
    );
  });
  recurringGifts.forEach((gift) => {
    supportedDesignations.add(
      `${gift.designation.type}:${gift.designation.id ?? gift.designation.name}`,
    );
  });

  const paymentMethods = new Map<string, DonorPortalPaymentMethod>();
  recurringGifts.forEach((gift) => {
    const key = gift.stripeSubscriptionId
      ? `stripe:${gift.stripeSubscriptionId}`
      : `pledge:${gift.paymentMethodLabel}`;
    const existing = paymentMethods.get(key);
    if (existing) {
      existing.recurringGiftIds.push(gift.id);
    } else {
      paymentMethods.set(key, {
        id: key,
        label: gift.paymentMethodLabel,
        source: "stripe_subscription",
        stripeManaged: true,
        recurringGiftIds: [gift.id],
      });
    }
  });
  donationModels.forEach((donation) => {
    const key = `history:${donation.method}`;
    if (!paymentMethods.has(key)) {
      paymentMethods.set(key, {
        id: key,
        label: donation.method,
        source: "donation_history",
        stripeManaged: true,
        recurringGiftIds: [],
      });
    }
  });

  const displayName =
    input.donor.name ||
    displayNameFromParts(input.profile) ||
    input.profile.email ||
    "Donor";

  return {
    profile: {
      id: input.profile.id,
      displayName,
      email: input.profile.email || input.donor.email,
      phone: input.profile.phone || input.donor.phone || input.donor.mobile,
      avatarUrl: input.profile.avatar_url || input.donor.avatar_url,
    },
    donor: {
      id: input.donor.id,
      status: input.donor.status || "active",
      joinedDate: input.donor.joined_date,
      preferredContact: input.donor.preferred_contact || "email",
      receiptEmailFrequency: input.donor.receipt_email_frequency || "monthly",
      defaultUpdateFrequency: input.donor.default_update_frequency,
      preferredLanguage: input.donor.preferred_language || "en",
      doNotContact: Boolean(input.donor.do_not_contact),
      doNotEmail: Boolean(input.donor.do_not_email),
      givingPreferences: input.donor.giving_preferences ?? {},
      stripeCustomerConfigured: Boolean(input.donor.stripe_customer_id),
      address: donorAddressFromRow(input.donor.address),
    },
    summary: {
      yearToDateCents,
      lifetimeGivenCents:
        input.lifetime?.givenCents ??
        (input.donor.total_given ?? centsOf(settledLegacy)) +
          centsOf(settledLineBased),
      giftCount:
        input.lifetime?.giftCount ??
        (input.donor.gift_count ?? settledLegacy.length) +
          settledLineBased.length,
      activeRecurringGiftCount,
      supportedDesignationCount: supportedDesignations.size,
      receiptCount: settledLegacy.length,
      statementYears,
      latestImpactLabel:
        settledDonations[0]?.designation.name ??
        recurringGifts[0]?.designation.name ??
        null,
    },
    donations: donationModels,
    recurringGifts,
    paymentMethods: [...paymentMethods.values()],
    feedPreferences: {
      showOrgPosts: input.feedPreferences?.show_org_posts ?? true,
      showMissionaryPosts: input.feedPreferences?.show_missionary_posts ?? true,
      followOrg: input.feedPreferences?.follow_org ?? true,
      emailOrgPosts: input.feedPreferences?.email_org_posts ?? true,
      emailMissionaryPosts:
        input.feedPreferences?.email_missionary_posts ?? true,
      pushOrgPosts: input.feedPreferences?.push_org_posts ?? false,
      pushMissionaryPosts:
        input.feedPreferences?.push_missionary_posts ?? false,
    },
  };
}

export type DonorPortalAddress = {
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

const ADDRESS_KEYS = [
  "street",
  "street2",
  "city",
  "state",
  "zip",
  "country",
] as const;

/** A stored address (some older rows hold only city/state) for the form. */
export function donorAddressFromRow(value: unknown): DonorPortalAddress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const address = Object.fromEntries(
    ADDRESS_KEYS.map((key) => [
      key,
      typeof row[key] === "string" ? (row[key] as string) : "",
    ]),
  ) as DonorPortalAddress;
  return ADDRESS_KEYS.some((key) => address[key]) ? address : null;
}

export function isSettledDonationStatus(status: string | null | undefined) {
  return SETTLED_DONATION_STATUSES.has(status?.toLowerCase() ?? "");
}
