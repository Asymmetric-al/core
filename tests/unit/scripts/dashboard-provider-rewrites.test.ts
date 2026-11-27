import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  MISSIONARY_EXEMPT_PATHS,
  STAFF_EXEMPT_PATHS,
} from "../../../packages/auth/front";
import { APP_BASE_PATHS } from "../../../scripts/release/serve-under-paths.mjs";

const repoRoot = process.cwd();
const BUN = readFileSync(path.join(repoRoot, ".bun-version"), "utf8").trim();

type Rewrite = Record<string, unknown>;
type VercelConfig = Record<string, unknown> & { rewrites?: Rewrite[] };

const readConfig = (app: string): VercelConfig =>
  JSON.parse(
    readFileSync(path.join(repoRoot, "apps", app, "vercel.json"), "utf8"),
  ) as VercelConfig;

const today = (app: string) => ({
  $schema: "https://openapi.vercel.sh/vercel.json",
  installCommand: `bunx bun@${BUN} install --cwd ../.. --frozen-lockfile`,
  buildCommand: `cd ../.. && bun run build:${app}`,
  ignoreCommand: `node ../../scripts/vercel/should-ignore-build.mjs ${app}`,
  git: {
    deploymentEnabled: {
      "*": false,
      develop: false,
      production: false,
      main: false,
    },
  },
});

const DASHBOARDS = ["admin", "missionary"] as const;

const EXPECTED_SOURCES = {
  admin: STAFF_EXEMPT_PATHS.filter(
    (source) =>
      source !== "/api/health/migrations" && source !== "/eve/v1/github",
  ),
  missionary: MISSIONARY_EXEMPT_PATHS.filter(
    (source) => source !== "/api/health/migrations",
  ),
};

const rewritesOf = (app: string) => {
  const { rewrites } = readConfig(app);
  expect(Array.isArray(rewrites), `${app} has a rewrites array`).toBe(true);
  expect(rewrites!.length, `${app} rewrites`).toBeGreaterThan(0);
  return rewrites!;
};

const without = (config: VercelConfig, key: string) =>
  Object.fromEntries(Object.entries(config).filter(([name]) => name !== key));

describe("the dashboards' vercel.json rewrite providers' root paths under the base path, and change nothing else", () => {
  it("lists, in order, each dashboard's exempt paths without the release check and the assistant's /eve/v1/github (D-18, AL-2681: the admin list gains the payment-event destination of W8-R39)", () => {
    expect(rewritesOf("admin").map((rule) => rule.source)).toEqual(
      EXPECTED_SOURCES.admin,
    );
    expect(EXPECTED_SOURCES.admin).toEqual([
      "/api/webhooks/stripe",
      "/api/webhooks/stripe-connect",
      "/api/webhooks/stripe-payment-events",
      "/api/email/webhooks/resend",
      "/api/inngest",
    ]);
    expect(rewritesOf("missionary").map((rule) => rule.source)).toEqual(
      EXPECTED_SOURCES.missionary,
    );
    expect(EXPECTED_SOURCES.missionary).toEqual(["/api/webhooks/stripe"]);
  });

  it.each(DASHBOARDS)(
    "%s: each rule is exactly { source, destination } with destination = base path + source, static and lower-case",
    (app) => {
      for (const rule of rewritesOf(app)) {
        expect(Object.keys(rule), JSON.stringify(rule)).toEqual([
          "source",
          "destination",
        ]);
        const source = String(rule.source);
        const destination = String(rule.destination);
        expect(destination).toBe(`${APP_BASE_PATHS[app]}${source}`);
        expect(APP_BASE_PATHS[app]).not.toBe("");
        for (const value of [source, destination]) {
          expect(value, value).toMatch(/^(?:\/[a-z0-9-]+)+$/);
          expect(value, value).not.toMatch(/[:(*?#[A-Z]|\/$/);
        }
      }
    },
  );

  it.each(DASHBOARDS)(
    "%s: a route handler answers each source in the build with the switch off, and none sits at the destination",
    (app) => {
      const rewrites = rewritesOf(app);
      expect(Array.isArray(rewrites) && rewrites.length > 0).toBe(true);
      for (const rule of rewrites) {
        const sourceRoute = path.join(
          repoRoot,
          "apps",
          app,
          `app${String(rule.source)}`,
          "route.ts",
        );
        const destinationRoute = path.join(
          repoRoot,
          "apps",
          app,
          `app${String(rule.destination)}`,
          "route.ts",
        );
        expect(existsSync(sourceRoute), sourceRoute).toBe(true);
        expect(existsSync(destinationRoute), destinationRoute).toBe(false);
      }
    },
  );

  it.each(DASHBOARDS)(
    "%s: rewrites come last, after git, and the rest of the file is today's",
    (app) => {
      const config = readConfig(app);
      expect(Object.keys(config)).toEqual([
        ...Object.keys(today(app)),
        "rewrites",
      ]);
      expect(without(config, "rewrites")).toEqual(today(app));
    },
  );

  it.each(DASHBOARDS)(
    "%s: no rule touches /eve/ and the file has no routes, redirects, headers, cleanUrls or trailingSlash",
    (app) => {
      const config = readConfig(app);
      for (const rule of config.rewrites ?? []) {
        expect(String(rule.source)).not.toContain("/eve/");
        expect(String(rule.destination)).not.toContain("/eve/");
      }
      for (const key of [
        "routes",
        "redirects",
        "headers",
        "cleanUrls",
        "trailingSlash",
      ]) {
        expect(Object.hasOwn(config, key), `${app} ${key}`).toBe(false);
      }
      expect(without(config, "rewrites")).toEqual(today(app));
    },
  );

  it("leaves the donor's vercel.json as it is", () => {
    expect(readConfig("donor")).toEqual(today("donor"));
  });
});
