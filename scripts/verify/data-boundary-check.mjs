import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const bannedImports = [
  "@asym/database/supabase/admin",
  "@asym/database/supabase/server",
  "@asym/database/supabase/client",
  "@supabase/ssr",
  "@supabase/supabase-js",
];

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

    if (entry.isFile() && entry.name.endsWith(".ts")) {
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

function statExists(targetPath) {
  try {
    return statSync(targetPath).isDirectory() || statSync(targetPath).isFile();
  } catch {
    return false;
  }
}

function collectViolations(filePath) {
  const relativePath = toRepoRelative(filePath);
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const violations = [];

  for (const [index, line] of lines.entries()) {
    const matchedImport = bannedImports.find((importPath) =>
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

if (apiRouteFiles.length === 0) {
  console.log(
    "No app API route TypeScript files found under apps/*/app/api/**/*.ts (after exclusions); data boundary check skipped.",
  );
  process.exit(0);
}

const violations = apiRouteFiles.flatMap(collectViolations);

if (violations.length > 0) {
  console.error(
    "Data access boundary violations detected in apps/*/app/api/**/*.ts:",
  );
  console.error(violations.join("\n"));
  console.error("");
  console.error(
    "Route handlers under apps/*/app/api/ must be thin re-exports and must not import Supabase clients directly.",
  );
  console.error(
    "See docs/guides/architecture/data-access-boundary.md for the boundary rule and approved exceptions.",
  );
  process.exit(1);
}

console.log(
  "Data access boundary check passed: no direct Supabase imports found in apps/*/app/api/**/*.ts.",
);
