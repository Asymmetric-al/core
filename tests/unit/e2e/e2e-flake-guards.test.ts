import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const E2E_ROOT = path.join(process.cwd(), "tests", "e2e");

function listSpecFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSpecFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".spec.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("e2e flake guards", () => {
  it("avoids fixed sleep waits in Playwright specs", () => {
    const offenders: string[] = [];

    for (const filePath of listSpecFiles(E2E_ROOT)) {
      const contents = readFileSync(filePath, "utf8");
      if (contents.includes("waitForTimeout(")) {
        offenders.push(path.relative(process.cwd(), filePath));
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps CI Playwright retries enabled for transient navigation flakes", () => {
    const config = readFileSync(
      path.join(process.cwd(), "playwright.config.ts"),
      "utf8",
    );

    expect(config).toContain("retries: process.env.CI ? 2 : 0");
  });
});
