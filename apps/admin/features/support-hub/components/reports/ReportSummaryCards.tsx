"use client";

import {
  MetricCard,
  MetricGrid,
  type MetricTone,
} from "@asym/ui/components/primitives/metric-card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

interface SummaryCard {
  label: string;
  value: string | number;
  helper?: string;
  tone?: MetricTone;
}

interface ReportSummaryCardsProps {
  cards: SummaryCard[];
  heading?: string;
  isLoading?: boolean;
  isError?: boolean;
  /** Names the group for assistive technology. */
  label?: string;
}

/** Report totals on Mission Control's shared metric cards. */
export function ReportSummaryCards({
  cards,
  heading,
  isLoading = false,
  isError = false,
  label = "Report summary",
}: ReportSummaryCardsProps) {
  if (cards.length === 0) return null;
  return (
    <section className="space-y-3">
      {heading && <h2 className="text-sm font-semibold">{heading}</h2>}
      <MetricGrid label={label} busy={isLoading}>
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={
              isLoading ? (
                <>
                  <Skeleton className="h-7 w-16" />
                  <span className="sr-only">Loading…</span>
                </>
              ) : isError ? (
                "—"
              ) : typeof card.value === "number" ? (
                card.value.toLocaleString("en-US")
              ) : (
                card.value
              )
            }
            detail={
              isLoading ? "Loading…" : isError ? "Couldn’t load" : card.helper
            }
            tone={isLoading || isError ? "default" : card.tone}
          />
        ))}
      </MetricGrid>
    </section>
  );
}
