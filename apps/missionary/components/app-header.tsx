"use client";

import { Separator } from "@asym/ui/components/shadcn/separator";
import { SidebarTrigger } from "@asym/ui/components/shadcn/sidebar";

import type { ReactNode } from "react";

interface AppHeaderProps {
  title?: string;
  /** Current workspace section, shown beside the trigger while the sidebar is a sheet. */
  sectionLabel?: string;
  navigation?: ReactNode;
}

export function AppHeader({ title, sectionLabel, navigation }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" size="icon-lg" />
        {sectionLabel ? (
          <span className="min-w-0 truncate text-sm font-semibold tracking-tight md:hidden">
            {sectionLabel}
          </span>
        ) : null}
        {title ? (
          <>
            <span className="hidden sm:flex">
              <Separator orientation="vertical" className="h-4" />
            </span>
            <h1 className="hidden max-w-50 truncate text-sm font-semibold tracking-tight sm:block lg:max-w-none">
              {title}
            </h1>
          </>
        ) : null}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        {navigation}
      </div>
    </header>
  );
}
