import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Target, TrendingUp } from "lucide-react";
import * as React from "react";

interface FundingProgressProps {
  monthlySupport: number;
  monthlyGoal: number;
  percentFunded: number;
}

export function FundingProgress({
  monthlySupport,
  monthlyGoal,
  percentFunded,
}: FundingProgressProps) {
  const remaining = monthlyGoal - monthlySupport;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Target className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-widest leading-none mb-1">
              Funding Goal
            </CardTitle>
            <p className="text-lg font-bold text-foreground tracking-tighter">
              Monthly Progress
            </p>
          </div>
        </div>
        <Badge>{percentFunded}%</Badge>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-4xl font-bold tracking-tighter text-foreground">
              ${monthlySupport.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              of ${monthlyGoal.toLocaleString()}
            </span>
          </div>
          <div
            className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Monthly support funded"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.max(0, Math.min(percentFunded, 100))}
            aria-valuetext={`${percentFunded}% funded`}
          >
            {/* Animate transform: scaleX (GPU, no layout) instead of width */}
            <div
              className="size-full origin-left bg-primary transform-(--funding-progress-transform) transition-transform duration-700 ease-[var(--ease-out-soft)]"
              style={
                {
                  "--funding-progress-transform": `scaleX(${Math.min(percentFunded, 100) / 100})`,
                } as React.CSSProperties
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/50 p-2.5 border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                Remaining
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground tracking-tight">
                ${remaining.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5 border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                Trend
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-foreground tracking-tight">
                <TrendingUp className="size-3" /> +12%
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5 border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                Days Left
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground tracking-tight">
                16
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
