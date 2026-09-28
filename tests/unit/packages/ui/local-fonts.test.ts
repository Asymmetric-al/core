import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import localFont from "next/font/local";
import { beforeAll, describe, expect, it, vi } from "vitest";

import manifest from "../../../../packages/ui/fonts/manifest.json";

const fontRoot = resolve("packages/ui/fonts");
const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

vi.mock("next/font/local", () => ({
  default: vi.fn((options: { variable: string }) => ({
    variable: options.variable,
  })),
}));

describe.each(["admin", "donor", "missionary"])(
  "%s root font delivery",
  (app) => {
    it("uses the shared font export without a Google compiler dependency", () => {
      const source = readFileSync(
        resolve(`apps/${app}/app/layout.tsx`),
        "utf8",
      );

      expect(source).not.toContain("next/font/google");
      expect(source).toContain('from "@asym/ui/fonts"');
      expect(source).not.toContain("fonts.gstatic.com");
    });
  },
);

describe("reviewed app font assets", () => {
  it("retains every original WOFF2 byte and upstream license notice", () => {
    const assetFiles = [];
    for (const family of manifest.families) {
      const license = readFileSync(resolve(fontRoot, family.licenseFile));
      expect(sha256(license)).toBe(family.licenseSha256);
      expect(license.toString()).toContain("SIL OPEN FONT LICENSE Version 1.1");
      for (const subset of family.subsets) {
        const bytes = readFileSync(resolve(fontRoot, subset.file));
        expect(bytes.subarray(0, 4).toString()).toBe("wOF2");
        expect(bytes.byteLength).toBe(subset.bytes);
        expect(sha256(bytes)).toBe(subset.sha256);
        assetFiles.push(subset.file);
      }
    }
    expect(assetFiles).toHaveLength(16);
    const checkedInAssets = manifest.families.flatMap((family) =>
      readdirSync(resolve(fontRoot, family.directory))
        .filter((name) => name.endsWith(".woff2"))
        .map((name) => `${family.directory}/${name}`),
    );
    expect(checkedInAssets.sort()).toEqual(assetFiles.sort());
  });

  it("retains the original fallback metric descriptors", () => {
    const stylesheet = readFileSync(resolve(fontRoot, "fallbacks.css"), "utf8");
    const faces = [...stylesheet.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
      (match) =>
        Object.fromEntries(
          match[1]
            .split(";")
            .filter((line) => line.includes(":"))
            .map((line) => {
              const colon = line.indexOf(":");
              return [
                line.slice(0, colon).trim(),
                line
                  .slice(colon + 1)
                  .trim()
                  .replace(/"/g, ""),
              ];
            }),
        ),
    );
    expect(faces).toHaveLength(3);
    for (const family of manifest.families) {
      expect(faces).toContainEqual({
        "font-family": family.fallback.family,
        src: `local(${family.fallback.local})`,
        ...family.fallback.metrics,
      });
    }
  });
});

describe("supported local font declarations", () => {
  let calls: Parameters<typeof localFont>[];
  let variables: string;

  beforeAll(async () => {
    const fonts = await import("../../../../packages/ui/fonts/index");
    variables = fonts.fontVariables;
    calls = [...vi.mocked(localFont).mock.calls];
  });

  it("preserves all Unicode faces, weights, public variables and preload choices", () => {
    expect(calls).toHaveLength(16);
    let faceCount = 0;
    let preloadCount = 0;
    for (const family of manifest.families) {
      expect(variables.split(" ")).toContain(family.variable);
      const familyCalls = calls
        .map(([options]) => options)
        .filter((options) => options.variable === family.variable);
      expect(familyCalls).toHaveLength(family.subsets.length);
      for (const subset of family.subsets) {
        const options = familyCalls.find((candidate) =>
          candidate.declarations?.some(
            (declaration) =>
              declaration.prop === "unicode-range" &&
              declaration.value === subset.unicodeRange,
          ),
        );
        expect(options).toEqual({
          src: family.weights.map((weight) => ({
            path: `./${subset.name}.woff2`,
            weight,
            style: family.style,
          })),
          display: family.display,
          preload: subset.name === family.preloadSubset,
          variable: family.variable,
          adjustFontFallback: false,
          fallback: [family.fallback.family],
          declarations: [{ prop: "unicode-range", value: subset.unicodeRange }],
        });
        faceCount += family.weights.length;
        if (options?.preload) preloadCount += 1;
      }
    }
    expect(faceCount).toBe(56);
    expect(preloadCount).toBe(2);
  });

  it("exposes the shared package entry used by each root layout", () => {
    const pkg = JSON.parse(
      readFileSync(resolve("packages/ui/package.json"), "utf8"),
    );
    expect(pkg.exports["./fonts"]).toBe("./fonts/index.ts");
  });
});
