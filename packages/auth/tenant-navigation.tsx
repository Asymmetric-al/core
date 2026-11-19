"use client";

import { loadDocument, reloadDocument } from "@asym/database/document-reload";
import {
  claimDocumentReload,
  requestDocumentReload,
} from "@asym/database/document-reload-claim";
import {
  DocumentScopeProvider,
  isDocumentScopeFixed,
  useDocumentScope,
  type DocumentScope,
} from "@asym/database/document-scope";
import { ScopeReloadNotice } from "@asym/database/scope-reload-notice";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  isOutsideTenantSegment,
  parseTenantAddress,
  stripTenantAddress,
  withTenantAddress,
} from "./tenant-address";
import {
  isWebStudioPagePath,
  WEB_STUDIO_SEGMENT,
  webStudioEntryQuery,
  withWebStudioEntry,
} from "./web-studio";

import type { ComponentProps, MouseEvent, ReactNode } from "react";

/**
 * The tenant document and the one way page code builds an address (plan 5.2;
 * AL-2675).
 *
 * Under the proxy rewrite a signed-in page renders for
 * `/<tenant>[~<sub-role>]/<page>` from the page file at `/<page>`. Page code
 * keeps writing unprefixed addresses and passes them through these helpers,
 * which add the document's prefix: `TenantLink` for `next/link`,
 * `useTenantRouter` for `useRouter`, `useTenantHref` for anything else that
 * needs an href, and `useRoutePathname` for `usePathname` in active-state
 * tests. Server code uses `redirectInTenant` from `./tenant-server`. Outside
 * a tenant document (sign-in, the chooser, the donor portal) they add no
 * prefix. In every app with a segment boundary, a tenant's
 * (`TenantSegmentBoundary`) or a path's (`PathSegmentBoundary`, the donor
 * portal's), `TenantLink` and `useTenantRouter` load a document for a
 * navigation that crosses it.
 */

/**
 * The segment of the address the document was loaded at: a tenant address
 * prefix, sub-role suffix included, or `null` outside the tenant segment;
 * `undefined` where the browser cannot say. Read from the navigation timing
 * entry, which names the address the document was loaded at whatever the
 * client router did since. Browser only.
 */
function loadedSegment(): string | null | undefined {
  const pathname = loadedPathname();
  if (pathname === undefined) return undefined;
  return parseTenantAddress(pathname)?.prefix ?? null;
}

/**
 * The path of the address the document was loaded at, from the navigation
 * timing entry; `undefined` on the server and where the browser cannot say.
 */
function loadedPathname(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const [entry] = performance.getEntriesByType("navigation");
    if (!entry) return undefined;
    return new URL(entry.name).pathname;
  } catch {
    return undefined;
  }
}

/**
 * Present only in an app with a segment boundary: a tenant's segment
 * (`TenantSegmentBoundary`) or a path segment (`PathSegmentBoundary`).
 * `documentSegment` is the segment the document was loaded in; `segmentOf`
 * places a page path in a segment, or `null` outside every segment.
 */
const SegmentContext = createContext<{
  documentSegment: string | null | undefined;
  segmentOf: (pathname: string) => string | null;
} | null>(null);

/**
 * A page path's tenant segment: Web Studio's pages, its prefix, "unprefixed",
 * or null outside.
 *
 * Web Studio's pages are outside every tenant's segment, but a segment of
 * their own (council on the joined release, JC1): a document scoped to Web
 * Studio's organization lives there, and neither sign-in nor Web Studio's
 * own chooser, which share the outside segment, may render on it, nor it on
 * them. Only the admin app serves them; elsewhere no address is one.
 */
function tenantSegmentOf(pathname: string): string | null {
  if (isWebStudioPagePath(pathname)) return WEB_STUDIO_SEGMENT.name;
  const address = parseTenantAddress(pathname);
  if (address) return address.prefix;
  // An unprefixed page address inside the segment: the proxy puts it under
  // the person's prefix, so it is in a segment other than "outside".
  return isOutsideTenantSegment(pathname) ? null : "unprefixed";
}

/**
 * The segment an address is in, for a document and for the boundary's
 * watcher: Web Studio's pages, a tenant prefix, or null for every other
 * address, an unprefixed one included (the guard of the signed-in pages,
 * `TenantDocument`, handles that one).
 */
