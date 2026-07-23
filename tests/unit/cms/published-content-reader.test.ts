import { beforeAll, describe, expect, it } from "vitest";

import { serializePublicPage } from "../../../packages/api/src/cms/public/serializer";

type ReaderModule =
  typeof import("../../../apps/admin/src/cms/public/published-content-reader");
type PublicReadPolicyModule =
  typeof import("../../../apps/admin/src/cms/access/public-read");
type ShippedSerializerModule =
  typeof import("../../../apps/admin/src/cms/public/serialize-published-page");
import type { PublicRequestContext } from "../../../packages/api/src/cms/public/context";

let PUBLIC_COLLECTION_CAPABILITIES: PublicReadPolicyModule["PUBLIC_COLLECTION_CAPABILITIES"];
let createPayloadPublishedContentReader: ReaderModule["createPayloadPublishedContentReader"];
let serializePublishedPageLike: ShippedSerializerModule["serializePublishedPageLike"];

beforeAll(async () => {
  const readerModule =
    await import("../../../apps/admin/src/cms/public/published-content-reader");
  createPayloadPublishedContentReader =
    readerModule.createPayloadPublishedContentReader;

  const policyModule =
    await import("../../../apps/admin/src/cms/access/public-read");
  PUBLIC_COLLECTION_CAPABILITIES = policyModule.PUBLIC_COLLECTION_CAPABILITIES;

  const shippedSerializerModule =
    await import("../../../apps/admin/src/cms/public/serialize-published-page");
  serializePublishedPageLike =
    shippedSerializerModule.serializePublishedPageLike;
});

const CMS_TENANT_ID = 7;

const TENANT_DOC = {
  id: CMS_TENANT_ID,
  slug: "give-hope-demo",
  isActive: true,
};

function context(
  overrides: Partial<PublicRequestContext> = {},
): PublicRequestContext {
  return {
    operationalTenantId: "00000000-0000-4000-8000-000000000001",
    cmsTenantId: CMS_TENANT_ID,
    siteId: null,
    ...overrides,
  };
}

type FindCall = Record<string, unknown>;

/**
 * A capturing fake Payload client. Docs are keyed by collection; every call
 * is recorded so tests can assert the exact query shape (overrideAccess,
 * context marker, where constraints) — the safety of this seam IS the query
 * shape.
 */
function fakePayload(
  docsByCollection: Partial<Record<string, unknown[]>> = {},
  options: { failWith?: Error } = {},
) {
  const calls: FindCall[] = [];
  return {
    calls,
    async find(args: FindCall) {
      calls.push(args);
      if (options.failWith && args.collection !== "tenants") {
        throw options.failWith;
      }
      return {
        docs: docsByCollection[args.collection as string] ?? [],
      };
    },
  };
}

function withTenant(docs: Partial<Record<string, unknown[]>>) {
  return { tenants: [TENANT_DOC], ...docs };
}

const PUBLISHED_PAGE_DOC = {
  id: "page-1",
  title: "Home",
  slug: "home",
  summary: "Welcome",
  content: { root: { type: "root" } },
  layout: [
    {
      id: "b1",
      blockType: "hero",
      blockName: null,
      eyebrow: "Hello",
      headline: "Give Hope",
      subheading: "Sub",
      backgroundImage: {
        id: 9,
        alt: "Alt",
        url: "/media/hero.jpg",
        sizes: {
          thumbnail: { url: "/media/t.jpg" },
          card: { url: "/media/c.jpg" },
        },
        width: 1200,
        height: 600,
        mimeType: "image/jpeg",
      },
      primaryCtaLabel: "Give",
      primaryCtaHref: "/give",
    },
    {
      id: "b2",
      blockType: "call-to-action",
      blockName: null,
      headline: "Act now",
      copy: "Copy",
      buttonLabel: "Go",
      buttonHref: "https://example.org/donate",
      openInNewTab: true,
    },
    {
      id: "b3",
      blockType: "rich-text",
      blockName: null,
      heading: "H",
      body: { r: 1 },
    },
    {
      id: "b4",
      blockType: "media-feature",
      blockName: null,
      title: "T",
      body: "B",
      media: 12,
      mediaCaption: "Cap",
    },
    {
      id: "b5",
      blockType: "faq",
      blockName: null,
      heading: "FAQ",
      items: [{ id: "q1", question: "Q?", answer: "A." }],
    },
    {
      id: "b6",
      blockType: "impact-stats",
      blockName: null,
      heading: "Impact",
      items: [{ id: "s1", value: "12", label: "Wells", description: null }],
    },
    {
      id: "b7",
      blockType: "testimonial",
      blockName: null,
      quote: "Great",
      attribution: "Someone",
    },
  ],
  pageType: null,
  missionaryId: null,
  fundId: null,
  legacyContentFallback: false,
  updatedAt: "2026-07-22T00:00:00.000Z",
};

