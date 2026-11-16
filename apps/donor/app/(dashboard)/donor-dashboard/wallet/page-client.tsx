"use client";

import { formatMoney, isSupportedCurrency } from "@asym/api/money";
import {
  useCreateDonorBillingPortalSession,
  useDonorPortalSnapshot,
  useDonorWallet,
  type DonorPortalRecurringGift,
  type DonorWalletPaymentMethod,
} from "@asym/database/hooks";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import {
  CreditCard,
  ExternalLink,
  Landmark,
  Loader2,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FREQUENCY_WORDS: Record<string, string> = {
  weekly: "a week",
  monthly: "a month",
  quarterly: "a quarter",
  annually: "a year",
  annual: "a year",
  yearly: "a year",
};

function giftAmount(gift: DonorPortalRecurringGift) {
  if (
    !Number.isSafeInteger(gift.amountCents) ||
    gift.amountCents < 0 ||
    !gift.currency ||
    !isSupportedCurrency(gift.currency)
  )
    return "Amount unavailable";
  const every = FREQUENCY_WORDS[gift.frequency.toLowerCase()];
  const amount = formatMoney(gift.amountCents, gift.currency, "en-US");
  return every ? `${amount} ${every}` : amount;
}

/** Expired, expiring within two months, or fine. */
function expiryState(
  method: DonorWalletPaymentMethod,
  now: Date,
): "expired" | "soon" | "ok" {
  if (!method.expMonth || !method.expYear) return "ok";
  // Cards work through the last day of their expiry month.
  const lastDay = new Date(method.expYear, method.expMonth, 0, 23, 59, 59);
  if (lastDay < now) return "expired";
  const twoMonths = new Date(
    now.getFullYear(),
    now.getMonth() + 2,
    now.getDate(),
  );
  return lastDay <= twoMonths ? "soon" : "ok";
}

function PaymentMethodItem({
  method,
  gifts,
  now,
}: {
  method: DonorWalletPaymentMethod;
  gifts: DonorPortalRecurringGift[];
  now: Date;
}) {
  const expiry = expiryState(method, now);
  const giftCount = method.recurringGiftIds.length;
  const Icon = method.kind === "bank" ? Landmark : CreditCard;
  const name = `${method.brand} ending in ${method.last4}`;

  return (
    <li aria-label={name}>
      <Card className="gap-0 py-0">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{name}</p>
                {method.isDefault ? (
                  <Badge variant="secondary">Default</Badge>
                ) : null}
                {expiry === "expired" ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : expiry === "soon" ? (
                  <Badge variant="warning">Expires soon</Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {method.kind === "bank"
                  ? "Bank account"
                  : `Expires ${String(method.expMonth).padStart(2, "0")}/${method.expYear}`}
              </p>
            </div>
          </div>

          <div className="min-w-0 sm:max-w-xs sm:text-right">
            {gifts.length > 0 && gifts.length === giftCount ? (
              <>
                <p className="text-xs font-medium text-muted-foreground">
                  Recorded recurring gifts
                </p>
                <ul className="mt-1 space-y-1">
                  {gifts.map((gift) => (
                    <li key={gift.id} className="text-sm">
                      <span className="font-medium text-foreground">
                        {gift.designation.name}
                      </span>
                      <span className="block text-muted-foreground">
                        {giftAmount(gift)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : giftCount > 0 ? (
              // Keep recorded links distinct from current Stripe billing use.
              <p className="text-sm text-muted-foreground">
                {giftCount === 1
                  ? "Recorded for 1 recurring gift"
                  : `Recorded for ${giftCount} recurring gifts`}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Recurring use not confirmed
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}

export default function WalletPage() {
  const wallet = useDonorWallet();
  const snapshot = useDonorPortalSnapshot();
  const portal = useCreateDonorBillingPortalSession();
  const [portalError, setPortalError] = useState(false);
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const now = new Date();

  const gifts = new Map(
    (snapshot.data?.recurringGifts ?? []).map((gift) => [gift.id, gift]),
  );
  const data = wallet.data;
  const linked = data?.status === "linked";

  const openPortal = async () => {
    setPortalError(false);
    try {
      const { url } = await portal.mutateAsync();
      window.location.assign(url);
    } catch {
      setPortalError(true);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-6 pb-20",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <PageHeader
        title="Payment methods"
        description="View cards and US bank accounts, or manage all saved methods in Stripe."
      >
        {linked ? (
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <Button
              onClick={() => void openPortal()}
              disabled={portal.isPending}
              focusableWhenDisabled={portal.isPending}
            >
              {portal.isPending ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : null}
              Manage payment methods
              <ExternalLink aria-hidden data-icon="inline-end" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Opens Stripe, our secure payment partner.
            </p>
          </div>
        ) : null}
      </PageHeader>

      {portalError ? (
        <p role="alert" className="text-sm text-destructive">
          We couldn’t open Stripe just now. Try again.
        </p>
      ) : null}

      {wallet.isLoading ? (
        <div
          className="space-y-3"
          aria-busy="true"
          aria-label="Loading payment methods"
        >
          {[0, 1].map((key) => (
            <Skeleton key={key} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : wallet.error || !data ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            <p role="alert" className="text-sm font-medium text-destructive">
              We couldn’t load your payment methods.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => wallet.refetch()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : data.methods.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WalletCards aria-hidden />
            </EmptyMedia>
            <EmptyTitle>
              <h2>No payment methods to show here</h2>
            </EmptyTitle>
            <EmptyDescription>
              {linked
                ? "Stripe may have other or older payment details. Open Stripe to view and manage your saved methods."
                : "When you give, you can save a card for next time."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {linked ? (
              <Button variant="outline" onClick={() => void openPortal()}>
                View payment methods in Stripe
              </Button>
            ) : (
              <Link href="/workers" className={buttonVariants()}>
                Find a missionary
              </Link>
            )}
          </EmptyContent>
        </Empty>
      ) : (
        <ul className="space-y-3" aria-label="Saved payment methods">
          {data.methods.map((method) => (
            <PaymentMethodItem
              key={method.id}
              method={method}
              now={now}
              gifts={method.recurringGiftIds
                .map((id) => gifts.get(id))
                .filter((gift): gift is DonorPortalRecurringGift =>
                  Boolean(gift),
                )}
            />
          ))}
        </ul>
      )}

      {linked && data && data.methods.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Gift links reflect our records. Confirm or change which method will be
          charged in Stripe, through{" "}
          <Link
            href="/donor-dashboard/pledges"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Recurring gifts
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
