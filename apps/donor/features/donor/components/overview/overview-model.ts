import { formatCurrency } from "@asym/lib/utils";

import type {
  DonorPortalGiftMissionary,
  DonorPortalSnapshot,
  DonorWallet,
} from "@asym/database/hooks";

import { makeDisplayDate } from "@/lib/dates";

/** Something the donor should fix, with how to fix it. */
export type OverviewAlert = {
  id: string;
  title: string;
  detail?: string;
  href: string;
  action: string;
};

const ACTIVE = new Set(["active", "processing", "trialing"]);
/** A failed gift older than this is history, not a problem to raise. */
const FAILED_WINDOW_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

const SHORT_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const MONTH = new Intl.DateTimeFormat("en-US", { month: "long" });

function brandName(brand: string) {
  const names: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
  };
  return (
    names[brand.toLowerCase()] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
  );
}

function recipientName(gift: {
  missionary: DonorPortalGiftMissionary | null;
  designation: { name: string };
}) {
  return gift.missionary?.name ?? gift.designation.name;
}

/**
 * Problems first: a recent gift that didn't go through and a saved card
 * that has expired or expires this month or next.
 */
export function overviewAlerts({
  snapshot,
  wallet,
  now = new Date(),
}: {
  snapshot: DonorPortalSnapshot | undefined;
  wallet: DonorWallet | undefined;
  now?: Date;
}): OverviewAlert[] {
  if (!snapshot) return [];
  const alerts: OverviewAlert[] = [];
  const since = now.getTime() - FAILED_WINDOW_DAYS * DAY_MS;
  const donations = [...snapshot.donations].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  for (const gift of donations) {
    if (gift.status !== "Failed") continue;
    if (makeDisplayDate(gift.date).getTime() < since) break;
    const name = recipientName(gift);
    // A separate paid gift does not establish that this charge recovered.
    // The alert clears when this gift's own status changes or it ages out.
    alerts.push({
      id: `failed-${gift.id}`,
      title: "A gift didn’t go through",
      detail: `Your ${formatCurrency(gift.amount)} gift to ${name} on ${SHORT_DAY.format(makeDisplayDate(gift.date))} didn’t go through. Check your card or choose another way to pay.`,
      href: "/donor-dashboard/wallet",
      action: "Update payment method",
    });
    break;
  }

  if (wallet?.status === "linked") {
    const thisMonth = now.getFullYear() * 12 + now.getMonth();
    for (const method of wallet.methods) {
      if (method.kind !== "card" || !method.expMonth || !method.expYear)
        continue;
      if (!method.isDefault && method.recurringGiftIds.length === 0) continue;
      const expires = method.expYear * 12 + (method.expMonth - 1);
      if (expires > thisMonth + 1) continue;
      const card = `${brandName(method.brand)} ending in ${method.last4}`;
      const gifts = method.recurringGiftIds.length;
      const expired = expires < thisMonth;
      const when = expired
        ? `Your ${card} has expired.`
        : `Your ${card} expires at the end of ${MONTH.format(new Date(method.expYear, method.expMonth - 1, 1))}.`;
      const uses =
        gifts > 0
          ? `Our records link it to ${gifts} recurring ${gifts === 1 ? "gift" : "gifts"}.`
          : "It’s your default payment method.";
      alerts.push({
        id: `expiring-${method.id}`,
        title: expired ? "Your card has expired" : "Your card expires soon",
        detail: `${when} ${uses}`,
        href: "/donor-dashboard/wallet",
        action: "Update card",
      });
    }
  }

  return alerts;
}

/** The soonest upcoming gift among active recurring gifts. */
export function nextScheduledGift(
  snapshot: DonorPortalSnapshot | undefined,
  now = new Date(),
): { amount: number; name: string; date: string } | null {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const upcoming = (snapshot?.recurringGifts ?? [])
    .filter(
      (gift) =>
        ACTIVE.has(gift.status.toLowerCase()) &&
        gift.nextChargeAt &&
        gift.nextChargeAt.slice(0, 10) >= today,
    )
    .sort((a, b) => a.nextChargeAt!.localeCompare(b.nextChargeAt!));
  const next = upcoming[0];
  return next
    ? {
        amount: next.amount,
        name: recipientName(next),
        date: next.nextChargeAt!,
      }
    : null;
}

