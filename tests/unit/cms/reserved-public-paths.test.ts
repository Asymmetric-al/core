import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import * as publicPage from "@asym/lib/cms/public-page";
import { describe, expect, it, vi } from "vitest";

const fetchPage = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("called CMS reader");
  }),
);
vi.mock("../../../apps/donor/lib/cms/client", () => ({
  fetchPublishedCmsPageResult: fetchPage,
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("not found");
  },
}));

const app = "apps/donor/app";
const route = "(public)/(solid)/[...cmsSlug]";
function firstSegments(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || /^[_\[]/.test(entry.name)) return [];
    return entry.name.startsWith("(")
      ? firstSegments(path.join(dir, entry.name))
      : [entry.name];
  });
}

it("reserves every donor route and redirect while it owns that address", () => {
  const config = readFileSync("apps/donor/next.config.ts", "utf8").split(
    "async redirects()",
  )[1]!;
  const redirects = Array.from(
    config.split("];")[0]!.matchAll(/source:\s*"\/([^/"]+)/g),
    (match) => match[1],
  );
  expect(redirects).toContain("home");
  const owned = new Set([...firstSegments(app), ...redirects]);
  for (const name of owned)
    expect(publicPage.isReservedPublicPageSlug(name!), name).toBe(true);
  for (const name of publicPage.TRANSIENT_PUBLIC_PAGE_SEGMENTS)
    expect(owned.has(name), name).toBe(true);
});

it("the route policy holds exactly the first segments a donor route serves", async () => {
  const policy = await import("../../../apps/donor/lib/route-policy");
  expect([...(policy.DONOR_ROUTED_FIRST_SEGMENTS ?? [])].sort()).toEqual(
    [...new Set(firstSegments(app))].sort(),
  );
});

describe("the reserved check reads a slug as the public lookup reads a request", () => {
  it.each([" admin", "api ", " /admin", "give /x", "%61dmin", "%41PI/x"])(
    "reserves %j: decoded once, each segment trimmed, empty segments dropped",
    (slug) => {
      expect(publicPage.isReservedPublicPageSlug(slug)).toBe(true);
    },
  );

  it.each(["about-us", "administration", "admins", " about-us", "give%20x"])(
    "does not reserve %j (guard)",
    (slug) => {
      expect(publicPage.isReservedPublicPageSlug(slug)).toBe(false);
    },
  );
});

describe("the public catch-all streams again, and still refuses a reserved slug before any read", () => {
  it("keeps its loading fallback and sets no instant export: the 404 is decided before rendering", async () => {
    const page =
      await import("../../../apps/donor/app/(public)/(solid)/[...cmsSlug]/page");
    expect(existsSync(path.join(app, route, "loading.tsx"))).toBe(true);
    expect("instant" in page).toBe(false);
  });

  it.each([
    "api/nope",
    "auth/nope",
    "web-studio/x",
    "invite/x",
    "admin/x",
    "give/monthly",
  ])(
    "refuses %s before either the metadata or the document reads the CMS",
    async (slug) => {
      const page =
        await import("../../../apps/donor/app/(public)/(solid)/[...cmsSlug]/page");
      const props = { params: Promise.resolve({ cmsSlug: slug.split("/") }) };
      await expect(page.generateMetadata(props)).resolves.toEqual({
        title: "Page not found",
      });
      await expect(page.default(props)).rejects.toThrow("not found");
      expect(fetchPage).not.toHaveBeenCalled();
    },
  );
});
