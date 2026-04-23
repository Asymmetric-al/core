import { describe, expect, it } from "vitest";

import {
  isAllowedPostLinkHref,
  normalizePostLinkHref,
} from "../../../../packages/lib/posts/link-policy";

describe("posts/link-policy", () => {
  it("normalizes full https URLs and rejects non-http(s) schemes", () => {
    expect(normalizePostLinkHref("https://example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(normalizePostLinkHref("http://example.com/")).toBe(
      "http://example.com/",
    );
    expect(normalizePostLinkHref("javascript:alert(1)")).toBe(null);
    expect(normalizePostLinkHref("ftp://files.example/")).toBe(null);
  });

  it("accepts bare hostnames by assuming https", () => {
    expect(normalizePostLinkHref("example.com")).toBe("https://example.com/");
  });

  it("rejects empty, leading/trailing whitespace, and internal spaces", () => {
    expect(normalizePostLinkHref("")).toBe(null);
    expect(normalizePostLinkHref("  https://a.com  ")).toBe(null);
    expect(normalizePostLinkHref("https://a com")).toBe(null);
  });

  it("isAllowedPostLinkHref mirrors normalizePostLinkHref truthiness", () => {
    expect(isAllowedPostLinkHref("https://ok.test")).toBe(true);
    expect(isAllowedPostLinkHref("not a url")).toBe(false);
  });
});
