import { serverEnv } from "@asym/env";

import { DEFAULT_SITE_URL, siteConfigShared } from "./site-shared";

const resolvedSiteUrl =
  serverEnv.NEXT_PUBLIC_SITE_URL ||
  serverEnv.NEXT_PUBLIC_APP_URL ||
  DEFAULT_SITE_URL;

export const siteConfig = {
  ...siteConfigShared,
  url: resolvedSiteUrl,
  verification: {
    google: serverEnv.GOOGLE_SITE_VERIFICATION,
    bing: serverEnv.BING_SITE_VERIFICATION,
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
