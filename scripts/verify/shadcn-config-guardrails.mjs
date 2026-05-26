#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const SHADCN_RSC_OVERRIDE_ENV = "SHADCN_ALLOW_RSC_DRIFT";

const COMPONENTS_CONFIG_PATH = "packages/ui/components.json";
const EXPECTED_SHARED_GLOBALS_IMPORT = '@import "@asym/ui/styles/globals.css";';
const REQUIRED_APP_GLOBALS = [
  "apps/admin/app/globals.css",
  "apps/donor/app/globals.css",
  "apps/missionary/app/globals.css",
];
const FORBIDDEN_APP_CONFIG_NAMES = [
  "components.json",
  "tailwind.config.ts",
  "tailwind.config.js",
  "tailwind.config.mjs",
  "tailwind.config.cjs",
];

const PINNED_COMPONENTS_JSON_VALUES = [
  ["style", "base-maia"],
  ["tailwind.baseColor", "zinc"],
  ["tailwind.cssVariables", true],
  ["tailwind.config", ""],
  ["iconLibrary", "lucide"],
  ["aliases.ui", "@/components/shadcn"],
  ["aliases.utils", "@/lib/utils"],
];

function repoPath(...segments) {
  return path.join(REPO_ROOT, ...segments);
}

function toPosix(relativePath) {
  return relativePath.replaceAll("\\", "/");
}

function readJsonFile(relativePath) {
  return JSON.parse(readFileSync(repoPath(relativePath), "utf8"));
}

function getPathValue(value, dottedPath) {
  return dottedPath
    .split(".")
    .reduce((current, part) => current?.[part], value);
}

function expectedLabel(value) {
  return JSON.stringify(value);
}

function actualLabel(value) {
  return value === undefined ? "<missing>" : JSON.stringify(value);
}

function envAllowsRscDrift(env) {
  return /^(1|true|yes)$/i.test(String(env?.[SHADCN_RSC_OVERRIDE_ENV] ?? ""));
}

function failure(pathName, expected, actual) {
  return {
    path: pathName,
    expected,
    actual: actualLabel(actual),
  };
}

export function firstNonCommentLine(text) {
  let inBlockComment = false;

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();

    while (line.length > 0) {
      if (inBlockComment) {
        const commentEnd = line.indexOf("*/");
        if (commentEnd === -1) {
          line = "";
          break;
        }
        line = line.slice(commentEnd + 2).trim();
        inBlockComment = false;
        continue;
      }

      if (line.startsWith("/*")) {
        const commentEnd = line.indexOf("*/", 2);
        if (commentEnd === -1) {
          inBlockComment = true;
          line = "";
          break;
        }
        line = line.slice(commentEnd + 2).trim();
        continue;
      }

      if (line.startsWith("//")) {
        line = "";
        break;
      }

      return line;
    }
  }

  return "";
}

export function findAppConfigFiles(root = REPO_ROOT) {
  const appsRoot = path.join(root, "apps");
  if (!existsSync(appsRoot)) {
    return [];
  }

  const matches = [];
  const appDirs = readdirSync(appsRoot, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory(),
  );

  for (const appDir of appDirs) {
    for (const fileName of FORBIDDEN_APP_CONFIG_NAMES) {
      const candidate = path.join(appsRoot, appDir.name, fileName);
      if (existsSync(candidate)) {
        matches.push(toPosix(path.relative(root, candidate)));
      }
    }
  }

  return matches.sort();
}

export function readAppGlobals(root = REPO_ROOT) {
  return Object.fromEntries(
    REQUIRED_APP_GLOBALS.map((relativePath) => {
      const absolutePath = path.join(root, relativePath);
      if (!existsSync(absolutePath)) {
        return [relativePath, undefined];
      }
      return [relativePath, readFileSync(absolutePath, "utf8")];
    }),
  );
}

export function validateShadcnConfigGuardrails({
  componentsConfig,
  appConfigFiles,
  appGlobals,
  env = process.env,
}) {
  const failures = [];

  for (const [dottedPath, expected] of PINNED_COMPONENTS_JSON_VALUES) {
    const actual = getPathValue(componentsConfig, dottedPath);
    if (actual !== expected) {
      failures.push(
        failure(
          `${COMPONENTS_CONFIG_PATH}#${dottedPath}`,
          expectedLabel(expected),
          actual,
        ),
      );
    }
  }

  const rsc = componentsConfig?.rsc;
  if (rsc !== false && !envAllowsRscDrift(env)) {
    failures.push(
      failure(
        `${COMPONENTS_CONFIG_PATH}#rsc`,
        `false or ${SHADCN_RSC_OVERRIDE_ENV}=1`,
        rsc,
      ),
    );
  }

  for (const relativePath of appConfigFiles) {
    failures.push(failure(relativePath, "file must not exist", "exists"));
  }

  for (const relativePath of REQUIRED_APP_GLOBALS) {
    const text = appGlobals[relativePath];
    const firstLine = typeof text === "string" ? firstNonCommentLine(text) : "";
    if (firstLine !== EXPECTED_SHARED_GLOBALS_IMPORT) {
      failures.push(
        failure(relativePath, EXPECTED_SHARED_GLOBALS_IMPORT, firstLine),
      );
    }
  }

  return failures;
}

export function formatConfigGuardrailFailures(failures) {
  return failures
    .map(
      (item) =>
        `[shadcn-config] FAIL ${item.path}: expected ${item.expected}; actual ${item.actual}`,
    )
    .join("\n");
}

async function main() {
  const failures = validateShadcnConfigGuardrails({
    componentsConfig: readJsonFile(COMPONENTS_CONFIG_PATH),
    appConfigFiles: findAppConfigFiles(),
    appGlobals: readAppGlobals(),
    env: process.env,
  });

  if (failures.length > 0) {
    console.error(formatConfigGuardrailFailures(failures));
    process.exitCode = 1;
    return;
  }

  console.log("[shadcn-config] OK (shared config guardrails preserved)");
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (executedPath === fileURLToPath(import.meta.url)) {
  await main();
}
