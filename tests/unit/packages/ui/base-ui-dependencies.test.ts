import { readFileSync } from "node:fs";
import path from "node:path";

import { glob } from "glob";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../../../..");
const uiManifest = JSON.parse(
  readFileSync(path.join(root, "packages/ui/package.json"), "utf8"),
);
const version: string = uiManifest.dependencies["@base-ui/react"];

describe("Base UI dependency contract", () => {
  it("pins the shared primitive version and keeps every direct consumer aligned", async () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/);
    const manifests = await glob(
      ["apps/*/package.json", "packages/*/package.json"],
      { cwd: root },
    );
    const mismatches: string[] = [];
    for (const file of manifests) {
      const manifest = JSON.parse(readFileSync(path.join(root, file), "utf8"));
      for (const section of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
      ]) {
        const declared = manifest[section]?.["@base-ui/react"];
        if (declared && declared !== version)
          mismatches.push(`${file}: ${declared}`);
      }
    }
    expect(mismatches).toEqual([]);
    const lock = readFileSync(path.join(root, "bun.lock"), "utf8");
    expect(lock).toContain(`"@base-ui/react": ["@base-ui/react@${version}"`);
  });

  it("does not reintroduce direct competing Radix primitive dependencies", async () => {
    const manifests = await glob(
      ["apps/*/package.json", "packages/*/package.json"],
      { cwd: root },
    );
    const offenders: string[] = [];
    for (const file of manifests) {
      const manifest = JSON.parse(readFileSync(path.join(root, file), "utf8"));
      for (const section of [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
      ]) {
        for (const dependency of Object.keys(manifest[section] ?? {})) {
          if (
            dependency === "radix-ui" ||
            dependency.startsWith("@radix-ui/")
          ) {
            offenders.push(`${file}: ${dependency}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
