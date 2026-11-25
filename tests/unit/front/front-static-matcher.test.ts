import { readFileSync } from "node:fs";

import * as pageStaticInfo from "next/dist/build/analysis/get-page-static-info";
import { getMiddlewareRouteMatcher } from "next/dist/shared/lib/router/utils/middleware-route-matcher";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

const donorModule = await import("../../../apps/donor/proxy");
const adminModule = await import("../../../apps/admin/proxy");
const missionaryModule = await import("../../../apps/missionary/proxy");
const serveUnderPaths =
  await import("../../../scripts/release/serve-under-paths.mjs");

type CompiledMatcher = Parameters<typeof getMiddlewareRouteMatcher>[0];

const { getMiddlewareMatchers } = pageStaticInfo as unknown as {
  getMiddlewareMatchers: (
    matcher: string[],
    nextConfig: Record<string, unknown>,
  ) => CompiledMatcher;
};

const SEGMENT = "[^/.][^/]*|\\.[^/.][^/]*|\\.\\.[^/]+";

function donorProxyRunsOnRawPath(pathname: string): boolean {
  const matchers = getMiddlewareMatchers(donorModule.config.matcher, {});
  return getMiddlewareRouteMatcher(matchers)(pathname, {} as never, {});
}

function donorRewriteFor(pathname: string): string | null {
  const rewrites = serveUnderPaths.serveUnderPathsDonorRewrites({
    CORE_SERVE_UNDER_PATHS: "1",
    FRONT_ADMIN_ORIGIN: "https://a.example.test",
    FRONT_MISSIONARY_ORIGIN: "https://m.example.test",
  });
  for (const rule of rewrites?.beforeFiles ?? []) {
    const match = getPathMatch(rule.source, {
      strict: true,
      removeUnnamedParams: true,
      sensitive: false,
    });
    if (match(pathname)) return rule.destination;
  }
  return null;
}

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  expect(network.reached.splice(0)).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const DASHBOARD_STATIC_FILES = [
  "/admin/_next/static/chunks/a.js",
  "/missionary/_next/static/css/a.css",
  "/admin/_next/image?url=%2Fx.png&w=64&q=75",
  "/admin/_next/",
  "/missionary/_next/",
];

const STILL_RUN = [
  "/admin",
  "/admin/",
  "/admin/_next",
  "/admin/_nextx/a",
  "/Admin/_next/a",
  "/admin/x/_next/a",
  "/x/admin/_next/a",
  "/admin/eve/v1/session",
  "/missionary",
  "/missionary/_next",
  "/missionary/_nextx/a",
  "/Missionary/_next/a",
  "/missionary/x/_next/a",
  "/administration/_next/a",
];

const ADMIN_MATCHER =
  "/((?!_next/|maplibre/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)";
const MISSIONARY_MATCHER =
  "/((?!_next/|[^/]+\\.(?:ico|svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)";

