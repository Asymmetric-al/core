import { describe, expect, it } from "vitest";

import {
  buildPublishedReadCacheTags,
  isValidPublicCacheTag,
  PUBLIC_CACHE_TAG_MAX_BYTES,
  PUBLIC_CONTENT_CACHE_LIFE_PROFILE,
  publicCollectionCacheTag,
  publicDocumentCacheTag,
  publicLocaleCacheTag,
  publicSiteCacheTag,
  publicTenantCacheTag,
} from "../../src/cms/public/cache-tags";
import {
  buildCheckoutHandoff,
  CHECKOUT_HANDOFF_PARAM_NAMES,
  checkoutHandoffSearchParams,
  DEFAULT_CHECKOUT_PARTY_KIND,
  PUBLIC_CHECKOUT_ENTRY_METHOD,
} from "../../src/cms/public/checkout-handoff";
import { isResolvedPublicRequest } from "../../src/cms/public/context";
import {
  clampPublishedUpdatesLimit,
  PUBLIC_PAGE_TYPES,
  PUBLISHED_UPDATES_DEFAULT_LIMIT,
  PUBLISHED_UPDATES_MAX_LIMIT,
} from "../../src/cms/public/reader";

import type { PublicRequestContext } from "../../src/cms/public/context";
import type {
  PublicPageTypeConfig,
  PublishedContentReader,
} from "../../src/cms/public/reader";

/**
 * Type-contract tests (Phase 5 #522): the reader/serializer/cache/handoff
 * signatures accept the PublicRequestContext and carry every reserved seam —
 * siteId, site_id/source_code/currency/locale/entry_method, the Phase 7
 * pass-through fields, and party_kind (never party_type).
 */

const context: PublicRequestContext = {
  operationalTenantId: "tenant-op-1",
  cmsTenantId: 7,
  siteId: null,
};

describe("PublicRequestContext", () => {
  it("carries the reserved siteId and both tenant ids", () => {
    expect(context.siteId).toBeNull();
    expect(context.operationalTenantId).toBe("tenant-op-1");
    expect(context.cmsTenantId).toBe(7);
  });

  it("narrows fail-closed resolutions", () => {
    expect(isResolvedPublicRequest({ status: "site-not-found" })).toBe(false);
    expect(isResolvedPublicRequest({ status: "resolved", context })).toBe(true);
  });
});

