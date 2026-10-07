#!/usr/bin/env node
/**
 * Restore exact dependency contracts for Bun's installed file packages.
 *
 * Bun can omit a file package's dependency subtree and resolve a different
 * workspace version instead. An explicit root npm alias materializes the
 * reviewed exact package; this repair links it only inside node_modules.
 * Source packages and compiled artifacts are never modified.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE_NAME = /^(?:@[a-z0-9_.-]+\/)?[a-z0-9_.-]+$/i;
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;
const NPM_ALIAS = /^npm:((?:@[a-z0-9_.-]+\/)?[a-z0-9_.-]+)@(\d+\.\d+\.\d+)$/i;

function manifest(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
}

function assertInstalledPath(file, modulesRoot) {
  const relative = path.relative(modulesRoot, fs.realpathSync(file));
  if (
    !relative ||
    relative.startsWith(`..${path.sep}`) ||
    relative === ".." ||
    path.isAbsolute(relative)
  ) {
    throw new Error(
      `[repair-file-package-links] Refusing to write outside installed node_modules: ${file}`,
    );
  }
}

/** @param {string} repoRoot */
export function repairFilePackageLinks(repoRoot) {
  const root = manifest(repoRoot);
  const declarations = { ...root.devDependencies, ...root.dependencies };
  const aliases = Object.entries(declarations).flatMap(([alias, spec]) => {
    const match = typeof spec === "string" ? spec.match(NPM_ALIAS) : null;
    return match && PACKAGE_NAME.test(alias)
      ? [{ alias, name: match[1], version: match[2] }]
      : [];
  });
  const repaired = [];
  if (!aliases.length) return { repaired };
  const modulesRoot = fs.realpathSync(path.join(repoRoot, "node_modules"));
  const local = { ...declarations, ...root.overrides };
  let sequence = 0;
  for (const [name, spec] of Object.entries(local)) {
    if (
      !PACKAGE_NAME.test(name) ||
      typeof spec !== "string" ||
      !spec.startsWith("file:")
    )
      continue;
    const source = manifest(path.resolve(repoRoot, spec.slice(5)));
    const installedPath = path.join(repoRoot, "node_modules", name);
    if (!fs.existsSync(path.join(installedPath, "package.json"))) {
      throw new Error(
        `[repair-file-package-links] Missing installed file package: ${name}`,
      );
    }
    for (const [dependency, version] of Object.entries(
      source.dependencies ?? {},
    )) {
      if (
        !PACKAGE_NAME.test(dependency) ||
        typeof version !== "string" ||
        !EXACT_VERSION.test(version)
      )
        continue;
      const candidates = aliases.filter(
        (alias) => alias.name === dependency && alias.version === version,
      );
      if (!candidates.length) continue;
      if (candidates.length !== 1)
        throw new Error(
          `[repair-file-package-links] Ambiguous aliases for ${dependency}@${version}`,
        );
      const installed = fs.realpathSync(installedPath);
      assertInstalledPath(installed, modulesRoot);
      if (manifest(installed).dependencies?.[dependency] !== version) {
        throw new Error(
          `[repair-file-package-links] Installed file-package declaration drift: ${name} -> ${dependency}@${version}`,
        );
      }
      const target = fs.realpathSync(
        path.join(repoRoot, "node_modules", candidates[0].alias),
      );
      assertInstalledPath(target, modulesRoot);
      const selected = manifest(target);
      if (selected.name !== dependency || selected.version !== version) {
        throw new Error(
          `[repair-file-package-links] Invalid alias for ${dependency}@${version}`,
        );
      }
      const child = path.join(installed, "node_modules", dependency);
      if (fs.existsSync(path.join(child, "package.json"))) {
        const current = manifest(child);
        if (current.name === dependency && current.version === version)
          continue;
      }
      let existing = false;
      try {
        const stat = fs.lstatSync(child);
        if (!stat.isSymbolicLink())
          throw new Error(
            `[repair-file-package-links] Refusing to replace a real directory: ${child}`,
          );
        existing = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      const parent = path.dirname(child);
      let ancestor = parent;
      while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
      assertInstalledPath(ancestor, modulesRoot);
      fs.mkdirSync(parent, { recursive: true });
      const temporary = `${child}.repair-${process.pid}-${sequence++}`;
      const backup = `${temporary}.previous`;
      fs.symlinkSync(
        target,
        temporary,
        process.platform === "win32" ? "junction" : "dir",
      );
      try {
        if (existing) fs.renameSync(child, backup);
        try {
          fs.renameSync(temporary, child);
        } catch (error) {
          if (existing) fs.renameSync(backup, child);
          throw error;
        }
        if (existing) fs.unlinkSync(backup);
      } finally {
        if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
      }
      repaired.push(`${name} -> ${dependency}@${version}`);
    }
  }
  return { repaired };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const { repaired } = repairFilePackageLinks(repoRoot);
  console.log(
    repaired.length
      ? `[repair-file-package-links] repaired ${repaired.join(", ")}`
      : "[repair-file-package-links] exact file-package dependencies healthy",
  );
}
