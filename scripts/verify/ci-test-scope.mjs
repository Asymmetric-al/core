#!/usr/bin/env node
// Decides which tests a CI run may leave out, and fails safe: anything it
// cannot be sure about runs everything. Pull requests into develop are the
// only runs that may skip; pushes to develop, merge_group and manual runs
// always run every test, so every test still runs on the path to develop.
// See openspec/changes/rebalance-ci-test-scope/design.md.
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  globSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SHA = /^[0-9a-f]{40}$/;
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

// A change to any of these can alter how every test runs (dependencies,
// toolchain, Vitest configuration and setup, this selection, the CI job), so
// it runs everything.
export const FULL_RUN_TRIGGERS = Object.freeze([
  "package.json",
  "bun.lock",
  "bun.lockb",
  "bunfig.toml",
  ".bun-version",
  ".node-version",
  ".nvmrc",
  ".npmrc",
  "tsconfig*.json",
  "tooling/typescript-config/**",
  "vitest.config.mts",
  "vitest.*.mts",
  "vitest.*.ts",
  "tests/setup/**",
  "tests/mocks/**",
  "scripts/verify/unit-tests.mjs",
  "scripts/verify/ci-test-scope.mjs",
  ".github/workflows/ci.yml",
]);

// A group's tests may be skipped only when the pull request touches none of
// its inputs. Membership is checked on every skip by analyzeGroupTests: a
// test whose imports or repository reads leave the inputs stays in the run.
// The inputs record the inspection in design.md §2.
export const SCOPED_TEST_GROUPS = Object.freeze([
  Object.freeze({
    id: "factory",
    description: "factory pack tests",
    tests: Object.freeze([
      "tests/unit/scripts/archon-*.test.ts",
      "tests/unit/scripts/factory-*.test.ts",
    ]),
    inputs: Object.freeze([
      "scripts/archon-factory/**",
      "scripts/factory/**",
      "scripts/verify/bun-lock-drift.mjs",
      "scripts/verify/ci-build-policy.mjs",
      "tests/unit/helpers/**",
      "tests/unit/scripts/support/**",
      ".codex/**",
      "docs/ai/skills/samson-factory/**",
      "docs/guides/development/samson-codex-cloud.md",
      "openspec/changes/add-six-agent-codex-factory/**",
    ]),
  }),
]);

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
      source += ".*";
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

/**
 * Why the change set cannot narrow anything, or null when it can: only a
 * known, non-empty change set of a pull request into develop narrows.
 */
function fullRunReason({ event, baseRef, changedFiles }) {
  if (event !== "pull_request")
    return `${event ? `${event} event` : "no pull request context"}: every test runs`;
  if (baseRef !== "develop")
    return `pull request into ${baseRef || "an unknown branch"}: every test runs (only pull requests into develop are scoped)`;
  if (!Array.isArray(changedFiles))
    return "the pull request's changed files could not be computed: every test runs";
  if (changedFiles.length === 0)
    return "the pull request's change set is empty: every test runs";
  const trigger = changedFiles.find((file) =>
    matchesAny(file, FULL_RUN_TRIGGERS),
  );
  if (trigger) return `${trigger} changed: every test runs`;
  return null;
}

/** Pure selection: which scoped groups run for this event and change set. */
export function selectUnitTests({ event, baseRef, changedFiles }) {
  const full = fullRunReason({ event, baseRef, changedFiles });
  const groups = SCOPED_TEST_GROUPS.map((group) => {
    if (full)
      return { id: group.id, tests: group.tests, run: true, reason: full };
    const hit = changedFiles.find(
      (file) => matchesAny(file, group.inputs) || matchesAny(file, group.tests),
    );
    return hit
      ? {
          id: group.id,
          tests: group.tests,
          run: true,
          reason: `${hit} changed`,
        }
      : {
          id: group.id,
          tests: group.tests,
          run: false,
          reason: `no changed file matches the ${group.description}' inputs`,
        };
  });
  return {
    reason: full ?? "pull request into develop: scoped groups apply",
    groups,
  };
}

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

const CODE_FILE = /\.(?:[cm]?[jt]sx?)$/;
const RESOLVE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".mjs",
  ".js",
  ".cjs",
  "/index.ts",
  "/index.mts",
  "/index.mjs",
  "/index.js",
];
const SPECIFIER_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  /\bvi\.(?:mock|doMock|importActual)\(\s*["']([^"']+)["']/g,
];
const URL_READ = /new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g;
// Ways a file reaches the real repository root instead of a fixture root.
const ROOT_ACCESS =
  /import\.meta\.(?:dirname|filename)|__dirname|__filename|process\.cwd\(\)|fileURLToPath\(\s*import\.meta\.url\s*\)/;
const STRING_LITERAL = /"([^"\n]*)"|'([^'\n]*)'|`([^`$]*)(?:`|\$\{)/g;

