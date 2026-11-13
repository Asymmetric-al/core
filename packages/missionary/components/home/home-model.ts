import { buildMissionaryDashboardView } from "../dashboard-view";
import { formatCents } from "../money-units";

import type { MissionaryPortalSnapshot } from "@asym/database/hooks";

/** Something on the home page that needs the missionary, with how to act. */
export type NeedsYouItem = {
  id: string;
  kind: "overdue-tasks" | "behind" | "thank" | "follow-requests";
  tone: "urgent" | "info";
  title: string;
  detail?: string;
  href: string;
  action: string;
};

/** Gifts newer than this count as "recent" and worth a thank-you. */
const THANK_WINDOW_DAYS = 14;
/** A monthly gift is late once a full cycle and a few days have passed. */
const LATE_AFTER_DAYS = 35;
const DAY_MS = 24 * 60 * 60 * 1000;
const BEHIND_STATUSES = new Set(["at_risk", "lapsed"]);

const DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * When a gift happened: a SQL date ("2026-10-10") is that calendar day where
 * the viewer is, not UTC midnight, which west of UTC is the day before.
 */
function giftTime(value: string): number {
  const match = DATE_ONLY.exec(value);
  return match
    ? new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      ).getTime()
    : new Date(value).getTime();
}

const defaultFormatDay = (value: string) =>
  DAY.format(new Date(giftTime(value)));

/** A settled gift with the partner's name, for the home page. */
export type RecentGift = {
  id: string;
  partnerId: string | null;
  name: string;
  amountCents: number;
  currency: string | null;
  date: string;
  avatarUrl: string | null;
  recurring: boolean;
};

/** Opens one partner on the Partners page (it reads `?partner=`). */
function partnerHref(partnerId: string) {
  return `/donors?partner=${encodeURIComponent(partnerId)}`;
}

/**
 * The home page's "Needs you" list: overdue tasks, recurring gifts that
 * haven't arrived, recent gifts to thank, and people waiting to follow. Most
 * urgent first; each item says what to do.
 */
export function buildNeedsYou({
  snapshot,
  followRequestCount,
  now = new Date(),
  formatDay = defaultFormatDay,
}: {
  snapshot: MissionaryPortalSnapshot | undefined | null;
  /** Null when the count couldn't be checked. */
  followRequestCount: number | null;
  now?: Date;
  /** Short day label ("Nov 5"); pass the app's hydration-safe formatter. */
  formatDay?: (value: string) => string;
}): NeedsYouItem[] {
  if (!snapshot) return [];
  const items: NeedsYouItem[] = [];

  const overdue = buildMissionaryDashboardView(snapshot, now)
    .pendingTasks.filter((task) => task.overdue)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  if (overdue.length > 0) {
    items.push({
      id: "overdue-tasks",
      kind: "overdue-tasks",
      tone: "urgent",
      title: `${overdue.length} overdue ${overdue.length === 1 ? "task" : "tasks"}`,
      detail: `Oldest: ${overdue[0]!.title}`,
      href: "/tasks",
      action: "Open tasks",
    });
  }

  const partners = snapshot.donorRelationships ?? [];
  const lateBefore = now.getTime() - LATE_AFTER_DAYS * DAY_MS;
  for (const partner of partners) {
    if (!partner.hasActivePledge || !BEHIND_STATUSES.has(partner.status)) {
      continue;
    }
    // A gift inside the last cycle means it did arrive, whatever the
    // stored status says.
    if (partner.lastGiftAt && giftTime(partner.lastGiftAt) >= lateBefore) {
      continue;
    }
    items.push({
      id: `behind-${partner.id}`,
      kind: "behind",
      tone: "urgent",
      title: `${partner.displayName}’s recurring gift hasn’t arrived`,
      detail: partner.lastGiftAt
        ? `Last gift on ${formatDay(partner.lastGiftAt)}`
        : undefined,
      href: partnerHref(partner.id),
      action: "View partner",
    });
  }

  // One thank-you per partner for their newest recent gift worth thanking:
  // a one-time gift, or the first gift of a new monthly commitment (not
  // every routine monthly charge). Anonymous gifts can't be thanked by name.
  const since = now.getTime() - THANK_WINDOW_DAYS * DAY_MS;
  const gifts = recentGifts(snapshot, Number.POSITIVE_INFINITY);
  const thanked = new Set<string>();
  for (const [index, gift] of gifts.entries()) {
    if (giftTime(gift.date) < since) break;
    if (!gift.partnerId || thanked.has(gift.partnerId)) continue;
    const firstMonthly =
      gift.recurring &&
      !gifts
        .slice(index + 1)
        .some((older) => older.partnerId === gift.partnerId && older.recurring);
    if (gift.recurring && !firstMonthly) continue;
    thanked.add(gift.partnerId);
    const amount = formatCents(gift.amountCents, gift.currency);
    items.push({
      id: `thank-${gift.partnerId}`,
      kind: "thank",
      tone: "info",
      title: firstMonthly
        ? `Thank ${gift.name} for their first monthly gift${amount === "Unavailable" ? "" : ` of ${amount}`}`
        : `Thank ${gift.name} for ${amount === "Unavailable" ? "their gift" : amount}`,
      detail: `Gave on ${formatDay(gift.date)}`,
      href: partnerHref(gift.partnerId),
      action: "View partner",
    });
  }

  if (followRequestCount === null) {
    items.push({
      id: "follow-requests",
      kind: "follow-requests",
      tone: "info",
      title: "Couldn’t check follow requests",
      detail: "Open Updates to see who’s waiting.",
      href: "/feed",
      action: "Open Updates",
    });
  } else if (followRequestCount > 0) {
    items.push({
      id: "follow-requests",
      kind: "follow-requests",
      tone: "info",
      title:
        followRequestCount === 1
          ? "1 person wants to follow your updates"
          : `${followRequestCount} people want to follow your updates`,
      href: "/feed",
      action: "Review",
    });
  }

  return items;
}

/**
 * Settled gifts, newest first, with the partner's name. Gifts from partners
 * who give anonymously arrive without a partner id and stay anonymous.
 */
export function recentGifts(
  snapshot: MissionaryPortalSnapshot | undefined | null,
  limit = 5,
): RecentGift[] {
  const partners = new Map(
    (snapshot?.donorRelationships ?? []).map((partner) => [
      partner.id,
      partner,
    ]),
  );
  return [...(snapshot?.recentGifts ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((gift) => {
      const partner = gift.donorId ? partners.get(gift.donorId) : undefined;
      return {
        id: gift.id,
        partnerId: partner ? partner.id : null,
        name: partner?.displayName ?? "Anonymous partner",
        amountCents: gift.amountCents,
        currency: gift.currency,
        date: gift.date,
        avatarUrl: partner?.avatarUrl ?? null,
        recurring: gift.type === "Recurring",
      };
    });
}

const POST_TYPE_LABELS: Record<string, string> = {
  "Prayer Request": "Prayer request",
};

/** Post types read in sentence case ("Prayer request"). */
export function postTypeLabel(postType: string) {
  return POST_TYPE_LABELS[postType] ?? postType;
}

/** Partners with an active recurring gift, anonymous ones included. */
export function monthlyPartnerCount(
  snapshot: MissionaryPortalSnapshot | undefined | null,
) {
  return (
    snapshot?.support?.monthlyPartnerCount ??
    (snapshot?.donorRelationships ?? []).filter(
      (partner) => partner.hasActivePledge,
    ).length
  );
}
