"use client";

import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** When set, wraps the title in a named shared View Transition (list ↔ detail continuity). */
  titleViewTransitionName?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  titleViewTransitionName,
}: PageHeaderProps) {
  const titleNode = titleViewTransitionName ? (
    <SharedNamedViewTransition name={titleViewTransitionName}>
      <span className="inline-block">{title}</span>
    </SharedNamedViewTransition>
  ) : (
    title
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between pb-4 sm:pb-6",
        className,
      )}
    >
      <div className="space-y-0.5 sm:space-y-1 min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 truncate">
          {titleNode}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 truncate-2 sm:truncate-none">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">{children}</div>
      )}
    </div>
  );
}