const toPosix = (file) => file.split(path.sep).join("/");
const trimPath = (literal) => literal.replace(/^\.\//, "").replace(/\/+$/, "");

/**
 * Splits a group's test files into those whose imports and repository reads
 * provably stay inside the group's inputs ("scoped", safe to skip when the
 * inputs did not change) and those that must stay in every run, with the
 * reasons. It follows relative imports transitively; flags workspace-package
 * imports and `new URL(..., import.meta.url)` targets outside the inputs; and,
 * in files that resolve the real repository root, flags every path literal
 * that names a top-level repository entry outside the inputs. A read through
 * a computed path is invisible to it; the full runs on develop pushes and
 * merge_group are the backstop for that.
 */
export function analyzeGroupTests(group, { root = REPO_ROOT } = {}) {
  // A full-run trigger changing runs every test, so reading one is safe.
  const allowed = [...group.inputs, ...group.tests, ...FULL_RUN_TRIGGERS];
  const inside = (relative) => {
    const clean = trimPath(relative);
    return allowed.some(
      (pattern) =>
        matchesGlob(clean, pattern) || matchesGlob(`${clean}/_`, pattern),
    );
  };
  const entries = readdirSync(root, { withFileTypes: true }).filter(
    (entry) => entry.name !== "node_modules" && entry.name !== ".git",
  );
  const topLevel = new Set(entries.map((entry) => entry.name));
  const topLevelFiles = new Set(
    entries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  );
  // A path below a top-level entry, or a top-level file. A bare directory
  // name ("review", "apps") is too often an ordinary word to count.
  const namesRepositoryPath = (literal) => {
    const clean = literal.replace(/^\.\//, "");
    return clean.includes("/")
      ? topLevel.has(clean.split("/")[0])
      : topLevelFiles.has(clean);
  };
  const relativeTarget = (from, specifier) =>
    toPosix(
      path.relative(
        root,
        path.resolve(path.dirname(path.join(root, from)), specifier),
      ),
    );
  const resolveImport = (from, specifier) => {
    const target = relativeTarget(from, specifier);
    for (const suffix of RESOLVE_SUFFIXES) {
      const candidate = `${target}${suffix}`;
      const absolute = path.join(root, candidate);
      if (
        CODE_FILE.test(candidate) &&
        existsSync(absolute) &&
        statSync(absolute).isFile()
      )
        return candidate;
    }
    return target;
  };

  const modules = new Map();
  const analyzeModule = (file) => {
    if (modules.has(file)) return modules.get(file);
    const result = { problems: [], imports: [] };
    modules.set(file, result);
    const source = readFileSync(path.join(root, file), "utf8");
    for (const pattern of SPECIFIER_PATTERNS)
      for (const [, specifier] of source.matchAll(pattern)) {
        if (specifier.startsWith("@asym/")) {
          result.problems.push(
            `${file} imports workspace package ${specifier}`,
          );
          continue;
        }
        if (!specifier.startsWith(".")) continue;
        const target = resolveImport(file, specifier);
        if (!inside(target)) result.problems.push(`${file} imports ${target}`);
        else if (CODE_FILE.test(target) && existsSync(path.join(root, target)))
          result.imports.push(target);
      }
    // `fileURLToPath(import.meta.url)` compared with process.argv[1] only
    // asks "am I the entry point?"; it reads nothing.
    let readsRoot = ROOT_ACCESS.test(
      source
        .split("\n")
        .filter((line) => !line.includes("process.argv[1]"))
        .join("\n"),
    );
    for (const [, relative] of source.matchAll(URL_READ)) {
      const target = relativeTarget(file, relative);
      if (target === "" || target.startsWith("..")) readsRoot = true;
      else if (!inside(target)) result.problems.push(`${file} reads ${target}`);
    }
    if (readsRoot)
      for (const match of source.matchAll(STRING_LITERAL)) {
        const literal = match[1] ?? match[2] ?? match[3] ?? "";
        if (namesRepositoryPath(literal) && !inside(literal))
          result.problems.push(`${file} reads ${trimPath(literal)}`);
      }
    return result;
  };
  const closureProblems = (test) => {
    const problems = new Set();
    const seen = new Set();
    const pending = [test];
    while (pending.length > 0) {
      const file = pending.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      const result = analyzeModule(file);
      for (const problem of result.problems) problems.add(problem);
      pending.push(...result.imports);
    }
    return [...problems].sort();
  };

  const tests = [
    ...new Set(
      group.tests.flatMap((pattern) =>
        globSync(pattern, { cwd: root }).map(toPosix),
      ),
    ),
  ].sort();
  const scoped = [];
  const unscoped = [];
  for (const test of tests) {
    const reasons = closureProblems(test);
    if (reasons.length === 0) scoped.push(test);
    else unscoped.push({ file: test, reasons });
  }
  return { scoped, unscoped };
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
    return [
      ...new Set(
        git(["diff", "--no-renames", "--name-only", `${base}...${head}`, "--"])
          .split(/\r?\n/)
          .map((line) => line.trim())
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

/** Vitest exclusions and log lines for the unit runner. */
export function unitTestScope({
  env = process.env,
  readChanges = readChangedFiles,
  analyze = analyzeGroupTests,
} = {}) {
  const selection = selectUnitTests(changeContext(env, readChanges));
  const excludeArgs = [];
  const lines = [];
  for (const group of selection.groups) {
    if (group.run) {
      lines.push(
        `unit-test scope: running the ${group.id} group (${group.reason})`,
      );
      continue;
    }
    const definition = SCOPED_TEST_GROUPS.find(({ id }) => id === group.id);
    const { scoped, unscoped } = analyze(definition);
    for (const file of scoped) excludeArgs.push("--exclude", file);
    lines.push(
      `unit-test scope: skipping ${scoped.length} files of the ${group.id} group (${group.tests.join(", ")}): ${group.reason}; pushes to develop and merge_group runs always run them`,
    );
    for (const { file, reasons } of unscoped)
      lines.push(
        `unit-test scope: keeping ${file} in the run: ${reasons.join("; ")}`,
      );
  }
  return { excludeArgs, lines };
}

function main(args) {
  if (!args.includes("--instant-navigation")) {
    console.error("usage: ci-test-scope.mjs --instant-navigation");
    return 2;
  }
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
  process.exitCode = main(process.argv.slice(2));
