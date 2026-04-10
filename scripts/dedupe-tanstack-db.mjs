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
const repoRoot = path.join(__dirname, "..");
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
  if (!fs.existsSync(canonical)) {
    console.warn(
      "[dedupe-tanstack-db] Skipping: canonical package not found at",
      canonical,
    );
    return;
  }
  try {
    const stat = fs.lstatSync(targetDir);
    if (stat.isSymbolicLink()) {
      const cur = fs.readlinkSync(targetDir);
      if (path.resolve(path.dirname(targetDir), cur) === canonical) {
        return;
      }
      fs.unlinkSync(targetDir);
    } else if (stat.isDirectory()) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code !== "ENOENT") throw e;
  }
  fs.symlinkSync(canonical, targetDir, "dir");
}

for (const p of nested) {
  replaceWithSymlink(p);
}
