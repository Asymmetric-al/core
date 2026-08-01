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

describe("Instant Navigation config (Next.js 16.3)", () => {
  for (const { app, configPath } of APP_CONFIGS) {
    it(`apps/${app} enables Cache Components and Partial Prefetching`, async () => {
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
