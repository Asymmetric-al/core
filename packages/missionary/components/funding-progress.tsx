import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Target } from "lucide-react";
import * as React from "react";

import { formatCents, moneyProgress, MONEY_UNAVAILABLE } from "./money-units";

interface FundingProgressProps {
  monthlySupport: number | null;
  supportCurrency: string | null;
  monthlyGoal: number | null;
  goalCurrency: string | null;
}

export function FundingProgress({
  monthlySupport,
  supportCurrency,
  monthlyGoal,
  goalCurrency,
}: FundingProgressProps) {
  const progress = moneyProgress(
    monthlySupport,
    supportCurrency,
    monthlyGoal,
    goalCurrency,
  );
  const percentFunded = progress?.percent ?? 0;
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
        {progress ? <Badge>{percentFunded}%</Badge> : null}
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-4xl font-bold tracking-tighter text-foreground">
              {formatCents(monthlySupport, supportCurrency)}
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              of {formatCents(monthlyGoal, goalCurrency)}
            </span>
          </div>
          {progress ? (
            <div
              className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Monthly support funded"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(0, Math.min(percentFunded, 100))}
              aria-valuetext={`${percentFunded}% funded`}
            >
              <div
                className="size-full origin-left bg-primary transform-(--funding-progress-transform) transition-transform duration-700 ease-[var(--ease-out-soft)]"
                style={
                  {
                    "--funding-progress-transform": `scaleX(${Math.max(0, Math.min(percentFunded, 100)) / 100})`,
                  } as React.CSSProperties
                }
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{MONEY_UNAVAILABLE}</p>
          )}
          {progress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-2.5 border border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Remaining
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground tracking-tight">
                  {formatCents(progress.remaining, goalCurrency)}
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
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
