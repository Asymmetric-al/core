"use client";

import { motion } from "@asym/lib/motion";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

const smoothTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

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
  return (
    <div
      className={cn("flex flex-col gap-10 p-4 sm:p-6 lg:p-8 pb-20", className)}
    >
      {/* Header — smooth entrance */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={smoothTransition}
        className={cn(
          "flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-zinc-100 pb-8",
          headerClassName,
        )}
      >
        <div className="space-y-3">
          {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}

          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl uppercase">
            {title}
          </h1>

          {description && (
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...smoothTransition, delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            {actions}
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
}
