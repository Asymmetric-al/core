import { describe, expect, it } from "vitest";

import { serializePublishedPageLike } from "../../../apps/admin/src/cms/public/serialize-published-page";

describe("serializePublishedPageLike", () => {
  it("maps known fields and stringifies id", () => {
    const out = serializePublishedPageLike({
      id: 12,
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
      pageType: "standard",
      missionaryId: "m1",
      fundId: "f1",
      legacyContentFallback: true,
      updatedAt: "2026-01-01",
    });

    expect(out).toEqual({
      id: "12",
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
      id: 12,
      title: "Missionary",
      slug: "missionary",
      layout: [
        {
          blockType: "hero",
          headline: "Partner with Jane",
          primaryCtaLabel: "Give monthly",
          primaryCtaHref: "https://example.org/manual-link",
          backgroundImage: {
            id: 44,
            alt: "Jane in field",
            url: "/api/media/file/jane.jpg",
            tenant: 99,
            sizes: {
              thumbnail: { url: "/api/media/file/jane-320.jpg" },
              card: { url: "/api/media/file/jane-960.jpg" },
            },
          },
        },
      ],
      pageType: "missionary_giving",
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
          id: "44",
          alt: "Jane in field",
          url: "/api/media/file/jane.jpg",
          thumbnailURL: "/api/media/file/jane-320.jpg",
          cardURL: "/api/media/file/jane-960.jpg",
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
});
