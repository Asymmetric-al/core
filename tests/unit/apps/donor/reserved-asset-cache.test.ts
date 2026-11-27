import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function yearLongRules(mode: string) {
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", mode);
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("VERCEL_TARGET_ENV", "");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", "https://a.example.test");
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", "https://m.example.test");
  const { pathToRegexp } = await import("next/dist/compiled/path-to-regexp");
  const config = (await import("../../../../apps/donor/next.config")).default;
  const rules = ((await config.headers?.()) ?? []).filter((rule) =>
    rule.headers.some(
      (header) =>
        header.key === "Cache-Control" && /immutable/.test(header.value),
    ),
  );
  expect(rules).toHaveLength(3);
  return (path: string) =>
    rules.some((rule) => pathToRegexp(rule.source).test(path));
}

describe.each([
  ["off", ""],
  ["on", "1"],
])("the year-long asset cache rules, switch %s", (_label, mode) => {
  it.each([
    "/api/nope.png",
    "/api/x/y.js",
    "/api/nope.woff2",
    "/auth/nope.css",
    "/auth/x/y.svg",
    "/API/nope.png",
  ])(
    "never match %s: a miss under /api or /auth is the donor app's own uncached 404",
    async (path) => {
      const matches = await yearLongRules(mode);
      expect(matches(path)).toBe(false);
    },
  );

  it.each([
    "/og-image.png",
    "/icon.svg",
    "/maplibre/maplibre-gl-shared.mjs",
    "/workers/x.png",
    "/apiary.png",
    "/authors/x.css",
    "/api.png",
  ])("still match %s (guard)", async (path) => {
    const matches = await yearLongRules(mode);
    expect(matches(path)).toBe(true);
  });
});

it("on, the rules still leave the dashboards' paths to the dashboards (guard)", async () => {
  const matches = await yearLongRules("1");
  for (const path of [
    "/admin/_next/static/chunks/a.js",
    "/admin/x.png",
    "/missionary/x.css",
  ]) {
    expect(matches(path), path).toBe(false);
  }
});
