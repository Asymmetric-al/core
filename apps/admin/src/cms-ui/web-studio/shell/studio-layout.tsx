"use client";


import { cn } from "@asym/ui/lib/utils";

import { StudioNavRail } from "./studio-nav-rail";
import { StudioTopBar } from "./studio-top-bar";

import type { ReactNode } from "react";

type StudioLayoutProps = {
  children: ReactNode;
  /** e.g. "Pages" — shown in breadcrumbs after Web Studio */
  sectionLabel?: string;
  /** Optional third crumb (current page title) */
  currentLabel?: string;
  className?: string;
};

export function StudioLayout({
  children,
  sectionLabel,
  currentLabel,
  className,
}: StudioLayoutProps) {
  return (
    <div
      data-testid="web-studio-native-shell"
      className={cn(
        "payload-admin-wrapper flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground",
        className,
      )}
    >
      <StudioTopBar
        sectionLabel={sectionLabel}
        currentLabel={currentLabel}
      />
      <div className="flex min-h-0 flex-1">
        <StudioNavRail />
        <main className="min-h-0 flex-1 overflow-auto border-border border-t bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
