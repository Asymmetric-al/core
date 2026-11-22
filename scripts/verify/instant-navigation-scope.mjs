#!/usr/bin/env node
// Decides whether the instant-nav job's donor build and instant() guards can
// be skipped on a same-repository pull request into develop, and fails safe:
// anything it cannot be sure about runs the guards. Production pull requests,
// production pushes and manual runs always run them.
// See openspec/changes/rebalance-ci-test-scope/design.md.
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SHA = /^[0-9a-f]{40}$/;

// Everything that can change a donor production build, the instant()
// guards or how the instant-nav job runs them. Generous on purpose: a miss
// would surface only at the next production release.
export const INSTANT_NAVIGATION_INPUTS = Object.freeze([
  "apps/donor/**",
  "packages/**",
  "tooling/**",
  "vendor/**",
  "scripts/**",
  "tests/e2e/**",
  "playwright*.config.ts",
  "package.json",
  "bun.lock",
  "bun.lockb",
  "bunfig.toml",
  "turbo.json",
  "tsconfig*.json",
  ".bun-version",
  ".node-version",
  ".nvmrc",
  ".npmrc",
  ".github/workflows/ci-integration.yml",
]);

function globToRegExp(pattern) {
  let source = "";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === "*" && pattern[index + 1] === "*") {
      // [\s\S], not ".": a name may hold a newline, which "." never matches.
      source += "[\\s\\S]*";
      index += 1;
    } else if (character === "*") source += "[^/]*";
    else source += character.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${source}$`);
}

/** Repository-relative glob match: `**` spans directories, `*` does not. */
export function matchesGlob(file, pattern) {
  return globToRegExp(pattern).test(String(file).replaceAll("\\", "/"));
}

const matchesAny = (file, patterns) =>
  patterns.some((pattern) => matchesGlob(file, pattern));

/** Pure selection for the instant-nav job: should it build and run? */
export function selectInstantNavigation({ event, baseRef, changedFiles }) {
  if (event !== "pull_request" || baseRef !== "develop")
    return {
      run: true,
      reason: `${event || "unknown event"}${baseRef ? ` into ${baseRef}` : ""}: the guards always run`,
    };
  if (!Array.isArray(changedFiles) || changedFiles.length === 0)
    return {
      run: true,
      reason:
        "the pull request's changed files could not be computed: the guards run",
    };
  const hit = changedFiles.find((file) =>
    matchesAny(file, INSTANT_NAVIGATION_INPUTS),
  );
  return hit
    ? { run: true, reason: `${hit} changed: the guards run` }
    : {
        run: false,
        reason:
          "no changed file can affect the donor build or the instant() guards: skipped",
      };
}

function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/**
 * The pull request's changed files (both sides of a rename), or null when
 * they cannot be known: a missing or malformed SHA, a shallow checkout, or a
 * failed diff.
 */
export function readChangedFiles({ base, head, git = runGit } = {}) {
  if (!SHA.test(base ?? "") || !SHA.test(head ?? "")) return null;
  try {
    if (git(["rev-parse", "--is-shallow-repository"]).trim() !== "false")
      return null;
    // -z: NUL-separated names exactly as stored. Without it git quotes and
    // escapes unusual names ("caf\303\251"), which then match no pattern.
    return [
      ...new Set(
        git([
          "diff",
          "--no-renames",
          "--name-only",
          "-z",
          `${base}...${head}`,
          "--",
        ])
          .split("\0")
          .filter(Boolean),
      ),
    ];
  } catch {
    return null;
  }
}

function changeContext(env, readChanges) {
  const event = env.GITHUB_EVENT_NAME;
  const baseRef = env.GITHUB_BASE_REF;
  const changedFiles =
    event === "pull_request" && baseRef === "develop"
      ? readChanges({ base: env.CI_BASE_SHA, head: env.CI_HEAD_SHA })
      : null;
  return { event, baseRef, changedFiles };
}

function main() {
  let decision;
  try {
    decision = selectInstantNavigation(
      changeContext(process.env, readChangedFiles),
    );
  } catch (error) {
    decision = {
      run: true,
      reason: `selection failed (${error instanceof Error ? error.message : error}): the guards run`,
    };
  }
  console.log(`instant-nav scope: ${decision.reason}`);
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `run=${decision.run}\n`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
