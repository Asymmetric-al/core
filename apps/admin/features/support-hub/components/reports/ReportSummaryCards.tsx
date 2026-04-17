"use client";

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
        <div
          key={card.label}
          className="flex flex-col gap-1 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            {card.label}
          </p>
          <p className="font-mono text-2xl font-black tabular-nums text-zinc-900">
            {typeof card.value === "number"
              ? card.value.toLocaleString()
              : card.value}
          </p>
          {card.helper ? (
            <p className="text-[11px] text-zinc-500">{card.helper}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
