import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const PACKAGE_JSON_PATH = "package.json";

describe("local gates contract", () => {
  const packageJson = JSON.parse(
    readFileSync(PACKAGE_JSON_PATH, "utf8"),
  ) as {
    scripts: Record<string, string>;
  };

  it("keeps bun run check as lint, typecheck, then test:unit", () => {
    expect(packageJson.scripts.check).toBe(
      "bun run lint && bun run typecheck && bun run test:unit",
    );
  });

  it("wires ci:preflight to the preflight verifier script", () => {
    expect(packageJson.scripts["ci:preflight"]).toBe(
      "node scripts/verify/ci-preflight.mjs",
    );
  });

  it("exposes per-app lint and typecheck scripts for donor and missionary", () => {
    expect(packageJson.scripts["lint:donor"]).toContain("@asym/donor");
    expect(packageJson.scripts["lint:missionary"]).toContain(
      "@asym/missionary-app",
    );
    expect(packageJson.scripts["typecheck:donor"]).toContain("@asym/donor");
    expect(packageJson.scripts["typecheck:missionary"]).toContain(
      "@asym/missionary-app",
    );
  });
});
