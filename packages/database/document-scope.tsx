"use client";

import { createContext, useContext, useEffect } from "react";

import { reloadDocument } from "./document-reload";

import type { ReactNode } from "react";

/**
 * The scope of one browser document (plan 5.2, "The browser data layer is
 * scoped to the person, the tenant and the selected assignment"; AL-2675).
 *
 * It is fixed when the page loads, from what the proxy decided for the page
 * address, and never taken from the live address. Changing organization or
 * assignment is a full document load, so there is no scope to retire inside
 * a page. The browser client, the own-API fetch wrapper, the collections and
 * their cache keys read the tenant and assignment from here; keys in browser
 * storage carry the person and the tenant.
 *
 * Signed-in pages of Mission Control and the missionary workspace always have
 * one, and so does every Web Studio page, from the Web Studio tenant cookie
 * (AL-2675, WP2b slice C). Everything else (sign-in, the choosers, the donor
 * portal) has none: `useDocumentScope()` and `getDocumentScope()` return
 * `null`.
 */
export interface DocumentScope {
  /** The signed-in person: their Supabase user id. */
  readonly userId: string;
  /** The tenant the document acts in; the `x-asym-tenant` header carries it. */
  readonly tenantId: string;
  /**
   * The membership row (`authz.memberships.id`) the document acts under; the
   * `x-asym-assignment` header carries it.
   */
  readonly assignmentId: string;
  /**
   * The page address prefix: `/<tenant>` or `/<tenant>~<sub-role>`. Empty in
   * Web Studio, whose pages stay outside the tenant segment, so nothing there
   * is prefixed.
   */
  readonly addressPrefix: string;
}

const DocumentScopeContext = createContext<DocumentScope | null>(null);

/** Browser only: the scope this document was loaded with, once fixed. */
let fixedScope: DocumentScope | null = null;

function sameScope(a: DocumentScope, b: DocumentScope): boolean {
  return (
    a.userId === b.userId &&
    a.tenantId === b.tenantId &&
    a.assignmentId === b.assignmentId &&
    a.addressPrefix === b.addressPrefix
  );
}

/**
 * Fixes `scope` as the document's on its first call in the browser. `false`
 * when the document already holds another scope. A no-op on the server,
 * where module state would be shared by every request.
 */
function fixDocumentScope(scope: DocumentScope): boolean {
  if (typeof window === "undefined") return true;
  if (fixedScope === null) {
    fixedScope = Object.freeze({ ...scope });
    return true;
  }
  return sameScope(fixedScope, scope);
}

/**
 * Provides the document's scope. The first scope rendered in a browser
 * document is that document's for its lifetime, fixed during render so that
 * the subtree's effects already see it. If another scope ever reaches the
 * same document, which a soft navigation between two organizations or a
 * change of signed-in person could cause, it renders nothing and reloads.
 *
 * Rendered by `TenantDocument` in `@asym/auth/tenant-navigation`, which also
 * guards the page address, and by Web Studio's document
 * (`apps/admin/src/cms-ui/web-studio/shell/web-studio-document.tsx`), whose
 * address names no tenant to guard.
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

/** The document's scope, or `null` on a page outside the tenant segment. */
export function useDocumentScope(): DocumentScope | null {
  return useContext(DocumentScopeContext);
}

/**
 * The document's scope for code outside React, such as the browser client
 * and the fetch wrapper. Browser only: always `null` on the server, and
 * `null` until a signed-in page has rendered its provider.
 */
export function getDocumentScope(): DocumentScope | null {
  return typeof window === "undefined" ? null : fixedScope;
}
