"use client";

import { loadDocument, reloadDocument } from "@asym/database/document-reload";
import {
  DocumentScopeProvider,
  isDocumentScopeFixed,
  useDocumentScope,
  type DocumentScope,
} from "@asym/database/document-scope";
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
 * a tenant document (sign-in, the chooser, the donor portal) they leave every
 * address as it is.
 */

/**
 * The segment of the address the document was loaded at: a tenant address
 * prefix, sub-role suffix included, or `null` outside the tenant segment;
 * `undefined` where the browser cannot say. Read from the navigation timing
 * entry, which names the address the document was loaded at whatever the
 * client router did since. Browser only.
 */
function loadedSegment(): string | null | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const [entry] = performance.getEntriesByType("navigation");
    if (!entry) return undefined;
    return parseTenantAddress(new URL(entry.name).pathname)?.prefix ?? null;
  } catch {
    return undefined;
  }
}

/** Present only in an app whose signed-in pages live under the tenant address. */
const SegmentContext = createContext<{
  documentSegment: string | null | undefined;
} | null>(null);

/**
 * Makes every navigation that crosses the boundary of the tenant segment a
 * document load (council round 1 ruling; plan 5.2: one scope for each
 * document, fixed at load). Mission Control's and the missionary workspace's
 * root layouts render it around the whole app.
 *
 * Crossing means: into the segment from outside, out of it, and from one
 * tenant or sub-role to another. Inside one tenant's segment, and between two
 * pages outside it, navigation stays soft. Three things hold the rule:
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
  const value = useMemo(() => ({ documentSegment: loadedSegment() }), []);
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
  const addressSegment =
    parseTenantAddress(usePathname() ?? "/")?.prefix ?? null;
  const crossed =
    documentSegment !== undefined && addressSegment !== documentSegment;
  useEffect(() => {
    if (crossed) reloadDocument();
  }, [crossed]);
  return null;
}

/**
 * Rendered where a document loaded outside the workspace finds itself
 * showing a workspace page: nothing, and a new document for the address.
 */
export function ReloadAcrossSegment() {
  useEffect(() => {
    reloadDocument();
  }, []);
  return null;
}

/** The segment of a navigation target, or `undefined` for one the browser handles as it is. */
function targetSegment(href: string): string | null | undefined {
  if (!href.startsWith("/") || href.startsWith("//")) return undefined;
  const pathname = href.split(/[?#]/)[0] || "/";
  const address = parseTenantAddress(pathname);
  if (address) return address.prefix;
  // An unprefixed page address inside the segment: the proxy puts it under
  // the person's prefix, so it is in a segment other than "outside".
  return isOutsideTenantSegment(pathname) ? null : "unprefixed";
}

/**
 * Whether going to `href` (already prefixed for this document) crosses the
 * tenant segment's boundary. Never in an app with no tenant segment.
 */
function useCrossesSegment(): (href: string) => boolean {
  const segment = useContext(SegmentContext);
  return useCallback(
    (href: string) => {
      if (!segment || segment.documentSegment === undefined) return false;
      const target = targetSegment(href);
      return target !== undefined && target !== segment.documentSegment;
    },
    [segment],
  );
}

/** A left click with no modifier on a link that opens in this window. */
function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  const target = event.currentTarget.getAttribute("target");
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    (!target || target === "_self")
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
    if (!reload) {
      forgetReload();
    } else if (claimReload()) {
      reloadDocument();
    } else {
      setStuck(true);
    }
  }, [reload]);

  if (stuck) {
    throw new TenantScopeMismatchError(addressPrefix, scope.addressPrefix);
  }
  if (reload) return null;
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

/** This tab's memory of the reload `TenantDocument` already tried. */
const RELOAD_CLAIM = "asym:tenant-document-reload";
/** How long a reload of the same address counts as the one already tried. */
const RELOAD_CLAIM_MS = 30_000;

/**
 * Claims this tab's one reload of the current address: `false` when a
 * reload of it was already tried within the last half minute and no document
 * has rendered since, which would make another one a loop. Without session
 * storage a tab cannot remember the reload, so it does not reload (a person
 * whose browser refuses storage cannot sign in either).
 */
function claimReload(): boolean {
  const href = window.location.href;
  const now = Date.now();
  try {
    const raw = window.sessionStorage.getItem(RELOAD_CLAIM);
    const last = raw
      ? (JSON.parse(raw) as { href?: unknown; at?: unknown })
      : null;
    if (
      last &&
      last.href === href &&
      typeof last.at === "number" &&
      now - last.at < RELOAD_CLAIM_MS
    ) {
      return false;
    }
    window.sessionStorage.setItem(
      RELOAD_CLAIM,
      JSON.stringify({ href, at: now }),
    );
    return true;
  } catch {
    return false;
  }
}

/** A document rendered: a later reload of any address is a new one. */
function forgetReload(): void {
  try {
    window.sessionStorage.removeItem(RELOAD_CLAIM);
  } catch {
    // Nothing was remembered.
  }
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

/** Adds the document's tenant prefix to an internal page address. */
export function useTenantHref(): (href: string) => string {
  const prefix = useDocumentScope()?.addressPrefix ?? null;
  return useCallback(
    (href: string) => withTenantAddress(prefix, href),
    [prefix],
  );
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
): LinkHref {
  if (typeof href === "string") return toHref(href);
  if (href instanceof URL) {
    throw new TypeError(
      "TenantLink does not take a URL object: pass the path of a page on this site, or use <a> for another site.",
    );
  }
  if (typeof href.pathname !== "string") return href;
  return { ...href, pathname: toHref(href.pathname) };
}

/** The address a link goes to, as a string, when it is a path on this site. */
function linkTarget(href: LinkHref): string | null {
  if (typeof href === "string") return href;
  if (href instanceof URL) return null;
  if (typeof href.pathname !== "string") return null;
  const query =
    href.query && typeof href.query === "object"
      ? new URLSearchParams(
          Object.entries(href.query).flatMap(([key, value]) =>
            value == null
              ? []
              : (Array.isArray(value) ? value : [value]).map(
                  (item) => [key, String(item)] as [string, string],
                ),
          ),
        ).toString()
      : "";
  return `${href.pathname}${query ? `?${query}` : ""}${href.hash ?? ""}`;
}

/**
 * `next/link` with the document's tenant prefix on internal page addresses.
 * A link that crosses the tenant segment's boundary loads its address as a
 * new document instead of a client-side transition, and is not prefetched.
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
  const crosses = useCrossesSegment();
  const prefixed = prefixLinkHref(href, toHref);
  const target = linkTarget(prefixed);
  const crossing = target !== null && crosses(target);
  return (
    <Link
      href={prefixed}
      prefetch={crossing ? false : prefetch}
      replace={replace}
      onClick={(event) => {
        onClick?.(event);
        if (crossing && !event.defaultPrevented && isPlainClick(event)) {
          event.preventDefault();
          loadDocument(target, { replace: replace === true });
        }
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
 * target across the tenant segment's boundary is loaded as a new document,
 * and not prefetched.
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
        if (crosses(target)) loadDocument(target, { replace: false });
        else router.push(target, ...options);
      },
      replace: (href, ...options) => {
        const target = toHref(href);
        if (crosses(target)) loadDocument(target, { replace: true });
        else router.replace(target, ...options);
      },
      prefetch: (href, ...options) => {
        const target = toHref(href);
        if (!crosses(target)) router.prefetch(target, ...options);
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
