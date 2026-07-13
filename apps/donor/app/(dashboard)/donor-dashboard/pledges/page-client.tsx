"use client";

import { mapRecurringGiftToPledgeView } from "@asym/api/donor-portal/pledge-view";
import {
  useCreateDonorBillingPortalSession,
  useDonorPortalSnapshot,
} from "@asym/database/hooks";
import { formatCurrency } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import {
  CalendarClock,
  ExternalLink,
  HeartHandshake,
  Loader2,
} from "lucide-react";

type PledgeView = ReturnType<typeof mapRecurringGiftToPledgeView>;

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "··"
  );
}

function statusClasses(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "active") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  if (normalized === "paused") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  return "border-border bg-muted text-muted-foreground";
}

function PledgeCard({ pledge }: { pledge: PledgeView }) {
  return (
    <Card className="border-border rounded-xl text-left">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-11 border border-border">
              {pledge.recipientAvatar ? (
                <AvatarImage src={pledge.recipientAvatar} alt="" />
              ) : null}
              <AvatarFallback className="bg-muted text-foreground text-sm font-semibold uppercase">
                {initialsOf(pledge.recipientName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {pledge.recipientName}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {pledge.recipientCategory}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[10px] uppercase",
              statusClasses(pledge.status),
            )}
          >
            {pledge.status}
          </Badge>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {formatCurrency(pledge.amount)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            / {pledge.frequency}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          <span>Next charge {formatDate(pledge.nextChargeDate)}</span>
        </div>

        {pledge.paymentMethodLabel ? (
          <p className="text-[11px] text-muted-foreground truncate">
            {pledge.paymentMethodLabel}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PledgesHeader({
  onManage,
  managing,
}: {
  onManage: () => void;
  managing: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 text-left">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight uppercase">
          Recurring Pledges
        </h1>
        <p className="text-muted-foreground mt-2 font-semibold uppercase tracking-widest text-[10px]">
          Manage your ongoing commitments and impact.
        </p>
      </div>
      <Button
        onClick={onManage}
        disabled={managing}
        className="h-12 px-6 rounded-lg font-semibold uppercase tracking-widest text-[10px]"
      >
        {managing ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ExternalLink className="mr-2 size-4" aria-hidden="true" />
        )}
        Manage in billing portal
      </Button>
    </div>
  );
}

export default function DonorPledgesPage() {
  const snapshot = useDonorPortalSnapshot();
  const billingPortal = useCreateDonorBillingPortalSession();

  const openBillingPortal = async () => {
    try {
      const { url } = await billingPortal.mutateAsync();
      window.location.assign(url);
    } catch {
      // error surfaced via billingPortal.error below
    }
  };

  const pledges = (snapshot.data?.recurringGifts ?? []).map(
    mapRecurringGiftToPledgeView,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <PledgesHeader
        onManage={openBillingPortal}
        managing={billingPortal.isPending}
      />

      {billingPortal.error ? (
        <p role="alert" className="text-sm text-destructive px-1">
          We couldn&apos;t open the billing portal. Please try again.
        </p>
      ) : null}

      {snapshot.isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          aria-busy="true"
          aria-label="Loading pledges"
        >
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : snapshot.error ? (
        <Card className="border-destructive/40 rounded-xl">
          <CardContent className="p-6 space-y-3 text-left">
            <p role="alert" className="text-sm font-medium text-destructive">
              We couldn&apos;t load your recurring pledges.
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
      ) : pledges.length === 0 ? (
        <Card className="border-dashed border-border rounded-xl">
          <CardContent className="p-10 flex flex-col items-center text-center gap-3">
            <HeartHandshake
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                No recurring pledges yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                When you set up a recurring gift, it will appear here.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={openBillingPortal}
              disabled={billingPortal.isPending}
              className="mt-2"
            >
              <ExternalLink className="mr-2 size-4" aria-hidden="true" />
              Open billing portal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {pledges.map((pledge) => (
            <PledgeCard key={pledge.id} pledge={pledge} />
          ))}
        </div>
      )}
    </div>
  );
}
