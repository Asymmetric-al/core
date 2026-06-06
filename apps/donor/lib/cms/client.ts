import {
  buildPublicCmsReadCachePolicy,
  buildPublicCmsReadPath,
  getPublicCmsDescriptorError,
  isPublicCmsPublishedPagePayload,
} from "@asym/lib/cms/public-page";
import { headers } from "next/headers";

import type {
  PublicCmsPage,
  PublicCmsPageDescriptor,
  PublicCmsPageReadResult,
} from "@asym/lib/cms/public-page";

/** @deprecated Use `PublicCmsPage` from `@asym/lib/cms/public-page` */
export type CmsPage = PublicCmsPage;

export function buildPublicCmsPagePath(slugSegments: string[]) {
  return buildPublicCmsReadPath({ kind: "page", slugSegments });
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
        tags: buildGenericPublicCmsCacheTags(tenantHost),
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

export async function fetchPublishedCmsPageResult(
  slugSegments: string[],
  hostOverride?: string,
) {
  return fetchPublishedCmsPageLikeResult(
    { kind: "page", slugSegments },
    hostOverride,
  );
}

export async function fetchPublishedCmsPage(
  slugSegments: string[],
  hostOverride?: string,
) {
  const result = await fetchPublishedCmsPageResult(slugSegments, hostOverride);

  return result.status === "found" ? result.page : null;
}

export type PublishedCmsPageRouteState =
  | {
      status: "found";
      page: PublicCmsPage;
    }
  | {
      status: "not-found";
    }
  | {
      status: "unavailable";
      error: string;
    };

export function resolvePublishedCmsPageRouteState(
  result: PublicCmsPageReadResult,
): PublishedCmsPageRouteState {
  if (result.status === "found") {
    return {
      status: "found",
      page: result.page,
    };
  }

  if (result.status === "unavailable") {
    return {
      status: "unavailable",
      error: result.error,
    };
  }

  return { status: "not-found" };
}

export async function fetchPublishedCmsUpdates(
  limit = 5,
  hostOverride?: string,
) {
  const payload = await fetchCmsJSON<unknown>(
    `/api/cms/public/updates?limit=${limit}`,
    hostOverride,
  );

  return readPublicCmsUpdates(payload);
}

export async function fetchPublishedMissionaryGivingPage(
  missionaryId: string,
  hostOverride?: string,
) {
  const result = await fetchPublishedMissionaryGivingPageResult(
    missionaryId,
    hostOverride,
  );

  return result.status === "found" ? result.page : null;
}

export async function fetchPublishedMissionaryGivingPageResult(
  missionaryId: string,
  hostOverride?: string,
) {
  return fetchPublishedCmsPageLikeResult(
    { kind: "missionary-giving-page", missionaryId },
    hostOverride,
  );
}

export async function fetchPublishedProjectPage(
  slug: string,
  hostOverride?: string,
) {
  const result = await fetchPublishedProjectPageResult(slug, hostOverride);

  return result.status === "found" ? result.page : null;
}

export async function fetchPublishedProjectPageResult(
  slug: string,
  hostOverride?: string,
) {
  return fetchPublishedCmsPageLikeResult(
    { kind: "project-page", slug },
    hostOverride,
  );
}

async function fetchPublishedCmsPageLikeResult(
  descriptor: PublicCmsPageDescriptor,
  hostOverride?: string,
): Promise<PublicCmsPageReadResult> {
  const descriptorError = getPublicCmsDescriptorError(descriptor);
  if (descriptorError) {
    return {
      status: "bad-request",
      statusCode: 400,
      error: descriptorError,
    };
  }

  const cmsURL = getCmsBaseUrl();
  const tenantHost = await getForwardedHost(hostOverride);
  const path = buildPublicCmsReadPath(descriptor);

  try {
    const response = await fetch(`${cmsURL}${path}`, {
      headers: {
        "x-forwarded-host": tenantHost,
      },
      next: buildPublicCmsReadCachePolicy(descriptor, tenantHost),
    });

    return cmsReadResultFromResponse(response);
  } catch {
    return {
      status: "unavailable",
      statusCode: 503,
      error: "CMS unavailable",
    };
  }
}

async function cmsReadResultFromResponse(
  response: Response,
): Promise<PublicCmsPageReadResult> {
  const body = await response.json().catch(() => null);

  if (response.ok) {
    if (!isPublicCmsPublishedPagePayload(body)) {
      return {
        status: "unavailable",
        statusCode: 502,
        error: "Invalid CMS response",
      };
    }

    return {
      status: "found",
      statusCode: 200,
      page: body.page,
      tenant: body.tenant,
    };
  }

  const error = readCmsError(body);

  if (response.status === 400) {
    return {
      status: "bad-request",
      statusCode: 400,
      error,
    };
  }

  if (response.status === 404) {
    return {
      status: error === "Tenant not found" ? "tenant-not-found" : "not-found",
      statusCode: 404,
      error,
    };
  }

  return {
    status: "unavailable",
    statusCode: response.status,
    error,
  };
}

function readCmsError(body: unknown) {
  if (body && typeof body === "object" && "error" in body) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return "Failed to fetch page content";
}

function readPublicCmsUpdates(value: unknown) {
  if (!value || typeof value !== "object") {
    return [];
  }

  const updates = (value as { updates?: unknown }).updates;
  if (!Array.isArray(updates)) {
    return [];
  }

  return updates.filter(isPublicCmsUpdateRecord);
}

function isPublicCmsUpdateRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildGenericPublicCmsCacheTags(tenantHost: string) {
  const host = tenantHost.replace(/:\d+$/, "").toLowerCase();
  return host ? ["public-cms", `public-cms:host:${host}`] : ["public-cms"];
}
