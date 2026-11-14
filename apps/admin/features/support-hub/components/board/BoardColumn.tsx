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
  dropProps: React.HTMLAttributes<HTMLElement>;
  /**
   * Phase 7 a11y improvement — overrides the default `${label} column` aria
   * label so screen readers announce the count alongside the column name.
   */
  ariaLabel?: string;
  /** The lane jump scrolls to and focuses the lane through this ref. */
  laneRef?: React.Ref<HTMLElement>;
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
  laneRef,
  children,
}: BoardColumnProps) {
  const tone = STATUS_TONES[status];

  return (
    <section
      ref={laneRef}
      // Focused by the lane jump only, so it adds no Tab stop.
      tabIndex={-1}
      aria-label={ariaLabel ?? `${label} column`}
      className={cn(
        // The lane is the drop target, so it stretches to the tallest lane
        // in its row. Lanes grow with their cards at every width: every card
        // stays in page flow, so none hides behind an inner scroll.
        "flex min-w-0 flex-col self-stretch rounded-xl border bg-muted/40 p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        tone.tint,
        isHovered && "border-border bg-muted/80",
      )}
      {...dropProps}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("size-2 rounded-full", tone.dot)} />
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <Badge variant="secondary">{count}</Badge>
        </span>
      </header>
      <p className="mb-3 hidden text-xs text-muted-foreground lg:block">
        {description}
      </p>
      <div className="flex flex-1 flex-col gap-2">
        {count === 0 ? (
          <div
            className={cn(
              // Fills the stretched lane, with a floor for a lone lane.
              "flex min-h-24 flex-1 items-center justify-center rounded-xl border border-dashed text-xs text-muted-foreground",
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
