"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

import type { SupportConversationStatus } from "../../types";

interface BoardColumnProps {
  status: SupportConversationStatus;
  label: string;
  description: string;
  count: number;
  isHovered: boolean;
  isDragging: boolean;
  dropProps: React.HTMLAttributes<HTMLDivElement> & {
    "aria-dropeffect": "move";
  };
  /**
   * Phase 7 a11y improvement — overrides the default `${label} column` aria
   * label so screen readers announce the count alongside the column name.
   */
  ariaLabel?: string;
  children: React.ReactNode;
}

const STATUS_TONES: Record<
  SupportConversationStatus,
  { dot: string; tint: string }
> = {
  open: { dot: "bg-warning", tint: "border-warning/20" },
  pending: { dot: "bg-muted-foreground", tint: "border-border" },
  snoozed: { dot: "bg-chart-3", tint: "border-chart-3/20" },
  resolved: { dot: "bg-success", tint: "border-success/20" },
};

export function BoardColumn({
  status,
  label,
  description,
  count,
  isHovered,
  isDragging,
  dropProps,
  ariaLabel,
  children,
}: BoardColumnProps) {
  const tone = STATUS_TONES[status];

  return (
    <section
      aria-label={ariaLabel ?? `${label} column`}
      className={cn(
        "flex h-full min-h-0 min-w-65 flex-1 flex-col rounded-2xl border bg-muted/40 p-3",
        tone.tint,
        isHovered && "border-border bg-muted/80",
      )}
      {...dropProps}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("size-2 rounded-full", tone.dot)} />
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <Badge variant="secondary" className="min-w-6 tabular-nums">
            {count}
          </Badge>
        </span>
      </header>
      <p className="mb-3 hidden text-xs text-muted-foreground lg:block">
        {description}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {count === 0 ? (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground",
              isDragging
                ? "border-border text-muted-foreground"
                : "border-border",
            )}
          >
            {isDragging ? "Drop to move here" : "No conversations"}
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
