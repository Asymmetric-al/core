import { describe, expect, it } from "vitest";

import {
  buildDonorPreviewPathForPageSlug,
  pagesGeneratePreviewURL,
} from "../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url";

describe("buildDonorPreviewPathForPageSlug", () => {
  it("maps home slug to root", () => {
    expect(buildDonorPreviewPathForPageSlug("home")).toBe("/");
    expect(buildDonorPreviewPathForPageSlug("")).toBe("/");
  });

  it("encodes path segments", () => {
    expect(buildDonorPreviewPathForPageSlug("a/b")).toBe("/a/b");
    expect(buildDonorPreviewPathForPageSlug("hello world")).toBe(
      "/hello%20world",
    );
  });
});

describe("pagesGeneratePreviewURL", () => {
  it("returns an absolute donor URL", () => {
    const url = pagesGeneratePreviewURL(
      { slug: "about" },
      { locale: "en", req: {} as never, token: null },
    );
    expect(url).toMatch(/^https?:\/\//);
    expect(String(url)).toContain("/about");
  });
});