describe("checkout handoff contract", () => {
  it("defaults party_kind to 'person' and entry_method to public_checkout", () => {
    const handoff = buildCheckoutHandoff({
      target: { missionaryId: "mis_1" },
      suggestedAmount: "50",
    });

    expect(handoff.partyKind).toBe(DEFAULT_CHECKOUT_PARTY_KIND);
    expect(handoff.partyKind).toBe("person");
    expect(handoff.orgType).toBeNull();
    expect(handoff.attribution.entryMethod).toBe(PUBLIC_CHECKOUT_ENTRY_METHOD);
    expect(handoff.attribution.siteId).toBeNull();
    expect(handoff.attribution.sourceCode).toBeNull();
    expect(handoff.attribution.currency).toBeNull();
    expect(handoff.attribution.locale).toBeNull();
    expect(handoff.tribute).toEqual({
      tributeType: null,
      honoree: null,
      notifyPartyReference: null,
    });
    expect(handoff.intent).toEqual({
      dafIntent: null,
      matchingIntent: null,
      employerIntent: null,
    });
  });

  it("serializes populated reserved fields under their reserved wire names", () => {
    const handoff = buildCheckoutHandoff({
      target: { fundId: "fund_1" },
      suggestedAmount: "100",
      suggestedFrequency: "monthly",
      attribution: {
        siteId: "site_1",
        sourceCode: "spring-appeal",
        currency: "USD",
        locale: "en-US",
      },
      tribute: {
        tributeType: "memorial",
        honoree: "Jane",
        notifyPartyReference: "party_5",
      },
      intent: {
        dafIntent: "yes",
        matchingIntent: "employer",
        employerIntent: "acme",
      },
      partyKind: "organization",
      orgType: "church",
    });

    const params = checkoutHandoffSearchParams(handoff);

    expect(params.get("fund_id")).toBe("fund_1");
    expect(params.get("amount")).toBe("100");
    expect(params.get("frequency")).toBe("monthly");
    expect(params.get("site_id")).toBe("site_1");
    expect(params.get("source_code")).toBe("spring-appeal");
    expect(params.get("currency")).toBe("USD");
    expect(params.get("locale")).toBe("en-US");
    expect(params.get("entry_method")).toBe("public_checkout");
    expect(params.get("tribute_type")).toBe("memorial");
    expect(params.get("honoree")).toBe("Jane");
    expect(params.get("notify_party_ref")).toBe("party_5");
    expect(params.get("daf_intent")).toBe("yes");
    expect(params.get("matching_intent")).toBe("employer");
    expect(params.get("employer_intent")).toBe("acme");
    expect(params.get("party_kind")).toBe("organization");
    expect(params.get("org_type")).toBe("church");
  });

  it("never emits a party_type parameter (Phase 9 C2 amendment)", () => {
    const handoff = buildCheckoutHandoff({ partyKind: "person" });
    const params = checkoutHandoffSearchParams(handoff);

    expect(params.has("party_type")).toBe(false);
    expect(Object.values(CHECKOUT_HANDOFF_PARAM_NAMES)).not.toContain(
      "party_type",
    );
    expect(Object.keys(CHECKOUT_HANDOFF_PARAM_NAMES)).not.toContain(
      "partyType",
    );
  });

  it("omits unpopulated reserved params so today's wire matches the shipped checkout contract", () => {
    const handoff = buildCheckoutHandoff({ target: { missionaryId: "mis_1" } });
    const params = checkoutHandoffSearchParams(handoff);

    expect([...params.keys()].sort()).toEqual(
      ["entry_method", "missionary_id", "party_kind"].sort(),
    );
  });
});

describe("cache-tag scheme", () => {
  it("derives tenant, collection, and document tags from the context argument", () => {
    expect(publicTenantCacheTag(context)).toBe("public-cms:tenant:7");
    expect(publicCollectionCacheTag(context, "pages")).toBe(
      "public-cms:tenant:7:collection:pages",
    );
    expect(publicDocumentCacheTag(context, "pages", "abc")).toBe(
      "public-cms:tenant:7:collection:pages:doc:abc",
    );
  });

  it("keeps every produced tag comma-free, lowercase, and byte-bounded", () => {
    const hostileContext: PublicRequestContext = {
      operationalTenantId: "tenant-op-1",
      cmsTenantId: "Tenant, With Spaces 💥".repeat(20),
      siteId: "SITE, one",
    };

    const tags = buildPublishedReadCacheTags({
      context: hostileContext,
      collection: "Missionary, Giving Pages",
      documentId: "DOC, 1",
      locale: "EN, US",
    });

    for (const tag of tags) {
      expect(isValidPublicCacheTag(tag)).toBe(true);
      expect(new TextEncoder().encode(tag).length).toBeLessThanOrEqual(
        PUBLIC_CACHE_TAG_MAX_BYTES,
      );
    }
  });

  it("neutralizes the ':' delimiter so no input can forge another tenant's tag structure", () => {
    const forgingContext: PublicRequestContext = {
      operationalTenantId: "tenant-op-1",
      cmsTenantId: "7:collection:pages",
      siteId: null,
    };

    const forgedAttempt = publicTenantCacheTag(forgingContext);
    const legitimateCollectionTag = publicCollectionCacheTag(
      { operationalTenantId: "tenant-op-2", cmsTenantId: 7, siteId: null },
      "pages",
    );

    // The hostile tenant id collapses to a single segment — it can never
    // equal the structured collection tag of the real tenant 7.
    expect(forgedAttempt).toBe("public-cms:tenant:7-collection-pages");
    expect(forgedAttempt).not.toBe(legitimateCollectionTag);
    expect(isValidPublicCacheTag(forgedAttempt)).toBe(true);
    expect(isValidPublicCacheTag("public-cms:tenant:se:cr:et")).toBe(true);
    expect(isValidPublicCacheTag("public-cms:tenant:")).toBe(false);
    expect(isValidPublicCacheTag("public-cms:tenant:UPPER")).toBe(false);
    expect(isValidPublicCacheTag("public-cms:tenant:a,b")).toBe(false);
  });

  it("includes the reserved site/locale dimensions only when populated", () => {
    const withoutReserved = buildPublishedReadCacheTags({
      context,
      collection: "pages",
    });
    expect(withoutReserved).toEqual([
      "public-cms:tenant:7",
      "public-cms:tenant:7:collection:pages",
    ]);

    const siteContext: PublicRequestContext = { ...context, siteId: "site1" };
    const withReserved = buildPublishedReadCacheTags({
      context: siteContext,
      collection: "pages",
      documentId: 5,
      locale: "en-us",
    });
    expect(withReserved).toContain("public-cms:site:site1");
    expect(withReserved).toContain("public-cms:locale:en-us");

    expect(publicSiteCacheTag(context)).toBeNull();
    expect(publicLocaleCacheTag(null)).toBeNull();
  });

  it("names a bounded cacheLife profile (never 'never')", () => {
    expect(PUBLIC_CONTENT_CACHE_LIFE_PROFILE).toBe("public-content");
  });
});

