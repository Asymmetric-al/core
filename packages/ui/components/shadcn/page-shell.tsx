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
      className={cn("flex flex-col gap-10 p-4 sm:p-6 lg:p-8 pb-20", className)}
    >
      <motion.div
        {...headerMotion}
        className={cn(
          "flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-border pb-8",
          headerClassName,
        )}
      >
        <div className="space-y-3">
          {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}

          <h1 className="text-5xl font-black tracking-tighter text-foreground lg:text-6xl uppercase">
            {title}
          </h1>

          {description && (
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <motion.div {...actionsMotion} className="flex flex-wrap gap-3">
            {actions}
          </motion.div>
        )}
      </motion.div>

      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
}
