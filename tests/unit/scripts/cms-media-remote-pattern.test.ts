import { describe, expect, it } from "vitest";

import { buildPublicCmsImageRemotePatterns } from "../../../scripts/cms/public-media-remote-pattern.mjs";

/**
 * Payload's media route moved under /web-studio/api (AL-2675, WP2b slice C).
 * The release job promotes the apps one after another, so for this release
 * the donor admits both routes (plan 7.4); the next release drops the old one.
 */
const CMS_MEDIA_FILE_PATHNAMES = [
  "/web-studio/api/media/file/**",
  "/api/media/file/**",
] as const;

function cmsPatterns(origin: {
  protocol: "http" | "https";
  hostname: string;
  port: string;
}) {
  return CMS_MEDIA_FILE_PATHNAMES.map((pathname) => ({ ...origin, pathname }));
}

const VERCEL_BLOB_PUBLIC_PATTERN = {
  protocol: "https" as const,
  hostname: "**.public.blob.vercel-storage.com",
  port: "",
};

describe("buildPublicCmsImageRemotePatterns", () => {
  it("derives a media-file-scoped CMS pattern from an https base URL and always includes Blob", () => {
    expect(
      buildPublicCmsImageRemotePatterns("https://admin.example.org"),
    ).toEqual([
      // An explicit empty port blocks custom ports; an omitted field would
      // imply the `**` wildcard (Next.js remotePatterns docs).
      ...cmsPatterns({
        protocol: "https",
        hostname: "admin.example.org",
        port: "",
      }),
      VERCEL_BLOB_PUBLIC_PATTERN,
    ]);
  });

  it("keeps explicit ports", () => {
    expect(buildPublicCmsImageRemotePatterns("http://127.0.0.1:3030")).toEqual([
      ...cmsPatterns({ protocol: "http", hostname: "127.0.0.1", port: "3030" }),
      VERCEL_BLOB_PUBLIC_PATTERN,
    ]);
  });

  it("falls back to the local-dev CMS origin when unset (matching the donor CMS client default)", () => {
    const expected = [
      ...cmsPatterns({ protocol: "http", hostname: "127.0.0.1", port: "3030" }),
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
