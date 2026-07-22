import { describe, expect, it } from "vitest";

import { buildPublicCmsImageRemotePatterns } from "../../../scripts/cms/public-media-remote-pattern.mjs";

describe("buildPublicCmsImageRemotePatterns", () => {
  it("derives the pattern from an https CMS base URL", () => {
    expect(
      buildPublicCmsImageRemotePatterns("https://admin.example.org"),
    ).toEqual([{ protocol: "https", hostname: "admin.example.org" }]);
  });

  it("keeps explicit ports", () => {
    expect(buildPublicCmsImageRemotePatterns("http://127.0.0.1:3030")).toEqual([
      { protocol: "http", hostname: "127.0.0.1", port: "3030" },
    ]);
  });

  it("falls back to the local-dev CMS origin when unset (matching the donor CMS client default)", () => {
    const expected = [
      { protocol: "http", hostname: "127.0.0.1", port: "3030" },
    ];
    expect(buildPublicCmsImageRemotePatterns(undefined)).toEqual(expected);
    expect(buildPublicCmsImageRemotePatterns("")).toEqual(expected);
    expect(buildPublicCmsImageRemotePatterns("   ")).toEqual(expected);
  });

  it("yields no pattern for non-http(s) or unparsable base URLs (fail-safe)", () => {
    expect(buildPublicCmsImageRemotePatterns("ftp://cms.example.org")).toEqual(
      [],
    );
    expect(buildPublicCmsImageRemotePatterns("not a url")).toEqual([]);
  });
});
