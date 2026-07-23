import {
  PUBLIC_PAGE_TYPES,
  clampPublishedUpdatesLimit,
  serializePublicNavigation,
  serializePublicPage,
  serializePublicUpdate,
} from "@asym/api/cms/public";

import {
  buildPublicReadRequestContext,
  getPublicCollectionCapability,
  isBlankTenantId,
} from "../access/public-read";

import type {
  PublicRequestContext,
  PublishedContentReader,
  PublishedNavigationResult,
  PublishedPageQuery,
  PublishedPageResult,
  PublishedUpdatesQuery,
  PublishedUpdatesResult,
  SerializedPublicTenantSummary,
} from "@asym/api/cms/public";
import type { Payload, Where } from "payload";

/**
 * The one concrete `PublishedContentReader` — the public-content choke-point
 * (Phase 5 (Public Website Runtime Contract), rulings A4/A5; ADR-0027/0028;
 * issue #523). This module is the ONLY place a public code path may touch
 * Payload's Local API; the sole-entry CI lint
 * (`scripts/verify/cms-public-sole-entry.mjs`) enforces that.
 *
 * Safety is by construction, in layers:
 *
 * 1. The resolved tenant arrives as a required typed argument
 *    ({@link PublicRequestContext}); a blank tenant returns empty and runs no
 *    query at all — "no tenant → serve nothing", never "serve everyone".
 * 2. Every read carries the explicit tenant-and-published `where` constraint.
 * 3. Every read runs `overrideAccess: false` under the public-read access
 *    policy (`../access/public-read`), tagged via the request-context marker,
 *    so Payload independently enforces "resolved tenant + published only"
 *    even if a `where` clause here were ever wrong.
 * 4. Results pass through the package allowlist serializer — raw Payload
 *    documents never leave this module.
 */

type ReaderPayloadClient = Pick<Payload, "find">;

const EMPTY_TENANT_SUMMARY: SerializedPublicTenantSummary = { slug: null };

/**
 * The one degraded result the reader ever reports: store failures never leak
 * their shape (connection strings, hosts, driver errors) into a public
 * response.
 */
const UNAVAILABLE_RESULT = {
  status: "unavailable",
  error: "Published content is temporarily unavailable",
} as const;

/**
 * Rich-text fields (`content`, rich-text block `body`) pass through the
 * allowlist serializer as Lexical JSON — the one intentional pass-through.
 * The reader is contractually bound (#522 README/reader contract) to keep
 * populated Payload documents out of that pass-through: any `upload` /
 * `relationship` node whose `value` was depth-populated into a full document
 * is reduced back to its id before serialization.
 */
function stripPopulatedRichTextNodes(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripPopulatedRichTextNodes);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const node = value as Record<string, unknown>;
  const entries = Object.entries(node).map(([key, child]) => {
    if (
      key === "value" &&
      (node.type === "upload" || node.type === "relationship") &&
      child &&
      typeof child === "object" &&
      !Array.isArray(child)
    ) {
      const id = (child as Record<string, unknown>).id;
      return [
        key,
        typeof id === "string" || typeof id === "number" ? id : null,
      ] as const;
    }
    return [key, stripPopulatedRichTextNodes(child)] as const;
  });

  return Object.fromEntries(entries);
}

function sanitizeRichTextPassThroughs(
  doc: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...doc };

  if (sanitized.content !== undefined) {
    sanitized.content = stripPopulatedRichTextNodes(sanitized.content);
  }
  if (Array.isArray(sanitized.layout)) {
    sanitized.layout = sanitized.layout.map((block) => {
      if (
        block &&
        typeof block === "object" &&
        (block as Record<string, unknown>).blockType === "rich-text"
      ) {
        const richText = block as Record<string, unknown>;
        return {
          ...richText,
          body: stripPopulatedRichTextNodes(richText.body),
        };
      }
      return block;
    });
  }

  return sanitized;
}

function publicWhere(
  collection: string,
  context: PublicRequestContext,
  extra: Where[] = [],
): Where {
  const constraints: Where[] = [
    { tenant: { equals: context.cmsTenantId } },
    ...extra,
  ];
  if (getPublicCollectionCapability(collection)?.draftable) {
    constraints.push({ _status: { equals: "published" } });
  }
  return { and: constraints };
}

