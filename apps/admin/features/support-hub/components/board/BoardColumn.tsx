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
  open: { dot: "bg-amber-400", tint: "border-amber-100" },
  pending: { dot: "bg-zinc-400", tint: "border-zinc-100" },
  snoozed: { dot: "bg-violet-400", tint: "border-violet-100" },
  resolved: { dot: "bg-emerald-500", tint: "border-emerald-100" },
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
        "flex h-full min-h-0 min-w-[260px] flex-1 flex-col rounded-2xl border bg-zinc-50/40 p-3",
        tone.tint,
        isHovered && "border-zinc-300 bg-zinc-100/80",
      )}
      {...dropProps}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className={cn("size-2 rounded-full", tone.dot)} />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
            {label}
          </h3>
          <Badge
            variant="secondary"
            className="h-5 min-w-[1.5rem] justify-center rounded-md border-transparent bg-white text-[11px] font-semibold tabular-nums text-zinc-700"
          >
            {count}
          </Badge>
        </span>
      </header>
      <p className="mb-3 hidden text-[11px] text-zinc-500 lg:block">
        {description}
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {React.Children.count(children) === 0 ? (
          <div
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl border border-dashed text-xs text-zinc-400",
              isDragging ? "border-zinc-300 text-zinc-600" : "border-zinc-200",
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
