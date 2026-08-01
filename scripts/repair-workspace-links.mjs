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
const SKIPPABLE_SYMLINK_ERROR_CODES = new Set([
  "EPERM",
  "EACCES",
  "ENOTSUP",
  // A concurrent install or a process holding the directory open. This runs
  // from postinstall, so throwing here would fail `bun install` itself.
  "EBUSY",
]);
const MAX_BACKUP_PATH_ATTEMPTS = 1000;

/** @param {string} repoRoot */
function discoverWorkspaceDirs(repoRoot, fileSystem) {
  const rootPackageJson = JSON.parse(
    fileSystem.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  );
  const globs = rootPackageJson?.workspaces ?? [];
  if (!Array.isArray(globs)) {
    throw new Error(
      `[repair-workspace-links] Expected an array "workspaces" field in ${path.join(repoRoot, "package.json")}.`,
    );
  }
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

function getErrorCode(error) {
  return /** @type {NodeJS.ErrnoException} */ (error).code;
}

function createBackupPath(linkPath, fileSystem) {
  for (let attempt = 0; attempt < MAX_BACKUP_PATH_ATTEMPTS; attempt += 1) {
    const backupPath = `${linkPath}.repair-backup-${process.pid}-${attempt}`;
    if (!fileSystem.existsSync(backupPath)) return backupPath;
  }
  throw new Error(
    `[repair-workspace-links] Could not find an available backup path for ${linkPath} after ${MAX_BACKUP_PATH_ATTEMPTS} attempts.`,
  );
}

function findInterruptedRepairBackup(linkPath, fileSystem) {
  const parentDir = path.dirname(linkPath);
  if (!fileSystem.existsSync(parentDir)) return null;

  const backupPrefix = `${path.basename(linkPath)}.repair-backup-`;
  const backupNames = fileSystem
    .readdirSync(parentDir)
    .filter((entry) => entry.startsWith(backupPrefix));

  if (backupNames.length > 1) {
    throw new Error(
      `[repair-workspace-links] Found multiple interrupted repair backups for ${linkPath}; refusing to guess which one to restore.`,
    );
  }

  return backupNames[0] ? path.join(parentDir, backupNames[0]) : null;
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
        const missingPackageJson = !fileSystem.existsSync(
          path.join(linkPath, "package.json"),
        );
        if (stat.isSymbolicLink()) {
          // Dangling links resolve without a package.json.
          needsRepair = missingPackageJson;
        } else if (stat.isDirectory()) {
          // Hollow materialization: a real directory without package.json
          // (typically only `dist/tsconfig.tsbuildinfo`).
          needsRepair = missingPackageJson;
        }
      } catch {
        const interruptedBackup = findInterruptedRepairBackup(
          linkPath,
          fileSystem,
        );
        if (interruptedBackup) {
          fileSystem.renameSync(interruptedBackup, linkPath);
          needsRepair = !fileSystem.existsSync(
            path.join(linkPath, "package.json"),
          );
        } else {
          // Missing entirely: Bun legitimately omits links when resolution
          // goes through the repo root.
          needsRepair = false;
        }
      }

      if (!needsRepair) continue;

      const backupPath = createBackupPath(linkPath, fileSystem);
      try {
        fileSystem.renameSync(linkPath, backupPath);
      } catch (error) {
        // This is the first mutating step and it runs from postinstall. A
        // locked or permission-denied entry must not fail `bun install`.
        const code = getErrorCode(error);
        if (SKIPPABLE_SYMLINK_ERROR_CODES.has(code)) {
          console.warn(
            `[repair-workspace-links] Skipping ${path.relative(repoRoot, linkPath)}: ${code}.`,
          );
          continue;
        }
        throw error;
      }
      try {
        fileSystem.mkdirSync(path.dirname(linkPath), { recursive: true });
        fileSystem.symlinkSync(targetDir, linkPath, linkType);
      } catch (error) {
        fileSystem.rmSync(linkPath, { recursive: true, force: true });
        fileSystem.renameSync(backupPath, linkPath);
        const code = getErrorCode(error);
        if (SKIPPABLE_SYMLINK_ERROR_CODES.has(code)) {
          console.warn(
            `[repair-workspace-links] Skipping ${path.relative(
              repoRoot,
              linkPath,
            )}: ${code}.`,
          );
          continue;
        }
        throw error;
      }
      fileSystem.rmSync(backupPath, { recursive: true, force: true });
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
