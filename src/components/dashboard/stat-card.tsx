"use client";

import { memo } from "react";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { cn } from "@asym/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: "increase" | "decrease";
    label: string;
  };
  icon: LucideIcon;
  iconColor?: "emerald" | "blue" | "violet" | "amber" | "rose" | "primary";
  className?: string;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  change,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-zinc-200 bg-white", className)}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-4 text-zinc-600" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-zinc-500">{title}</span>
          <span className="text-lg font-semibold text-zinc-900">{value}</span>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                change.type === "increase"
                  ? "text-emerald-600"
                  : "text-rose-600",
              )}
            >
              {change.type === "increase" ? (
                <TrendingUpIcon className="size-3" />
              ) : (
                <TrendingDownIcon className="size-3" />
              )}
              <span>
                {change.value} {change.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