export function createPayloadPublishedContentReader(
  payload: ReaderPayloadClient,
): PublishedContentReader {
  async function findPublic(
    collection: string,
    context: PublicRequestContext,
    options: { limit: number; sort: string; extraWhere?: Where[] },
  ) {
    const result = await payload.find({
      collection: collection as never,
      limit: options.limit,
      overrideAccess: false,
      pagination: false,
      sort: options.sort,
      context: buildPublicReadRequestContext({
        cmsTenantId: context.cmsTenantId,
      }),
      where: publicWhere(collection, context, options.extraWhere),
    });

    return result.docs as unknown as Record<string, unknown>[];
  }

  /**
   * Policy-checked tenant lookup: exists AND active, enforced by the
   * `tenants` public-read access arm as well as this explicit filter. A
   * missing or disabled tenant reads as "no tenant" — serve nothing.
   */
  async function findTenantSummary(
    context: PublicRequestContext,
  ): Promise<SerializedPublicTenantSummary | null> {
    const result = await payload.find({
      collection: "tenants" as never,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      context: buildPublicReadRequestContext({
        cmsTenantId: context.cmsTenantId,
      }),
      where: {
        and: [
          { id: { equals: context.cmsTenantId } },
          { isActive: { equals: true } },
        ],
      },
    });

    const tenant = result.docs[0] as Record<string, unknown> | undefined;
    if (!tenant) {
      return null;
    }

    return { slug: typeof tenant.slug === "string" ? tenant.slug : null };
  }

  return {
    async getPublishedPage(
      context: PublicRequestContext,
      query: PublishedPageQuery,
    ): Promise<PublishedPageResult> {
      const pageType = PUBLIC_PAGE_TYPES[query.pageType];
      if (!pageType) {
        return { status: "bad-request", error: "Unknown page type" };
      }

      const key = typeof query.key === "string" ? query.key.trim() : "";
      if (!key) {
        return { status: "bad-request", error: "Page identifier required" };
      }

      if (isBlankTenantId(context.cmsTenantId)) {
        return { status: "not-found" };
      }

      try {
        const tenant = await findTenantSummary(context);
        if (!tenant) {
          return { status: "not-found" };
        }

        const docs = await findPublic(pageType.collection, context, {
          limit: 1,
          sort: "-updatedAt",
          extraWhere: [{ [pageType.lookupField]: { equals: key } }],
        });

        const doc = docs[0];
        if (!doc) {
          return { status: "not-found" };
        }

        return {
          status: "found",
          page: serializePublicPage(sanitizeRichTextPassThroughs(doc)),
          tenant,
        };
      } catch {
        return UNAVAILABLE_RESULT;
      }
    },

    async getNavigation(
      context: PublicRequestContext,
    ): Promise<PublishedNavigationResult> {
      if (isBlankTenantId(context.cmsTenantId)) {
        return {
          status: "found",
          navigation: null,
          tenant: EMPTY_TENANT_SUMMARY,
        };
      }

      try {
        const tenant = await findTenantSummary(context);
        if (!tenant) {
          return {
            status: "found",
            navigation: null,
            tenant: EMPTY_TENANT_SUMMARY,
          };
        }

        const docs = await findPublic("navigation", context, {
          limit: 1,
          sort: "-updatedAt",
        });

        const doc = docs[0];
        return {
          status: "found",
          navigation: doc ? serializePublicNavigation(doc) : null,
          tenant,
        };
      } catch {
        return UNAVAILABLE_RESULT;
      }
    },

    async getUpdates(
      context: PublicRequestContext,
      query?: PublishedUpdatesQuery,
    ): Promise<PublishedUpdatesResult> {
      if (isBlankTenantId(context.cmsTenantId)) {
        return { status: "found", updates: [], tenant: EMPTY_TENANT_SUMMARY };
      }

      try {
        const tenant = await findTenantSummary(context);
        if (!tenant) {
          return {
            status: "found",
            updates: [],
            tenant: EMPTY_TENANT_SUMMARY,
          };
        }

        const docs = await findPublic("ministry-updates", context, {
          limit: clampPublishedUpdatesLimit(query?.limit),
          sort: "-publishedAt",
        });

        return {
          status: "found",
          updates: docs.map((doc) =>
            serializePublicUpdate(sanitizeRichTextPassThroughs(doc)),
          ),
          tenant,
        };
      } catch {
        return UNAVAILABLE_RESULT;
      }
    },
  };
}
