"use client";

import { createContext, useContext, useEffect } from "react";

import { reloadDocument } from "./document-reload";
import { fixDocumentScope, type DocumentScope } from "./document-scope-store";

import type { ReactNode } from "react";

/**
 * The scope of one browser document (plan 5.2, "The browser data layer is
 * scoped to the person, the tenant and the selected assignment"; AL-2675).
 * `./document-scope-store` holds it for code outside React and says where
 * each surface takes it from; this module provides it to React.
 */
export type { DocumentScope };
export { getDocumentScope } from "./document-scope-store";

const DocumentScopeContext = createContext<DocumentScope | null>(null);

/**
 * Provides the document's scope. The first scope rendered in a browser
 * document is that document's for its lifetime, fixed during render so that
 * the subtree's effects already see it. If another scope ever reaches the
 * same document, which a soft navigation between two organizations or a
 * change of signed-in person could cause, it renders nothing and reloads.
 *
 * Rendered by `TenantDocument` in `@asym/auth/tenant-navigation` and
 * `PortalDocument` in `@asym/auth/portal-document`; apps do not render it
 * directly.
 */
export function DocumentScopeProvider({
  scope,
  children,
}: {
  scope: DocumentScope;
  children: ReactNode;
}) {
  const fixed = fixDocumentScope(scope);

  useEffect(() => {
    if (!fixed) reloadDocument();
  }, [fixed]);

  if (!fixed) return null;
  return (
    <DocumentScopeContext.Provider value={scope}>
      {children}
    </DocumentScopeContext.Provider>
  );
}

/** The document's scope, or `null` on a page outside every signed-in surface. */
export function useDocumentScope(): DocumentScope | null {
  return useContext(DocumentScopeContext);
}
