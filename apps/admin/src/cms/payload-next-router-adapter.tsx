"use client";

import {
  isWebStudioApiPath,
  isWebStudioPath,
  WEB_STUDIO_CHOOSER_PATH,
} from "@asym/auth/web-studio";
import { RouterAdapterContext } from "@payloadcms/ui";
import Link from "next/link";
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
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
  return (
    url.origin === here.origin &&
    isWebStudioPath(url.pathname) &&
    !isWebStudioApiPath(url.pathname) &&
    url.pathname !== WEB_STUDIO_CHOOSER_PATH &&
    !url.pathname.startsWith(`${WEB_STUDIO_CHOOSER_PATH}/`)
  );
}

const NextLinkAdapter: React.FC<LinkAdapterProps> = ({
  children,
  href,
  prefetch,
  ref,
  replace,
  scroll,
  ...rest
}) => {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      ref={ref}
      replace={replace}
      scroll={scroll}
      {...rest}
    >
      {children}
    </Link>
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
  const nextRouter = useNextRouter();
  const pathname = useNextPathname();
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
