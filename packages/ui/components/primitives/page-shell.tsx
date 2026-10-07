"use client";

import { motion, useReducedMotion } from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
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
  const reduceMotion = useReducedMotion();
  const withinRouteVt = useWithinViewTransitionRouteLayer();

  const headerMotion =
    reduceMotion || withinRouteVt
      ? {
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: -8 },
          animate: { opacity: 1, y: 0 },
          transition: transitionStandard,
        };

  const actionsMotion =
    reduceMotion || withinRouteVt
      ? {
          initial: { opacity: 1, x: 0 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, x: 12 },
          animate: { opacity: 1, x: 0 },
          transition: { ...transitionStandard, delay: 0.08 },
        };

  return (
    <div
      className={cn(
        density === "compact"
          ? "flex flex-col gap-6 p-4 pb-16 sm:p-6 lg:p-7"
          : "flex flex-col gap-10 p-4 pb-20 sm:p-6 lg:p-8",
        className,
      )}
    >
      <motion.div
        initial={headerMotion.initial}
        animate={headerMotion.animate}
        transition={headerMotion.transition}
        data-slot="page-shell-header"
        className={cn(
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
          <motion.div
            initial={actionsMotion.initial}
            animate={actionsMotion.animate}
            transition={actionsMotion.transition}
            className={cn(
              density === "compact"
                ? "flex w-full flex-wrap items-center gap-2.5 md:w-auto md:shrink-0"
                : "flex w-full flex-wrap items-center gap-3 md:w-auto md:shrink-0",
            )}
          >
            {actions}
          </motion.div>
        )}
      </motion.div>

      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
}
