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

  it("emits public filename/caption only when present, identically to the package serializer (#529)", async () => {
    const { serializePublicPage } =
      await import("../../../packages/api/src/cms/public/serializer");

    const doc = {
      id: 12,
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
            id: 44,
            alt: "Jane in field",
            url: "/api/media/file/jane.jpg",
            width: 1200,
            height: 800,
            mimeType: "image/jpeg",
            filename: "jane.jpg",
            caption: "Jane serving in June",
            // Raw Payload internals that must never be emitted:
            filesize: 123456,
            focalX: 50,
            focalY: 50,
            tenant: 99,
          },
        },
      ],
      pageType: null,
      missionaryId: null,
      fundId: null,
    };

    const shipped = JSON.parse(JSON.stringify(serializePublishedPageLike(doc)));
    const packaged = JSON.parse(JSON.stringify(serializePublicPage(doc)));

    const shippedMedia = shipped.layout[0].media;
    expect(shippedMedia.filename).toBe("jane.jpg");
    expect(shippedMedia.caption).toBe("Jane serving in June");
    expect(shippedMedia.filesize).toBeUndefined();
    expect(shippedMedia.focalX).toBeUndefined();
    expect(shippedMedia.tenant).toBeUndefined();

    // Both serializers stay behavior-identical — the #523 parity baseline.
    expect(shipped.layout).toEqual(packaged.layout);

    // Present-only: a document without filename/caption emits neither key.
    const bare = JSON.parse(
      JSON.stringify(
        serializePublishedPageLike({
          ...doc,
          layout: [
            {
              ...doc.layout[0],
              media: {
                id: 44,
                alt: "Jane in field",
                url: "/api/media/file/jane.jpg",
                width: 1200,
                height: 800,
                mimeType: "image/jpeg",
              },
            },
          ],
        }),
      ),
    );
    expect("filename" in bare.layout[0].media).toBe(false);
    expect("caption" in bare.layout[0].media).toBe(false);
  });
});