describe("fail-closed tenant argument", () => {
  it("returns empty for a blank tenant and performs no query at all", async () => {
    for (const cmsTenantId of ["", "   ", null, undefined] as never[]) {
      const payload = fakePayload();
      const reader = createPayloadPublishedContentReader(payload as never);
      const blankContext = context({ cmsTenantId });

      const page = await reader.getPublishedPage(blankContext, {
        pageType: "page",
        key: "home",
      });
      const navigation = await reader.getNavigation(blankContext);
      const updates = await reader.getUpdates(blankContext);

      expect(page).toEqual({ status: "not-found" });
      expect(navigation).toEqual({
        status: "found",
        navigation: null,
        tenant: { slug: null },
      });
      expect(updates).toEqual({
        status: "found",
        updates: [],
        tenant: { slug: null },
      });
      expect(payload.calls).toEqual([]);
    }
  });

  it("returns empty when the resolved tenant does not exist or is inactive", async () => {
    const payload = fakePayload({ tenants: [], pages: [PUBLISHED_PAGE_DOC] });
    const reader = createPayloadPublishedContentReader(payload as never);

    const page = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "home",
    });
    expect(page).toEqual({ status: "not-found" });

    // Only the policy-checked tenant read ran; no content query followed.
    expect(payload.calls.map((call) => call.collection)).toEqual(["tenants"]);
  });
});