function addressSegmentOf(pathname: string): string | null {
  if (isWebStudioPagePath(pathname)) return WEB_STUDIO_SEGMENT.name;
  return parseTenantAddress(pathname)?.prefix ?? null;
}

/** The segment the document was loaded in; `undefined` where the browser cannot say. */
function loadedAddressSegment(): string | null | undefined {
  const pathname = loadedPathname();
  return pathname === undefined ? undefined : addressSegmentOf(pathname);
}

/**
 * Makes every navigation that crosses the boundary of the tenant segment a
 * document load (council round 1 ruling; plan 5.2: one scope for each
 * document, fixed at load). Mission Control's and the missionary workspace's
 * root layouts render it around the whole app.
 *
 * Crossing means: into the segment from outside, out of it, and from one
 * tenant or sub-role to another; and, in the admin app, into or out of Web
 * Studio's pages, a segment of their own (JC1). Inside one tenant's segment,
 * among Web Studio's pages, and between two pages outside every segment
 * (sign-in, the choosers), navigation stays soft. Three things hold the rule:
 *
 * - `TenantLink` and `useTenantRouter` load a crossing's address as a new
 *   document instead of a client-side transition, so the usual way across
 *   never renders on the old document.
 * - `TenantDocument` renders nothing and reloads where the signed-in pages
 *   would otherwise render in a document loaded outside their segment.
 * - This boundary's watcher loads a new document after any other
 *   client-side navigation that lands across the boundary: a redirect the
 *   browser carries out, the proxy's redirect of a client request, a link
 *   that bypassed the helpers.
 *
 * The watcher reads the address inside a Suspense boundary of its own, so
 * the root layout reads no request data outside Suspense and every route
 * keeps its prerendered shell.
 */
export function TenantSegmentBoundary({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      documentSegment: loadedAddressSegment(),
      segmentOf: tenantSegmentOf,
    }),
    [],
  );
  return (
    <SegmentContext.Provider value={value}>
      <Suspense fallback={null}>
        <SegmentCrossingWatcher documentSegment={value.documentSegment} />
      </Suspense>
      {children}
    </SegmentContext.Provider>
  );
}

function SegmentCrossingWatcher({
  documentSegment,
}: {
  documentSegment: string | null | undefined;
}) {
  const addressSegment = addressSegmentOf(usePathname() ?? "/");
  const crossed =
    documentSegment !== undefined && addressSegment !== documentSegment;
  useEffect(() => {
    if (crossed) requestDocumentReload();
  }, [crossed]);
  return null;
}

/**
 * The same rule for a segment whose address names no tenant, such as the
 * donor portal's `/donor-dashboard` (council round 2 on slice B, BR2):
 * `TenantLink` and `useTenantRouter` load a document for a navigation into
 * or out of `segment`, so the usual way across never renders on the old
 * document; inside the segment, and between two pages outside it, navigation
 * stays soft. It reads no request data and renders no Suspense boundary.
 *
 * It has no watcher of its own: the scope provider given the same segment
 * (`DocumentScopeProvider`, BR1) reloads a document that crosses it softly,
 * which is the fallback for a crossing that bypassed these helpers. The
 * donor app renders it at its root through `PortalSegmentBoundary`
 * (`./portal-document`).
 */
export function PathSegmentBoundary({
  segment,
  children,
}: {
  segment: string;
  children: ReactNode;
}) {
  if (!segment.startsWith("/") || segment.length < 2) {
    throw new TypeError(
      `A path segment is a page path such as /donor-dashboard, not "${segment}".`,
    );
  }
  const value = useMemo(() => {
    const segmentOf = (pathname: string) =>
      pathname === segment || pathname.startsWith(`${segment}/`)
        ? segment
        : null;
    const loaded = loadedPathname();
    return {
      documentSegment: loaded === undefined ? undefined : segmentOf(loaded),
      segmentOf,
    };
  }, [segment]);
  return (
    <SegmentContext.Provider value={value}>{children}</SegmentContext.Provider>
  );
}

/**
 * Rendered where a document loaded outside the workspace finds itself
 * showing a workspace page: nothing, and a new document for the address.
 */
