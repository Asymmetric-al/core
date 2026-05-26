#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const COMPONENTS_CONFIG_PATH = "packages/ui/components.json";
const SHADCN_CWD = "packages/ui";
const BASE_VIEW_ITEM = "button";

export const REGISTRY_CANARIES = Object.freeze({
  "@ss-blocks": "hero-section-09",
  "@shadcnuikit": "button1",
});

function readComponentsConfig() {
  return JSON.parse(
    readFileSync(path.join(REPO_ROOT, COMPONENTS_CONFIG_PATH), "utf8"),
  );
}

function commandArgs(item) {
  return ["--yes", "shadcn@latest", "view", item, "--cwd", SHADCN_CWD];
}

function commandText(item) {
  return `npx ${commandArgs(item).join(" ")}`;
}

export function shadcnViewSpawnSpec(
  item,
  {
    platform = process.platform,
    comspec = process.env.ComSpec ?? process.env.COMSPEC ?? "cmd.exe",
  } = {},
) {
  const args = commandArgs(item);
  if (platform === "win32") {
    return {
      command: comspec,
      args: ["/d", "/s", "/c", `npx ${args.join(" ")}`],
    };
  }

  return {
    command: "npx",
    args,
  };
}

export function collectEnvRefs(value) {
  const refs = new Set();

  function visit(current) {
    if (typeof current === "string") {
      for (const match of current.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)) {
        refs.add(match[1]);
      }
      return;
    }

    if (Array.isArray(current)) {
      for (const item of current) {
        visit(item);
      }
      return;
    }

    if (current && typeof current === "object") {
      for (const item of Object.values(current)) {
        visit(item);
      }
    }
  }

  visit(value);
  return [...refs].sort();
}

export function buildRegistrySmokePlan({
  registries,
  env = process.env,
  canaries = REGISTRY_CANARIES,
}) {
  return Object.entries(registries ?? {}).map(([namespace, registryConfig]) => {
    const requiredEnvVars = collectEnvRefs(registryConfig);
    const missingEnvVars = requiredEnvVars.filter((key) => !env[key]);

    if (missingEnvVars.length > 0) {
      return {
        namespace,
        status: "skip",
        reason: `missing env ${missingEnvVars.join(", ")}`,
        requiredEnvVars,
      };
    }

    const canary = canaries[namespace];
    if (!canary) {
      return {
        namespace,
        status: "skip",
        reason: "no canary configured",
        requiredEnvVars,
      };
    }

    return {
      namespace,
      status: "attempt",
      item: `${namespace}/${canary}`,
      requiredEnvVars,
    };
  });
}

function sanitizeOutput(text) {
  let sanitized = text;

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && value.length >= 4) {
      sanitized = sanitized.replaceAll(value, `<redacted:${key}>`);
    }
  }

  return sanitized.trim();
}

function runView(item) {
  const spawnSpec = shadcnViewSpawnSpec(item);
  const result = spawnSync(spawnSpec.command, spawnSpec.args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.error) {
    return {
      ok: false,
      detail: result.error.message,
    };
  }

  if (result.status !== 0) {
    const output = sanitizeOutput(result.stderr || result.stdout || "");
    return {
      ok: false,
      detail: output || `exit ${result.status ?? "unknown"}`,
    };
  }

  return {
    ok: true,
    detail: "",
  };
}

async function main() {
  const config = readComponentsConfig();
  const plan = buildRegistrySmokePlan({
    registries: config.registries,
    env: process.env,
  });
  const failures = [];
  let attempted = 0;
  let skipped = 0;

  console.log(`[shadcn-registry-smoke] RUN ${commandText(BASE_VIEW_ITEM)}`);
  attempted += 1;
  const baseResult = runView(BASE_VIEW_ITEM);
  if (!baseResult.ok) {
    failures.push({
      label: BASE_VIEW_ITEM,
      detail: baseResult.detail,
    });
    console.error(
      `[shadcn-registry-smoke] FAIL ${BASE_VIEW_ITEM}: ${baseResult.detail}`,
    );
  } else {
    console.log(`[shadcn-registry-smoke] PASS ${BASE_VIEW_ITEM}`);
  }

  for (const item of plan) {
    if (item.status === "skip") {
      skipped += 1;
      console.log(
        `[shadcn-registry-smoke] SKIP ${item.namespace}: ${item.reason}`,
      );
      continue;
    }

    attempted += 1;
    console.log(`[shadcn-registry-smoke] RUN ${commandText(item.item)}`);
    const result = runView(item.item);
    if (!result.ok) {
      failures.push({
        label: item.item,
        detail: result.detail,
      });
      console.error(
        `[shadcn-registry-smoke] FAIL ${item.item}: ${result.detail}`,
      );
      continue;
    }

    console.log(`[shadcn-registry-smoke] PASS ${item.item}`);
  }

  if (failures.length > 0) {
    console.error(
      `[shadcn-registry-smoke] BLOCKED (${failures.length} attempted checks failed, ${skipped} skipped)`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[shadcn-registry-smoke] OK (${attempted} attempted, ${skipped} skipped)`,
  );
}

const executedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;

if (executedPath === fileURLToPath(import.meta.url)) {
  await main();
}
