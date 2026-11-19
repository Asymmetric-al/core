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
 * one, and so does the donor portal, from the person's one live donor
 * membership (`PortalDocument` in `@asym/auth/portal-document`; WP2b).
 * Everything else (sign-in, the chooser, account screens, Web Studio, the
 * public website) has none.
 *
 * A scope is valid inside its own segment and nowhere else (council round 1:
 * slice A's A8, slice B's SB2, record D-41). The segment is a tenant's address
 * segment (`<prefix>` or `<prefix>/…`) for Mission Control and the missionary
 * workspace, and the portal's path `/donor-dashboard` for the donor portal,
 * whose address names no tenant. So:
 * - `useDocumentScope()` returns the scope only inside the provider that fixed
 *   it (`TenantDocument`, or `PortalDocument`), so `null` on every page outside
 *   the segment.
 * - `getDocumentScope()` returns the scope only in the browser, only once a
 *   signed-in page has fixed it, and only while the address is inside its
 *   segment. It is `null` on the server, before a scope is fixed, and on any
 *   address outside the segment: another tenant's or another sub-role's, and
 *   for the portal the public site.
 * Neither ever returns a scope other than the one the document was loaded
 * with.
 *
 * A scope whose address names no tenant (the donor portal's; Web Studio's,
 * slice C) has an empty `addressPrefix` and a `segment` given by its provider.
 * The empty prefix is part of the contract, not an accident: the shared links
 * built with `useTenantHref` and `TenantLink` (`@asym/auth/tenant-navigation`,
 * including the auth and public links of `@asym/ui`) add the scope's prefix,
 * and an empty one adds nothing, so they keep their plain addresses. The
 * `segment` bounds the scope instead: outside it both functions return
 * nothing. Such a scope needs its segment, and a segment is never empty:
 * the provider throws `DocumentScopeSegmentError` on either, as on any other
 * programming error (council round 2, BR1).
 *
 * Crossing a segment's boundary is always a document load: into it from
 * outside, out of it, and from one tenant or sub-role to another. So a scope
 * always starts in a new document, with an empty query cache. Inside one
 * segment navigation stays soft. Two things hold it, for every scope:
 * - At the source, the helpers in `@asym/auth/tenant-navigation`
 *   (`TenantLink`, `useTenantRouter`) load a document for a navigation that
 *   crosses the boundary, so the usual way across never renders on the old
 *   document.
 * - As the fallback, for a crossing that bypassed them, the document's own
 *   guard reloads. Which guard depends on where the segment is written:
 *   - A tenant's segment is in the address itself (`/<tenant>[~<sub-role>]`),
 *     so `TenantDocument` and `TenantSegmentBoundary` guard it from the
 *     address, and `TenantDocument` passes no `segment` here: the scope's
 *     prefix is its segment.
 *   - A segment whose address names no tenant is known only to its provider,
 *     so `DocumentScopeProvider` guards it itself whenever it is given a
 *     `segment`: it loads a new document when it unmounts at an address
 *     outside the segment, and it renders nothing and loads a new document
 *     when the document was loaded outside the segment (entered softly). A
 *     reload at an address inside the segment gives a document loaded inside
 *     it, so this never loops. `PortalDocument` passes `/donor-dashboard`;
 *     Web Studio's document (slice C) passes `/web-studio` with an empty
 *     prefix and inherits the same guard.
 *   Do not merge the two: a tenant's guard also checks which tenant the
 *   address names, which a path segment cannot.
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
   * The page address prefix: `/<tenant>` or `/<tenant>~<sub-role>`. Empty for
   * a document whose address names no tenant (the donor portal), whose links
   * are not prefixed.
   */
  readonly addressPrefix: string;
}

const DocumentScopeContext = createContext<DocumentScope | null>(null);

/** Browser only: the scope this document was loaded with, once fixed. */
let fixedScope: DocumentScope | null = null;

/** Browser only: the address segment the fixed scope is valid in. */
let fixedSegment = "";

function sameScope(a: DocumentScope, b: DocumentScope): boolean {
  return (
    a.userId === b.userId &&
    a.tenantId === b.tenantId &&
    a.assignmentId === b.assignmentId &&
    a.addressPrefix === b.addressPrefix
  );
}

/**
 * Fixes `scope` as the document's on its first call in the browser, valid in
 * `segment`. `false` when the document already holds another scope, and the
 * same scope under another segment is another scope (BR1). A no-op on the
 * server, where module state would be shared by every request.
 */
