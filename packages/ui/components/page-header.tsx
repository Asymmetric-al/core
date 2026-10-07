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
        "flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pb-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground wrap-break-word sm:text-2xl lg:text-3xl">
          {titleNode}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
