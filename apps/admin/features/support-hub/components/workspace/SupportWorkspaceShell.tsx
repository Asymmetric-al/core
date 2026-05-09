"use client";

import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import * as React from "react";

import { SupportSubNav, type SupportSection } from "./SupportSubNav";
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
  return (
    <PageShell title={title} description={description} actions={actions}>
      <SupportNowProvider>
        <div className="flex flex-col gap-6">
          <SupportSubNav section={section} />
          {children}
        </div>
      </SupportNowProvider>
    </PageShell>
  );
}
