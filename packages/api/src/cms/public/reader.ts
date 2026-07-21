import type { PublicRequestContext } from "./context";
import type {
  SerializedPublicNavigation,
  SerializedPublicPage,
  SerializedPublicTenantSummary,
  SerializedPublicUpdate,
} from "./serialized";

/**
 * The published-content reader — the sole entry for public content (Phase 5
 * (Public Website Runtime Contract), rulings A3/A4/A5; ADR-0027/ADR-0028).
 *
 * This package defines the interface and serialized result shapes only. The
 * single Payload-touching implementation lives co-located with Payload in
 * `apps/admin` (#523); it takes the resolved tenant (and reserved site) as a
 * required argument through {@link PublicRequestContext}, always applies the
 * tenant-and-published constraint, runs with `overrideAccess: false` under
 * the public-read policy, and returns empty on an unresolved tenant.
 */

/**
 * A public page type is configuration over the shared primitives (ruling
 * A14): the collection, lookup field, and operational-reference kind are
 * parameters. Adding a later page type (project, event, campaign) is a new
 * config entry plus a renderer — never an interface or serializer change.
 */
export type PublicPageTypeConfig = {
  /** Stable key callers pass to {@link PublishedContentReader.getPublishedPage}. */
  key: string;
  /** CMS collection slug the page type reads from. */
  collection: string;
  /** Document field matched against the query key (for example `slug`). */
  lookupField: string;
  /**
   * The kind of operational record the page references (`missionary`,
   * `fund`, …) or `null` for standalone content pages. Reference resolution
   * and validation against the resolved tenant happen at read time (A7).
   */
  operationalReferenceKind: string | null;
};

/** The page types shipped today. Later phases extend this record — only. */
export const PUBLIC_PAGE_TYPES: Readonly<Record<string, PublicPageTypeConfig>> =
  {
    page: {
      key: "page",
      collection: "pages",
      lookupField: "slug",
      operationalReferenceKind: null,
    },
    "missionary-giving-page": {
      key: "missionary-giving-page",
      collection: "missionary-giving-pages",
      lookupField: "missionaryId",
      operationalReferenceKind: "missionary",
    },
    "project-page": {
      key: "project-page",
      collection: "project-pages",
      lookupField: "slug",
      operationalReferenceKind: "fund",
    },
  };

export type PublishedPageQuery = {
  /** A key of {@link PUBLIC_PAGE_TYPES} (or a later registered config). */
  pageType: string;
  /** The lookup value for the page type's `lookupField` (slug, missionary id, …). */
  key: string;
};

export type PublishedUpdatesQuery = {
  /** Clamped to [1, {@link PUBLISHED_UPDATES_MAX_LIMIT}]; defaults to {@link PUBLISHED_UPDATES_DEFAULT_LIMIT}. */
  limit?: number;
};

export const PUBLISHED_UPDATES_DEFAULT_LIMIT = 5;
export const PUBLISHED_UPDATES_MAX_LIMIT = 20;

export function clampPublishedUpdatesLimit(limit: number | undefined): number {
  if (limit === undefined || Number.isNaN(limit)) {
    return PUBLISHED_UPDATES_DEFAULT_LIMIT;
  }

  const floored = Math.floor(limit);
  return Math.min(Math.max(floored, 1), PUBLISHED_UPDATES_MAX_LIMIT);
}

/**
 * Result unions are fail-closed: there is no arm that carries unfiltered or
 * draft content. `unavailable` covers transient reader/transport failures so
 * pages can degrade the affected element instead of leaking an error shape.
 */
export type PublishedPageResult =
  | {
      status: "found";
      page: SerializedPublicPage;
      tenant: SerializedPublicTenantSummary;
    }
  | { status: "bad-request"; error: string }
  | { status: "not-found" }
  | { status: "unavailable"; error: string };

export type PublishedNavigationResult =
  | {
      status: "found";
      /** `null` when the tenant has not configured navigation yet. */
      navigation: SerializedPublicNavigation | null;
      tenant: SerializedPublicTenantSummary;
    }
  | { status: "unavailable"; error: string };

export type PublishedUpdatesResult =
  | {
      status: "found";
      updates: SerializedPublicUpdate[];
      tenant: SerializedPublicTenantSummary;
    }
  | { status: "unavailable"; error: string };

/**
 * The sole entry for public content. Interface growth is additive
 * (listing/detail operations for events and campaigns arrive as new methods,
 * never as changes to these signatures).
 *
 * BINDING on the implementation (#523): rich-text fields (`content`,
 * rich-text block `body`) pass through the serializer as Lexical JSON, so
 * the reader must not let populated Payload documents ride inside them —
 * read rich text at depth 0, or strip/reduce populated `upload` and
 * `relationship` node values to ids/public URLs before serialization.
 */
export interface PublishedContentReader {
  getPublishedPage(
    context: PublicRequestContext,
    query: PublishedPageQuery,
  ): Promise<PublishedPageResult>;
  getNavigation(
    context: PublicRequestContext,
  ): Promise<PublishedNavigationResult>;
  getUpdates(
    context: PublicRequestContext,
    query?: PublishedUpdatesQuery,
  ): Promise<PublishedUpdatesResult>;
}
