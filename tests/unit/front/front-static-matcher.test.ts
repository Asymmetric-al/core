import { readFileSync } from "node:fs";

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

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  expect(network.reached).toEqual([]);
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
