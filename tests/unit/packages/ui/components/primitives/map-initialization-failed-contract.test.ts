import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../../../../../");
const mapSource = readFileSync(
  path.join(repoRoot, "packages/ui/components/primitives/map.tsx"),
  "utf8",
);

describe("Map initialization-failed source contract", () => {
  it("handles constructor GPUInitializationError as a failed state, not loaded", () => {
    expect(mapSource).toContain("GPUInitializationError");
    expect(mapSource).toMatch(/initializationFailed/);
    expect(mapSource).not.toMatch(
      /catch\s*\([^)]*\)\s*\{[\s\S]*?markMapReady\s*\(/,
    );
  });

  it("keeps map-only controls gated on a live map instance", () => {
    expect(mapSource).toMatch(
      /export function MapControls\([\s\S]*?if\s*\(\s*!isLoaded\s*\|\|\s*!map\s*\)\s*return null/,
    );
    expect(mapSource).toMatch(
      /export function MapStyleToggle\([\s\S]*?if\s*\(\s*!isLoaded\s*\|\|\s*!map\s*\)\s*return null/,
    );
    expect(mapSource).toMatch(
      /export function MapLegend\([\s\S]*?if\s*\(\s*!isLoaded\s*\|\|\s*!map\s*\)\s*return null/,
    );
  });
});
