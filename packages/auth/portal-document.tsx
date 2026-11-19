"use client";

import {
  DocumentScopeProvider,
  type DocumentScope,
} from "@asym/database/document-scope";

import type { ReactNode } from "react";

/** The donor portal's path: its scope applies under it and nowhere else. */
export const DONOR_PORTAL_PATH = "/donor-dashboard";

/**
 * The donor portal's document (plan 12, WP2, "Interim rules until WP3"; WP2b,
 * AL-2675). Its scope is the person's one live donor membership
 * (`readPortalDocumentScope` in `./tenant-server`), so the own-API wrapper,
 * the browser client and the query cache read the same scope as in Mission
 * Control and the missionary workspace, with no second code path.
 *
 * Unlike `TenantDocument` it guards no tenant in the address: the portal's
 * address carries none until WP3. A change of signed-in person still reaches
 * the same document with another scope, and `DocumentScopeProvider` then
 * renders nothing and reloads.
 *
 * The portal's path bounds the scope (record D-41), and the provider holds
 * that boundary itself (council round 2, BR1): outside the portal's path
 * both scope functions return nothing, so a public page's calls, such as the
 * checkout's `/api/donate`, carry neither header; a document that entered
 * the portal without a load reloads; and when the portal unmounts at an
 * address outside it, the address loads as a new document.
 */
export function PortalDocument({
  scope,
  children,
}: {
  scope: DocumentScope;
  children: ReactNode;
}) {
  return (
    <DocumentScopeProvider scope={scope} segment={DONOR_PORTAL_PATH}>
      {/* What the end-to-end suites read; it renders nothing visible. */}
      <span
        hidden
        data-tenant-scope={scope.tenantId}
        data-tenant-assignment={scope.assignmentId}
      />
      {children}
    </DocumentScopeProvider>
  );
}
