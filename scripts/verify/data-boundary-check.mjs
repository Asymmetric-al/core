import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const bannedApiRouteImports = [
  "@asym/database/supabase/admin",
  "@asym/database/supabase/server",
  "@asym/database/supabase/client",
  "@supabase/ssr",
  "@supabase/supabase-js",
];
const bannedAppSourcePatterns = [
  "@asym/api/crm/client",
  "@asym/api/src/crm/client",
  "packages/api/src/crm/client",
  "TWENTY_API_KEY",
  "TWENTY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_TWENTY_",
];
const bannedRawSupabaseAppImports = ["@supabase/supabase-js"];
const bannedBrowserSupabaseAppImports = [
  "@asym/database/supabase/client",
  '@asym/database/supabase"',
  "@asym/database/supabase'",
];
// Each allowlist scopes an approved exception to the specific banned pattern
// it was approved for, so an allowlisted file cannot silently pick up the
// other class of banned import later.
//
// Server-side Payload auth strategy: verifies Supabase sessions with the raw
// SDK (service-role, server only).
const appRawSupabaseImportAllowlist = new Set([
  "apps/admin/src/cms/auth/supabase-strategy.ts",
]);
// Browser Supabase AUTH helper (@asym/database/supabase*) for attaching the
// session token to fetches; not a table read path.
const appBrowserSupabaseImportAllowlist = new Set([
  "apps/admin/lib/authenticated-fetch.ts",
]);
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const SKIP_DIRECTORY_NAMES = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  ".turbo",
  // Gitignored Nitro/Eve build trees. Local `.output` chunks can still mention
  // retired Twenty env names; those files are not current runtime source.
  ".output",
  ".nitro",
]);
const RETIRED_TWENTY_RUNTIME_MARKERS = [
  "TWENTY_API_URL",
  "TWENTY_API_KEY",
  "TWENTY_WEBHOOK_SECRET",
  "TWENTY_WORKSPACE_ID",
  "TWENTY_RATE_LIMIT_RPM",
  "CRM_SYNC_INBOUND_ENABLED",
  "CRM_SYNC_OUTBOUND_ENABLED",
  "CRM_SYNC_REPLAY_ENABLED",
  "CRM_SYNC_RECONCILIATION_ENABLED",
  "CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS",
  "@asym/api/crm/client",
  "@asym/api/src/crm/client",
  "packages/api/src/crm/client",
  "NEXT_PUBLIC_TWENTY_",
];
const HISTORICAL_TWENTY_PATH_PREFIXES = ["docs/", "openspec/", "tests/"];
const RETIRED_TWENTY_SCAN_ROOTS = ["apps", "packages", "scripts"];
const RETIRED_TWENTY_SCANNER_PATH = "scripts/verify/data-boundary-check.mjs";

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function collectTypeScriptFiles(directoryPath) {
  const entries = readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORY_NAMES.has(entry.name)) {
        continue;
      }
      files.push(...collectTypeScriptFiles(entryPath));
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

export function collectRetiredTwentyRuntimeViolationsFromSource(
  relativePath,
  source,
) {
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    HISTORICAL_TWENTY_PATH_PREFIXES.some((prefix) =>
      normalized.startsWith(prefix),
    ) ||
    normalized === RETIRED_TWENTY_SCANNER_PATH
  ) {
    return [];
  }

  const isScannedRuntime =
    RETIRED_TWENTY_SCAN_ROOTS.some((root) =>
      normalized.startsWith(`${root}/`),
    ) || normalized === ".env.example";

  if (!isScannedRuntime) {
    return [];
  }

  return RETIRED_TWENTY_RUNTIME_MARKERS.flatMap((marker) =>
    source.includes(marker)
      ? [`${normalized}: retired Twenty runtime reference (${marker})`]
      : [],
  );
}

export function collectRetiredTwentyRuntimeViolations() {
  const files = RETIRED_TWENTY_SCAN_ROOTS.flatMap((dir) => {
    const directoryPath = path.join(repoRoot, dir);
    if (!statExists(directoryPath)) {
      return [];
    }
    return collectTypeScriptFiles(directoryPath);
  });

  const envExample = path.join(repoRoot, ".env.example");
  if (statExists(envExample)) {
    files.push(envExample);
  }

  return files.flatMap((filePath) =>
    collectRetiredTwentyRuntimeViolationsFromSource(
      toRepoRelative(filePath),
      readFileSync(filePath, "utf8"),
    ),
  );
}

function collectApiRouteFiles() {
  const appsRoot = path.join(repoRoot, "apps");
  if (!statExists(appsRoot)) {
    return [];
  }

  const appDirectories = readdirSync(appsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(appsRoot, entry.name));

  const apiFiles = [];
  for (const appDirectory of appDirectories) {
    const apiDirectory = path.join(appDirectory, "app", "api");
    if (!statExists(apiDirectory)) {
      continue;
    }

    apiFiles.push(...collectTypeScriptFiles(apiDirectory));
  }

  return apiFiles.filter(
    (filePath) => !toRepoRelative(filePath).endsWith("/api/health/route.ts"),
  );
}