export function ReloadAcrossSegment() {
  return <ScopeReloadNotice />;
}

/** The segment of a navigation target, or `undefined` for one the browser handles as it is. */
function targetSegment(
  href: string,
  segmentOf: (pathname: string) => string | null,
): string | null | undefined {
  if (!href.startsWith("/") || href.startsWith("//")) return undefined;
  return segmentOf(href.split(/[?#]/)[0] || "/");
}

/**
 * Whether going to `href` (already prefixed for this document) crosses the
 * app's segment boundary: a tenant's, or a path segment's. Never in an app
 * with no segment boundary.
 */
function useCrossesSegment(): (href: string) => boolean {
  const segment = useContext(SegmentContext);
  return useCallback(
    (href: string) => {
      if (!segment || segment.documentSegment === undefined) return false;
      const target = targetSegment(href, segment.segmentOf);
      return target !== undefined && target !== segment.documentSegment;
    },
    [segment],
  );
}

/**
 * A left click with no modifier on a link that opens in this window and is
 * not a download, as next/link itself decides (council round 3, AR14).
 */
function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  const target = event.currentTarget.getAttribute("target");
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!target || target === "_self") &&
    !event.currentTarget.hasAttribute("download")
  );
}

export class TenantScopeMismatchError extends Error {
  constructor(addressPrefix: string | null, scopePrefix: string) {
    super(
      `The page address prefix "${addressPrefix ?? "(none)"}" does not match ` +
        `the document's scope "${scopePrefix}". The page was rendered without ` +
        "the tenant its address names; if the server is bound to a loopback " +
        "IP address, the proxy rewrite left the server (record D-19).",
    );
    this.name = "TenantScopeMismatchError";
  }
}

/**
 * Wraps a signed-in page tree in its document scope and guards it.
 *
 * The scope is the one the proxy decided for the address the document was
 * loaded at; the signed-in layout reads it from the request once. When the
 * address's tenant segment or sub-role suffix later differs from it, which a
 * soft navigation to another organization, another assignment or an
 * unprefixed address causes, this renders nothing and loads the address as a
 * new document: the client router would otherwise keep showing the first
 * tenant's page under the second tenant's address. That holds whether this
 * guard re-renders or mounts afresh during the navigation, and whether or
 * not the page had hydrated when the navigation began.
 *
 * A mismatch at the very address the document was loaded at is a server
 * fault, not a navigation: the page was rendered for an address without that
 * address's tenant. It throws, on the server and in the browser, instead of
 * reloading into the same fault.
 */
export function TenantDocument({
  scope,
  children,
}: {
  scope: DocumentScope;
  children: ReactNode;
}) {
  const addressPrefix =
    parseTenantAddress(usePathname() ?? "/")?.prefix ?? null;
  const mismatch = addressPrefix !== scope.addressPrefix;
  // A server fault only where this document never fixed a scope: once it
  // has, a mismatch is a navigation, which a hidden (Activity) copy of the
  // layout sees too, and the effect below reloads (effects do not run while
  // hidden). Council round 1, A6.
  if (mismatch && neverFixedScope() && isAtLoadedAddress(addressPrefix)) {
    throw new TenantScopeMismatchError(addressPrefix, scope.addressPrefix);
  }
  // A document loaded outside this segment never fixes its scope here: the
  // person crossed into the segment without a document load, so one is
  // loaded now (council round 1 ruling, A7, A8).
  const enteredWithoutLoad =
    !mismatch && neverFixedScope() && loadedElsewhere(scope.addressPrefix);
  const reload = mismatch || enteredWithoutLoad;
  // A reload that did not cure the mismatch is a fault, not a navigation:
  // one reload, then the error, never a loop (council round 1, A12).
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!reload) return;
    if (claimDocumentReload()) reloadDocument();
    else setStuck(true);
  }, [reload]);

  if (stuck) {
    throw new TenantScopeMismatchError(addressPrefix, scope.addressPrefix);
  }
  // No page of the wrong scope, but an announced status and, if the reload
  // does not happen, a way out (JB2). The reload is this guard's own.
  if (reload) return <ScopeReloadNotice requestReload={false} />;
  return (
    <DocumentScopeProvider scope={scope}>
      {/* What the end-to-end suites read; it renders nothing visible. It
          ships in production builds on purpose: the production specs read
          it, and it tells the browser nothing new: the same scope is a prop of
          this client component, so it is already in the page's own payload
          (council round 1, A13). */}
      <span
        hidden
        data-tenant-scope={scope.addressPrefix}
        data-tenant-assignment={scope.assignmentId}
      />
      {children}
    </DocumentScopeProvider>
  );
}

