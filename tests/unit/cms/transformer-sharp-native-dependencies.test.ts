import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import type sharp from "sharp";

const adminRequire = createRequire(
  new URL("../../../apps/admin/package.json", import.meta.url),
);
const transformerRequire = createRequire(
  adminRequire.resolve("@payloadcms/transformer-sharp"),
);
const transformerSharp: typeof sharp = transformerRequire("sharp");

function versionNumber(version: string) {
  const [major, minor, patch] = version.split(".").map(Number);
  return major * 1_000_000 + minor * 1_000 + patch;
}

describe("Payload transformer's loaded native decoder dependencies", () => {
  it.each([
    { library: "sharp", minimum: 35_005 },
    { library: "vips", minimum: 8_018_007 },
    { library: "heif", minimum: 1_023_002 },
    { library: "rsvg", minimum: 2_063_002 },
  ])("loads the patched $library runtime", ({ library, minimum }) => {
    expect(
      versionNumber(transformerSharp.versions[library] ?? "0.0.0"),
    ).toBeGreaterThanOrEqual(minimum);
  });
});
