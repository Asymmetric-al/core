import {
  resolvePublicCmsMediaUrl,
  resolveRenderablePublicCmsImage,
} from "@asym/lib/cms/public-media";
import { describe, expect, it } from "vitest";

const CMS_BASE_URL = "http://127.0.0.1:3030";

const PUBLIC_MEDIA = {
  id: "44",
  alt: "Jane in field",
  url: "/api/media/file/jane.jpg",
  thumbnailURL: "/api/media/file/jane-320.jpg",
  cardURL: "/api/media/file/jane-960.jpg",
  width: 1200,
  height: 800,
  mimeType: "image/jpeg",
  filename: "jane.jpg",
  caption: "Jane serving in June",
};

describe("resolvePublicCmsMediaUrl", () => {
  it("joins admin-relative media paths to the CMS base origin", () => {
    expect(
      resolvePublicCmsMediaUrl("/api/media/file/jane.jpg", CMS_BASE_URL),
    ).toBe("http://127.0.0.1:3030/api/media/file/jane.jpg");
  });

  it("passes absolute URLs through only on the CMS media origin", () => {
    expect(
      resolvePublicCmsMediaUrl(
        "http://127.0.0.1:3030/api/media/file/x.jpg",
        CMS_BASE_URL,
      ),
    ).toBe("http://127.0.0.1:3030/api/media/file/x.jpg");
  });

  it("rejects absolute URLs on foreign hosts (they would break at next/image's host allowlist)", () => {
    expect(
      resolvePublicCmsMediaUrl("https://cdn.example.org/x.jpg", CMS_BASE_URL),
    ).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("http://127.0.0.1:9999/x.jpg", CMS_BASE_URL),
    ).toBeNull();
  });

  it("rejects unsafe or unresolvable URLs fail-safe", () => {
    expect(resolvePublicCmsMediaUrl(null, CMS_BASE_URL)).toBeNull();
    expect(resolvePublicCmsMediaUrl("", CMS_BASE_URL)).toBeNull();
    expect(resolvePublicCmsMediaUrl("   ", CMS_BASE_URL)).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("//evil.example.org/x.jpg", CMS_BASE_URL),
    ).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("javascript:alert(1)", CMS_BASE_URL),
    ).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("data:image/png;base64,x", CMS_BASE_URL),
    ).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("relative/no-slash.jpg", CMS_BASE_URL),
    ).toBeNull();
  });

  it("resolves nothing when the CMS base URL is missing or not http(s)", () => {
    expect(resolvePublicCmsMediaUrl("/api/media/file/x.jpg", null)).toBeNull();
    expect(resolvePublicCmsMediaUrl("/api/media/file/x.jpg", "")).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("/api/media/file/x.jpg", "ftp://cms.example"),
    ).toBeNull();
    expect(
      resolvePublicCmsMediaUrl("/api/media/file/x.jpg", "not a url"),
    ).toBeNull();
  });
});

describe("resolveRenderablePublicCmsImage", () => {
  it("resolves a fully serialized public media object", () => {
    expect(resolveRenderablePublicCmsImage(PUBLIC_MEDIA, CMS_BASE_URL)).toEqual(
      {
        src: "http://127.0.0.1:3030/api/media/file/jane.jpg",
        alt: "Jane in field",
        width: 1200,
        height: 800,
        caption: "Jane serving in June",
      },
    );
  });

  it("treats a bare reference id as not renderable (unpopulated or non-public-eligible)", () => {
    expect(resolveRenderablePublicCmsImage("44", CMS_BASE_URL)).toBeNull();
    expect(resolveRenderablePublicCmsImage(44, CMS_BASE_URL)).toBeNull();
    expect(resolveRenderablePublicCmsImage(null, CMS_BASE_URL)).toBeNull();
    expect(resolveRenderablePublicCmsImage(undefined, CMS_BASE_URL)).toBeNull();
  });

  it("fails safe on missing URL or missing intrinsic dimensions", () => {
    expect(
      resolveRenderablePublicCmsImage(
        { ...PUBLIC_MEDIA, url: null },
        CMS_BASE_URL,
      ),
    ).toBeNull();
    expect(
      resolveRenderablePublicCmsImage(
        { ...PUBLIC_MEDIA, width: null },
        CMS_BASE_URL,
      ),
    ).toBeNull();
    expect(
      resolveRenderablePublicCmsImage(
        { ...PUBLIC_MEDIA, height: 0 },
        CMS_BASE_URL,
      ),
    ).toBeNull();
    expect(
      resolveRenderablePublicCmsImage(
        { ...PUBLIC_MEDIA, width: Number.NaN },
        CMS_BASE_URL,
      ),
    ).toBeNull();
  });

  it("renders missing alt text as decorative and blank captions as absent", () => {
    const resolved = resolveRenderablePublicCmsImage(
      { ...PUBLIC_MEDIA, alt: null, caption: "   " },
      CMS_BASE_URL,
    );

    expect(resolved?.alt).toBe("");
    expect(resolved?.caption).toBeNull();
  });

  it("rounds fractional dimensions for next/image", () => {
    const resolved = resolveRenderablePublicCmsImage(
      { ...PUBLIC_MEDIA, width: 1199.6, height: 799.4 },
      CMS_BASE_URL,
    );

    expect(resolved?.width).toBe(1200);
    expect(resolved?.height).toBe(799);
  });
});
