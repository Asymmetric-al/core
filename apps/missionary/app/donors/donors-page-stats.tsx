"use client";

import { useMissionaryPortalSnapshot } from "@asym/database/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import { formatCurrency } from "./donors-model";
import { useDonorsPageViewFields } from "./use-donors-page-view";

function StatCard({
  label,
  value,
  detail,
  onClick,
  isActive,
}: {
  label: string;
  value: string | number;
  detail: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const content = (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-xl font-semibold tracking-tight tabular-nums text-foreground sm:text-2xl">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{detail}</p>
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
  const { statusFilter, pledgeFilter } = view.filters;
  const { applyStatFilter } = view.actions;
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
  const support = useMissionaryPortalSnapshot().data?.support;
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
      />
      <StatCard
        label="Given, all time"
        value={formatCurrency(totalGiven, null)}
        detail="Lifetime giving is unavailable because its currency is unknown."
      />
      <StatCard
        label="Monthly partners"
        value={monthlyPartners}
        detail={
          committedAmount === "Unavailable"
            ? "Committed amount unavailable: currencies are mixed or unknown."
            : `${committedAmount} a month committed`
        }
        onClick={() => applyStatFilter("activePledge")}
        isActive={pledgeFilter === "Active"}
      />
      <StatCard
        label="Need attention"
        value={atRiskCount + lapsedCount}
        detail={`${atRiskCount} at risk · ${lapsedCount} lapsed${loaded}`}
        onClick={() => applyStatFilter("needsAttention")}
        isActive={statusFilter === "Needs Attention"}
      />
    </div>
  );
}
