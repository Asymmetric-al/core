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

  it("keeps its dev default in sync with the donor CMS client default", async () => {
    const clientModule = await import("../../../apps/donor/lib/cms/client");

    const originalBaseUrl = process.env.CMS_BASE_URL;
    delete process.env.CMS_BASE_URL;
    try {
      const clientDefault = new URL(clientModule.getPublicCmsBaseUrl());
      const [pattern] = buildPublicCmsImageRemotePatterns(undefined);

      expect(pattern).toBeDefined();
      expect(`${pattern?.protocol}:`).toBe(clientDefault.protocol);
      expect(pattern?.hostname).toBe(clientDefault.hostname);
      expect(pattern?.port ?? "").toBe(clientDefault.port);
    } finally {
      if (originalBaseUrl !== undefined) {
        process.env.CMS_BASE_URL = originalBaseUrl;
      }
    }
  });
});
