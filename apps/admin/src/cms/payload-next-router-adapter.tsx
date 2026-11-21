"use client";

import {
  TenantLink,
  useRoutePathname,
  useTenantRouter,
} from "@asym/auth/tenant-navigation";
import { isWebStudioPagePath } from "@asym/auth/web-studio";
import { RouterAdapterContext } from "@payloadcms/ui";
import {
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import React from "react";

import { loadDocument } from "./web-studio-document-load";
import { StudioFlowLoading } from "../cms-ui/web-studio/flows/studio-flow-loading";

import type { RouterAdapterContextValue } from "@payloadcms/ui";
import type { LinkAdapterProps } from "payload";

/**
 * Whether Payload may reach `href` by a client navigation: only a Web Studio
 * page of this origin. The organization chooser, Mission Control and every
 * other address load a new document, so switching organization or leaving
 * Web Studio never keeps the old organization's page, even when Payload's
 * leave-without-saving dialog turns a link click into a push (AL-2675,
 * council C1 and C12).
 *
 * `href` is resolved against the live address, as the browser resolves it:
 * Payload's list search, sort and paging and its bulk actions replace the
 * query alone (`?page=2`), which stays on the page (council round 2, CR1).
 * A Web Studio page is `isWebStudioPagePath`'s, the one test the tenant
 * boundary and the document's scope use too (council on the joined release,
 * JC1).
 */
export function isWebStudioPageAddress(href: string, current: string): boolean {
  let url: URL;
  let here: URL;
  try {
    here = new URL(current);
    url = new URL(href, here);
  } catch {
    return false;
  }
  return url.origin === here.origin && isWebStudioPagePath(url.pathname);
}

/**
 * A left click with no modifier on a link that opens in this window and is
 * not a download: the click the browser would otherwise follow in this tab,
 * as next/link itself decides.
 */
function isPlainClick(event: React.MouseEvent<HTMLAnchorElement>): boolean {
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

/**
 * Payload's links. They load a document wherever its router does (council on
 * the joined release, JC1): a link to the organization chooser, to Mission
 * Control or to a REST route is never a client navigation, whatever the
 * address looks like, because the decision is the router's own test of the
 * address the anchor resolved. A link to another origin is the browser's.
 */
const NextLinkAdapter: React.FC<LinkAdapterProps> = ({
  children,
  href,
  onClick,
  prefetch,
  ref,
  replace,
  scroll,
  ...rest
}) => {
  return (
    <TenantLink
      href={href}
      prefetch={prefetch}
      ref={ref}
      replace={replace}
      scroll={scroll}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainClick(event)) return;
        const url = new URL(event.currentTarget.href);
        if (url.origin !== window.location.origin) return;
        if (isWebStudioPageAddress(url.href, window.location.href)) return;
        event.preventDefault();
        loadDocument(`${url.pathname}${url.search}${url.hash}`, {
          replace: replace === true,
        });
      }}
      {...rest}
    >
      {children}
    </TenantLink>
  );
};

export const NextRouterAdapter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <React.Suspense fallback={<StudioFlowLoading />}>
      <NextRouterAdapterProvider>{children}</NextRouterAdapterProvider>
    </React.Suspense>
  );
};

function NextRouterAdapterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Web Studio is outside the tenant segment: the helpers act as the Next.js
  // originals here, and a link or push to Mission Control loads a new
  // document (AL-2675; council round 1, A10).
  const nextRouter = useTenantRouter();
  const pathname = useRoutePathname();
  const searchParams = useNextSearchParams();
  const nextParams = useNextParams();

  const router = React.useMemo<RouterAdapterContextValue["router"]>(
    () => ({
      back: nextRouter.back,
      push: (href, options) =>
        isWebStudioPageAddress(href, window.location.href)
          ? nextRouter.push(href, options)
          : loadDocument(href, { replace: false }),
      refresh: nextRouter.refresh,
      replace: (href, options) =>
        isWebStudioPageAddress(href, window.location.href)
          ? nextRouter.replace(href, options)
          : loadDocument(href, { replace: true }),
    }),
    [nextRouter],
  );
  const params = React.useMemo(() => normalizeParams(nextParams), [nextParams]);

  const value = React.useMemo<RouterAdapterContextValue>(
    () => ({
      Link: NextLinkAdapter,
      params,
      pathname,
      router,
      searchParams,
    }),
    [params, pathname, router, searchParams],
  );

  return <RouterAdapterContext value={value}>{children}</RouterAdapterContext>;
}

function normalizeParams(
  params: ReturnType<typeof useNextParams>,
): RouterAdapterContextValue["params"] {
  const normalized: RouterAdapterContextValue["params"] = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      normalized[key] = value;
      continue;
    }

    if (
      Array.isArray(value) &&
      value.every((entry) => typeof entry === "string")
    ) {
      normalized[key] = value;
    }
  }

  return normalized;
}
