import { describe, expect, it } from "vitest";

import { serializePublishedPageLike } from "../../../apps/admin/src/cms/preview/serialize-published-page";

import type { PublicRequestContext } from "../../../packages/api/src/cms/public/context";

const context: PublicRequestContext = {
  operationalTenantId: "tenant-op-1",
  cmsTenantId: 7,
  siteId: null,
};

const PAGE_ID = "0b6a2f4e-3c1d-4e5f-8a9b-0c1d2e3f4a5b";
const MEDIA_ID = "5c4b3a29-1807-4f6e-9d5c-4b3a29180716";

describe("serializePublishedPageLike (D-18: WP6 part 2b gives pages a family instead of a pageType, UUID ids and plain media records)", () => {
  it("maps known fields and stringifies id", () => {
    const out = serializePublishedPageLike({
      id: PAGE_ID,
      title: "Hello",
      slug: "hello",
      summary: "S",
      content: { a: 1 },
      layout: [
        {
          blockType: "call-to-action",
          headline: "Give",
          copy: "Support the work",
          buttonLabel: "Give now",
          buttonHref: "javascript:alert(1)",
          openInNewTab: true,
        },
      ],
      family: "standard",
      missionaryId: "m1",
      fundId: "f1",
      legacyContentFallback: true,
      updatedAt: "2026-01-01",
    });

    expect(out).toEqual({
      id: PAGE_ID,
      title: "Hello",
      slug: "hello",
      summary: "S",
      content: { a: 1 },
      layout: [
        {
          id: null,
          blockName: null,
          blockType: "call-to-action",
          headline: "Give",
          copy: "Support the work",
          buttonLabel: "Give now",
          buttonHref: null,
          openInNewTab: true,
        },
      ],
      pageType: "standard",
      missionaryId: "m1",
      fundId: "f1",
      legacyContentFallback: true,
      updatedAt: "2026-01-01",
    });
  });

  it("normalizes missionary giving CTAs through the checkout route", () => {
    const out = serializePublishedPageLike({
      id: PAGE_ID,
      title: "Missionary",
      slug: "missionary",
      layout: [
        {
          blockType: "hero",
          headline: "Partner with Jane",
          primaryCtaLabel: "Give monthly",
          primaryCtaHref: "https://example.org/manual-link",
          backgroundImage: {
            id: MEDIA_ID,
            alt: "Jane in field",
            credit: "Field team",
            folder: "Portraits",
            tenant: "00000000-0000-4000-8000-000000000101",
          },
        },
      ],
      family: "missionary",
      missionaryId: "123e4567-e89b-42d3-a456-426614174111",
    });

    expect(out.layout).toEqual([
      {
        id: null,
        blockName: null,
        blockType: "hero",
        eyebrow: null,
        headline: "Partner with Jane",
        subheading: null,
        backgroundImage: {
          id: MEDIA_ID,
          alt: "Jane in field",
          url: null,
          thumbnailURL: null,
          cardURL: null,
          width: null,
          height: null,
          mimeType: null,
        },
        primaryCtaLabel: "Give monthly",
        primaryCtaHref:
          "/checkout?missionary_id=123e4567-e89b-42d3-a456-426614174111",
      },
    ]);
  });

  it("serializes a media record as the package serializer does, emitting none of its tenant, credit or folder", async () => {
    const { serializePublicPage } =
      await import("../../../packages/api/src/cms/public/serializer");

    const doc = {
      id: PAGE_ID,
      title: "Missionary",
      slug: "missionary",
      layout: [
        {
          id: "m1",
          blockType: "media-feature",
          title: "From the field",
          body: "A season of growth.",
          mediaCaption: null,
          media: {
            id: MEDIA_ID,
            alt: "Jane in field",
            credit: "Field team",
            folder: "Portraits",
            tenant: "00000000-0000-4000-8000-000000000101",
          },
        },
      ],
      family: null,
      missionaryId: null,
      fundId: null,
    };

    const shipped = JSON.parse(JSON.stringify(serializePublishedPageLike(doc)));
    const packaged = JSON.parse(
      JSON.stringify(serializePublicPage(context, doc)),
    );

    expect(Object.keys(shipped.layout[0].media).sort()).toEqual([
      "alt",
      "cardURL",
      "height",
      "id",
      "mimeType",
      "thumbnailURL",
      "url",
      "width",
    ]);
    expect(shipped.layout).toEqual(packaged.layout);
  });
});
