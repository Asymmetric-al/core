"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";

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
 * one. Everything else (sign-in, the chooser, account screens, Web Studio,
 * the donor portal) has none.
 *
 * When each function returns `null` (council round 1, A8):
 * - `useDocumentScope()` returns the scope only inside the `TenantDocument`
 *   that fixed it, so `null` on every page outside the tenant segment.
 * - `getDocumentScope()` returns the scope only in the browser, only once a
 *   signed-in page has fixed it, and only while the address is inside that
 *   scope's segment (`<prefix>` or `<prefix>/…`). It is `null` on the
 *   server, before a scope is fixed, and on any address outside the segment,
 *   another tenant's or another sub-role's included.
 * Neither ever returns a scope other than the one the document was loaded
 * with.
 *
 * Crossing the tenant segment's boundary is always a document load: into it
 * from outside, out of it, and from one tenant or sub-role to another. The
 * helpers in `@asym/auth/tenant-navigation` load a document for such a
 * navigation; `TenantSegmentBoundary` reloads when one happens softly anyway;
 * `TenantDocument` reloads a document that entered the segment without a
 * load. So a scope always starts in a new document, with an empty query
 * cache. Inside one tenant's segment navigation stays soft.
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
  /** The page address prefix: `/<tenant>` or `/<tenant>~<sub-role>`. */
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
 * guards the page address; apps do not render it directly.
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
  // Tell readers above this provider (retained drafts) the scope is fixed.
  useLayoutEffect(() => {
    if (fixed) fixedScopeListeners.forEach((listener) => listener());
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

/** Whether `pathname` is in the tenant segment of `addressPrefix`. */
function inSegment(pathname: string, addressPrefix: string): boolean {
  return pathname === addressPrefix || pathname.startsWith(`${addressPrefix}/`);
}

/**
 * The document's scope for code outside React, such as the browser client
 * and the fetch wrapper. Browser only: always `null` on the server, `null`
 * until a signed-in page has rendered its provider, and `null` while the
 * address is outside that scope's tenant segment, so a page outside it never
 * acts in the document's tenant, even before the crossing's document load.
 * The address only withholds the scope; it never supplies one.
 */
export function getDocumentScope(): DocumentScope | null {
  if (typeof window === "undefined" || fixedScope === null) return null;
  return inSegment(window.location.pathname, fixedScope.addressPrefix)
    ? fixedScope
    : null;
}

/**
 * Whether this browser document has fixed a scope, wherever its address is
 * now. `false` on the server, which keeps none.
 */
export function isDocumentScopeFixed(): boolean {
  return typeof window !== "undefined" && fixedScope !== null;
}

const fixedScopeListeners = new Set<() => void>();

function subscribeFixedScope(listener: () => void) {
  fixedScopeListeners.add(listener);
  return () => {
    fixedScopeListeners.delete(listener);
  };
}

const readFixedScope = () =>
  typeof window === "undefined" ? null : fixedScope;
const readNoScope = () => null;

/**
 * The scope this document fixed, for React code above the provider that
 * fixed it, such as retained drafts in the root layout (council round 1,
 * A13); `null` on the server and until a signed-in page has rendered.
 */
export function useFixedDocumentScope(): DocumentScope | null {
  return useSyncExternalStore(subscribeFixedScope, readFixedScope, readNoScope);
}
