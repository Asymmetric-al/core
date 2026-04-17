/**
 * Ensure nested copies of `@tanstack/db` under `@tanstack/react-db` and
 * `@tanstack/query-db-collection` resolve to the workspace root install.
 *
 * Without this, `instanceof CollectionImpl` in the query builder can fail because
 * collections are built from one copy and queries from another.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} repoRoot */
export function dedupeTanstackDb(repoRoot, fileSystem = fs) {
  const canonical = path.join(repoRoot, "node_modules/@tanstack/db");
  const nested = [
    path.join(
      repoRoot,
      "node_modules/@tanstack/react-db/node_modules/@tanstack/db",
    ),
    path.join(
      repoRoot,
      "node_modules/@tanstack/query-db-collection/node_modules/@tanstack/db",
    ),
  ];

  function replaceWithSymlink(targetDir) {
    if (!fileSystem.existsSync(canonical)) {
      console.warn(
        "[dedupe-tanstack-db] Skipping: canonical package not found at",
        canonical,
      );
      return;
    }
    try {
      const stat = fileSystem.lstatSync(targetDir);
      if (stat.isSymbolicLink()) {
        const cur = fileSystem.readlinkSync(targetDir);
        if (path.resolve(path.dirname(targetDir), cur) === canonical) {
          return;
        }
        fileSystem.unlinkSync(targetDir);
      } else if (stat.isDirectory()) {
        fileSystem.rmSync(targetDir, { recursive: true, force: true });
      }
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code !== "ENOENT") throw e;
    }
    fileSystem.mkdirSync(path.dirname(targetDir), { recursive: true });
    try {
      fileSystem.symlinkSync(canonical, targetDir, "dir");
    } catch (e) {
      const code = /** @type {NodeJS.ErrnoException} */ (e).code;
      if (code === "EPERM" || code === "EACCES" || code === "ENOTSUP") {
        console.warn(
          `[dedupe-tanstack-db] Skipping symlink for ${targetDir}: ${code}.`,
        );
        return;
      }
      throw e;
    }
  }

  for (const p of nested) {
    replaceWithSymlink(p);
  }
}

const isMain =
  typeof process.argv[1] === "string" &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  dedupeTanstackDb(path.join(__dirname, ".."));
}
