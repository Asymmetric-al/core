import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

interface InstantNavigationConfig {
  cacheComponents?: boolean;
  partialPrefetching?: boolean;
}

const APP_CONFIGS = [
  {
    app: "admin",
    configPath: fileURLToPath(
      new URL("../../../apps/admin/next.config.ts", import.meta.url),
    ),
  },
  {
    app: "donor",
    configPath: fileURLToPath(
      new URL("../../../apps/donor/next.config.ts", import.meta.url),
    ),
  },
  {
    app: "missionary",
    configPath: fileURLToPath(
      new URL("../../../apps/missionary/next.config.ts", import.meta.url),
    ),
  },
] as const;

/**
 * Config lock only: asserts the three Next.js apps keep Cache Components and
 * Partial Prefetching enabled. Route-level Instant Navigation compliance is
 * guarded elsewhere - Instant Insights [stream]/[cache]/[block] errors during
 * `next build`, and tests/e2e/instant-navigation.spec.ts in the `instant-nav`
 * job.
 */
describe("Instant Navigation config (Next.js 16.3)", () => {
  for (const { app, configPath } of APP_CONFIGS) {
    it(`apps/${app} enables Cache Components and Partial Prefetching`, async () => {
      // Prefer the named `nextConfig`: admin's default export is
      // `withEve(withSentryConfig(withPayload(nextConfig)))`, and `withEve`
      // returns Next's function form `(phase, ctx) => config`, so reading
      // `.default` directly reports every flag as `undefined`. Calling it
      // would also run withEve's Vercel-output side effects inside a unit
      // test. This locks the source config; that the flags survive the
      // plugins is what `next build` proves.
      const mod = (await import(configPath)) as {
        default: InstantNavigationConfig;
        nextConfig?: InstantNavigationConfig;
      };
      const config = mod.nextConfig ?? mod.default;

      expect(config.cacheComponents).toBe(true);
      expect(config.partialPrefetching).toBe(true);
    }, 60_000);
  }
});
