"use client";

import { formatPledgeDate } from "@asym/api/donor-portal/pledge-view";
import { formatMoney, isSupportedCurrency } from "@asym/api/money";
import {
  useCreateDonorBillingPortalSession,
  useDonorPortalSnapshot,
  useDonorWallet,
  type DonorPortalRecurringGift,
} from "@asym/database/hooks";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { todayDateInputValue } from "@/lib/dates";

const ACTIVE = new Set(["active", "processing", "trialing"]);
const PAUSED = new Set(["paused"]);

/** How often a gift repeats, in the words people use. */
const SCHEDULE: Record<string, { phrase: string; perYear: number }> = {
  weekly: { phrase: "a week", perYear: 52 },
  biweekly: { phrase: "every 2 weeks", perYear: 26 },
  monthly: { phrase: "a month", perYear: 12 },
  quarterly: { phrase: "every 3 months", perYear: 4 },
  annually: { phrase: "a year", perYear: 1 },
  annual: { phrase: "a year", perYear: 1 },
  yearly: { phrase: "a year", perYear: 1 },
};

function schedule(frequency: string) {
  return SCHEDULE[frequency.toLowerCase()] ?? { phrase: frequency, perYear: 0 };
}

/** The gift's currency, when its amount can be shown in it. */
function giftCurrency(gift: DonorPortalRecurringGift) {
  return Number.isSafeInteger(gift.amountCents) &&
    gift.amountCents >= 0 &&
    gift.currency &&
    isSupportedCurrency(gift.currency)
    ? gift.currency.trim().toUpperCase()
    : null;
}

function giftAmount(gift: DonorPortalRecurringGift) {
  const currency = giftCurrency(gift);
  return currency
    ? `${formatMoney(gift.amountCents, currency, "en-US")} ${schedule(gift.frequency).phrase}`
    : "Amount unavailable";
}

type GiftStanding = "Active" | "Paused" | "Stopped";

function standing(status: string): GiftStanding {
  const normalized = status.toLowerCase();
  if (ACTIVE.has(normalized)) return "Active";
  if (PAUSED.has(normalized)) return "Paused";
  return "Stopped";
}

const STANDING_VARIANT: Record<
  GiftStanding,
  "success" | "warning" | "secondary"
> = {
  Active: "success",
  Paused: "warning",
  Stopped: "secondary",
};

/**
 * What active gifts add up to each month (quarterly gifts spread out), or
 * null when they don't share one known currency. With nothing active the
 * zero takes the currency every gift shares.
 */
export function monthlyEquivalent(gifts: DonorPortalRecurringGift[]) {
  const active = gifts.filter((gift) => standing(gift.status) === "Active");
  const currencies = new Set(
    (active.length > 0 ? active : gifts).map(giftCurrency),
  );
  const [currency] = currencies;
  if (currencies.size !== 1 || !currency) return null;
  // Round once: per-gift division can drift a half cent.
  const yearly = active.reduce(
    (sum, gift) => sum + gift.amountCents * schedule(gift.frequency).perYear,
    0,
  );
  const cents = Math.round(yearly / 12);
  return Number.isSafeInteger(cents) ? { cents, currency } : null;
}

/** "Next gift today" for today, otherwise the date. */
function nextGiftLabel(date: string) {
  return date.slice(0, 10) === todayDateInputValue()
    ? "Next gift today"
    : `Next gift ${formatPledgeDate(date)}`;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
}

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

