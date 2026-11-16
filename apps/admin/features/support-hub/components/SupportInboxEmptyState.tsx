"use client";

import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { LifeBuoy, RotateCcw } from "lucide-react";
import Link from "next/link";

interface SupportInboxEmptyStateProps {
  onResetFilters?: () => void;
  settingsHref?: string;
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
  settingsHref,
  title = "No conversations match your filters",
  description = "Adjust the view, status, label, or assignee filters above to widen the search.",
}: SupportInboxEmptyStateProps) {
  return (
    <Empty role="status" className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LifeBuoy aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>
          <h3>{title}</h3>
        </EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {settingsHref ? (
          <Link
            href={settingsHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Inbox settings
          </Link>
        ) : null}
        {onResetFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
          >
            <RotateCcw aria-hidden="true" />
            Reset filters
          </Button>
        ) : null}
      </EmptyContent>
    </Empty>
  );
}
