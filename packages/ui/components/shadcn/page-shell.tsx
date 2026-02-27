"use client";

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
  return (
    <div
      className={cn("flex flex-col gap-10 p-4 sm:p-6 lg:p-8 pb-20", className)}
    >
      {/* Header */}
      <div
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

        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>

      {/* Content */}
      <div className={cn(contentClassName)}>{children}</div>
    </div>
  );
}
