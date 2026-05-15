const SETTLED_DONATION_STATUSES = new Set([
  "completed",
  "succeeded",
  "success",
]);
const FAILED_DONATION_STATUSES = new Set(["failed", "refunded"]);

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
};

export type DonorPortalDonationRow = {
  id: string;
  amount: number;
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
  missionary: {
    id: string;
    profile: {
      id: string;
      display_name: string | null;
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
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
  missionary: {
    id: string;
    profile: {
      id: string;
      display_name: string | null;
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
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
  recurringGifts: DonorPortalRecurringGift[];
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
  currency: string;
  status: "Succeeded" | "Processing" | "Failed";
  type: "Recurring" | "One-Time";
  method: string;
  receiptUrl: string;
  statementYear: number;
  designation: {
    id: string | null;
    name: string;
    type: "missionary" | "fund" | "general";
    avatarUrl: string | null;
  };
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

function designationFromDonation(
  donation: DonorPortalDonationRow,
): DonorPortalDonation["designation"] {
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
      name:
        donation.missionary.profile &&
        displayNameFromParts(donation.missionary.profile)
          ? displayNameFromParts(donation.missionary.profile)
          : "Missionary support",
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
      name:
        pledge.missionary.profile &&
        displayNameFromParts(pledge.missionary.profile)
          ? displayNameFromParts(pledge.missionary.profile)
          : "Missionary support",
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

function donationStatus(status: string | null): DonorPortalDonation["status"] {
  const normalized = status?.toLowerCase() ?? "";
  if (SETTLED_DONATION_STATUSES.has(normalized)) return "Succeeded";
  if (FAILED_DONATION_STATUSES.has(normalized)) return "Failed";
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

function paymentLabel(value: string | null | undefined): string {
  if (!value?.trim()) return "Stripe managed";
  return value.trim();
}

export function buildDonorPortalSnapshot(input: {
  profile: DonorPortalProfileRow;
  donor: DonorPortalDonorRow;
  donations: DonorPortalDonationRow[];
  pledges: DonorPortalPledgeRow[];
  feedPreferences: DonorPortalFeedPreferencesRow | null;
  now?: Date;
}): DonorPortalSnapshot {
  const now = input.now ?? new Date();
  const currentYear = now.getUTCFullYear();
  const donationModels = input.donations.map((donation) => {
    const date = donationDate(donation);
    const amountCents = donation.amount ?? 0;
    return {
      id: donation.id,
      date,
      amountCents,
      amount: centsToDollars(amountCents),
      currency: normalizeCurrency(donation.currency),
      status: donationStatus(donation.status),
      type: donationType(donation),
      method: paymentLabel(donation.payment_method),
      receiptUrl: `/api/donor/receipts/${donation.id}`,
      statementYear: new Date(date).getUTCFullYear(),
      designation: designationFromDonation(donation),
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
    } satisfies DonorPortalRecurringGift;
  });

  const settledDonations = donationModels.filter(
    (donation) => donation.status === "Succeeded",
  );
  const yearToDateCents = settledDonations
    .filter((donation) => donation.statementYear === currentYear)
    .reduce((sum, donation) => sum + donation.amountCents, 0);
  const activeRecurringGiftCount = recurringGifts.filter((gift) =>
    ["active", "processing", "trialing"].includes(gift.status.toLowerCase()),
  ).length;
  const statementYears = [
    ...new Set(settledDonations.map((donation) => donation.statementYear)),
  ].sort((a, b) => b - a);
  const supportedDesignations = new Set<string>();

  donationModels.forEach((donation) => {
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
    },
    summary: {
      yearToDateCents,
      lifetimeGivenCents:
        input.donor.total_given ??
        settledDonations.reduce(
          (sum, donation) => sum + donation.amountCents,
          0,
        ),
      giftCount: input.donor.gift_count ?? donationModels.length,
      activeRecurringGiftCount,
      supportedDesignationCount: supportedDesignations.size,
      receiptCount: settledDonations.length,
      statementYears,
      latestImpactLabel:
        donationModels[0]?.designation.name ??
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

export function isSettledDonationStatus(status: string | null | undefined) {
  return SETTLED_DONATION_STATUSES.has(status?.toLowerCase() ?? "");
}
