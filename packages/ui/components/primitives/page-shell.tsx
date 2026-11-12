"use client";

import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  density?: "default" | "compact";
  /** @deprecated Badge is no longer rendered. Prop kept for backward compatibility. */
  badge?: string;
}

export function PageShell({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  className,
  headerClassName,
  contentClassName,
  density = "default",
}: PageShellProps) {
  // A route view transition already animates the page in. Otherwise the
  // header settles in with CSS, so the server HTML shows the title and
  // actions before any JavaScript runs, and reduced motion skips it in CSS
  // (motion-safe) instead of a client-only check that broke hydration.
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  return (
    <div
      className={cn(
        density === "compact"
          ? "flex flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-7"
          : "flex flex-col gap-10 p-4 pb-20 sm:p-6 lg:p-8",
        className,
      )}
    >
      <div
        data-slot="page-shell-header"
        className={cn(
          !withinRouteVt &&
            "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-(--duration-standard) motion-safe:ease-(--ease-out-soft)",
          density === "compact"
            ? "flex flex-col items-start justify-between gap-4 border-b border-border/80 pb-5 md:flex-row md:items-end"
            : "flex flex-col items-start justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end",
          headerClassName,
        )}
      >
        <div
          className={cn(
            "min-w-0 flex-1",
            density === "compact" ? "space-y-2" : "space-y-3",
          )}
        >
          {breadcrumbs && (
            <div className={density === "compact" ? "mb-2" : "mb-4"}>
              {breadcrumbs}
            </div>
          )}

          <h1
            className={cn(
              density === "compact"
                ? "text-2xl font-semibold tracking-tight text-foreground wrap-break-word sm:text-3xl lg:text-4xl"
                : "text-3xl font-bold tracking-tight text-foreground wrap-break-word sm:text-4xl lg:text-5xl",
            )}
          >
            {title}
          </h1>

          {description && (
            <p
              className={cn(
                density === "compact"
                  ? "max-w-2xl text-sm font-medium leading-6 text-muted-foreground"
                  : "max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground",
              )}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div
            className={cn(
              density === "compact"
                ? "flex w-full flex-wrap items-center gap-2.5 md:w-auto md:shrink-0"
                : "flex w-full flex-wrap items-center gap-3 md:w-auto md:shrink-0",
            )}
          >
            {actions}
          </div>
        )}
      </div>

      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
}