/** Why there's no next gift: a missing date, paused gifts, or no gifts. */
export function noNextGiftNote(snapshot: DonorPortalSnapshot | undefined) {
  const statuses = (snapshot?.recurringGifts ?? []).map((gift) =>
    gift.status.toLowerCase(),
  );
  if (statuses.some((status) => ACTIVE.has(status))) {
    return "Your next gift date isn’t set yet.";
  }
  if (statuses.includes("paused")) return "Your recurring gifts are paused.";
  return "Set up a monthly gift on any missionary’s page.";
}

/**
 * Paid this calendar year, plus what is still processing (not counted).
 * `complete` is false when the portal loaded only the newest gifts and they
 * don't reach back past 1 January, so earlier gifts this year may be missing.
 */
export function givenThisYear(
  snapshot: DonorPortalSnapshot | undefined,
  now = new Date(),
) {
  const year = now.getFullYear();
  const donations = snapshot?.donations ?? [];
  const inYear = donations.filter(
    (gift) => makeDisplayDate(gift.date).getFullYear() === year,
  );
  // The list is newest first by gift date: a gift from an earlier year
  // proves every gift from this year is already in it.
  const complete =
    snapshot?.donationsComplete !== false ||
    donations.some((gift) => makeDisplayDate(gift.date).getFullYear() < year);
  // A partly refunded gift stays Paid; count what the donor still gave, and
  // leave out a gift refunded in full.
  const paid = inYear
    .filter((gift) => gift.status === "Paid")
    .map((gift) => Math.max(0, gift.amount - (gift.refundedAmount ?? 0)))
    .filter((amount) => amount > 0);
  return {
    paid: paid.reduce((sum, amount) => sum + amount, 0),
    paidCount: paid.length,
    processing: inYear
      .filter((gift) => gift.status === "Processing")
      .reduce((sum, gift) => sum + gift.amount, 0),
    complete,
  };
}

/** Last year's statement, offered January to April (tax season). */
export function statementPromptYear(
  snapshot: DonorPortalSnapshot | undefined,
  now = new Date(),
): number | null {
  if (now.getMonth() > 3) return null;
  const year = now.getFullYear() - 1;
  return snapshot?.summary.statementYears.includes(year) ? year : null;
}

/** Checkout for a missionary account the donor gives to. */
export function giveHref(missionaryId: string) {
  return `/checkout?missionary_id=${encodeURIComponent(missionaryId)}`;
}

/** The missionary the donor most recently gave to, for "Give again". */
export function lastSupported(
  snapshot: DonorPortalSnapshot | undefined,
): DonorPortalGiftMissionary | null {
  const latest = [...(snapshot?.donations ?? [])]
    .filter((gift) => gift.status === "Paid" && gift.missionary)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return latest?.missionary ?? null;
}

/** The missionaries a donor gives to now (recurring) or gave to this year. */
export function supportedMissionaries(
  snapshot: DonorPortalSnapshot | undefined,
  now = new Date(),
) {
  const seen = new Map<
    string,
    { id: string; name: string; avatarUrl: string | null }
  >();
  for (const gift of snapshot?.recurringGifts ?? []) {
    if (gift.missionary && gift.status.toLowerCase() === "active") {
      seen.set(gift.missionary.id, gift.missionary);
    }
  }
  const year = now.getFullYear();
  for (const gift of snapshot?.donations ?? []) {
    if (
      gift.missionary &&
      gift.status === "Paid" &&
      makeDisplayDate(gift.date).getFullYear() === year
    ) {
      seen.set(gift.missionary.id, gift.missionary);
    }
  }
  return [...seen.values()];
}