describe("query shape: overrideAccess is false, the marker is set, constraints always apply", () => {
  it("reads pages with the tenant + lookup + published constraint under the public-read policy", async () => {
    const payload = fakePayload(withTenant({ pages: [PUBLISHED_PAGE_DOC] }));
    const reader = createPayloadPublishedContentReader(payload as never);

    const result = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "home",
    });

    expect(result.status).toBe("found");
    const pageCall = payload.calls.find((call) => call.collection === "pages");
    expect(pageCall).toMatchObject({
      collection: "pages",
      limit: 1,
      overrideAccess: false,
      pagination: false,
      sort: "-updatedAt",
      where: {
        and: [
          { tenant: { equals: CMS_TENANT_ID } },
          { slug: { equals: "home" } },
          { _status: { equals: "published" } },
        ],
      },
    });
    expect(pageCall?.context).toEqual({
      asymPublicRead: { cmsTenantId: CMS_TENANT_ID },
    });

    const tenantCall = payload.calls.find(
      (call) => call.collection === "tenants",
    );
    expect(tenantCall).toMatchObject({
      overrideAccess: false,
      where: {
        and: [
          { id: { equals: CMS_TENANT_ID } },
          { isActive: { equals: true } },
        ],
      },
    });
  });

  it("returns not-found (is_empty) when the store yields nothing — draft or cross-tenant content is silent zero rows", async () => {
    const payload = fakePayload(withTenant({ pages: [] }));
    const reader = createPayloadPublishedContentReader(payload as never);

    const result = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "draft-only-or-other-tenant",
    });

    expect(result).toEqual({ status: "not-found" });
  });

  it("rejects unknown page types and blank keys without querying", async () => {
    const payload = fakePayload(withTenant({}));
    const reader = createPayloadPublishedContentReader(payload as never);

    const unknownType = await reader.getPublishedPage(context(), {
      pageType: "not-a-type",
      key: "x",
    });
    expect(unknownType.status).toBe("bad-request");

    const blankKey = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "   ",
    });
    expect(blankKey.status).toBe("bad-request");

    expect(payload.calls).toEqual([]);
  });

  it("reads navigation tenant-constrained without a _status clause (versionless collection)", async () => {
    const navigationDoc = {
      id: "nav-1",
      label: "Main Navigation",
      items: [
        { id: "i1", label: "Home", href: "/", openInNewTab: false },
        {
          id: "i2",
          label: "Evil",
          href: "javascript:alert(1)",
          openInNewTab: false,
        },
      ],
      updatedAt: "2026-07-22T00:00:00.000Z",
    };
    const payload = fakePayload(withTenant({ navigation: [navigationDoc] }));
    const reader = createPayloadPublishedContentReader(payload as never);

    const result = await reader.getNavigation(context());

    expect(result).toEqual({
      status: "found",
      navigation: {
        id: "nav-1",
        label: "Main Navigation",
        items: [
          { id: "i1", label: "Home", href: "/", openInNewTab: false },
          { id: "i2", label: "Evil", href: null, openInNewTab: false },
        ],
        updatedAt: "2026-07-22T00:00:00.000Z",
      },
      tenant: { slug: "give-hope-demo" },
    });

    const navigationCall = payload.calls.find(
      (call) => call.collection === "navigation",
    );
    expect(navigationCall).toMatchObject({
      overrideAccess: false,
      where: { and: [{ tenant: { equals: CMS_TENANT_ID } }] },
    });
    expect(JSON.stringify(navigationCall?.where)).not.toContain("_status");
  });

  it("returns null navigation when the tenant has none configured", async () => {
    const payload = fakePayload(withTenant({ navigation: [] }));
    const reader = createPayloadPublishedContentReader(payload as never);

    expect(await reader.getNavigation(context())).toEqual({
      status: "found",
      navigation: null,
      tenant: { slug: "give-hope-demo" },
    });
  });

  it("reads updates published-only with a clamped limit and serializes each row", async () => {
    const updateDoc = {
      id: "u1",
      title: "Update",
      slug: "update",
      excerpt: "E",
      content: { r: 1 },
      missionary: { id: 5, name: "Private Fields" },
      publishedAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-02T00:00:00.000Z",
      internalNotes: "never leaks",
    };
    const payload = fakePayload(
      withTenant({ "ministry-updates": [updateDoc] }),
    );
    const reader = createPayloadPublishedContentReader(payload as never);

    const result = await reader.getUpdates(context(), { limit: 999 });

    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.updates).toEqual([
        {
          id: "u1",
          title: "Update",
          slug: "update",
          excerpt: "E",
          content: { r: 1 },
          missionaryId: "5",
          publishedAt: "2026-07-01T00:00:00.000Z",
          updatedAt: "2026-07-02T00:00:00.000Z",
        },
      ]);
      expect(JSON.stringify(result.updates)).not.toContain("internalNotes");
    }

    const updatesCall = payload.calls.find(
      (call) => call.collection === "ministry-updates",
    );
    expect(updatesCall).toMatchObject({
      limit: 20,
      overrideAccess: false,
      sort: "-publishedAt",
      where: {
        and: [
          { tenant: { equals: CMS_TENANT_ID } },
          { _status: { equals: "published" } },
        ],
      },
    });
  });

  it("degrades to unavailable when the store throws, without leaking the error shape", async () => {
    const payload = fakePayload(withTenant({}), {
      failWith: new Error("connection refused at 10.0.0.5"),
    });
    const reader = createPayloadPublishedContentReader(payload as never);

    const page = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "home",
    });
    expect(page.status).toBe("unavailable");
    if (page.status === "unavailable") {
      expect(page.error).not.toContain("10.0.0.5");
    }

    const navigation = await reader.getNavigation(context());
    expect(navigation.status).toBe("unavailable");

    const updates = await reader.getUpdates(context());
    expect(updates.status).toBe("unavailable");
  });
});

