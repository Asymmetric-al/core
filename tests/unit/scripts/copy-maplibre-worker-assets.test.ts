import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  MAPLIBRE_WORKER_FILES,
  MAPLIBRE_WORKER_PUBLIC_PATH,
  copyMaplibreWorkerAssets,
} from "../../../scripts/copy-maplibre-worker-assets.mjs";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("copyMaplibreWorkerAssets", () => {
  it("serves the worker from a stable public path the Map primitive can set", () => {
    expect(MAPLIBRE_WORKER_PUBLIC_PATH).toBe(
      "/maplibre/maplibre-gl-worker.mjs",
    );
    expect(MAPLIBRE_WORKER_FILES).toEqual([
      "maplibre-gl-worker.mjs",
      "maplibre-gl-shared.mjs",
    ]);
  });

  it("copies the worker and its sibling shared module into public/maplibre", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "maplibre-worker-"));
    tempDirs.push(root);
    const distDir = path.join(root, "dist");
    const publicDir = path.join(root, "public");
    mkdirSync(distDir);

    for (const file of MAPLIBRE_WORKER_FILES) {
      writeFileSync(path.join(distDir, file), `// ${file}\n`);
    }

    const destDir = copyMaplibreWorkerAssets({ distDir, publicDir });

    expect(destDir).toBe(path.join(publicDir, "maplibre"));
    for (const file of MAPLIBRE_WORKER_FILES) {
      expect(readFileSync(path.join(destDir, file), "utf8")).toBe(
        `// ${file}\n`,
      );
    }
  });

  it("fails loudly when a MapLibre 6 worker file is missing", () => {
    const root = mkdtempSync(
      path.join(os.tmpdir(), "maplibre-worker-missing-"),
    );
    tempDirs.push(root);
    const distDir = path.join(root, "dist");
    mkdirSync(distDir);
    writeFileSync(path.join(distDir, "maplibre-gl-worker.mjs"), "// worker\n");

    expect(() =>
      copyMaplibreWorkerAssets({
        distDir,
        publicDir: path.join(root, "public"),
      }),
    ).toThrow(/maplibre-gl-shared\.mjs/);
  });
});

describe("generated MapLibre public assets stay out of repo gates", () => {
  const gitignore = readFileSync(".gitignore", "utf8");
  const prettierignore = readFileSync(".prettierignore", "utf8");
  const eslintBase = readFileSync("tooling/eslint-config/base.mjs", "utf8");

  it("gitignores the donor and admin copies Next config writes", () => {
    expect(gitignore).toContain("/apps/donor/public/maplibre/");
    expect(gitignore).toContain("/apps/admin/public/maplibre/");
  });

  it("does not let Prettier rewrite the copied MapLibre ESM after a local build", () => {
    expect(prettierignore).toContain("/apps/donor/public/maplibre/");
    expect(prettierignore).toContain("/apps/admin/public/maplibre/");
  });

  it("does not let app ESLint scan the copied MapLibre ESM after a local build", () => {
    expect(eslintBase).toContain('"**/public/maplibre/**"');
  });
});
