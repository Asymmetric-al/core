import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { uiWorkspaces } from "./design-system.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
const eslintCli = path.join(
  path.dirname(require.resolve("eslint/package.json")),
  "bin/eslint.js",
);

// A small schema/ownership guard around ESLint's native data, not a second
// suppression engine. Only this integration's six rules may accrue legacy debt.
export function validateSuppressions(entries) {
  const allowed = new Set(
    [
      "no-restyle",
      "no-raw-colors",
      "no-arbitrary-values",
      "no-inline-styles",
      "no-unknown-classes",
      "require-static-classes",
    ].map((name) => `shadcn/${name}`),
  );
  if (!entries || typeof entries !== "object" || Array.isArray(entries))
    throw new Error("Invalid native ESLint suppression file.");
  for (const [file, rules] of Object.entries(entries)) {
    if (
      file.includes("\\") ||
      file.split("/").includes("..") ||
      !uiWorkspaces.some((scope) => file.startsWith(`${scope}/`))
    )
      throw new Error(`Suppression path is outside first-party UI: ${file}`);
    if (!rules || typeof rules !== "object" || Array.isArray(rules))
      throw new Error(`Invalid suppressions for ${file}`);
    for (const [rule, entry] of Object.entries(rules)) {
      if (
        !allowed.has(rule) ||
        !entry ||
        Object.keys(entry).length !== 1 ||
        !Number.isSafeInteger(entry.count) ||
        entry.count <= 0
      )
        throw new Error(`Invalid or unrelated suppression ${file}: ${rule}`);
    }
  }
}

// Native ESLint owns findings, formatting, fixes, and count-based suppressions.
// This adapter only fixes cwd semantics and rejects degraded discovery/cache.
export function lintInvocation({ args, cwd, rootDir = repositoryRoot }) {
  cwd = path.resolve(cwd);
  rootDir = path.resolve(rootDir);
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      raw: { type: "boolean" },
      "prune-suppressions": { type: "boolean" },
      fix: { type: "boolean" },
      "fix-dry-run": { type: "boolean" },
      format: { type: "string", short: "f" },
      "output-file": { type: "string", short: "o" },
      quiet: { type: "boolean" },
      "no-warn-ignored": { type: "boolean" },
      "no-error-on-unmatched-pattern": { type: "boolean" },
      "no-inline-config": { type: "boolean" },
      "no-color": { type: "boolean" },
      stats: { type: "boolean" },
    },
  });
  if (values.raw && values["prune-suppressions"]) {
    throw new Error("--raw and --prune-suppressions are separate operations.");
  }
  const workspace = uiWorkspaces.find(
    (scope) => path.resolve(rootDir, scope) === path.resolve(cwd),
  );
  if (cwd !== rootDir && !workspace) {
    throw new Error(
      "Run from the repository root or a supported UI workspace.",
    );
  }
  const targets = positionals.length
    ? positionals
    : workspace
      ? ["."]
      : uiWorkspaces;
  const paths = targets.map((target) => path.resolve(cwd, target));
  if (
    workspace &&
    paths.some((target) => target !== cwd && !target.startsWith(cwd + path.sep))
  ) {
    throw new Error(
      "Use the repository-root lint:ui command for cross-workspace paths.",
    );
  }
  const workspaces = workspace
    ? [workspace]
    : uiWorkspaces.filter((scope) =>
        paths.some((target) => {
          const directory = path.resolve(rootDir, scope);
          const globStart = target.search(/[*?{[]/);
          const prefix =
            globStart < 0 ? target : path.resolve(target.slice(0, globStart));
          return (
            prefix === rootDir ||
            prefix === directory ||
            prefix.startsWith(directory + path.sep) ||
            directory.startsWith(prefix + path.sep)
          );
        }),
      );
  const configFile = path.join(rootDir, workspace ?? "", "eslint.config.mjs");
  const cliArgs = [
    "--config",
    configFile,
    "--suppressions-location",
    path.join(rootDir, "tooling/eslint-config/suppressions.json"),
  ];
  for (const [option, value] of Object.entries(values)) {
    if (option === "raw" || value === false) continue;
    cliArgs.push(`--${option}`);
    if (typeof value === "string")
      cliArgs.push(option === "output-file" ? path.resolve(cwd, value) : value);
  }
  return {
    cwd: rootDir,
    args: [...cliArgs, ...paths],
    workspaces,
    workspace,
    configFile,
    raw: values.raw === true,
  };
}

export async function runLint({
  args = process.argv.slice(2),
  cwd = process.cwd(),
  rootDir = repositoryRoot,
} = {}) {
  const invocation = lintInvocation({ args, cwd, rootDir });
  validateSuppressions(
    JSON.parse(
      await readFile(
        path.join(rootDir, "tooling/eslint-config/suppressions.json"),
        "utf8",
      ),
    ),
  );
  if (invocation.workspaces.length) {
    const healthStatus = await runCheckedProcess(
      fileURLToPath(new URL("./health.mjs", import.meta.url)),
      [
        "--root",
        rootDir,
        "--config-file",
        invocation.configFile,
        ...invocation.workspaces.flatMap((workspace) => [
          "--workspace",
          workspace,
        ]),
      ],
      invocation.cwd,
    );
    if (healthStatus !== 0) return healthStatus;
  }
  let temporary;
  try {
    if (invocation.raw) {
      temporary = await mkdtemp(path.join(os.tmpdir(), "core-lint-raw-"));
      const empty = path.join(temporary, "suppressions.json");
      await writeFile(empty, "{}\n");
      invocation.args[invocation.args.indexOf("--suppressions-location") + 1] =
        empty;
    }
    return await runCheckedProcess(eslintCli, invocation.args, invocation.cwd);
  } finally {
    if (temporary) await rm(temporary, { recursive: true, force: true });
  }
}

export function runCheckedProcess(script, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd,
      stdio: ["inherit", "inherit", "pipe"],
      shell: false,
    });
    let operationalWarning = false;
    let tail = "";
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
      const text = tail + chunk.toString();
      operationalWarning ||= text.includes("[@shadcn/lint]");
      tail = text.slice(-32);
    });
    child.on("error", reject);
    child.on("close", (status) => {
      if (operationalWarning) {
        console.error(
          "Core design-system analysis emitted an upstream operational warning. Resolve the discovery/configuration problem above; a fallback result is not accepted.",
        );
      }
      resolve(operationalWarning ? 2 : (status ?? 2));
    });
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    process.exitCode = await runLint();
  } catch (error) {
    console.error(`Core design-system lint setup failed: ${error.message}`);
    process.exitCode = 2;
  }
}
