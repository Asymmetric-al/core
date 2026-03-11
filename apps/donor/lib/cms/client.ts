import { headers } from "next/headers";

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  updatedAt?: string;
};

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
  const payload = await fetchCmsJSON<{ page: CmsPage }>(
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
