import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
  ".cts",
  ".mts",
]);
const IGNORE_DIRECTORIES = new Set([
  ".git",
  ".nia-sync",
  ".nia_sync_local",
  ".next",
  ".tmp",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "tmp",
  "tmp-bun",
  "tmp-npm-cache",
  "vendor",
]);
const DISABLE_FORMAT =
  /eslint-disable(?:-next-line|-line)?\s+[^\n]+--\s*(TODO\([^)]+\)|[A-Z]+-\d+)/;

const errors = [];

function toRelative(targetPath) {
  return path.relative(ROOT, targetPath).replaceAll("\\", "/");
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dirPath, fileList = []) {
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      ["EACCES", "EPERM", "ENOENT"].includes(error.code)
    ) {
      return fileList;
    }
    throw error;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRECTORIES.has(entry.name)) {
        continue;
      }

      await walkFiles(path.join(dirPath, entry.name), fileList);
      continue;
    }

    fileList.push(path.join(dirPath, entry.name));
  }

  return fileList;
}

async function verifyAppConfigs() {
  const appsPath = path.join(ROOT, "apps");
  const apps = await fs.readdir(appsPath, { withFileTypes: true });

  for (const app of apps) {
    if (!app.isDirectory()) {
      continue;
    }

    const appPath = path.join(appsPath, app.name);
    const packageJsonPath = path.join(appPath, "package.json");
    if (!(await pathExists(packageJsonPath))) {
      continue;
    }

    const configPath = path.join(appPath, "eslint.config.mjs");
    if (!(await pathExists(configPath))) {
      errors.push(`Missing app ESLint config: ${toRelative(configPath)}`);
    }
  }
}

async function verifyPackageConfigs() {
  const packagesPath = path.join(ROOT, "packages");
  const packages = await fs.readdir(packagesPath, { withFileTypes: true });

  for (const pkg of packages) {
    if (!pkg.isDirectory()) {
      continue;
    }

    const packagePath = path.join(packagesPath, pkg.name);
    const packageJsonPath = path.join(packagePath, "package.json");
    if (!(await pathExists(packageJsonPath))) {
      continue;
    }

    const configPath = path.join(packagePath, "eslint.config.mjs");
    if (!(await pathExists(configPath))) {
      errors.push(`Missing package ESLint config: ${toRelative(configPath)}`);
    }

    if (await pathExists(configPath)) {
      const configContent = await fs.readFile(configPath, "utf8");
      if (!configContent.includes("@asym/eslint-config/library.mjs")) {
        errors.push(
          `Package ESLint config must import @asym/eslint-config/library.mjs: ${toRelative(configPath)}`,
        );
      }

      if (!configContent.includes("libraryConfig")) {
        errors.push(
          `Package ESLint config must reference libraryConfig: ${toRelative(configPath)}`,
        );
      }

      const disablesRules = /:\s*["']off["']/.test(configContent);
      if (disablesRules && !/TODO\([^)]+\)/.test(configContent)) {
        errors.push(
          `Package ESLint overrides that disable rules must include a tracking TODO(...): ${toRelative(configPath)}`,
        );
      }
    }

    const tsconfigPath = path.join(packagePath, "tsconfig.json");
    if (!(await pathExists(tsconfigPath))) {
      errors.push(
        `Missing package tsconfig required for type-aware linting: ${toRelative(tsconfigPath)}`,
      );
    }

    const packageJsonRaw = await fs.readFile(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonRaw);
    const lintScript = packageJson?.scripts?.lint;
    if (typeof lintScript !== "string" || !lintScript.includes("eslint")) {
      errors.push(
        `Missing package lint script using ESLint: ${toRelative(packageJsonPath)}`,
      );
    }
  }
}

async function verifyLegacyEslintrcFiles() {
  const files = await walkFiles(ROOT);
  const legacyFiles = files.filter((filePath) =>
    /^\.eslintrc(?:\..+)?$/i.test(path.basename(filePath)),
  );

  for (const legacyFile of legacyFiles) {
    errors.push(
      `Legacy ESLint config is not allowed: ${toRelative(legacyFile)}`,
    );
  }
}

async function verifyDisableCommentFormat() {
  const files = await walkFiles(ROOT);

  for (const filePath of files) {
    if (!SOURCE_EXTENSIONS.has(path.extname(filePath))) {
      continue;
    }

    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const hasDisableComment =
        /(?:\/\/|\/\*+)\s*eslint-disable(?:-next-line|-line)?\b/.test(line);
      if (!hasDisableComment || line.includes("eslint-enable")) {
        continue;
      }

      if (!DISABLE_FORMAT.test(line)) {
        errors.push(
          `Invalid eslint-disable format: ${toRelative(filePath)}:${index + 1}`,
        );
      }
    }
  }
}

async function verifyArchitectureRules() {
  const baseConfigPath = path.join(
    ROOT,
    "tooling",
    "eslint-config",
    "base.mjs",
  );
  const baseConfigContent = await fs.readFile(baseConfigPath, "utf8");

  const requiredMarkers = [
    "no-restricted-imports",
    "../../apps/*",
    "**/apps/admin/**",
    "**/apps/donor/**",
    "**/apps/missionary/**",
  ];

  for (const marker of requiredMarkers) {
    if (!baseConfigContent.includes(marker)) {
      errors.push(
        `Missing architecture boundary marker "${marker}" in ${toRelative(baseConfigPath)}`,
      );
    }
  }
}

async function main() {
  await verifyAppConfigs();
  await verifyPackageConfigs();
  await verifyLegacyEslintrcFiles();
  await verifyDisableCommentFormat();
  await verifyArchitectureRules();

  if (errors.length > 0) {
    console.error("ESLint config verification failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("ESLint config verification passed.");
}

await main();
