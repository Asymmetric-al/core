import { clientEnv } from "@asym/env";

import { DEFAULT_SITE_URL, siteConfigShared } from "./site-shared";

const resolvedSiteUrl =
  clientEnv.NEXT_PUBLIC_SITE_URL ||
  clientEnv.NEXT_PUBLIC_APP_URL ||
  DEFAULT_SITE_URL;

export const siteConfig = {
  ...siteConfigShared,
  url: resolvedSiteUrl,
  verification: {
    google: undefined as string | undefined,
    bing: undefined as string | undefined,
    yandex: undefined as string | undefined,
  },
} as const;

export type SiteConfig = typeof siteConfig;

export const brandConfig = {
  name: siteConfig.name,
  shortName: siteConfig.shortName,
  tagline: siteConfig.tagline,
  logo: siteConfig.logo,
};
