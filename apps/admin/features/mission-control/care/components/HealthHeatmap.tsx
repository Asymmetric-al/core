"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import React from "react";

const healthHeatmapGetColor = (intensity: number) => {
  switch (intensity) {
    case 0:
      return "bg-muted";
    case 1:
      return "bg-chart-5/20";
    case 2:
      return "bg-chart-5/40";
    case 3:
      return "bg-chart-5/70";
    case 4:
      return "bg-chart-5";
    default:
      return "bg-muted";
  }
};

interface HeatmapProps {
  data: { date: string; intensity: number; type: string }[];
  days?: number;
}

export function HealthHeatmap({ data, days = 90 }: HeatmapProps) {
  // Generate dates for the last N days
  const dates = Array.from({ length: days }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {dates.map((date) => {
          const entry = data.find((d) => d.date === date);
          const intensity = entry?.intensity || 0;
          // Tooltips are visual-only, so the trigger label carries the same
          // information for screen readers.
          const label =
            intensity > 0
              ? `${date}: ${entry?.type} intensity ${intensity}`
              : `${date}: no activity logged`;

          return (
            <Tooltip key={date}>
              <TooltipTrigger
                type="button"
                aria-label={label}
                className={cn(
                  "w-3 h-3 rounded-sm cursor-pointer transition-colors hover:ring-1 hover:ring-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                  healthHeatmapGetColor(intensity),
                )}
              />
              <TooltipContent side="top">
                <p className="text-xs font-medium">{date}</p>
                <p className="text-xs text-muted-foreground">
                  {intensity > 0
                    ? `${entry?.type} intensity: ${intensity}`
                    : "No activity logged"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
