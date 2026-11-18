"use client";

import { useMissionaryPortalSnapshot } from "@asym/database/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import { formatCurrency } from "./donors-model";
import { useDonorsPageViewFields } from "./use-donors-page-view";

function StatCard({
  label,
  value,
  detail,
  loading = false,
  onClick,
  isActive,
}: {
  label: string;
  value: string | number;
  detail: string;
  /** Its numbers have not loaded: show placeholders, not zeros. */
  loading?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const content = (
    <Card className="h-full" aria-busy={loading || undefined}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {loading ? (
          <>
            <span className="sr-only">Loading…</span>
            <Skeleton className="h-7 w-12 sm:h-8" />
            <Skeleton className="h-5 w-28" />
          </>
        ) : (
          <>
            <p className="text-xl font-semibold tracking-tight tabular-nums text-foreground sm:text-2xl">
              {value}
            </p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    // The tile doubles as a filter for the list below.
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={Boolean(isActive)}
        className={cn(
          "w-full cursor-pointer rounded-xl text-left transition-shadow hover:ring-1 hover:ring-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive && "ring-2 ring-primary",
        )}
      >
        {content}
      </button>
    );
  }
  return content;
}

export function DonorsPageStats() {
  const view = useDonorsPageViewFields();
  const {
    all: donorRows,
    hasMore: hasMoreDonors,
    selected: selectedDonor,
  } = view.donors;
  const { statusFilter, pledgeFilter, setStatusFilter, setPledgeFilter } =
    view.filters;
  const { applyStatFilter } = view.actions;
  const rosterLoading = view.status.isLoading;
  // Each tile is a toggle: pressing it again clears only its own filter.
  const monthlyActive = pledgeFilter === "Active";
  const attentionActive = statusFilter === "Needs Attention";
  const {
    activeCount,
    activePledgeCount,
    atRiskCount,
    lapsedCount,
    totalGiven,
  } = view.summary;
  // With more pages to load, the roster numbers describe the loaded
  // partners only.
  const loaded = hasMoreDonors ? " (loaded so far)" : "";
  // Committed support comes from the same source as Home, so the two agree
  // and anonymous partners' gifts are counted.
  const portalQuery = useMissionaryPortalSnapshot();
  const support = portalQuery.data?.support;
  // Offline, a load with nothing cached waits for the connection: pending
  // and paused, not `isLoading`. It has not answered, so it still loads.
  const portalLoading =
    portalQuery.isLoading || (portalQuery.isPending && portalQuery.isPaused);
  const monthlyPartners = support?.monthlyPartnerCount ?? activePledgeCount;
  const committedAmount = formatCurrency(
    support?.recurringMonthlyCents,
    support?.recurringCurrency,
  );
  return (
    // Below lg an open partner fills the page: the tiles step aside, like the
    // list does, so the partner starts at the top. "Back" brings both back.
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        selectedDonor && "max-lg:hidden",
      )}
    >
      <StatCard
        label="Partners"
        value={hasMoreDonors ? `${donorRows.length}+` : donorRows.length}
        detail={`${activeCount} active${loaded}`}
        loading={rosterLoading}
      />
      <StatCard
        label="Given, all time"
        value={formatCurrency(totalGiven, null)}
        detail="Lifetime giving is unavailable because its currency is unknown."
        loading={rosterLoading}
      />
      <StatCard
        label="Monthly partners"
        value={monthlyPartners}
        // Without the snapshot's support, the count falls back to the roster.
        loading={portalLoading || (!support && rosterLoading)}
        detail={
          committedAmount === "Unavailable"
            ? "Committed amount unavailable: currencies are mixed or unknown."
            : `${committedAmount} a month committed`
        }
        onClick={() =>
          monthlyActive
            ? setPledgeFilter("All")
            : applyStatFilter("activePledge")
        }
        isActive={monthlyActive}
      />
      <StatCard
        label="Need attention"
        value={atRiskCount + lapsedCount}
        detail={`${atRiskCount} at risk · ${lapsedCount} lapsed${loaded}`}
        loading={rosterLoading}
        onClick={() =>
          attentionActive
            ? setStatusFilter("All")
            : applyStatFilter("needsAttention")
        }
        isActive={attentionActive}
      />
    </div>
  );
}
