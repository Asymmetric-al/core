#!/usr/bin/env node
/**
 * Repair broken per-workspace `node_modules` links to workspace packages.
 *
 * On Windows worktrees, Bun's isolated linker intermittently materializes a
 * workspace dependency (for example `apps/admin/node_modules/@asym/mock-data`)
 * as a real directory containing only `dist/tsconfig.tsbuildinfo` instead of a
 * junction to the workspace package. Module resolution then finds a directory
 * without `package.json` and fails (`Cannot find module '@asym/mock-data'`).
 *
 * This script replaces any such hollow directory (or dangling link) with a
 * junction/symlink to the real workspace package. Healthy links and Bun's
 * legitimate materializations (directories that contain a `package.json`) are
 * left untouched, so the script is an idempotent no-op on a correct install.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @param {string} repoRoot */
function discoverWorkspaceDirs(repoRoot, fileSystem) {
  const rootPackageJson = JSON.parse(
    fileSystem.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  const globs = rootPackageJson.workspaces ?? [];
  const dirs = new Set();

  for (const glob of globs) {
    if (glob.endsWith("/*")) {
      const parent = path.join(repoRoot, glob.slice(0, -2));
      if (!fileSystem.existsSync(parent)) continue;
      for (const entry of fileSystem.readdirSync(parent)) {
        dirs.add(path.join(parent, entry));
      }
    } else {
      dirs.add(path.join(repoRoot, glob));
    }
  }

  return [...dirs].filter((dir) =>
    fileSystem.existsSync(path.join(dir, "package.json")),
  );
}

/** @param {string} dir */
function readPackageJson(dir, fileSystem) {
  return JSON.parse(
    fileSystem.readFileSync(path.join(dir, "package.json"), "utf8"),
  );
}

/**
 * @param {string} repoRoot
 * @returns {{ repaired: string[] }}
 */
export function repairWorkspaceLinks(repoRoot, fileSystem = fs) {
  const workspaceDirs = discoverWorkspaceDirs(repoRoot, fileSystem);

  const packageDirByName = new Map();
  for (const dir of workspaceDirs) {
    const pkg = readPackageJson(dir, fileSystem);
    if (pkg.name) packageDirByName.set(pkg.name, dir);
  }

  const repaired = [];
  const linkType = process.platform === "win32" ? "junction" : "dir";

  for (const consumerDir of workspaceDirs) {
    const pkg = readPackageJson(consumerDir, fileSystem);
    const declared = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.optionalDependencies,
    };

    for (const [depName, depRange] of Object.entries(declared)) {
      if (typeof depRange !== "string" || !depRange.startsWith("workspace:")) {
        continue;
      }
      const targetDir = packageDirByName.get(depName);
      if (!targetDir) continue;

      const linkPath = path.join(consumerDir, "node_modules", depName);

      let needsRepair = false;
      try {
        const stat = fileSystem.lstatSync(linkPath);
        if (stat.isSymbolicLink()) {
          // Dangling or wrong-target links resolve without a package.json.
          needsRepair = !fileSystem.existsSync(
            path.join(linkPath, "package.json"),
          );
        } else if (stat.isDirectory()) {
          // Hollow materialization: a real directory without package.json
          // (typically only `dist/tsconfig.tsbuildinfo`).
          needsRepair = !fileSystem.existsSync(
            path.join(linkPath, "package.json"),
          );
        }
      } catch {
        // Missing entirely: Bun legitimately omits links when resolution goes
        // through the repo root, so only existing-but-broken entries are
        // repaired.
        needsRepair = false;
      }

      if (!needsRepair) continue;

      fileSystem.rmSync(linkPath, { recursive: true, force: true });
      fileSystem.mkdirSync(path.dirname(linkPath), { recursive: true });
      fileSystem.symlinkSync(targetDir, linkPath, linkType);
      repaired.push(`${path.relative(repoRoot, linkPath)} -> ${depName}`);
    }
  }

  return { repaired };
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const repoRoot = path.resolve(__dirname, "..");
  const { repaired } = repairWorkspaceLinks(repoRoot);
  if (repaired.length > 0) {
    for (const entry of repaired) {
      console.log(`[repair-workspace-links] restored ${entry}`);
    }
  } else {
    console.log("[repair-workspace-links] all workspace links healthy");
  }
}