function fixDocumentScope(scope: DocumentScope, segment: string): boolean {
  if (typeof window === "undefined") return true;
  if (fixedScope === null) {
    fixedScope = Object.freeze({ ...scope });
    fixedSegment = segment;
    return true;
  }
  return sameScope(fixedScope, scope) && fixedSegment === segment;
}

/** A scope given no segment it can be bounded by: a programming error. */
export class DocumentScopeSegmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentScopeSegmentError";
  }
}

/**
 * Whether the browser knows this document was loaded at an address outside
 * `segment`, from the navigation timing entry, which names the address the
 * document was loaded at whatever the client router did since. `false` on
 * the server and where the browser cannot say.
 */
function loadedOutside(segment: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const [entry] = performance.getEntriesByType("navigation");
    if (!entry) return false;
    return !inSegment(new URL(entry.name).pathname, segment);
  } catch {
    return false;
  }
}

/**
 * Provides the document's scope. The first scope rendered in a browser
 * document is that document's for its lifetime, fixed during render so that
 * the subtree's effects already see it. If another scope ever reaches the
 * same document, which a soft navigation between two organizations or a
 * change of signed-in person could cause, it renders nothing and reloads.
 *
 * Given a `segment`, it also holds that segment's boundary (BR1): it renders
 * nothing and reloads in a document loaded outside the segment, and reloads
 * when it unmounts at an address outside it.
 *
 * Rendered by `TenantDocument` in `@asym/auth/tenant-navigation`, which
 * guards the tenant's segment in the page address, and by `PortalDocument`
 * in `@asym/auth/portal-document`, with the portal's path as `segment`; apps
 * do not render it directly.
 */
export function DocumentScopeProvider({
  scope,
  segment,
  children,
}: {
  scope: DocumentScope;
  /**
   * The address segment the scope is valid in and bounded by, for a
   * document whose address names no tenant (the donor portal's
   * `/donor-dashboard`). Required when the scope's `addressPrefix` is empty;
   * never empty. Without it the scope's own address prefix is its segment,
   * a tenant's, guarded by `TenantDocument`.
   */
  segment?: string;
  children: ReactNode;
}) {
  if (segment === "") {
    throw new DocumentScopeSegmentError(
      "A document scope's segment is never empty: pass the path that bounds it, such as /donor-dashboard.",
    );
  }
  if (segment === undefined && scope.addressPrefix === "") {
    throw new DocumentScopeSegmentError(
      "A document scope whose address names no tenant needs the segment that bounds it, such as /donor-dashboard.",
    );
  }
  const validIn = segment ?? scope.addressPrefix;
  const guarded = segment !== undefined;
  // Entered without a document load: never fix the scope here (BR1).
  const enteredSoftly =
    guarded && !isDocumentScopeFixed() && loadedOutside(validIn);
  const fixed = !enteredSoftly && fixDocumentScope(scope, validIn);

  useEffect(() => {
    if (!fixed) reloadDocument();
  }, [fixed]);
  // Tell readers above this provider (retained drafts) the scope is fixed.
  useLayoutEffect(() => {
    if (fixed) fixedScopeListeners.forEach((listener) => listener());
  }, [fixed]);
  // Leaving the segment softly loads the new address as a document (BR1).
  // (A provider that did not fix its scope has already asked for a reload.)
  useEffect(() => {
    if (!guarded || !fixed) return;
    return () => {
      if (!inSegment(window.location.pathname, validIn)) reloadDocument();
    };
  }, [guarded, fixed, validIn]);

  if (!fixed) return null;
  return (
    <DocumentScopeContext.Provider value={scope}>
      {children}
    </DocumentScopeContext.Provider>
  );
}

/** The document's scope, or `null` on a page outside its segment. */
export function useDocumentScope(): DocumentScope | null {
  return useContext(DocumentScopeContext);
}

/** Whether `pathname` is in `segment`: the segment itself or below it. */
function inSegment(pathname: string, segment: string): boolean {
  return pathname === segment || pathname.startsWith(`${segment}/`);
}

/**
 * The document's scope for code outside React, such as the browser client
 * and the fetch wrapper. Browser only: always `null` on the server, `null`
 * until a signed-in page has rendered its provider, and `null` while the
 * address is outside that scope's segment, so a page outside it never acts
 * in the document's tenant, even before the crossing's document load. The
 * address only withholds the scope; it never supplies one.
 */
export function getDocumentScope(): DocumentScope | null {
  if (typeof window === "undefined" || fixedScope === null) return null;
  return inSegment(window.location.pathname, fixedSegment) ? fixedScope : null;
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
