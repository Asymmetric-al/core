"use client";

import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

interface SummaryCard {
  label: string;
  value: string | number;
  helper?: string;
}

interface ReportSummaryCardsProps {
  cards: SummaryCard[];
  className?: string;
}

export function ReportSummaryCards({
  cards,
  className,
}: ReportSummaryCardsProps) {
  if (cards.length === 0) return null;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">
              {card.label}
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {typeof card.value === "number"
                ? card.value.toLocaleString()
                : card.value}
            </p>
            {card.helper ? (
              <p className="text-xs text-muted-foreground">{card.helper}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
