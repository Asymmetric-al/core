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
        {...headerMotion}
        className={cn(
          density === "compact"
            ? "flex flex-col items-start justify-between gap-4 border-b border-border/80 pb-5 md:flex-row md:items-end"
            : "flex flex-col items-start justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end",
          headerClassName,
        )}
      >
        <div className={cn(density === "compact" ? "space-y-2" : "space-y-3")}>
          {breadcrumbs && (
            <div className={density === "compact" ? "mb-2" : "mb-4"}>
              {breadcrumbs}
            </div>
          )}

          <h1
            className={cn(
              density === "compact"
                ? "text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl"
                : "text-5xl font-black uppercase tracking-tighter text-foreground lg:text-6xl",
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
            {...actionsMotion}
            className={cn(
              density === "compact"
                ? "flex flex-wrap items-center gap-2.5"
                : "flex flex-wrap gap-3",
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
