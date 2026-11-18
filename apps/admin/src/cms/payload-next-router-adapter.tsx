"use client";

import {
  TenantLink,
  useRoutePathname,
  useTenantRouter,
} from "@asym/auth/tenant-navigation";
import { RouterAdapterContext } from "@payloadcms/ui";
import {
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import React from "react";

import { StudioFlowLoading } from "../cms-ui/web-studio/flows/studio-flow-loading";

import type { RouterAdapterContextValue } from "@payloadcms/ui";
import type { LinkAdapterProps } from "payload";

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
    <TenantLink
      href={href}
      prefetch={prefetch}
      ref={ref}
      replace={replace}
      scroll={scroll}
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
      push: nextRouter.push,
      refresh: nextRouter.refresh,
      replace: nextRouter.replace,
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
