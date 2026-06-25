"use client";

import { RouterAdapterContext } from "@payloadcms/ui";
import Link from "next/link";
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation.js";
import React from "react";

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
    <React.Suspense fallback={null}>
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