/**
 * Whether this document has fixed no scope yet: always on the server, which
 * keeps none. Not `getDocumentScope()`, which is also `null` once the address
 * has left the segment of a scope the document did fix (A6, A8).
 */
function neverFixedScope(): boolean {
  return !isDocumentScopeFixed();
}

/**
 * Whether the address prefix is the one the document was loaded at: always
 * on the server, which renders the requested address; in the browser, from
 * the navigation timing entry. Where the browser cannot say, it answers no,
 * so the guard reloads, once, rather than throws (A12).
 */
function isAtLoadedAddress(addressPrefix: string | null): boolean {
  if (typeof window === "undefined") return true;
  const loaded = loadedSegment();
  return loaded !== undefined && loaded === addressPrefix;
}

/** Whether the browser knows the document was loaded in a segment other than `prefix`. */
function loadedElsewhere(prefix: string): boolean {
  if (typeof window === "undefined") return false;
  const loaded = loadedSegment();
  return loaded !== undefined && loaded !== prefix;
}

/**
 * Adds the document's tenant prefix to an internal page address. A link from
 * a tenant's document into Web Studio, which keeps its organization in a
 * cookie, names that document's tenant and row instead, so the proxy can ask
 * before Web Studio works in another organization (`withWebStudioEntry`;
 * council on the joined release, JC3).
 */
export function useTenantHref(): (href: string) => string {
  const scope = useDocumentScope();
  return useCallback(
    (href: string) =>
      withWebStudioEntry(
        withTenantAddress(scope?.addressPrefix ?? null, href),
        scope,
      ),
    [scope],
  );
}

/** A URL object's query with the tenant document's Web Studio entry added. */
function withEntryQuery(
  query: Exclude<LinkHref, string>["query"],
  entry: Record<string, string>,
): Exclude<LinkHref, string>["query"] {
  if (typeof query === "string") {
    const params = new URLSearchParams(query);
    for (const [name, value] of Object.entries(entry)) params.set(name, value);
    return params.toString();
  }
  return { ...(query ?? {}), ...entry };
}

type LinkHref = ComponentProps<typeof Link>["href"];

/**
 * What `TenantLink` takes as `href`: a path, or a URL object without an
 * origin (`{ pathname, query, hash }`). A `URL` instance is refused, by the
 * type (it has `href`) and at run time: its origin cannot be judged on the
 * server, so it could reach this site without the prefix (council round 1,
 * A13). A link to another site is a plain `<a>`.
 */
export type TenantLinkHref =
  string | (Exclude<LinkHref, string> & { href?: never });

function prefixLinkHref(
  href: LinkHref,
  toHref: (href: string) => string,
  scope: DocumentScope | null,
): LinkHref {
  if (typeof href === "string") return toHref(href);
  if (href instanceof URL) {
    throw new TypeError(
      "TenantLink does not take a URL object: pass the path of a page on this site, or use <a> for another site.",
    );
  }
  if (typeof href.pathname !== "string") return href;
  const pathname = withTenantAddress(
    scope?.addressPrefix ?? null,
    href.pathname,
  );
  // Into Web Studio on this site only: an object that names a host or a
  // protocol leaves it (JC3).
  const entry =
    !href.host &&
    !href.hostname &&
    !href.protocol &&
    isWebStudioPagePath(pathname)
      ? webStudioEntryQuery(scope)
      : null;
  if (!entry) return { ...href, pathname };
  // next/link prefers a `search` to a `query`.
  if (typeof href.search === "string") {
    const search = new URLSearchParams(href.search);
    for (const [name, value] of Object.entries(entry)) search.set(name, value);
    return { ...href, pathname, search: `?${search.toString()}` };
  }
  return { ...href, pathname, query: withEntryQuery(href.query, entry) };
}

/**
 * The path a link goes to, which is all that decides whether it crosses the
 * segment's boundary; its query and fragment do not. The address itself is
 * read from the rendered anchor when the link is followed.
 */
