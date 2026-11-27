import { describe, expect, it, vi } from "vitest";

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
          url: `/api/media/${MEDIA_ID}`,
          thumbnailURL: `/api/media/${MEDIA_ID}?variant=w320`,
          cardURL: `/api/media/${MEDIA_ID}`,
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

  it("serializes a media record as the package serializer does, emitting none of its tenant, credit or folder, and only the preview gives it the signed-in media route (public media is WP7's)", async () => {
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
    const unaddressed = {
      ...shipped.layout[0],
      media: {
        ...shipped.layout[0].media,
        url: null,
        thumbnailURL: null,
        cardURL: null,
      },
    };
    expect([unaddressed]).toEqual(packaged.layout);
    expect(packaged.layout[0].media.url).toBeNull();
    expect(shipped.layout[0].media.url).toBe(`/api/media/${MEDIA_ID}`);
  });
});

describe("preview media addresses (WP6 rest, pull request 2, invariant 5): a draft shows its images through /api/media/<id>", () => {
  const page = (media: unknown) => ({
    id: PAGE_ID,
    title: "Field",
    slug: "field",
    layout: [{ blockType: "media-feature", media, mediaCaption: null }],
  });

  it("gives a stored media record the signed-in media route's bounded variants, never a storage address: w320, which every image has, and the largest the image has for the card", () => {
    const [block] = serializePublishedPageLike(
      page({
        id: MEDIA_ID.toUpperCase(),
        alt: "Jane in field",
        url: "https://project.supabase.co/storage/v1/object/cms-media/x.jpg",
      }),
    ).layout as Array<{ media: Record<string, unknown> }>;
    expect(block!.media).toEqual({
      id: MEDIA_ID.toUpperCase(),
      alt: "Jane in field",
      url: `/api/media/${MEDIA_ID}`,
      thumbnailURL: `/api/media/${MEDIA_ID}?variant=w320`,
      cardURL: `/api/media/${MEDIA_ID}`,
      width: null,
      height: null,
      mimeType: null,
    });
  });

  it("gives no address to a media value whose id is not a hex UUID", () => {
    const [block] = serializePublishedPageLike(
      page({ id: "../../etc/passwd", alt: "x" }),
    ).layout as Array<{ media: Record<string, unknown> }>;
    expect(block!.media).toMatchObject({
      url: null,
      thumbnailURL: null,
      cardURL: null,
    });
  });

  it("carries the admin app's base path when the apps are served under paths, since the unoptimized image adds none (fix round F3)", () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
    vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
    try {
      const [block] = serializePublishedPageLike(
        page({ id: MEDIA_ID, alt: "Jane in field" }),
      ).layout as Array<{ media: Record<string, unknown> }>;
      expect(block!.media).toMatchObject({
        url: `/admin/api/media/${MEDIA_ID}`,
        thumbnailURL: `/admin/api/media/${MEDIA_ID}?variant=w320`,
        cardURL: `/admin/api/media/${MEDIA_ID}`,
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