describe("collection capabilities stay true to the real Payload configs", () => {
  it("derives draftability from the actual collection definitions", async () => {
    const { Pages } =
      await import("../../../apps/admin/src/cms/collections/pages");
    const { MinistryUpdates } =
      await import("../../../apps/admin/src/cms/collections/ministry-updates");
    const { Navigation } =
      await import("../../../apps/admin/src/cms/collections/navigation");
    const { MissionaryGivingPages } =
      await import("../../../apps/admin/src/cms/collections/missionary-giving-pages");
    const { ProjectPages } =
      await import("../../../apps/admin/src/cms/collections/project-pages");
    const { Media } =
      await import("../../../apps/admin/src/cms/collections/media");

    const derivedDraftable = (config: { versions?: unknown }) => {
      const versions = config.versions;
      return Boolean(
        versions &&
        typeof versions === "object" &&
        (versions as { drafts?: unknown }).drafts,
      );
    };

    expect(PUBLIC_COLLECTION_CAPABILITIES).toEqual({
      pages: { draftable: derivedDraftable(Pages) },
      "missionary-giving-pages": {
        draftable: derivedDraftable(MissionaryGivingPages),
      },
      "project-pages": { draftable: derivedDraftable(ProjectPages) },
      "ministry-updates": { draftable: derivedDraftable(MinistryUpdates) },
      navigation: { draftable: derivedDraftable(Navigation) },
      media: { draftable: derivedDraftable(Media) },
    });
  });
});

describe("parity guard: the choke-point serialization equals the shipped published output", () => {
  it("serializes a published page identically to the shipped serializer", () => {
    const packageOutput = JSON.parse(
      JSON.stringify(serializePublicPage(PUBLISHED_PAGE_DOC)),
    );
    const shippedOutput = JSON.parse(
      JSON.stringify(serializePublishedPageLike(PUBLISHED_PAGE_DOC)),
    );

    expect(packageOutput).toEqual(shippedOutput);
  });

  it("returns the package-serialized page from the reader (the same bytes the parity baseline guards)", async () => {
    const payload = fakePayload(withTenant({ pages: [PUBLISHED_PAGE_DOC] }));
    const reader = createPayloadPublishedContentReader(payload as never);

    const result = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "home",
    });

    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(JSON.parse(JSON.stringify(result.page))).toEqual(
        JSON.parse(
          JSON.stringify(serializePublishedPageLike(PUBLISHED_PAGE_DOC)),
        ),
      );
      expect(result.tenant).toEqual({ slug: "give-hope-demo" });
    }
  });
});

describe("rich-text pass-through hygiene (#522 reader binding)", () => {
  it("reduces populated upload/relationship nodes in rich text to bare ids", async () => {
    const docWithPopulatedNodes = {
      ...PUBLISHED_PAGE_DOC,
      content: {
        root: {
          children: [
            {
              type: "upload",
              value: {
                id: 33,
                url: "/media/full-doc.jpg",
                internalFileName: "secret-path.jpg",
              },
            },
            {
              type: "relationship",
              value: { id: "rel-1", privateField: "never" },
            },
            { type: "paragraph", value: { keep: true } },
          ],
        },
      },
      layout: [
        {
          id: "rt",
          blockType: "rich-text",
          blockName: null,
          heading: null,
          body: {
            root: {
              children: [
                { type: "upload", value: { id: 44, ownerEmail: "x@y.z" } },
              ],
            },
          },
        },
      ],
    };
    const payload = fakePayload(withTenant({ pages: [docWithPopulatedNodes] }));
    const reader = createPayloadPublishedContentReader(payload as never);

    const result = await reader.getPublishedPage(context(), {
      pageType: "page",
      key: "home",
    });

    expect(result.status).toBe("found");
    if (result.status === "found") {
      const serialized = JSON.stringify(result.page);
      expect(serialized).not.toContain("secret-path.jpg");
      expect(serialized).not.toContain("privateField");
      expect(serialized).not.toContain("ownerEmail");

      const content = result.page.content as {
        root: { children: Array<{ type: string; value: unknown }> };
      };
      expect(content.root.children[0]).toEqual({ type: "upload", value: 33 });
      expect(content.root.children[1]).toEqual({
        type: "relationship",
        value: "rel-1",
      });
      expect(content.root.children[2]).toEqual({
        type: "paragraph",
        value: { keep: true },
      });
    }
  });
});
