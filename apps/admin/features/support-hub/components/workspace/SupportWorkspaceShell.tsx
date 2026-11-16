"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ConfirmProvider } from "./confirm-provider";
import {
  supportPageLabel,
  SupportSettingsSideNav,
  SupportSubNav,
  type SupportSection,
} from "./SupportSubNav";
import { SupportNowProvider } from "../../lib/now";

interface SupportWorkspaceShellProps {
  section: SupportSection;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Standard page chrome for every `/support/reports/*` and
 * `/support/settings/*` leaf. Wraps `PageShell` and mounts the shared
 * `SupportSubNav` inside the content area so sub-section navigation is
 * always visible without touching the Mission Control shell.
 *
 * `SupportNowProvider` keeps relative-time renders pure under the React
 * Compiler purity rule — same pattern used by `SupportInbox`.
 */
export function SupportWorkspaceShell({
  section,
  title,
  description,
  actions,
  children,
}: SupportWorkspaceShellProps) {
  const pathname = usePathname();
  const leafLabel = supportPageLabel(pathname) ?? title;
  return (
    <PageShell
      title={section === "settings" ? leafLabel : title}
      description={description}
      actions={actions}
      density="compact"
    >
      <SupportNowProvider>
        <ConfirmProvider>
          {/* Tighter on phones, where every row pushes the first record
              further down. */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <SupportSubNav section={section} />
            {section === "settings" ? (
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Phones choose the page from the select above, so the
                    side nav's column takes no space (and adds no gap). */}
                <div className="hidden md:block md:w-44 md:shrink-0">
                  <SupportSettingsSideNav />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  {children}
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </ConfirmProvider>
      </SupportNowProvider>
    </PageShell>
  );
}
