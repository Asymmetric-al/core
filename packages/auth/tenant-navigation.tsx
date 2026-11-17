"use client";

import { reloadDocument } from "@asym/database/document-reload";
import {
  DocumentScopeProvider,
  useDocumentScope,
  type DocumentScope,
} from "@asym/database/document-scope";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import {
  parseTenantAddress,
  stripTenantAddress,
  withTenantAddress,
} from "./tenant-address";

import type { ComponentProps, ReactNode } from "react";

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
  if (mismatch && isAtLoadedAddress(addressPrefix)) {
    throw new TenantScopeMismatchError(addressPrefix, scope.addressPrefix);
  }

  useEffect(() => {
    if (mismatch) reloadDocument();
  }, [mismatch]);

  if (mismatch) return null;
  return (
    <DocumentScopeProvider scope={scope}>
      {/* What the end-to-end suites read; it renders nothing visible. */}
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
 * Whether the address prefix is the one the document was loaded at: always
 * on the server, which renders the requested address; in the browser, from
 * the navigation timing entry. Where the browser cannot say, it answers no,
 * so the guard reloads rather than throws.
 */
function isAtLoadedAddress(addressPrefix: string | null): boolean {
  if (typeof window === "undefined") return true;
  try {
    const [entry] = performance.getEntriesByType("navigation");
    if (!entry) return false;
    const loaded = parseTenantAddress(new URL(entry.name).pathname);
    return (loaded?.prefix ?? null) === addressPrefix;
  } catch {
    return false;
  }
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

function prefixLinkHref(
  href: LinkHref,
  toHref: (href: string) => string,
): LinkHref {
  if (typeof href === "string") return toHref(href);
  if (href instanceof URL) return href;
  if (typeof href.pathname !== "string") return href;
  return { ...href, pathname: toHref(href.pathname) };
}

/** `next/link` with the document's tenant prefix on internal page addresses. */
export function TenantLink({
  href,
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const toHref = useTenantHref();
  return (
    <Link href={prefixLinkHref(href, toHref)} {...props}>
      {children}
    </Link>
  );
}

type AppRouter = ReturnType<typeof useRouter>;

/** `useRouter` whose `push`, `replace` and `prefetch` carry the prefix. */
export function useTenantRouter(): AppRouter {
  const router = useRouter();
  const toHref = useTenantHref();
  return useMemo(
    () => ({
      ...router,
      push: (href, ...options) => router.push(toHref(href), ...options),
      replace: (href, ...options) => router.replace(toHref(href), ...options),
      prefetch: (href, ...options) => router.prefetch(toHref(href), ...options),
    }),
    [router, toHref],
  );
}

/**
 * The pathname the page files see. `usePathname()` returns the address,
 * prefix included, so active-navigation tests compare this instead.
 */
export function useRoutePathname(): string {
  return stripTenantAddress(usePathname() ?? "/");
}
