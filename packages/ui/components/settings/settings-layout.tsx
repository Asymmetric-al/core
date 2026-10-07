"use client";

// Adapted from ReUI Pro settings-7/account-settings.tsx (base-maia).
// Commercial source permission and provenance: docs/guides/development/reui-source-license.md.
import { useIsDesktop } from "@asym/lib/hooks/use-mobile";

import { Tabs, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";

import type { ReactNode } from "react";

export interface SettingsTab {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SettingsLayoutProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: readonly SettingsTab[];
  children: ReactNode;
  ariaLabel?: string;
}

export function SettingsLayout({
  value,
  onValueChange,
  tabs,
  children,
  ariaLabel = "Account settings",
}: SettingsLayoutProps) {
  const isDesktop = useIsDesktop();

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onValueChange(next);
      }}
      orientation={isDesktop ? "vertical" : "horizontal"}
    >
      <div className="flex w-full min-w-0 flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="min-w-0 lg:w-44 lg:shrink-0">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList aria-label={ariaLabel}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.icon}
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Tabs>
  );
}
