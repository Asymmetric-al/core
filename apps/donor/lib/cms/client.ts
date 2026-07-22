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
  PublicCmsReadCachePolicy,
} from "@asym/lib/cms/public-page";

/** @deprecated Use `PublicCmsPage` from `@asym/lib/cms/public-page` */
export type CmsPage = PublicCmsPage;

export function buildPublicCmsPagePath(slugSegments: string[]) {
  return buildPublicCmsReadPath({ kind: "page", slugSegments });
}

/**
 * The CMS origin the donor app reads public content from — and the origin
 * serialized relative media URLs resolve against (issue #529). The dev
 * default matches `scripts/cms/public-media-remote-pattern.mjs`.
 */
export function getPublicCmsBaseUrl() {
  return process.env.CMS_BASE_URL ?? "http://127.0.0.1:3030";
}

function getCmsBaseUrl() {
  return getPublicCmsBaseUrl();
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

type PublicCmsUpdate = Record<string, unknown>;

export type PublicCmsUpdatesReadResult =
  | {
      status: "found";
      statusCode: 200;
      updates: PublicCmsUpdate[];
    }
  | {
      status: "unavailable";
      statusCode: number;
      error: string;
    };

type PublicCmsJsonReadResult =
  | {
      status: "ok";
      statusCode: number;
      body: unknown;
    }
  | {
      status: "error";
      statusCode: number;
      error: string;
    };

async function fetchPublicCmsJSON(
  path: string,
  hostOverride: string | undefined,
  buildCachePolicy: (tenantHost: string) => PublicCmsReadCachePolicy,
): Promise<PublicCmsJsonReadResult> {
  const cmsURL = getCmsBaseUrl();
  const tenantHost = await getForwardedHost(hostOverride);

  try {
    const response = await fetch(`${cmsURL}${path}`, {
      headers: {
        "x-forwarded-host": tenantHost,
      },
      next: buildCachePolicy(tenantHost),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: "error",
        statusCode: response.status,
        error: readCmsError(body),
      };
    }

    return {
      status: "ok",
      statusCode: response.status,
      body,
    };
  } catch {
    return {
      status: "error",
      statusCode: 503,
      error: "CMS unavailable",
    };
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
  const result = await fetchPublishedCmsUpdatesResult(limit, hostOverride);

  return result.status === "found" ? result.updates : [];
}

export async function fetchPublishedCmsUpdatesResult(
  limit = 5,
  hostOverride?: string,
): Promise<PublicCmsUpdatesReadResult> {
  const result = await fetchPublicCmsJSON(
    `/api/cms/public/updates?limit=${limit}`,
    hostOverride,
    buildPublicCmsUpdatesCachePolicy,
  );

  if (result.status === "error") {
    return {
      status: "unavailable",
      statusCode: result.statusCode,
      error: result.error,
    };
  }

  const updates = readPublicCmsUpdates(result.body);

  if (!updates) {
    return {
      status: "unavailable",
      statusCode: 502,
      error: "Invalid CMS response",
    };
  }

  return {
    status: "found",
    statusCode: 200,
    updates,
  };
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

  const path = buildPublicCmsReadPath(descriptor);
  const result = await fetchPublicCmsJSON(path, hostOverride, (tenantHost) =>
    buildPublicCmsReadCachePolicy(descriptor, tenantHost),
  );

  return cmsReadResultFromJsonResult(result);
}

function cmsReadResultFromJsonResult(
  result: PublicCmsJsonReadResult,
): PublicCmsPageReadResult {
  if (result.status === "ok") {
    if (!isPublicCmsPublishedPagePayload(result.body)) {
      return {
        status: "unavailable",
        statusCode: 502,
        error: "Invalid CMS response",
      };
    }

    return {
      status: "found",
      statusCode: 200,
      page: result.body.page,
      tenant: result.body.tenant,
    };
  }

  if (result.statusCode === 400) {
    return {
      status: "bad-request",
      statusCode: 400,
      error: result.error,
    };
  }

  if (result.statusCode === 404) {
    return {
      status:
        result.error === "Tenant not found" ? "tenant-not-found" : "not-found",
      statusCode: 404,
      error: result.error,
    };
  }

  return {
    status: "unavailable",
    statusCode: result.statusCode,
    error: result.error,
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
    return null;
  }

  const updates = (value as { updates?: unknown }).updates;
  if (!Array.isArray(updates)) {
    return null;
  }

  return updates.filter(isPublicCmsUpdateRecord);
}

function isPublicCmsUpdateRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function buildPublicCmsUpdatesCachePolicy(
  tenantHost: string,
): PublicCmsReadCachePolicy {
  return {
    revalidate: 60,
    tags: buildGenericPublicCmsCacheTags(tenantHost),
  };
}

function buildGenericPublicCmsCacheTags(tenantHost: string) {
  const host = tenantHost.replace(/:\d+$/, "").toLowerCase();
  return host ? ["public-cms", `public-cms:host:${host}`] : ["public-cms"];
}
