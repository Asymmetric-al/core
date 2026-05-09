"use client";

import { cn } from "@asym/ui/lib/utils";
import * as React from "react";

interface SupportSettingsLayoutProps {
  /** Left-rail aside (usually a description or helper list). */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Two-column settings layout. Left aside collapses above the content on
 * small viewports so long forms stay readable without side-scroll.
 */
export function SupportSettingsLayout({
  aside,
  children,
  className,
}: SupportSettingsLayoutProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]",
        className,
      )}
    >
      {aside ? (
        <aside className="flex flex-col gap-3 text-[12px] text-zinc-500">
          {aside}
        </aside>
      ) : null}
      <section className="flex min-w-0 flex-col gap-4">{children}</section>
    </div>
  );
}