describe("the donor proxy's matcher and the dashboards' static files", () => {
  it.each(DASHBOARD_STATIC_FILES)(
    "skips the dashboard static path %s",
    (url) => {
      expect(
        unstable_doesMiddlewareMatch({ config: donorModule.config, url }),
      ).toBe(false);
    },
  );

  it.each(STILL_RUN)("still runs on %s", (url) => {
    expect(
      unstable_doesMiddlewareMatch({ config: donorModule.config, url }),
    ).toBe(true);
  });

  it("holds the matcher as one string literal inside export const config", () => {
    const source = readFileSync("apps/donor/proxy.ts", "utf8");
    const start = source.indexOf("export const config = {");
    expect(start).toBeGreaterThan(-1);
    const block = source.slice(start);
    const literals = [...block.matchAll(/^\s*("(?:[^"\\]|\\.)*"),?\s*$/gm)].map(
      (match) => JSON.parse(match[1]!) as string,
    );
    expect(literals).toHaveLength(1);
    expect(donorModule.config).toEqual({ matcher: literals });
    expect(block).toMatch(/\bmatcher:\s*\[/);
  });

  it("leaves the staff and missionary matchers as they are", () => {
    expect(adminModule.config).toEqual({ matcher: ["/", ADMIN_MATCHER] });
    expect(missionaryModule.config).toEqual({
      matcher: ["/", MISSIONARY_MATCHER],
    });
  });
});

const RAW_DASHBOARD_ASSETS = [
  "/admin/_next/static/chunks/a.js",
  "/admin/_next/static/immutable/chunks/a.css",
  "/admin/_next/static/a..b.js",
  "/admin/_next/static/.a.js",
  "/admin/_next/static/..a.js",
  "/admin/_next/static/.../a.js",
  "/admin/_next/static/a.json",
  "/admin/_next/image",
  "/missionary/_next/static/css/a.css",
  "/missionary/_next/static/chunks/a..b.js",
];

const RAW_DOT_SEGMENTS = [
  "/admin/_next/.",
  "/admin/_next/..",
  "/admin/_next/../../donor-dashboard",
  "/admin/_next/../../donor-dashboard.rsc",
  "/admin/_next/../../donor-dashboard.segments/_tree.segment.rsc",
  "/admin/_next/./../../donor-dashboard",
  "/admin/_next/../../checkout",
  "/admin/_next/../../api/donate",
  "/admin/_next/../../eve/v1/info",
  "/admin/_next/static/.",
  "/admin/_next/static/..",
  "/admin/_next/static/./a.js",
  "/admin/_next/static/../chunks/a.js",
  "/admin/_next/static/../../../donor-dashboard",
  "/admin/_next//static/a.js",
  "/admin/_next/static//a.js",
  "/missionary/_next/.",
  "/missionary/_next/..",
  "/missionary/_next/../../donor-dashboard",
  "/missionary/_next/../../api/health",
];

const UNRELATED_ROUTES = [
  "/",
  "/workers",
  "/workers/1",
  "/workers/1.rsc",
  "/workers/1.segments/_tree.segment.rsc",
  "/about",
  "/login",
  "/donor-dashboard",
];

describe("the donor proxy's matcher on raw paths, before any dot segment is resolved", () => {
  it.each([...RAW_DASHBOARD_ASSETS, "/admin/_next/", "/missionary/_next/"])(
    "skips the dashboard asset %s",
    (pathname) => {
      expect(donorProxyRunsOnRawPath(pathname)).toBe(false);
    },
  );

  it.each(RAW_DOT_SEGMENTS)(
    "runs on %s, which holds an empty, . or .. segment",
    (pathname) => {
      expect(donorProxyRunsOnRawPath(pathname)).toBe(true);
    },
  );

  it.each([...STILL_RUN, ...UNRELATED_ROUTES])(
    "still runs on %s",
    (pathname) => {
      expect(donorProxyRunsOnRawPath(pathname)).toBe(true);
    },
  );

  it("skips a dashboard asset exactly when the rewrite with the switch on takes it", () => {
    for (const pathname of [...RAW_DASHBOARD_ASSETS, ...RAW_DOT_SEGMENTS]) {
      expect(donorRewriteFor(pathname) !== null, pathname).toBe(
        !donorProxyRunsOnRawPath(pathname),
      );
    }
  });

  it("uses the one segment rule of serve-under-paths.mjs for both prefixes", () => {
    expect(serveUnderPaths.DASHBOARD_ASSET_SEGMENT).toBe(SEGMENT);
    const [literal] = donorModule.config.matcher;
    for (const prefix of ["admin", "missionary"]) {
      expect(literal).toContain(
        `|${prefix}/_next/(?:(?:${SEGMENT})(?:/|$))*$|`,
      );
    }
    expect(literal).not.toContain("|admin/_next/|");
    expect(literal).not.toContain("|missionary/_next/|");
  });
});
