import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import config from "../next.config";

// Next's own matcher for a `headers()` source; it ships without types.
const { pathToRegexp } = createRequire(import.meta.url)(
  "next/dist/compiled/path-to-regexp",
) as { pathToRegexp: (source: string) => RegExp };

// Observed through the operator's tunnel on 12 November 2026 (about 13 KB/s):
// every response, hashed assets included, was sent `no-store`, so each visit
// downloaded the whole application again and took 40 to 80 seconds.
describe("response caching", () => {
  const rules = async () =>
    ((await config.headers?.()) ?? []).map((rule) => ({
      matches: (pathname: string) => pathToRegexp(rule.source).test(pathname),
      headers: new Map(
        rule.headers.map((header) => [header.key, header.value]),
      ),
    }));
  // Next applies every matching rule in order; the last value for a key wins.
  const header = async (pathname: string, key: string) =>
    (await rules())
      .filter((rule) => rule.matches(pathname))
      .reduce<string | undefined>(
        (value, rule) => rule.headers.get(key) ?? value,
        undefined,
      );

  it("never lets a page, the icon or an API answer be stored", async () => {
    for (const pathname of [
      "/",
      "/icon.svg",
      "/api/console/snapshot",
      "/api/console/issues/2233",
      "/_next/data/x.json",
      "/_next/image",
    ])
      expect(await header(pathname, "Cache-Control"), pathname).toBe(
        "no-store",
      );
  });

  it("leaves hashed build assets to Next's own immutable caching", async () => {
    for (const pathname of [
      "/_next/static/chunks/369-831b97ea4503fd41.js",
      "/_next/static/css/bbc47d5c80d08977.css",
      "/_next/static/media/8a1d8947e5852e30.p.woff2",
    ])
      expect(await header(pathname, "Cache-Control"), pathname).toBeUndefined();
  });

  it("keeps the security headers on every response", async () => {
    for (const pathname of ["/", "/_next/static/chunks/a.js", "/api/x"]) {
      expect(await header(pathname, "X-Content-Type-Options")).toBe("nosniff");
      expect(await header(pathname, "X-Frame-Options")).toBe("DENY");
      expect(await header(pathname, "Referrer-Policy")).toBe("no-referrer");
      expect(await header(pathname, "Content-Security-Policy")).toContain(
        "frame-ancestors 'none'",
      );
    }
  });
});