function linkPathname(href: LinkHref): string | null {
  if (typeof href === "string") return href;
  return typeof href.pathname === "string" ? href.pathname : null;
}

/**
 * The address the anchor points to, as next/link formatted it and the
 * browser resolved it, as a path on this site; null when it is on another
 * origin, which the browser follows by itself. Not a second formatting of
 * an object href, which got a fragment without its `#`, a query given as a
 * string and a `search` wrong (council round 2, AR4).
 */
function anchorAddress(anchor: HTMLAnchorElement): string | null {
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Whether the current task has begun loading another document for a
 * crossing. In that task a `refresh()` would render the old address again
 * on the old document: on a sign-in screen, a soft redirect into the segment
 * that the guard blanks, and server renders for nothing (council round 2,
 * AR3). Every caller calls `replace(target); refresh();` in one task, so the
 * mark lasts only that task and is cleared by the next: a document that is
 * still here afterwards (a cancelled `beforeunload` prompt, Stop, a 204 or a
 * download, a back-forward cache restore) keeps a working `refresh()`
 * (council round 3, AR14).
 */
let crossingLoadBegun = false;

/**
 * Loads `address` as a new document for a crossing, and marks the current
 * task so that `useTenantRouter`'s `refresh` does nothing in it. Exported for
 * the one other router that begins crossings, Payload's router adapter in
 * Web Studio, whose `push(outside); refresh()` must not render the current
 * page again on the document that is going away (council on the joined
 * release, JC8).
 */
export function loadCrossing(address: string, replace: boolean): void {
  if (!crossingLoadBegun) {
    crossingLoadBegun = true;
    setTimeout(() => {
      crossingLoadBegun = false;
    }, 0);
  }
  loadDocument(address, { replace });
}

/**
 * `next/link` with the document's tenant prefix on internal page addresses.
 * A link that crosses the app's segment boundary (a tenant's, or the donor
 * portal's path) loads its address as a new document instead of a
 * client-side transition, and is not prefetched. A modifier key, another
 * button and a `target` are left to the browser.
 */
export function TenantLink({
  href,
  children,
  onClick,
  prefetch,
  replace,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: TenantLinkHref }) {
  const toHref = useTenantHref();
  const scope = useDocumentScope();
  const crosses = useCrossesSegment();
  const prefixed = prefixLinkHref(href, toHref, scope);
  const pathname = linkPathname(prefixed);
  const crossing = pathname !== null && crosses(pathname);
  return (
    <Link
      href={prefixed}
      prefetch={crossing ? false : prefetch}
      replace={replace}
      onClick={(event) => {
        onClick?.(event);
        if (!crossing || event.defaultPrevented || !isPlainClick(event)) {
          return;
        }
        const address = anchorAddress(event.currentTarget);
        if (address === null) return;
        event.preventDefault();
        loadCrossing(address, replace === true);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

type AppRouter = ReturnType<typeof useRouter>;

/**
 * `useRouter` whose `push`, `replace` and `prefetch` carry the prefix. A
 * target across the app's segment boundary is loaded as a new document, and
 * not prefetched; once such a load has begun, `refresh` does nothing.
 */
export function useTenantRouter(): AppRouter {
  const router = useRouter();
  const toHref = useTenantHref();
  const crosses = useCrossesSegment();
  return useMemo(
    () => ({
      ...router,
      push: (href, ...options) => {
        const target = toHref(href);
        if (crosses(target)) loadCrossing(target, false);
        else router.push(target, ...options);
      },
      replace: (href, ...options) => {
        const target = toHref(href);
        if (crosses(target)) loadCrossing(target, true);
        else router.replace(target, ...options);
      },
      prefetch: (href, ...options) => {
        const target = toHref(href);
        if (!crosses(target)) router.prefetch(target, ...options);
      },
      refresh: () => {
        if (!crossingLoadBegun) router.refresh();
      },
    }),
    [router, toHref, crosses],
  );
}

/**
 * The pathname the page files see. `usePathname()` returns the address,
 * prefix included, so active-navigation tests compare this instead.
 */
export function useRoutePathname(): string {
  return stripTenantAddress(usePathname() ?? "/");
}
