"use client";

import { WEB_STUDIO_SEGMENT } from "@asym/auth/web-studio";
import {
  DocumentScopeProvider,
  type DocumentScope,
} from "@asym/database/document-scope";
import { createContext, useContext } from "react";

import { installWebStudioDocumentFetch } from "./web-studio-document-fetch";
import { WebStudioRefusalDialog } from "./web-studio-refusal-dialog";
import { installWebStudioLeaveGuard } from "../../../cms/web-studio-document-load";

import type { ReactNode } from "react";

export interface WebStudioOrganization {
  name: string;
  canSwitch: boolean;
  /**
   * The selected organization's home in Mission Control, under its tenant
   * address (council on the joined release, JC3).
   */
  missionControlHref: string;
}

const WebStudioOrganizationContext =
  createContext<WebStudioOrganization | null>(null);

/**
 * A Web Studio document (plan 5.2; AL-2675, WP2b slice C): the tenant and
 * membership row it was rendered for, from the Web Studio cookie, as its
 * document scope through slice A's `DocumentScopeProvider`. Code that reads
 * the document scope, such as slice B's own-API fetch wrapper behind Web
 * Studio's pickers, sees this organization. If another scope ever reaches the
 * same document, the provider renders nothing and reloads.
 *
 * It also has the document's calls to Payload's REST routes name that scope
 * (`web-studio-document-fetch.ts`), and gives the Studio chrome the
 * organization's name and whether the person can switch. When one of those
 * calls is refused, it asks the person to reload, once (council C2).
 */
export function WebStudioDocument({
  scope,
  organization,
  children,
}: {
  scope: DocumentScope;
  organization: WebStudioOrganization;
  children: ReactNode;
}) {
  // Before any child effect, so no call leaves without its scope, and so the
  // leave guard comes before Payload's own "leave this page?" listener.
  if (typeof window !== "undefined") {
    installWebStudioDocumentFetch();
    installWebStudioLeaveGuard();
  }

  return (
    // Valid on Web Studio's pages only: its address names no tenant, so the
    // prefix is empty and the segment bounds the scope (slice B, D-41). The
    // chooser and the REST routes are not among them (JC1).
    <DocumentScopeProvider scope={scope} segment={WEB_STUDIO_SEGMENT}>
      <WebStudioOrganizationContext.Provider value={organization}>
        {/* What the end-to-end suites read; it renders nothing visible. */}
        <span
          hidden
          data-web-studio-scope={scope.tenantId}
          data-web-studio-assignment={scope.assignmentId}
          data-web-studio-generation={scope.generation}
        />
        {children}
        <WebStudioRefusalDialog />
      </WebStudioOrganizationContext.Provider>
    </DocumentScopeProvider>
  );
}

/**
 * A Web Studio page render's own copy of the document's scope (Payload's
 * catch-all page and the draft preview): the same scope under the same
 * segment, so a page rendered for another organization reloads (council C1).
 * A client component, because the segment's test of an address is a
 * function, which cannot pass from a server component.
 */
export function WebStudioPageScope({
  scope,
  children,
}: {
  scope: DocumentScope;
  children: ReactNode;
}) {
  return (
    <DocumentScopeProvider scope={scope} segment={WEB_STUDIO_SEGMENT}>
      {children}
    </DocumentScopeProvider>
  );
}

/** The organization this Web Studio document works in, or `null` outside one. */
export function useWebStudioOrganization(): WebStudioOrganization | null {
  return useContext(WebStudioOrganizationContext);
}
