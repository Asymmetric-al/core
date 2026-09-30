import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../../../../../");
const mapSource = readFileSync(
  path.join(repoRoot, "packages/ui/components/primitives/map.tsx"),
  "utf8",
);
const donorNextConfig = readFileSync(
  path.join(repoRoot, "apps/donor/next.config.ts"),
  "utf8",
);
const adminNextConfig = readFileSync(
  path.join(repoRoot, "apps/admin/next.config.ts"),
  "utf8",
);

describe("MapLibre 6 worker URL contract", () => {
  it("points MapLibre at the public worker before constructing a Map", () => {
    const setWorker = mapSource.search(/setWorkerUrl\s*\(/);
    const constructMap = mapSource.search(/new maplibregl\.Map\s*\(/);

    expect(setWorker).toBeGreaterThan(-1);
    expect(constructMap).toBeGreaterThan(-1);
    expect(setWorker).toBeLessThan(constructMap);
    expect(mapSource).toContain("/maplibre/maplibre-gl-worker.mjs");
  });

  it("copies MapLibre worker assets during donor and admin Next config load", () => {
    expect(donorNextConfig).toContain("copyMaplibreWorkerAssetsForApp");
    expect(adminNextConfig).toContain("copyMaplibreWorkerAssetsForApp");
  });
});
