"use client";

import * as React from "react";
import { cn } from "@asym/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
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
  badge,
}: PageShellProps) {
  return (
    <div className={cn("space-y-12 max-w-7xl mx-auto pb-20", className)}>
      {/* Header */}
      <div
        className={cn(
          "flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-zinc-100 pb-8 px-4 md:px-0",
          headerClassName,
        )}
      >
        <div className="space-y-3">
          {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}

          {(badge || title) && (
            <div className="space-y-2">
              {badge && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    {badge}
                  </span>
                </div>
              )}
              <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl uppercase">
                {title}
              </h1>
            </div>
          )}

          {description && (
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex flex-wrap gap-4">{actions}</div>}
      </div>

      {/* Content */}
      <div className={cn("px-4 md:px-0", contentClassName)}>{children}</div>
    </div>
  );
}
