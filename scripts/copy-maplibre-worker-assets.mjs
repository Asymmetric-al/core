import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * MapLibre 6 loads `maplibre-gl-worker.mjs`, which imports the sibling
 * `./maplibre-gl-shared.mjs`. Next.js Turbopack/webpack do not keep that
 * pair resolvable from `import.meta.url`, so both files must be served
 * from a stable same-origin path and `setWorkerUrl` must point at the worker.
 *
 * @see https://maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/
 */

export const MAPLIBRE_WORKER_PUBLIC_PATH = "/maplibre/maplibre-gl-worker.mjs";

export const MAPLIBRE_WORKER_FILES = [
  "maplibre-gl-worker.mjs",
  "maplibre-gl-shared.mjs",
];

/**
 * @param {string} fromFile Absolute path of a file inside the resolving package
 *   (typically `packages/ui/package.json`).
 * @returns {string} Absolute `maplibre-gl/dist` directory
 */
export function resolveMaplibreDistDir(fromFile) {
  const require = createRequire(fromFile);
  return path.join(
    path.dirname(require.resolve("maplibre-gl/package.json")),
    "dist",
  );
}

/**
 * @param {{ distDir: string, publicDir: string }} options
 * @returns {string} Destination `public/maplibre` directory
 */
export function copyMaplibreWorkerAssets({ distDir, publicDir }) {
  const destDir = path.join(publicDir, "maplibre");
  mkdirSync(destDir, { recursive: true });

  for (const file of MAPLIBRE_WORKER_FILES) {
    const source = path.join(distDir, file);
    if (!existsSync(source)) {
      throw new Error(
        `MapLibre worker asset missing: ${source}. Install maplibre-gl 6.x (need ${MAPLIBRE_WORKER_FILES.join(" and ")}).`,
      );
    }
    copyFileSync(source, path.join(destDir, file));
  }

  return destDir;
}

/**
 * Copy worker assets into an app `public/maplibre/` using the `@asym/ui`
 * maplibre-gl install. Call from Next config so `next build` / `next dev`
 * publish the files before collecting `public/`.
 *
 * @param {{ workspaceRoot: string, fromConfigUrl: string | URL }} options
 * @returns {string} Destination directory
 */
export function copyMaplibreWorkerAssetsForApp({
  workspaceRoot,
  fromConfigUrl,
}) {
  const appDir = fileURLToPath(new URL(".", fromConfigUrl));
  const distDir = resolveMaplibreDistDir(
    path.join(workspaceRoot, "packages/ui/package.json"),
  );

  return copyMaplibreWorkerAssets({
    distDir,
    publicDir: path.join(appDir, "public"),
  });
}
