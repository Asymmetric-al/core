import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveMonorepoRoot } from "../../../scripts/resolve-monorepo-root.mjs";

const actualRoot = process.cwd();
const temporaryRoots: string[] = [];

function write(root: string, relative: string, value: unknown) {
  const target = path.join(root, relative);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(
    target,
    typeof value === "string" ? value : JSON.stringify(value),
  );
}

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "core-root-resolution-"));
  temporaryRoots.push(root);
  write(root, "package.json", {
    name: "fixture",
    private: true,
    packageManager: "bun@1.3.14",
    workspaces: ["apps/*", "packages/*"],
  });
  write(root, "turbo.json", { tasks: {} });
  for (const directory of ["apps/admin", "packages/ui"]) {
    write(root, `${directory}/package.json`, { name: directory });
    write(root, `${directory}/turbo.json`, { extends: ["//"] });
  }
  return root;
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("monorepo root resolution with package Turbo configurations", () => {
  it.each(["apps/admin", "packages/ui"])(
    "skips the package-level turbo.json from %s",
    (directory) => {
      const root = fixture();
      vi.spyOn(process, "cwd").mockReturnValue(path.join(root, directory));
      expect(
        resolveMonorepoRoot(
          pathToFileURL(path.join(root, directory, "next.config.ts")),
        ),
      ).toBe(root);
    },
  );

  it("walks above a generated .next config when cwd cannot locate the repository", () => {
    const root = fixture();
    vi.spyOn(process, "cwd").mockReturnValue(os.tmpdir());
    expect(
      resolveMonorepoRoot(
        pathToFileURL(
          path.join(root, "apps/admin/.next/server/next.config.mjs"),
        ),
      ),
    ).toBe(root);
  });

  it.each([{}, { workspaces: [] }, { workspaces: "apps/*" }])(
    "requires a real workspace manifest alongside a Turbo marker: %j",
    (manifest) => {
      const root = fixture();
      write(root, "apps/admin/package.json", manifest);
      vi.spyOn(process, "cwd").mockReturnValue(path.join(root, "apps/admin"));
      expect(
        resolveMonorepoRoot(
          pathToFileURL(path.join(root, "apps/admin/next.config.ts")),
        ),
      ).toBe(root);
    },
  );

  it("preserves the original config-relative fallback when no workspace marker exists", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-root-fallback-"));
    temporaryRoots.push(root);
    vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(
      resolveMonorepoRoot(
        pathToFileURL(path.join(root, "apps/example/next.config.ts")),
      ),
    ).toBe(root);
  });

  it.each([
    ".",
    "apps/admin",
    "apps/donor",
    "apps/missionary",
    "packages/ui",
    "packages/missionary",
  ])("resolves Core's actual root from %s", (directory) => {
    vi.spyOn(process, "cwd").mockReturnValue(path.join(actualRoot, directory));
    for (const app of ["admin", "donor", "missionary"]) {
      expect(
        resolveMonorepoRoot(
          pathToFileURL(path.join(actualRoot, `apps/${app}/next.config.ts`)),
        ),
      ).toBe(actualRoot);
    }
  });
});
