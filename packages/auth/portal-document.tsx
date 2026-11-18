"use client";

import {
  DocumentScopeProvider,
  type DocumentScope,
} from "@asym/database/document-scope";

import type { ReactNode } from "react";

/**
 * The donor portal's document (plan 12, WP2, "Interim rules until WP3"; WP2b,
 * AL-2675). Its scope is the person's one live donor membership
 * (`readPortalDocumentScope` in `./tenant-server`), so the own-API wrapper,
 * the browser client and the query cache read the same scope as in Mission
 * Control and the missionary workspace, with no second code path.
 *
 * Unlike `TenantDocument` it guards no address: the portal's address carries
 * no tenant until WP3. A change of signed-in person still reaches the same
 * document with another scope, and `DocumentScopeProvider` then renders
 * nothing and reloads.
 */
export function PortalDocument({
  scope,
  children,
}: {
  scope: DocumentScope;
  children: ReactNode;
}) {
  return (
    <DocumentScopeProvider scope={scope}>
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