describe("reader contract", () => {
  it("clamps the updates limit into [1, max] with a default", () => {
    expect(clampPublishedUpdatesLimit(undefined)).toBe(
      PUBLISHED_UPDATES_DEFAULT_LIMIT,
    );
    expect(clampPublishedUpdatesLimit(Number.NaN)).toBe(
      PUBLISHED_UPDATES_DEFAULT_LIMIT,
    );
    expect(clampPublishedUpdatesLimit(0)).toBe(1);
    expect(clampPublishedUpdatesLimit(-5)).toBe(1);
    expect(clampPublishedUpdatesLimit(7.9)).toBe(7);
    expect(clampPublishedUpdatesLimit(999)).toBe(PUBLISHED_UPDATES_MAX_LIMIT);
  });

  it("ships the three page types as configuration over shared primitives", () => {
    expect(PUBLIC_PAGE_TYPES["page"]?.collection).toBe("pages");
    expect(PUBLIC_PAGE_TYPES["missionary-giving-page"]).toEqual({
      key: "missionary-giving-page",
      collection: "missionary-giving-pages",
      lookupField: "missionaryId",
      operationalReferenceKind: "missionary",
    });
    expect(PUBLIC_PAGE_TYPES["project-page"]?.operationalReferenceKind).toBe(
      "fund",
    );
  });

  it("admits a new page type as pure configuration — no interface change", () => {
    // Compile-level proof: a later page type is only a new config object.
    const eventPage = {
      key: "event-page",
      collection: "event-pages",
      lookupField: "slug",
      operationalReferenceKind: "event",
    } satisfies PublicPageTypeConfig;

    expect(eventPage.operationalReferenceKind).toBe("event");
  });

  it("accepts the PublicRequestContext on every reader operation", async () => {
    // Compile-level proof that the interface signatures take the context and
    // return the fail-closed result unions.
    const reader: PublishedContentReader = {
      async getPublishedPage(ctx, query) {
        expect(ctx.siteId).toBeNull();
        expect(query.pageType).toBe("page");
        return { status: "not-found" };
      },
      async getNavigation() {
        return {
          status: "found",
          navigation: null,
          tenant: { slug: null },
        };
      },
      async getUpdates(_ctx, query) {
        expect(clampPublishedUpdatesLimit(query?.limit)).toBe(5);
        return { status: "found", updates: [], tenant: { slug: "t" } };
      },
    };

    const page = await reader.getPublishedPage(context, {
      pageType: "page",
      key: "home",
    });
    expect(page.status).toBe("not-found");

    const navigation = await reader.getNavigation(context);
    expect(navigation.status).toBe("found");

    const updates = await reader.getUpdates(context, {});
    expect(updates.status).toBe("found");
  });
});
