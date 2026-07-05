import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfigPath = fileURLToPath(
  new URL("../../../../apps/donor/next.config.ts", import.meta.url),
);

describe("apps/donor next.config images", () => {
  it("allows quality 85 for next/image (Next 16+ allowlist)", async () => {
    const mod = (await import(nextConfigPath)) as {
      default: {
        images?: {
          contentDispositionType?: string;
          dangerouslyAllowSVG?: boolean;
          qualities?: number[];
        };
      };
    };
    const qualities = mod.default.images?.qualities;
    expect(qualities).toBeDefined();
    expect(qualities).toContain(85);
  }, 60_000);

  it("keeps SVG optimization disabled and attachments enforced", async () => {
    const mod = (await import(nextConfigPath)) as {
      default: {
        images?: {
          contentDispositionType?: string;
          dangerouslyAllowSVG?: boolean;
        };
      };
    };

    expect(mod.default.images?.dangerouslyAllowSVG).not.toBe(true);
    expect(mod.default.images?.contentDispositionType).toBe("attachment");
  }, 60_000);
});
