"use client";

import {
  appPathname,
  loadDocument,
  withAppBasePath,
} from "@asym/database/document-reload";
import {
  forgetDocumentReload,
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

function loadedSegment(): string | null | undefined {
  const pathname = loadedPathname();
  if (pathname === undefined) return undefined;
  return parseTenantAddress(pathname)?.prefix ?? null;
}

function loadedPathname(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const [entry] = performance.getEntriesByType("navigation");
    if (!entry) return undefined;
    return appPathname(new URL(entry.name).pathname);
  } catch {
    return undefined;
  }
}

const SegmentContext = createContext<{
  documentSegment: string | null | undefined;
  segmentOf: (pathname: string) => string | null;
} | null>(null);

function tenantSegmentOf(pathname: string): string | null {
  if (isWebStudioPagePath(pathname)) return WEB_STUDIO_SEGMENT.name;
  const address = parseTenantAddress(pathname);
  if (address) return address.prefix;
  return isOutsideTenantSegment(pathname) ? null : "unprefixed";
}

function addressSegmentOf(pathname: string): string | null {
  if (isWebStudioPagePath(pathname)) return WEB_STUDIO_SEGMENT.name;
  return parseTenantAddress(pathname)?.prefix ?? null;
}

function loadedAddressSegment(): string | null | undefined {
  const pathname = loadedPathname();
  return pathname === undefined ? undefined : addressSegmentOf(pathname);
}

export function TenantSegmentBoundary({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      documentSegment: loadedAddressSegment(),
      segmentOf: tenantSegmentOf,
    }),
    [],
  );
  const [crossed, setCrossed] = useState(false);
  return (
    <SegmentContext.Provider value={value}>
      <Suspense fallback={null}>
        <SegmentCrossingWatcher
          documentSegment={value.documentSegment}
          onCrossed={setCrossed}
        />
      </Suspense>
      {crossed ? <ScopeReloadNotice /> : children}
    </SegmentContext.Provider>
  );
}

function SegmentCrossingWatcher({
  documentSegment,
  onCrossed,
}: {
  documentSegment: string | null | undefined;
  onCrossed: (crossed: true) => void;
}) {
  const addressSegment = addressSegmentOf(usePathname() ?? "/");
  const crossed =
    documentSegment !== undefined && addressSegment !== documentSegment;
  useEffect(() => {
    if (crossed) onCrossed(true);
  }, [crossed, onCrossed]);
  return null;
}

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

export function ReloadAcrossSegment() {
  return <ScopeReloadNotice />;
}

function targetSegment(
  href: string,
  segmentOf: (pathname: string) => string | null,
): string | null | undefined {
  if (!href.startsWith("/") || href.startsWith("//")) return undefined;
  return segmentOf(href.split(/[?#]/)[0] || "/");
}

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
  if (mismatch && neverFixedScope() && isAtLoadedAddress(addressPrefix)) {
    throw new TenantScopeMismatchError(addressPrefix, scope.addressPrefix);
  }
  const enteredWithoutLoad =
    !mismatch && neverFixedScope() && loadedElsewhere(scope.addressPrefix);
  const reload = mismatch || enteredWithoutLoad;
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!reload) {
      forgetDocumentReload();
      return;
    }
    if (!requestDocumentReload()) setStuck(true);
  }, [reload]);

  if (stuck) {
    throw new TenantScopeMismatchError(addressPrefix, scope.addressPrefix);
  }
  if (reload) return <ScopeReloadNotice requestReload={false} />;
  return (
    <DocumentScopeProvider scope={scope}>
      <span
        hidden
        data-tenant-scope={scope.addressPrefix}
        data-tenant-assignment={scope.assignmentId}
      />
      {children}
    </DocumentScopeProvider>
  );
}

function neverFixedScope(): boolean {
  return !isDocumentScopeFixed();
}

function isAtLoadedAddress(addressPrefix: string | null): boolean {
  if (typeof window === "undefined") return true;
  const loaded = loadedSegment();
  return loaded !== undefined && loaded === addressPrefix;
}

function loadedElsewhere(prefix: string): boolean {
  if (typeof window === "undefined") return false;
  const loaded = loadedSegment();
  return loaded !== undefined && loaded !== prefix;
}

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
  const entry =
    !href.host &&
    !href.hostname &&
    !href.protocol &&
    isWebStudioPagePath(pathname)
      ? webStudioEntryQuery(scope)
      : null;
  if (!entry) return { ...href, pathname };
  if (typeof href.search === "string") {
    const search = new URLSearchParams(href.search);
    for (const [name, value] of Object.entries(entry)) search.set(name, value);
    return { ...href, pathname, search: `?${search.toString()}` };
  }
  return { ...href, pathname, query: withEntryQuery(href.query, entry) };
}

function linkPathname(href: LinkHref): string | null {
  if (typeof href === "string") return href;
  return typeof href.pathname === "string" ? href.pathname : null;
}

function anchorAddress(anchor: HTMLAnchorElement): string | null {
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

let crossingLoadBegun = false;

export function loadCrossing(address: string, replace: boolean): void {
  if (!crossingLoadBegun) {
    crossingLoadBegun = true;
    setTimeout(() => {
      crossingLoadBegun = false;
    }, 0);
  }
  loadDocument(address, { replace });
}

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

export function useTenantRouter(): AppRouter {
  const router = useRouter();
  const toHref = useTenantHref();
  const crosses = useCrossesSegment();
  return useMemo(
    () => ({
      ...router,
      push: (href, ...options) => {
        const target = toHref(href);
        if (crosses(target)) loadCrossing(withAppBasePath(target), false);
        else router.push(target, ...options);
      },
      replace: (href, ...options) => {
        const target = toHref(href);
        if (crosses(target)) loadCrossing(withAppBasePath(target), true);
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

export function useRoutePathname(): string {
  return stripTenantAddress(usePathname() ?? "/");
}
