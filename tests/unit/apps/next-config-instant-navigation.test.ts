import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

interface InstantNavigationConfig {
  cacheComponents?: boolean;
  partialPrefetching?: boolean;
}

/**
 * Next accepts either an object or `(phase, ctx) => config`. Admin exports the
 * function form because `withEve()` wraps its config, so reading `.default`
 * directly would report every flag as `undefined` while the real config is
 * fine. Resolve whichever form the app exports.
 */
type NextConfigExport =
  | InstantNavigationConfig
  | ((
      phase: string,
      context: { defaultConfig: Record<string, unknown> },
    ) => InstantNavigationConfig | Promise<InstantNavigationConfig>);

const resolveNextConfig = async (
  value: NextConfigExport,
): Promise<InstantNavigationConfig> =>
  typeof value === "function"
    ? await value("phase-production-build", { defaultConfig: {} })
    : value;

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
      // Import rather than regex the source: `default` is the wrapped export
      // (admin is withEve(withSentryConfig(withPayload(nextConfig)))), so this
      // proves the flags survive every plugin. The 60s budget covers loading
      // @payloadcms/next and @sentry/nextjs - not a flakiness allowance.
      const mod = (await import(configPath)) as { default: NextConfigExport };
      const config = await resolveNextConfig(mod.default);

      expect(config.cacheComponents).toBe(true);
      expect(config.partialPrefetching).toBe(true);
    }, 60_000);
  }
});