function collectAppSourceFiles() {
  const appsRoot = path.join(repoRoot, "apps");
  if (!statExists(appsRoot)) {
    return [];
  }

  return collectTypeScriptFiles(appsRoot).filter(
    (filePath) =>
      !toRepoRelative(filePath).includes("/.next/") &&
      !toRepoRelative(filePath).includes("/node_modules/"),
  );
}

function statExists(targetPath) {
  try {
    return statSync(targetPath).isDirectory() || statSync(targetPath).isFile();
  } catch {
    return false;
  }
}

function collectViolations(filePath, bannedPatterns) {
  const relativePath = toRepoRelative(filePath);
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const violations = [];

  for (const [index, line] of lines.entries()) {
    const matchedImport = bannedPatterns.find((importPath) =>
      line.includes(importPath),
    );
    if (!matchedImport) {
      continue;
    }

    violations.push(`${relativePath}:${index + 1}:${line.trim()}`);
  }

  return violations;
}

export function collectAppSupabaseViolationsFromSource(relativePath, source) {
  const lines = source.split(/\r?\n/);
  const violations = [];

  for (const [index, line] of lines.entries()) {
    const matchedRawImport = bannedRawSupabaseAppImports.find((importPath) =>
      line.includes(importPath),
    );
    if (matchedRawImport && !appRawSupabaseImportAllowlist.has(relativePath)) {
      violations.push(`${relativePath}:${index + 1}:${line.trim()}`);
      continue;
    }

    const matchedBrowserImport = bannedBrowserSupabaseAppImports.find(
      (importPath) => line.includes(importPath),
    );
    if (
      matchedBrowserImport &&
      !appBrowserSupabaseImportAllowlist.has(relativePath)
    ) {
      violations.push(`${relativePath}:${index + 1}:${line.trim()}`);
    }
  }

  return violations;
}

function collectAppSupabaseViolations(filePath) {
  const relativePath = toRepoRelative(filePath);
  return collectAppSupabaseViolationsFromSource(
    relativePath,
    readFileSync(filePath, "utf8"),
  );
}

function runDataBoundaryCheck() {
  const apiRouteFiles = collectApiRouteFiles();
  const appSourceFiles = collectAppSourceFiles();

  if (apiRouteFiles.length === 0 && appSourceFiles.length === 0) {
    console.log(
      "No app source files found under apps/**/*.{ts,tsx,js,jsx,mjs}; data boundary check skipped.",
    );
    process.exit(0);
  }

  if (apiRouteFiles.length === 0) {
    console.log(
      "No app API route source files found under apps/*/app/api/**/*.{ts,tsx} (after exclusions); Supabase route boundary check skipped.",
    );
  }

  const apiRouteViolations = apiRouteFiles.flatMap((filePath) =>
    collectViolations(filePath, bannedApiRouteImports),
  );
  const appTwentyViolations = appSourceFiles.flatMap((filePath) =>
    collectViolations(filePath, bannedAppSourcePatterns),
  );
  const appSupabaseViolations = appSourceFiles.flatMap((filePath) =>
    collectAppSupabaseViolations(filePath),
  );

  if (apiRouteViolations.length > 0) {
    console.error(
      "Data access boundary violations detected in apps/*/app/api/**/*.{ts,tsx}:",
    );
    console.error(apiRouteViolations.join("\n"));
    console.error("");
    console.error(
      "Route handlers under apps/*/app/api/ must be thin re-exports and must not import Supabase clients directly.",
    );
    console.error(
      "See docs/guides/architecture/data-access-boundary.md for the boundary rule and approved exceptions.",
    );
    process.exit(1);
  }

  if (appTwentyViolations.length > 0) {
    console.error(
      "Twenty CRM boundary violations detected in apps/**/*.{ts,tsx,js,jsx,mjs}:",
    );
    console.error(appTwentyViolations.join("\n"));
    console.error("");
    console.error(
      "App source must not import raw Twenty clients or reference server-only Twenty credentials.",
    );
    console.error(
      "Use stable @asym/api CRM contracts and thin route re-exports instead.",
    );
    process.exit(1);
  }

  if (appSupabaseViolations.length > 0) {
    console.error(
      "Browser Supabase data-boundary violations detected in apps/**/*.{ts,tsx,js,jsx,mjs}:",
    );
    console.error(appSupabaseViolations.join("\n"));
    console.error("");
    console.error(
      "App browser table reads should go through @asym/database/hooks or approved collection exports.",
    );
    console.error(
      "Raw @supabase/supabase-js imports are forbidden in app source; browser Supabase auth helpers require an explicit allowlist entry.",
    );
    process.exit(1);
  }

  const retiredTwentyRuntimeViolations =
    collectRetiredTwentyRuntimeViolations();
  if (retiredTwentyRuntimeViolations.length > 0) {
    console.error("Retired Twenty CRM runtime violations detected:");
    console.error(retiredTwentyRuntimeViolations.join("\n"));
    console.error("");
    console.error(
      "Asym Postgres owns CRM truth. Remove live Twenty clients, credentials, routes, webhooks, and sync flags from current runtime source.",
    );
    process.exit(1);
  }

  console.log(
    "Data access boundary check passed: no direct Supabase imports in app API routes, no raw Twenty access, and no unapproved browser Supabase app imports.",
  );
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  runDataBoundaryCheck();
}
