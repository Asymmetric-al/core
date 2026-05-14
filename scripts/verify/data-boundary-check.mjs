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
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function collectTypeScriptFiles(directoryPath) {
  const entries = readdirSync(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(entryPath));
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
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

console.log(
  "Data access boundary check passed: no direct Supabase imports in app API routes and no raw Twenty access in app source.",
);