function GiftRow({
  gift,
  paidWith,
}: {
  gift: DonorPortalRecurringGift;
  paidWith: string;
}) {
  const name = gift.missionary?.name ?? gift.designation.name;
  const avatar = gift.missionary?.avatarUrl ?? gift.designation.avatarUrl;
  const giftStanding = standing(gift.status);
  const nameId = `recurring-gift-${gift.id}`;
  // An unnamed missionary is shown by its fund; don't repeat it below.
  const fundLine =
    gift.fund?.name === name ? null : (gift.fund?.name ?? "General support");
  const when =
    giftStanding === "Active"
      ? gift.nextChargeAt
        ? nextGiftLabel(gift.nextChargeAt)
        : "Next gift date not set"
      : giftStanding === "Paused"
        ? "No gift scheduled while paused"
        : gift.endsAt
          ? `Stopped ${formatPledgeDate(gift.endsAt)}`
          : "No more gifts scheduled";

  return (
    <li
      aria-labelledby={nameId}
      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="lg">
          {avatar ? <AvatarImage src={avatar} alt="" /> : null}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p id={nameId} className="truncate font-medium text-foreground">
            {name}
          </p>
          {fundLine ? (
            <p className="truncate text-sm text-muted-foreground">{fundLine}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:w-48">
        <p className="font-medium tabular-nums text-foreground">
          {giftAmount(gift)}
        </p>
        <p className="text-sm text-muted-foreground">{when}</p>
      </div>
      <p className="text-sm text-muted-foreground sm:w-56">{paidWith}</p>
      <Badge
        variant={STANDING_VARIANT[giftStanding]}
        className="self-start sm:self-center"
      >
        {giftStanding}
      </Badge>
    </li>
  );
}

export default function DonorPledgesPage() {
  const snapshot = useDonorPortalSnapshot();
  const wallet = useDonorWallet();
  const billingPortal = useCreateDonorBillingPortalSession();

  const openPaymentSettings = async () => {
    try {
      const { url } = await billingPortal.mutateAsync();
      window.location.assign(url);
    } catch {
      // Surfaced below through billingPortal.error.
    }
  };

  const gifts = snapshot.data?.recurringGifts ?? [];
  // Active and paused first, then stopped gifts for the record.
  const ordered = [...gifts].sort(
    (a, b) =>
      Number(standing(a.status) === "Stopped") -
      Number(standing(b.status) === "Stopped"),
  );
  const methods = wallet.data?.status === "linked" ? wallet.data.methods : [];
  const paidWith = (gift: DonorPortalRecurringGift) => {
    const method = methods.find((candidate) =>
      candidate.recurringGiftIds.includes(gift.id),
    );
    if (!method) return gift.paymentMethodLabel;
    return method.kind === "bank"
      ? `Bank account ending in ${method.last4}`
      : `${brandName(method.brand)} ending in ${method.last4}`;
  };
  const activeGifts = gifts.filter(
    (gift) => standing(gift.status) === "Active",
  );
  const activeCount = activeGifts.length;
  const spreadsGifts = activeGifts.some((gift) => {
    const { perYear } = schedule(gift.frequency);
    return perYear > 0 && perYear < 12;
  });
  const total = monthlyEquivalent(gifts);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-20">
      <PageHeader
        title="Recurring gifts"
        description="Gifts that repeat on a schedule. You can change the amount, card or date, or stop a gift, at any time."
      >
        {gifts.length > 0 ? (
          <Button
            onClick={openPaymentSettings}
            disabled={billingPortal.isPending}
            focusableWhenDisabled
          >
            {billingPortal.isPending ? (
              <Loader2
                data-icon="inline-start"
                className="animate-spin"
                aria-hidden
              />
            ) : null}
            Change or stop a gift
          </Button>
        ) : null}
      </PageHeader>

      {billingPortal.error ? (
        <p role="alert" className="text-sm text-destructive">
          We couldn’t open your payment settings. Please try again.
        </p>
      ) : null}

      {snapshot.isLoading ? (
        <div
          className="flex flex-col gap-4"
          aria-busy="true"
          aria-label="Loading recurring gifts"
        >
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : snapshot.error ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-foreground">
              We couldn’t load your recurring gifts.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => snapshot.refetch()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : gifts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No recurring gifts yet</EmptyTitle>
            <EmptyDescription>
              A monthly gift gives a missionary support they can plan around.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/workers" className={buttonVariants()}>
              Find a missionary
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                Your recurring giving
              </p>
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {total
                  ? `${formatMoney(total.cents, total.currency, "en-US")} a month`
                  : "Total unavailable"}
              </p>
              <p className="text-sm text-muted-foreground">
                {total
                  ? null
                  : "Gifts in different currencies, or an unknown one, aren't added together. "}
                {activeCount === 1
                  ? "From 1 active gift."
                  : `From ${activeCount} active gifts.`}
                {spreadsGifts
                  ? " Gifts every 3 months or once a year are spread across the months."
                  : null}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <ul className="flex flex-col divide-y divide-border">
                {ordered.map((gift) => (
                  <GiftRow
                    key={gift.id}
                    gift={gift}
                    paidWith={paidWith(gift)}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
