import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const styles = readFileSync(
  path.join(root, "apps/admin/src/styles/payloadStyles.css"),
  "utf8",
);
const adminRequire = createRequire(path.join(root, "apps/admin/package.json"));
const upstream = readFileSync(
  path.join(
    path.dirname(adminRequire.resolve("@payloadcms/ui/css/app.css")),
    "colors.css",
  ),
  "utf8",
);
const shared = readFileSync(
  path.join(root, "packages/ui/styles/globals.css"),
  "utf8",
);

function declarations(source: string) {
  return new Map(
    [...source.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)].map(
      ([, name, value]) => [name!, value!.trim()],
    ),
  );
}

describe("Payload semantic theme contract", () => {
  it("replaces the removed theme variables with every installed semantic color token", () => {
    expect(styles).not.toContain("--theme-");
    const tokens = [...declarations(upstream).keys()].filter((name) =>
      name.startsWith("--color-"),
    );
    expect(tokens.length).toBeGreaterThan(100);
    const bridge = declarations(styles);
    expect(tokens.filter((name) => !bridge.has(name))).toEqual([]);
  });

  it("derives CMS colors from the shared design system without a parallel palette", () => {
    const bridge = declarations(styles);
    const sharedTokens = declarations(shared);
    const colors = [...bridge].filter(([name]) => name.startsWith("--color-"));
    expect(colors.length).toBeGreaterThan(100);
    for (const [name, value] of colors) {
      expect(value, name).not.toMatch(/--ramp-|#[\da-f]+|rgba?\(|hsla?\(/i);
      const references = [...value.matchAll(/var\((--[\w-]+)/g)].map(
        ([, reference]) => reference!,
      );
      expect(references.length, name).toBeGreaterThan(0);
      expect(
        references.filter((reference) => !sharedTokens.has(reference)),
        name,
      ).toEqual([]);
    }
    expect(bridge.get("--color-bg")).toBe("var(--background)");
    expect(bridge.get("--color-text")).toBe("var(--foreground)");
    expect(bridge.get("--color-bg-brand")).toBe("var(--primary)");
    expect(bridge.get("--color-text-onbrand")).toBe(
      "var(--primary-foreground)",
    );
    expect(bridge.get("--color-bg-danger")).toBe("var(--destructive)");
    expect(bridge.get("--color-text-ondanger")).toBe(
      "var(--destructive-foreground)",
    );
    expect(bridge.get("--color-text-success")).toBe("var(--success)");
    expect(bridge.get("--color-text-warning")).toBe("var(--warning)");
    expect(bridge.get("--accessibility-focus-color")).toBe("var(--ring)");
    expect(bridge.get("--font-family-sans")).toBe("var(--font-sans)");
    expect(styles).not.toMatch(/(--[\w-]+)\s*:\s*var\(\1\)/);
  });
});
