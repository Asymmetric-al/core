import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse as parseJsonc } from "jsonc-parser";

const ROOT = process.cwd();
const errors = [];
const legacyEslintRcPattern = /^\.eslintrc(?:\..+)?$/i;
const routeHandlerOverrideInclude =
  "apps/*/app/api/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}";
const healthRouteOverrideInclude = "apps/*/app/api/health/route.ts";
const requiredRouteHandlerPatternGroups = [
  [
    "@asym/database/supabase",
    "@asym/database/supabase/*",
    "@asym/database/supabase/**",
  ],
  ["@supabase/*"],
];
const requiredRouteHandlerPaths = [
  "@asym/database/supabase",
  "@asym/database/supabase/client",
  "@asym/database/supabase/server",
  "@asym/database/supabase/admin",
  "@supabase/ssr",
  "@supabase/supabase-js",
];

const legacyRootFiles = [
  "eslint.config.mjs",
  "prettier.config.mjs",
  "stylelint.config.mjs",
  ".stylelintignore",
];

const legacyLintDependencies = [
  "@asym/eslint-config",
  "@next/eslint-plugin-next",
  "@tanstack/eslint-plugin-query",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "eslint",
  "eslint-config-next",
  "eslint-config-prettier",
  "eslint-import-resolver-typescript",
  "eslint-plugin-compat",
  "eslint-plugin-cypress",
  "eslint-plugin-github",
  "eslint-plugin-html",
  "eslint-plugin-import",
  "eslint-plugin-import-x",
  "eslint-plugin-jest",
  "eslint-plugin-jsx-a11y",
  "eslint-plugin-n",
  "eslint-plugin-prettier",
  "eslint-plugin-promise",
  "eslint-plugin-react",
  "eslint-plugin-react-hooks",
  "eslint-plugin-sonarjs",
  "eslint-plugin-storybook",
  "eslint-plugin-unicorn",
  "eslint-plugin-unused-imports",
  "prettier",
  "stylelint",
  "stylelint-config-idiomatic-order",
  "stylelint-config-standard",
  "stylelint-prettier",
];

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

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readJsonc(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parseErrors = [];
  const parsed = parseJsonc(raw, parseErrors, {
    allowEmptyContent: false,
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (parseErrors.length > 0) {
    throw new Error(
      `Failed to parse JSONC file ${toRelative(filePath)} (${parseErrors.length} parse error(s))`
    );
  }

  return parsed;
}

function getNoRestrictedImportsRule(config) {
  return config?.linter?.rules?.style?.noRestrictedImports;
}

function hasExactGroup(patterns, expectedGroup) {
  return patterns.some((pattern) => {
    const group = pattern?.group;
    if (!Array.isArray(group) || group.length !== expectedGroup.length) {
      return false;
    }

    return expectedGroup.every((entry, index) => group[index] === entry);
  });
}

function verifyRequiredBiomeExtends(extendsList) {
  const requiredExtends = [
    "ultracite/biome/core",
    "ultracite/biome/react",
    "ultracite/biome/next",
  ];

  for (const requiredExtend of requiredExtends) {
    if (!extendsList.includes(requiredExtend)) {
      errors.push(`Missing Biome extend "${requiredExtend}" in biome.jsonc`);
    }
  }
}

function verifyRouteHandlerOverride(overrides) {
  const routeHandlerOverride = overrides.find((override) =>
    override?.includes?.includes(routeHandlerOverrideInclude)
  );

  if (!routeHandlerOverride) {
    errors.push(
      `Missing Biome override for route handlers: ${routeHandlerOverrideInclude}`
    );
    return;
  }

  const noRestrictedImportsRule =
    getNoRestrictedImportsRule(routeHandlerOverride);

  if (!noRestrictedImportsRule || noRestrictedImportsRule.level !== "error") {
    errors.push(
      "Route-handler Biome override must enable style.noRestrictedImports at error level"
    );
    return;
  }

  const patterns = Array.isArray(noRestrictedImportsRule.options?.patterns)
    ? noRestrictedImportsRule.options.patterns
    : [];
  const pathEntries =
    noRestrictedImportsRule.options?.paths &&
    typeof noRestrictedImportsRule.options.paths === "object"
      ? noRestrictedImportsRule.options.paths
      : {};
  const pathNames = new Set(Object.keys(pathEntries));

  for (const expectedGroup of requiredRouteHandlerPatternGroups) {
    if (!hasExactGroup(patterns, expectedGroup)) {
      errors.push(
        `Route-handler Biome override is missing restricted import group: ${expectedGroup.join(", ")}`
      );
    }
  }

  for (const requiredPath of requiredRouteHandlerPaths) {
    if (!pathNames.has(requiredPath)) {
      errors.push(
        `Route-handler Biome override is missing restricted import path: ${requiredPath}`
      );
    }
  }
}

function verifyHealthRouteOverride(overrides) {
  const healthRouteOverride = overrides.find((override) =>
    override?.includes?.includes(healthRouteOverrideInclude)
  );

  if (!healthRouteOverride) {
    errors.push(
      `Missing approved-exception override for health routes: ${healthRouteOverrideInclude}`
    );
    return;
  }

  if (getNoRestrictedImportsRule(healthRouteOverride) !== "off") {
    errors.push(
      "Health-route Biome override must disable style.noRestrictedImports for the approved exception"
    );
  }
}

async function verifyRootBiomeConfig() {
  const biomePath = path.join(ROOT, "biome.jsonc");
  if (!(await pathExists(biomePath))) {
    errors.push("Missing root Biome config: biome.jsonc");
    return;
  }

  const biomeConfig = await readJsonc(biomePath);
  const extendsList = Array.isArray(biomeConfig.extends)
    ? biomeConfig.extends
    : [];
  const overrides = Array.isArray(biomeConfig.overrides)
    ? biomeConfig.overrides
    : [];

  verifyRequiredBiomeExtends(extendsList);
  verifyRouteHandlerOverride(overrides);
  verifyHealthRouteOverride(overrides);
}

async function verifyLegacyRootFilesRemoved() {
  for (const file of legacyRootFiles) {
    const targetPath = path.join(ROOT, file);
    if (await pathExists(targetPath)) {
      errors.push(`Legacy lint config file should be removed: ${file}`);
    }
  }
}

async function verifyRootDependencies() {
  const rootPackagePath = path.join(ROOT, "package.json");
  const rootPackage = await readJson(rootPackagePath);
  const devDependencies = rootPackage.devDependencies ?? {};
  const scripts = rootPackage.scripts ?? {};

  for (const dependency of legacyLintDependencies) {
    if (dependency in devDependencies) {
      errors.push(
        `Legacy lint dependency should not be in root devDependencies: ${dependency}`
      );
    }
  }

  if (
    scripts["verify:data-boundary"] !==
    "bash scripts/verify/data-boundary-check.sh"
  ) {
    errors.push(
      'Root package.json must keep "verify:data-boundary" as "bash scripts/verify/data-boundary-check.sh"'
    );
  }
}

async function listWorkspacePackageJsonPaths() {
  const packageJsonPaths = [];
  const workspaceDirs = ["apps", "packages"];

  for (const workspaceDir of workspaceDirs) {
    const workspacePath = path.join(ROOT, workspaceDir);
    if (!(await pathExists(workspacePath))) {
      continue;
    }

    const entries = await fs.readdir(workspacePath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageJsonPath = path.join(
        workspacePath,
        entry.name,
        "package.json"
      );
      if (await pathExists(packageJsonPath)) {
        packageJsonPaths.push(packageJsonPath);
      }
    }
  }

  return packageJsonPaths;
}

function verifyWorkspaceLintScript(packageJsonPath, packageJson) {
  const lintScript = packageJson?.scripts?.lint;

  if (typeof lintScript !== "string") {
    errors.push(`Missing lint script in ${toRelative(packageJsonPath)}`);
    return;
  }

  const usesIncrementalLintScript = lintScript.includes(
    "scripts/check-changed-files.mjs"
  );
  const usesDirectUltraciteCheck = lintScript.includes("ultracite check");

  if (!(usesIncrementalLintScript || usesDirectUltraciteCheck)) {
    errors.push(
      `Lint script must use Ultracite Biome flow in ${toRelative(packageJsonPath)}: "${lintScript}"`
    );
  }

  if (!usesIncrementalLintScript) {
    return;
  }

  const lintFullScript = packageJson?.scripts?.["lint:full"];
  if (lintFullScript !== "bunx ultracite check .") {
    errors.push(
      `Incremental lint scripts must keep lint:full as "bunx ultracite check ." in ${toRelative(packageJsonPath)}`
    );
  }
}

async function verifyWorkspaceLintScripts() {
  const packageJsonPaths = await listWorkspacePackageJsonPaths();

  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = await readJson(packageJsonPath);
    verifyWorkspaceLintScript(packageJsonPath, packageJson);
  }
}

async function verifyLegacyEslintConfigsRemoved() {
  const workspaceDirs = ["apps", "packages"];
  for (const workspaceDir of workspaceDirs) {
    const workspacePath = path.join(ROOT, workspaceDir);
    if (!(await pathExists(workspacePath))) {
      continue;
    }

    const entries = await fs.readdir(workspacePath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const eslintConfigPath = path.join(
        workspacePath,
        entry.name,
        "eslint.config.mjs"
      );
      if (await pathExists(eslintConfigPath)) {
        errors.push(
          `Legacy workspace ESLint config should be removed: ${toRelative(eslintConfigPath)}`
        );
      }
    }
  }
}

async function verifyNoLegacyEslintrcFiles() {
  async function walkFiles(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".next"
        ) {
          continue;
        }
        await walkFiles(fullPath);
        continue;
      }

      if (legacyEslintRcPattern.test(entry.name)) {
        errors.push(
          `Legacy ESLint rc file is not allowed: ${toRelative(fullPath)}`
        );
      }
    }
  }

  await walkFiles(ROOT);
}

async function verifyDataBoundaryScriptExists() {
  const dataBoundaryScriptPath = path.join(
    ROOT,
    "scripts/verify/data-boundary-check.sh"
  );

  if (!(await pathExists(dataBoundaryScriptPath))) {
    errors.push(
      "Missing secondary data-boundary CI guard: scripts/verify/data-boundary-check.sh"
    );
  }
}

async function main() {
  await verifyRootBiomeConfig();
  await verifyLegacyRootFilesRemoved();
  await verifyRootDependencies();
  await verifyWorkspaceLintScripts();
  await verifyLegacyEslintConfigsRemoved();
  await verifyNoLegacyEslintrcFiles();
  await verifyDataBoundaryScriptExists();

  if (errors.length > 0) {
    console.error("Lint config verification failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Lint config verification passed.");
}

await main();
