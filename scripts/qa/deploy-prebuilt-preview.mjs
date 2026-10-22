#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { appendFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { EXPECTED_PROJECTS } from "../verify/vercel-build-controls.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const TEAM = "team_YrLB8jJARcRH0jnF1HPpPGTB";
export const VERCEL_CLI_VERSION = "65.0.0";

function describeFailure(result) {
  const status =
    Number.isInteger(result.status) &&
    result.status >= 0 &&
    result.status <= 255
      ? result.status
      : "unknown";
  const signals = [
    "SIGABRT",
    "SIGBUS",
    "SIGINT",
    "SIGKILL",
    "SIGSEGV",
    "SIGTERM",
  ];
  const codes = [
    "EACCES",
    "EAGAIN",
    "ENOBUFS",
    "ENOENT",
    "ENOMEM",
    "ETIMEDOUT",
  ];
  const signal = result.signal
    ? (signals.find((value) => value === result.signal) ?? "unknown")
    : "none";
  const spawn = result.error
    ? (codes.find((value) => value === result.error.code) ?? "unknown")
    : "none";
  const output = [result.stdout, result.stderr]
    .filter((value) => typeof value === "string")
    .join("\n");
  const categories = [];
  if (status === 137 || signal === "SIGKILL") categories.push("process-killed");
  if (spawn === "ENOBUFS") categories.push("output-limit");
  if (
    /Invalid environment variables|Missing required environment variable/i.test(
      output,
    )
  )
    categories.push("environment-validation");
  if (
    /PAYLOAD_DATABASE_SSL_CA (?:requires exactly one sslmode=verify-full|must contain a non-empty CA certificate|cannot be combined with URI SSL overrides)/.test(
      output,
    )
  )
    categories.push("tls-configuration");
  // Only bounded numbers and fixed labels leave this boundary. Never include
  // child messages, environment values or arbitrary signal/error-code strings.
  return `status=${status}; signal=${signal}; spawn=${spawn}; categories=${categories.join(",") || "unclassified"}`;
}

export function deployPrebuiltPreview({
  app,
  env = process.env,
  run = spawnSync,
  remove = rmSync,
  root = ROOT,
}) {
  const project = EXPECTED_PROJECTS.find((item) => item.key === app);
  if (
    !project ||
    env.GITHUB_ACTIONS !== "true" ||
    env.VERCEL_PROJECT_ID !== project.projectId ||
    env.VERCEL_ORG_ID !== TEAM ||
    !env.VERCEL_TOKEN
  ) {
    throw new Error(
      "Preview deployment requires GitHub Actions and the configured Core app/team credentials",
    );
  }
  const branch = env.CORE_PREVIEW_GIT_BRANCH;
  if (
    typeof branch !== "string" ||
    branch.length === 0 ||
    branch !== branch.trim() ||
    branch === "HEAD" ||
    /[\r\n\0]/.test(branch)
  ) {
    throw new Error("Preview deployment requires an explicit PR head branch");
  }
  const options = {
    cwd: root,
    env: {
      ...env,
      CORE_EVE_BUILD_MODE: "artifacts",
      VERCEL_FORCE_NO_COLOR: "1",
    },
    encoding: "utf8",
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  };
  const credentials = ["--project", project.projectId, "--scope", TEAM];
  const steps = [
    [
      "pull",
      "--yes",
      "--environment=preview",
      `--git-branch=${branch}`,
      ...credentials,
    ],
    ["build", "--yes", "--target=preview", ...credentials],
    [
      "deploy",
      "--yes",
      "--prebuilt",
      "--target=preview",
      "--archive=tgz",
      ...credentials,
    ],
  ];
  const localState = path.join(root, ".vercel");
  try {
    // Each surface gets its own pulled project/settings/output. Never upload
    // a previous app's output or persist downloaded credentials as artifacts.
    remove(localState, { recursive: true, force: true });
    let output;
    for (const args of steps) {
      const result = run(
        "bunx",
        [`vercel@${VERCEL_CLI_VERSION}`, ...args],
        options,
      );
      if (result.error || result.status !== 0)
        throw new Error(
          `Preview ${args[0]} failed for ${app} (${describeFailure(result)}); raw CLI output is withheld because it may contain environment values`,
        );
      output = result.stdout?.trim();
    }
    if (!/^https:\/\/[a-zA-Z0-9.-]+\.vercel\.app$/.test(output ?? ""))
      throw new Error(
        "Preview deployment did not return a plain Vercel deployment URL",
      );
    return output;
  } finally {
    remove(localState, { recursive: true, force: true });
  }
}

function main() {
  const url = deployPrebuiltPreview({ app: process.argv[2] });
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `url=${url}\n`);
  console.log("Prebuilt preview URL captured; local Vercel state removed.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
