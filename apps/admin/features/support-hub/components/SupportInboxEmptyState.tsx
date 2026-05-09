"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { LifeBuoy, RotateCcw } from "lucide-react";

interface SupportInboxEmptyStateProps {
  onResetFilters: () => void;
  /** Primary line. Defaults to a filtered-search wording. */
  title?: string;
  /** Secondary line. Defaults to a filter-tweaking suggestion. */
  description?: string;
}

/**
 * Quiet Maia/Zinc empty state shown when filters return no rows. The reset
 * button calls `useSupportInboxState().resetState`, which clears every
 * search-param at once.
 */
export function SupportInboxEmptyState({
  onResetFilters,
  title = "No conversations match your filters",
  description = "Adjust the view, status, label, or assignee filters above to widen the search.",
}: SupportInboxEmptyStateProps) {
  return (
    <section
      role="status"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-8 py-16 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100">
        <LifeBuoy className="size-6 text-zinc-300" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-zinc-500">{description}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onResetFilters}
        className="mt-5 h-9 gap-2 rounded-xl border-zinc-200 px-4 text-[11px] font-bold uppercase tracking-widest"
      >
        <RotateCcw className="size-3.5" />
        Reset filters
      </Button>
    </section>
  );
}
