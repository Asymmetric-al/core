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
 * membership (`PortalDocument` in `@asym/auth/portal-document`; WP2b), and so
 * does every Web Studio page, from the Web Studio tenant cookie
 * (`apps/admin/src/cms-ui/web-studio/shell/web-studio-document.tsx`; WP2b
 * slice C). Everything else (sign-in, the choosers, Web Studio's included,
 * account screens, the public website) has none.
 *
 * A scope is valid inside its own segment and nowhere else (council round 1:
 * slice A's A8, slice B's SB2, record D-41). The segment is a tenant's address
 * segment (`<prefix>` or `<prefix>/…`) for Mission Control and the missionary
 * workspace, the portal's path `/donor-dashboard` for the donor portal, and
 * `/web-studio` for Web Studio, whose addresses name no tenant. So:
 * - `useDocumentScope()` returns the scope only inside the provider that fixed
 *   it (`TenantDocument`, `PortalDocument`, or Web Studio's document), so
 *   `null` on every page outside the segment.
 * - `getDocumentScope()` returns the scope only in the browser, only once a
 *   signed-in page has fixed it, and only while the address is inside its
 *   segment. It is `null` on the server, before a scope is fixed, and on any
 *   address outside the segment: another tenant's or another sub-role's, for
 *   the portal the public site, and for Web Studio Mission Control.
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
 * nothing. A provider given an empty prefix and no segment holds a scope
 * valid on every path of its document, so such a document passes its
 * segment.
 *
 * Crossing a segment's boundary is always a document load: into it from
 * outside, out of it, and from one tenant or sub-role to another. The helpers
 * in `@asym/auth/tenant-navigation` load a document for such a navigation;
 * `TenantSegmentBoundary` reloads when one happens softly anyway;
 * `TenantDocument` reloads a document that entered the segment without a
 * load; `PortalDocument` reloads when the portal unmounts at an address
 * outside it. Web Studio's router adapter loads a document for every address
 * that is not a Web Studio page, its chooser included
 * (`apps/admin/src/cms/payload-next-router-adapter.tsx`), its links out are
 * document loads (`mission-control-link.tsx`), and each Web Studio page
 * renders under the scope its own render resolved, so a page rendered for
 * another organization renders nothing and reloads. So a scope always starts
 * in a new document, with an empty query cache. Inside one segment
 * navigation stays soft.
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
   * a document whose address names no tenant (the donor portal, Web Studio),
   * whose links are not prefixed.
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
 * `segment`. `false` when the document already holds another scope. A no-op
 * on the server, where module state would be shared by every request.
 */
function fixDocumentScope(scope: DocumentScope, segment: string): boolean {
  if (typeof window === "undefined") return true;
  if (fixedScope === null) {
    fixedScope = Object.freeze({ ...scope });
    fixedSegment = segment;
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
 * guards the page address, by `PortalDocument` in
 * `@asym/auth/portal-document`, with the portal's path as `segment`, and by
 * Web Studio, with `/web-studio` as `segment`: its document
 * (`web-studio-document.tsx`) and each of its page renders (Payload's
 * catch-all page and the draft preview), which repeat the document's scope
 * so that a page rendered for another organization reloads (AL-2675, council
 * C1). Other app code does not render it.
 */
export function DocumentScopeProvider({
  scope,
  segment,
  children,
}: {
  scope: DocumentScope;
  /**
   * The address segment the scope is valid in, for a document whose address
   * names no tenant (the donor portal's `/donor-dashboard`, Web Studio's
   * `/web-studio`). By default the scope's own address prefix, a tenant's
   * segment.
   */
  segment?: string;
  children: ReactNode;
}) {
  const fixed = fixDocumentScope(scope, segment ?? scope.addressPrefix);

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
