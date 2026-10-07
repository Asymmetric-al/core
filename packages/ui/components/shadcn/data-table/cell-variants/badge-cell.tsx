"use client";

import { useMemo } from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../../badge";

import type { RowData } from "../tanstack";
import type { BadgeCellProps, BadgeVariant } from "./types";

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-primary",
  secondary: "bg-secondary-foreground",
  destructive: "bg-destructive",
  outline: "bg-foreground",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
};

export function BadgeCell<TData extends RowData>({
  value,
  className,
  options,
  variant: defaultVariant = "default",
  showDot = false,
}: BadgeCellProps<TData>) {
  const resolvedOption = useMemo(() => {
    if (!options || !value) return null;
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const resolvedVariant = resolvedOption?.variant ?? defaultVariant;
  const displayLabel = resolvedOption?.label ?? value;
  const Icon = resolvedOption?.icon;

  if (!value) {
    return (
      <span
        className={cn("block text-sm text-muted-foreground italic", className)}
      >
        N/A
      </span>
    );
  }

  return (
    <Badge
      variant={resolvedVariant}
      className={cn(resolvedOption?.className, className)}
    >
      {showDot && (
        <span
          className={cn(
            "size-1.5 rounded-full mr-1.5 shrink-0",
            dotColors[resolvedVariant],
          )}
        />
      )}
      {Icon && <Icon className="size-3 mr-1 shrink-0" />}
      {displayLabel}
    </Badge>
  );
}
