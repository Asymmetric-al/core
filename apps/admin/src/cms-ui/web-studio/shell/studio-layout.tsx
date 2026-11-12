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
  recordsId?: string;
  className?: string;
  /** Payload account forms supply their own main landmark. */
  contentAs?: "main" | "div";
};

/**
 * The one Mission Control chrome for every Web Studio screen: a top bar with
 * breadcrumbs and a section rail. Payload's own template chrome (sidebar nav,
 * app header, document header) steps aside wherever this shell renders; see
 * `data-web-studio-shell` in `src/styles/payloadStyles.css`.
 */
export function StudioLayout({
  children,
  sectionLabel,
  currentLabel,
  recordsId,
  className,
  contentAs: Content = "main",
}: StudioLayoutProps) {
  return (
    <div
      data-testid="web-studio-native-shell"
      data-web-studio-shell=""
      className={cn(
        "payload-admin-wrapper flex min-h-svh min-w-0 flex-1 flex-col bg-background text-base text-foreground",
        className,
      )}
    >
      {recordsId ? (
        <a
          href={`#${recordsId}`}
          className="sr-only focus:not-sr-only focus:rounded-md focus:bg-background focus:p-3 focus:text-foreground focus:outline-2 focus:outline-ring"
          onClick={(event) => {
            const records = document.getElementById(recordsId);
            if (!records) return;
            event.preventDefault();
            const firstRecord = Array.from(
              records.querySelectorAll<HTMLElement>("[data-grid-row-primary]"),
            ).find((element) => !element.closest("[hidden]"));
            (firstRecord ?? records).focus();
          }}
        >
          Skip to records
        </a>
      ) : null}
      <StudioTopBar sectionLabel={sectionLabel} currentLabel={currentLabel} />
      <div className="flex min-w-0 flex-1 flex-col md:flex-row">
        <StudioNavRail />
        <Content className="min-w-0 flex-1">{children}</Content>
      </div>
    </div>
  );
}
