"use client";

import { useMemo } from "react";
import { cn } from "@asym/ui/lib/utils";
import { Progress } from "../../progress";
import type { ProgressCellProps } from "./types";

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const variantColors = {
  default: "",
  success: "[&>div]:bg-emerald-500",
  warning: "[&>div]:bg-amber-500",
  destructive: "[&>div]:bg-destructive",
};

export function ProgressCell<TData>({
  value,
  className,
  max = 100,
  showLabel = true,
  variant = "default",
  size = "md",
}: ProgressCellProps<TData>) {
  const percentage = useMemo(() => {
    if (value === null || value === undefined) return 0;
    return Math.min(100, Math.max(0, (value / max) * 100));
  }, [value, max]);

  const resolvedVariant = useMemo(() => {
    if (variant !== "default") return variant;
    if (percentage >= 80) return "success";
    if (percentage >= 50) return "warning";
    if (percentage < 30) return "destructive";
    return "default";
  }, [percentage, variant]);

  return (
    <div
      className={cn("flex items-center gap-2 w-full min-w-[80px]", className)}
    >
      <Progress
        value={percentage}
        className={cn(
          "flex-1",
          sizeClasses[size],
          variantColors[resolvedVariant],
        )}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap min-w-[3ch] text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
