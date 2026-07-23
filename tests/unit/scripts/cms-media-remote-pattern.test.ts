import { describe, expect, it } from "vitest";

import { buildPublicCmsImageRemotePatterns } from "../../../scripts/cms/public-media-remote-pattern.mjs";

const VERCEL_BLOB_PUBLIC_PATTERN = {
  protocol: "https" as const,
  hostname: "**.public.blob.vercel-storage.com",
};

describe("buildPublicCmsImageRemotePatterns", () => {
  it("derives the CMS pattern from an https base URL and always includes Blob", () => {
    expect(
      buildPublicCmsImageRemotePatterns("https://admin.example.org"),
    ).toEqual([
      { protocol: "https", hostname: "admin.example.org" },
      VERCEL_BLOB_PUBLIC_PATTERN,
    ]);
  });

  it("keeps explicit ports", () => {
    expect(buildPublicCmsImageRemotePatterns("http://127.0.0.1:3030")).toEqual([
      { protocol: "http", hostname: "127.0.0.1", port: "3030" },
      VERCEL_BLOB_PUBLIC_PATTERN,
    ]);
  });

  it("falls back to the local-dev CMS origin when unset (matching the donor CMS client default)", () => {
    const expected = [
      { protocol: "http", hostname: "127.0.0.1", port: "3030" },
      VERCEL_BLOB_PUBLIC_PATTERN,
    ];
    expect(buildPublicCmsImageRemotePatterns(undefined)).toEqual(expected);
    expect(buildPublicCmsImageRemotePatterns("")).toEqual(expected);
    expect(buildPublicCmsImageRemotePatterns("   ")).toEqual(expected);
  });

  it("still allows Blob optimization when the CMS base is not http(s)", () => {
    expect(buildPublicCmsImageRemotePatterns("ftp://cms.example.org")).toEqual([
      VERCEL_BLOB_PUBLIC_PATTERN,
    ]);
    expect(buildPublicCmsImageRemotePatterns("not a url")).toEqual([
      VERCEL_BLOB_PUBLIC_PATTERN,
    ]);
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
