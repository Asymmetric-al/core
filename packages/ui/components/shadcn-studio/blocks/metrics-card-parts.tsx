import { Avatar, AvatarFallback } from "@asym/ui/components/shadcn/avatar";

import type { ReactNode } from "react";

export interface MetricTileData {
  title: string;
  value: string;
  icons: ReactNode;
}

/** Two-column grid of icon + label + value tiles shared by the metrics cards. */
export function MetricTileGrid({ metrics }: { metrics: MetricTileData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="flex items-center gap-3 rounded-md border px-4 py-2"
        >
          <Avatar className="size-8.5 rounded-sm">
            <AvatarFallback className="bg-primary/10 text-primary shrink-0 rounded-sm">
              {metric.icons}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-sm font-medium">
              {metric.title}
            </span>
            <span className="text-lg font-medium">{metric.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export interface MetricHighlight {
  icon: ReactNode;
  label: string;
}

/** Side-by-side icon + label headings above a chart. */
export function MetricHighlightPair({
  highlights,
}: {
  highlights: readonly [MetricHighlight, MetricHighlight];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {highlights.map((highlight) => (
        <div key={highlight.label} className="flex items-center gap-2">
          {highlight.icon}
          <span className="text-lg font-medium">{highlight.label}</span>
        </div>
      ))}
    </div>
  );
}
