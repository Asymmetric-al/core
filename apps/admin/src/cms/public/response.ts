import { NextResponse } from "next/server";

import type {
  CmsPublicErrorCode,
  CmsPublicNavigation,
  CmsPublicPage,
  CmsPublicUpdate,
  CmsTenantSummary,
} from "@asym/api/cms/public";

type TenantDoc = {
  id: number | string;
  slug?: string | null;
};

type NavigationDoc = {
  id: number | string;
  label?: unknown;
  items?: unknown;
};

type PageDoc = {
  id: number | string;
  title?: unknown;
  slug?: unknown;
  summary?: unknown;
  content?: unknown;
  updatedAt?: unknown;
};

type UpdateDoc = {
  id: number | string;
  slug?: unknown;
  title?: unknown;
  excerpt?: unknown;
  publishedAt?: unknown;
};

function applyPublicCmsHeaders(response: NextResponse) {
  // Host-based tenant resolution is request-specific, so keep this API uncached
  // until there is an explicit cross-app invalidation strategy.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Vary", "x-forwarded-host, host");
  return response;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function normalizeRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Expected "${fieldName}" to be a non-empty string.`);
  }

  return value;
}

function normalizeId(value: number | string) {
  return String(value);
}

export function createPublicCmsJsonResponse(body: unknown, status = 200) {
  return applyPublicCmsHeaders(NextResponse.json(body, { status }));
}

export function createPublicCmsErrorResponse(
  status: number,
  code: CmsPublicErrorCode,
  message: string,
) {
  return createPublicCmsJsonResponse(
    {
      error: {
        code,
        message,
      },
    },
    status,
  );
}

export function toCmsTenantSummary(tenant: TenantDoc): CmsTenantSummary {
  return {
    id: normalizeId(tenant.id),
    slug: normalizeOptionalString(tenant.slug),
  };
}

export function toCmsPublicNavigation(
  navigation: NavigationDoc,
): CmsPublicNavigation {
  const items = Array.isArray(navigation.items) ? navigation.items : [];

  return {
    id: normalizeId(navigation.id),
    label: normalizeRequiredString(navigation.label, "navigation.label"),
    items: items.map((item, index) => {
      const typedItem =
        item && typeof item === "object"
          ? (item as {
              href?: unknown;
              label?: unknown;
              openInNewTab?: unknown;
            })
          : null;

      return {
        href: normalizeRequiredString(
          typedItem?.href,
          `navigation.items[${index}].href`,
        ),
        label: normalizeRequiredString(
          typedItem?.label,
          `navigation.items[${index}].label`,
        ),
        openInNewTab: typedItem?.openInNewTab === true,
      };
    }),
  };
}

export function toCmsPublicPage(page: PageDoc): CmsPublicPage {
  return {
    id: normalizeId(page.id),
    title: normalizeRequiredString(page.title, "page.title"),
    slug: normalizeRequiredString(page.slug, "page.slug"),
    summary: normalizeOptionalString(page.summary),
    content: page.content ?? null,
    updatedAt: normalizeOptionalString(page.updatedAt),
  };
}

export function toCmsPublicUpdate(update: UpdateDoc): CmsPublicUpdate {
  return {
    id: normalizeId(update.id),
    slug: normalizeRequiredString(update.slug, "update.slug"),
    title: normalizeRequiredString(update.title, "update.title"),
    excerpt: normalizeOptionalString(update.excerpt),
    publishedAt: normalizeOptionalString(update.publishedAt),
  };
}
