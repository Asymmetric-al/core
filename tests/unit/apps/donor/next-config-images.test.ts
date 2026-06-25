import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfigPath = fileURLToPath(
  new URL("../../../../apps/donor/next.config.ts", import.meta.url),
);
const nextConfigImportTimeout = process.platform === "win32" ? 60_000 : 15_000;

describe("apps/donor next.config images", () => {
  it(
    "allows quality 85 for next/image (Next 16+ allowlist)",
    async () => {
      const mod = (await import(nextConfigPath)) as {
        default: { images?: { qualities?: number[] } };
      };
      const qualities = mod.default.images?.qualities;
      expect(qualities).toBeDefined();
      expect(qualities).toContain(85);
    },
    nextConfigImportTimeout,
  );
});
