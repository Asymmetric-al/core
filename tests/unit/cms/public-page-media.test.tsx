import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

// next/image validates hostnames against the running app's image config,
// which does not exist under vitest — pass through to a plain img so the
// tests assert THIS contract (fail-safe resolution, alt, dimensions), not
// Next internals.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { priority: _priority, sizes: _sizes, ...imgProps } = props;
    return <img {...(imgProps as Record<string, never>)} />;
  },
}));

type PublicPageMediaModule =
  typeof import("../../../apps/donor/components/cms/public-page-media");

let PublicCmsPageMedia: PublicPageMediaModule["PublicCmsPageMedia"];
let readMediaBearingBlocks: PublicPageMediaModule["readMediaBearingBlocks"];

beforeAll(async () => {
  const pageMediaModule =
    await import("../../../apps/donor/components/cms/public-page-media");
  PublicCmsPageMedia = pageMediaModule.PublicCmsPageMedia;
  readMediaBearingBlocks = pageMediaModule.readMediaBearingBlocks;
});

const CMS_BASE_URL = "http://127.0.0.1:3030";

const PUBLIC_MEDIA = {
  id: "44",
  alt: "Jane in field",
  url: "/api/media/file/jane.jpg",
  thumbnailURL: null,
  cardURL: null,
  width: 1200,
  height: 800,
  mimeType: "image/jpeg",
  caption: "Jane serving in June",
};

const HERO_BLOCK = {
  id: "b1",
  blockName: null,
  blockType: "hero",
  eyebrow: null,
  headline: "Partner with Jane",
  subheading: null,
  backgroundImage: PUBLIC_MEDIA,
  primaryCtaLabel: null,
  primaryCtaHref: null,
};

const MEDIA_FEATURE_BLOCK = {
  id: "b2",
  blockName: null,
  blockType: "media-feature",
  title: "From the field",
  body: "A season of growth.",
  media: PUBLIC_MEDIA,
  mediaCaption: "Block caption wins",
};

describe("readMediaBearingBlocks", () => {
  it("selects only media-bearing blocks with renderable or textual content", () => {
    const layout = [
      HERO_BLOCK,
      { ...HERO_BLOCK, id: "b3", backgroundImage: "44" },
      MEDIA_FEATURE_BLOCK,
      { blockType: "call-to-action", headline: "Give" },
      { blockType: "faq", items: [] },
    ];

    const blocks = readMediaBearingBlocks(layout, CMS_BASE_URL);

    expect(blocks.map((block) => [block.kind, block.key])).toEqual([
      ["hero-image", "b1"],
      ["media-figure", "b2"],
    ]);
  });

  it("returns nothing for missing or non-array layouts", () => {
    expect(readMediaBearingBlocks(null, CMS_BASE_URL)).toEqual([]);
    expect(readMediaBearingBlocks(undefined, CMS_BASE_URL)).toEqual([]);
    expect(readMediaBearingBlocks({}, CMS_BASE_URL)).toEqual([]);
  });

  it("excludes a media-feature whose media is a bare reference id (media-only seam — block text is #530's template)", () => {
    const blocks = readMediaBearingBlocks(
      [{ ...MEDIA_FEATURE_BLOCK, media: 44 }],
      CMS_BASE_URL,
    );

    expect(blocks).toEqual([]);
  });
});

describe("PublicCmsPageMedia", () => {
  it("renders hero and media-feature images via next/image with alt text and resolved public URLs", () => {
    const markup = renderToStaticMarkup(
      <PublicCmsPageMedia
        layout={[HERO_BLOCK, MEDIA_FEATURE_BLOCK]}
        cmsBaseUrl={CMS_BASE_URL}
      />,
    );

    expect(markup).toContain(
      'src="http://127.0.0.1:3030/api/media/file/jane.jpg"',
    );
    expect(markup).toContain('alt="Jane in field"');
    expect(markup).toContain('width="1200"');
    expect(markup).toContain('height="800"');
    // Media-only seam: block text (title/body) is #530's template, not media
    // delivery — only the image and its caption render here.
    expect(markup).not.toContain("From the field");
    expect(markup).not.toContain("A season of growth.");
    // The block-level caption overrides the media document's caption.
    expect(markup).toContain("Block caption wins");
    expect(markup).not.toContain("Jane serving in June");
  });

  it("falls back to the media document caption when the block has none", () => {
    const markup = renderToStaticMarkup(
      <PublicCmsPageMedia
        layout={[{ ...MEDIA_FEATURE_BLOCK, mediaCaption: null }]}
        cmsBaseUrl={CMS_BASE_URL}
      />,
    );

    expect(markup).toContain("Jane serving in June");
  });

  it("renders nothing at all when no media resolves (fail-safe, no empty shells)", () => {
    const markup = renderToStaticMarkup(
      <PublicCmsPageMedia
        layout={[
          { ...HERO_BLOCK, backgroundImage: "44" },
          { ...HERO_BLOCK, id: "b9", backgroundImage: null },
        ]}
        cmsBaseUrl={CMS_BASE_URL}
      />,
    );

    expect(markup).toBe("");
  });

  it("never renders a raw Payload media object's private fields", () => {
    const markup = renderToStaticMarkup(
      <PublicCmsPageMedia
        layout={[
          {
            ...MEDIA_FEATURE_BLOCK,
            media: {
              ...PUBLIC_MEDIA,
              // If a raw Payload doc ever slipped through serialization,
              // rendering still exposes only the resolved public fields.
              filesize: 123456,
              focalX: 50,
              tenant: "cms-tenant-1",
              internalNotes: "never",
            },
          },
        ]}
        cmsBaseUrl={CMS_BASE_URL}
      />,
    );

    expect(markup).not.toContain("123456");
    expect(markup).not.toContain("cms-tenant-1");
    expect(markup).not.toContain("never");
  });

  it("does not render media when the CMS base URL is unavailable (no unresolvable relative sources)", () => {
    const markup = renderToStaticMarkup(
      <PublicCmsPageMedia layout={[HERO_BLOCK]} cmsBaseUrl={null} />,
    );

    expect(markup).toBe("");
  });
});
