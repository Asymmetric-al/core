import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

describe("Shadscan browser dependency isolation", () => {
  it("keeps Axe's Playwright peer on the repository test runner while isolating the scanner core", () => {
    const testRequire = createRequire(require.resolve("@playwright/test"));
    const playwrightRequire = createRequire(testRequire.resolve("playwright"));
    const axeRequire = createRequire(require.resolve("@axe-core/playwright"));
    const cliRequire = createRequire(
      require.resolve("@shadscan/cli/package.json"),
    );
    const testCore = playwrightRequire.resolve("playwright-core/package.json");
    const axeCore = axeRequire.resolve("playwright-core/package.json");
    const scannerCore = cliRequire.resolve("playwright-core/package.json");

    expect(axeCore).toBe(testCore);
    expect(JSON.parse(readFileSync(testCore, "utf8")).version).toBe("1.64.0");
    expect(JSON.parse(readFileSync(scannerCore, "utf8")).version).toBe(
      "1.61.1",
    );
    expect(scannerCore).not.toBe(testCore);
  });
});
