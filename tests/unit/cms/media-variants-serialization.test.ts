import { describe, expect, it } from "vitest";

import { serializePublishedPageLike } from "../../../apps/admin/src/cms/public/serialize-published-page";
import { serializePublicPage } from "../../../packages/api/src/cms/public/serializer";

import type { PublicRequestContext } from "../../../packages/api/src/cms/public/context";

const context: PublicRequestContext = {
  operationalTenantId: "tenant-op-1",
  cmsTenantId: 7,
  siteId: null,
};

const serializers = [
  {
    name: "canonical API",
    serialize: (doc: Record<string, unknown>) =>
      serializePublicPage(context, doc),
  },
  { name: "admin parity baseline", serialize: serializePublishedPageLike },
];

const media = {
  id: 44,
  alt: "Jane in field",
  url: "/api/media/file/jane.jpg",
  width: 1200,
  height: 800,
  mimeType: "image/jpeg",
  filename: "jane.jpg",
  caption: "Jane serving in June",
  tenant: 99,
  prefix: "private-storage-prefix",
  _objectKey: "private-main-object-key",
  original: {
    filename: "jane-original.jpg",
    _objectKey: "private-original-object-key",
  },
};

const publicMedia = {
  id: "44",
  alt: "Jane in field",
  url: "/api/media/file/jane.jpg",
  width: 1200,
  height: 800,
  mimeType: "image/jpeg",
  filename: "jane.jpg",
  caption: "Jane serving in June",
};

function pageWithMedia(value: unknown) {
  return {
    id: 12,
    title: "From the field",
    slug: "from-the-field",
    layout: [{ blockType: "media-feature", media: value }],
  };
}

function expectedLayout(thumbnailURL: string | null, cardURL: string | null) {
  return [
    {
      id: null,
      blockName: null,
      blockType: "media-feature",
      title: null,
      body: null,
      media: { ...publicMedia, thumbnailURL, cardURL },
      mediaCaption: null,
    },
  ];
}

describe.each(serializers)("$name media variants", ({ serialize }) => {
  it("preserves public image URLs and excludes new storage internals", () => {
    const doc = pageWithMedia({
      ...media,
      variants: {
        thumbnail: {
          url: "/api/media/file/jane-320.jpg",
          prefix: "private-variant-prefix",
          _objectKey: "private-thumbnail-object-key",
        },
        card: { url: "/api/media/file/jane-960.jpg" },
      },
    });

    expect(serialize(doc).layout).toEqual(
      expectedLayout(
        "/api/media/file/jane-320.jpg",
        "/api/media/file/jane-960.jpg",
      ),
    );
  });

  it("reads the current variants field even when a legacy sizes value exists", () => {
    const doc = pageWithMedia({
      ...media,
      variants: {
        thumbnail: { url: "/api/media/file/current-thumbnail.jpg" },
      },
      sizes: {
        thumbnail: { url: "/api/media/file/stale-thumbnail.jpg" },
        card: { url: "/api/media/file/stale-card.jpg" },
      },
    });

    expect(serialize(doc).layout).toEqual(
      expectedLayout("/api/media/file/current-thumbnail.jpg", null),
    );
  });

  it("retains null public variant URLs for malformed or missing metadata", () => {
    const doc = pageWithMedia({
      ...media,
      variants: {
        thumbnail: "/api/media/file/not-a-variant-object.jpg",
        card: { url: 42, _objectKey: "private-card-object-key" },
      },
    });

    expect(serialize(doc).layout).toEqual(expectedLayout(null, null));
    expect(serialize(pageWithMedia(media)).layout).toEqual(
      expectedLayout(null, null),
    );
  });
});
