import { headers } from "next/headers";

import type { PublicCmsPage } from "@asym/lib/cms/public-page";

/** @deprecated Use `PublicCmsPage` from `@asym/lib/cms/public-page` */
export type CmsPage = PublicCmsPage;

function normalizeSlugSegments(slugSegments: string[]) {
  return slugSegments.map((segment) => segment.trim()).filter(Boolean);
}

export function buildPublicCmsPagePath(slugSegments: string[]) {
  const normalizedSegments = normalizeSlugSegments(slugSegments);
  const pageSlug = normalizedSegments.length
    ? normalizedSegments.map((segment) => encodeURIComponent(segment)).join("/")
    : "home";

  return `/api/cms/public/pages/${pageSlug}`;
}

function getCmsBaseUrl() {
  return process.env.CMS_BASE_URL ?? "http://127.0.0.1:3030";
}

async function getForwardedHost(hostOverride?: string) {
  if (hostOverride) {
    return hostOverride;
  }

  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3005"
  );
}

async function fetchCmsJSON<T>(
  path: string,
  hostOverride?: string,
): Promise<T | null> {
  const cmsURL = getCmsBaseUrl();
  const tenantHost = await getForwardedHost(hostOverride);

  try {
    const response = await fetch(`${cmsURL}${path}`, {
      headers: {
        "x-forwarded-host": tenantHost,
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPublishedCmsPage(
  slugSegments: string[],
  hostOverride?: string,
) {
  const payload = await fetchCmsJSON<{ page: PublicCmsPage }>(
    buildPublicCmsPagePath(slugSegments),
    hostOverride,
  );

  return payload?.page ?? null;
}

export async function fetchPublishedCmsUpdates(
  limit = 5,
  hostOverride?: string,
) {
  const payload = await fetchCmsJSON<{
    updates: Array<Record<string, unknown>>;
  }>(`/api/cms/public/updates?limit=${limit}`, hostOverride);

  return payload?.updates ?? [];
}

export async function fetchPublishedMissionaryGivingPage(
  missionaryId: string,
  hostOverride?: string,
) {
  const encoded = encodeURIComponent(missionaryId.trim());
  const payload = await fetchCmsJSON<{ page: PublicCmsPage }>(
    `/api/cms/public/missionary-pages/${encoded}`,
    hostOverride,
  );

  return payload?.page ?? null;
}

export async function fetchPublishedProjectPage(
  slug: string,
  hostOverride?: string,
) {
  const segments = slug
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const encoded = segments.map((s) => encodeURIComponent(s)).join("/");
  const payload = await fetchCmsJSON<{ page: PublicCmsPage }>(
    `/api/cms/public/project-pages/${encoded}`,
    hostOverride,
  );

  return payload?.page ?? null;
}
