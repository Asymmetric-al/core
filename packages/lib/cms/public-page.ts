/**
 * JSON shape for `page` in public CMS read APIs (`/api/cms/public/pages/*`, etc.).
 * Keep additive fields backward compatible for donor consumers.
 */
export type PublicCmsPage = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: unknown;
  layout?: unknown;
  pageType?: string | null;
  missionaryId?: string | null;
  fundId?: string | null;
  legacyContentFallback?: boolean | null;
  updatedAt?: string;
};

export type PublicCmsPageDescriptor =
  | {
      kind: "page";
      slugSegments?: readonly string[];
    }
  | {
      kind: "missionary-giving-page";
      missionaryId: string;
    }
  | {
      kind: "project-page";
      slug: string;
    };

export type PublicCmsTenantSummary = {
  slug: string | null;
};

export type PublicCmsPublishedPagePayload = {
  page: PublicCmsPage;
  tenant: PublicCmsTenantSummary;
};

export type PublicCmsPageReadResult =
  | (PublicCmsPublishedPagePayload & {
      status: "found";
      statusCode: 200;
    })
  | {
      status: "bad-request";
      statusCode: 400;
      error: string;
    }
  | {
      status: "not-found" | "tenant-not-found";
      statusCode: 404;
      error: string;
    }
  | {
      status: "unavailable";
      statusCode: number;
      error: string;
    };

export type PublicCmsReadCachePolicy = {
  revalidate: 60;
  tags: string[];
};

const PUBLIC_CMS_REVALIDATE_SECONDS = 60;
const SAFE_PUBLIC_CMS_HREF_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
]);

export function normalizePublicCmsLookupValue(value: string | undefined) {
  const rawValue = value ?? "";

  try {
    return decodeURIComponent(rawValue).trim();
  } catch {
    return rawValue.trim();
  }
}

export function normalizePublicCmsPageSlug(segments: readonly string[] = []) {
  const normalizedSegments = segments
    .map((segment) => normalizePublicCmsLookupValue(segment))
    .filter(Boolean);

  return normalizedSegments.join("/") || "home";
}

export function buildPublicCmsReadPath(descriptor: PublicCmsPageDescriptor) {
  switch (descriptor.kind) {
    case "page": {
      const slug = normalizePublicCmsPageSlug(descriptor.slugSegments);
      return `/api/cms/public/pages/${encodePathSegments(slug)}`;
    }
    case "missionary-giving-page":
      return `/api/cms/public/missionary-pages/${encodeURIComponent(
        normalizePublicCmsLookupValue(descriptor.missionaryId),
      )}`;
    case "project-page":
      return `/api/cms/public/project-pages/${encodeURIComponent(
        normalizePublicCmsLookupValue(descriptor.slug),
      )}`;
  }
}

export function getPublicCmsDescriptorError(
  descriptor: PublicCmsPageDescriptor,
): string | null {
  switch (descriptor.kind) {
    case "page":
      return null;
    case "missionary-giving-page":
      return normalizePublicCmsLookupValue(descriptor.missionaryId)
        ? null
        : "Missionary id required";
    case "project-page":
      return normalizePublicCmsLookupValue(descriptor.slug)
        ? null
        : "Slug required";
  }
}

export function buildPublicCmsReadCachePolicy(
  descriptor: PublicCmsPageDescriptor,
  tenantHost?: string | null,
): PublicCmsReadCachePolicy {
  const tags = ["public-cms"];
  const host = normalizePublicCmsHost(tenantHost);

  if (host) {
    tags.push(`public-cms:host:${host}`);
  }

  tags.push(
    `public-cms:${descriptor.kind}:${descriptorCacheToken(descriptor)}`,
  );

  return {
    revalidate: PUBLIC_CMS_REVALIDATE_SECONDS,
    tags,
  };
}

export function sanitizePublicCmsHref(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    return null;
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return SAFE_PUBLIC_CMS_HREF_PROTOCOLS.has(parsed.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

export function buildGivingCheckoutHref({
  missionaryId,
  fundId,
  amount,
  frequency,
}: {
  missionaryId?: string | null;
  fundId?: string | null;
  amount?: string | number | null;
  frequency?: string | null;
}) {
  const params = new URLSearchParams();
  const normalizedMissionaryId = normalizePublicCmsLookupValue(
    missionaryId ?? undefined,
  );
  const normalizedFundId = normalizePublicCmsLookupValue(fundId ?? undefined);

  if (normalizedMissionaryId) {
    params.set("missionary_id", normalizedMissionaryId);
  }

  if (normalizedFundId) {
    params.set("fund_id", normalizedFundId);
  }

  const normalizedAmount =
    typeof amount === "number"
      ? String(amount)
      : typeof amount === "string"
        ? amount.trim()
        : "";
  if (normalizedAmount) {
    params.set("amount", normalizedAmount);
  }

  const normalizedFrequency =
    typeof frequency === "string" ? frequency.trim() : "";
  if (normalizedFrequency) {
    params.set("frequency", normalizedFrequency);
  }

  const suffix = params.toString();
  return suffix ? `/checkout?${suffix}` : "/checkout";
}

export function resolvePublicCmsCtaHref({
  rawHref,
  pageType,
  missionaryId,
  fundId,
}: {
  rawHref?: unknown;
  pageType?: string | null;
  missionaryId?: string | null;
  fundId?: string | null;
}) {
  if (pageType === "missionary_giving" && missionaryId) {
    return buildGivingCheckoutHref({ missionaryId });
  }

  if (pageType === "project" && fundId) {
    return buildGivingCheckoutHref({ fundId });
  }

  return sanitizePublicCmsHref(rawHref);
}

export function isPublicCmsPublishedPagePayload(
  value: unknown,
): value is PublicCmsPublishedPagePayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    page?: unknown;
    tenant?: unknown;
  };

  return isPublicCmsPage(candidate.page) && isPublicCmsTenant(candidate.tenant);
}

function isPublicCmsPage(value: unknown): value is PublicCmsPage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const page = value as PublicCmsPage;
  return (
    typeof page.id === "string" &&
    typeof page.title === "string" &&
    typeof page.slug === "string"
  );
}

function isPublicCmsTenant(value: unknown): value is PublicCmsTenantSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const tenant = value as PublicCmsTenantSummary;
  return tenant.slug === null || typeof tenant.slug === "string";
}

function normalizePublicCmsHost(host: string | null | undefined) {
  if (!host) {
    return null;
  }

  return host.replace(/:\d+$/, "").toLowerCase();
}

function descriptorCacheToken(descriptor: PublicCmsPageDescriptor) {
  switch (descriptor.kind) {
    case "page":
      return encodeURIComponent(
        normalizePublicCmsPageSlug(descriptor.slugSegments),
      );
    case "missionary-giving-page":
      return encodeURIComponent(
        normalizePublicCmsLookupValue(descriptor.missionaryId),
      );
    case "project-page":
      return encodeURIComponent(normalizePublicCmsLookupValue(descriptor.slug));
  }
}

function encodePathSegments(path: string) {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
