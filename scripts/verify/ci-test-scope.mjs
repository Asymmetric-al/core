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
import { isBuiltin } from "node:module";
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
function fullRunReason({
  event,
  baseRef,
  changedFiles,
  triggers = FULL_RUN_TRIGGERS,
}) {
  if (event !== "pull_request")
    return `${event ? `${event} event` : "no pull request context"}: every test runs`;
  if (baseRef !== "develop")
    return `pull request into ${baseRef || "an unknown branch"}: every test runs (only pull requests into develop are scoped)`;
  if (!Array.isArray(changedFiles))
    return "the pull request's changed files could not be computed: every test runs";
  if (changedFiles.length === 0)
    return "the pull request's change set is empty: every test runs";
  const trigger = changedFiles.find((file) => matchesAny(file, triggers));
  if (trigger) return `${trigger} changed: every test runs`;
  return null;
}

/**
 * Pure selection: which scoped groups run for this event and change set.
 * `triggers` defaults to FULL_RUN_TRIGGERS; the runner adds the modules they
 * import (derivedFullRunTriggers).
 */
export function selectUnitTests({ event, baseRef, changedFiles, triggers }) {
  const full = fullRunReason({ event, baseRef, changedFiles, triggers });
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
// One string with no interpolation: "x", 'x' or `x`. Its value is in the
// first defined of three groups.
const LITERAL = String.raw`(?:"([^"\n]*)"|'([^'\n]*)'|` + "`([^`$\\n]*)`)";
const literalValue = (match, first = 1) =>
  match[first] ?? match[first + 1] ?? match[first + 2];
const WHOLE_LITERAL = new RegExp(String.raw`^\s*${LITERAL}\s*$`);
// Static imports and re-exports, and side-effect imports.
const SPECIFIER_PATTERNS = [
  new RegExp(String.raw`\bfrom\s*${LITERAL}`, "g"),
  new RegExp(String.raw`(?<![.\w$])import\s*${LITERAL}`, "g"),
];
// Calls that load or mock a module by specifier. A literal first argument is
// followed; anything else is a computed specifier the analysis cannot see.
const MODULE_CALL =
  /(?<![.\w$])(?:import|require)\(|\brequire\.resolve\(|\bimport\.meta\.resolve\(|\bvi\.(?:mock|doMock|unmock|doUnmock|importActual|importMock)\(/g;
const CALL_LITERAL_ARGUMENT = new RegExp(String.raw`^\s*${LITERAL}\s*[,)]`);
// `new URL(<first>, import.meta.url)`, also wrapped with a trailing comma.
const URL_READ = new RegExp(
  String.raw`\bnew URL\(\s*((?:[^()]|\([^()]*\))*?)\s*,\s*import\.meta\.url\s*,?\s*\)`,
  "g",
);
// Ways a file reaches the real repository root instead of a fixture root.
const ROOT_ACCESS =
  /import\.meta\.(?:dirname|filename)|__dirname|__filename|process\.cwd\(\)|fileURLToPath\(\s*import\.meta\.url\s*\)/;
const STRING_LITERAL = /"([^"\n]*)"|'([^'\n]*)'|`([^`$]*)(?:`|\$\{)/g;
// path.join / path.resolve arguments, with one level of nested calls.
const PATH_CALL = /\b(?:join|resolve)\(((?:[^()]|\([^()]*\))*)\)/g;
// File-system calls whose literal first argument is resolved against the
// working directory, which is the repository root under Vitest.
const WORKING_DIRECTORY_CALL = new RegExp(
  String.raw`\b(?:readFileSync|readFile|existsSync|statSync|lstatSync|readdirSync|readdir|createReadStream|accessSync|access|opendirSync|opendir|realpathSync|realpath|globSync|glob|resolve)\(\s*${LITERAL}`,
  "g",
);
// Child processes start in the working directory unless told otherwise, so a
// literal argument can name a repository file they run or read.
const CHILD_PROCESS_CALL =
  /\b(?:spawn|spawnSync|execFile|execFileSync|fork|exec|execSync)\(((?:[^()]|\([^()]*\))*)\)/g;
const PACKAGE_NAME = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*/i;

const toPosix = (file) => file.split(path.sep).join("/");
const trimPath = (literal) => literal.replace(/^\.\//, "").replace(/\/+$/, "");
const literalsIn = (text) =>
  [...text.matchAll(STRING_LITERAL)].map((match) => literalValue(match) ?? "");

/**
 * The source without comment lines: a line that starts with `//` goes, and a
 * line that starts with `/*` or `*` loses everything up to its `*\/`. Prose
 * such as `vi.mock("@asym/...")` in a doc comment is then not read as an
 * import. Code after a comment on the same line is kept.
 */
function withoutCommentLines(source) {
  return source
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("//")) return "";
      if (!trimmed.startsWith("/*") && !trimmed.startsWith("*")) return line;
      const end = trimmed.indexOf("*/");
      return end === -1 ? "" : trimmed.slice(end + 2);
    })
    .join("\n");
}

/** A module's literal specifiers, and whether it also loads a computed one. */
function moduleSpecifiers(text) {
  const source = withoutCommentLines(text);
  const specifiers = [];
  for (const pattern of SPECIFIER_PATTERNS)
    for (const match of source.matchAll(pattern))
      specifiers.push(literalValue(match) ?? "");
  let computed = false;
  for (const match of source.matchAll(MODULE_CALL)) {
    const argument = CALL_LITERAL_ARGUMENT.exec(
      source.slice(match.index + match[0].length),
    );
    if (argument) specifiers.push(literalValue(argument) ?? "");
    else computed = true;
  }
  return { specifiers, computed };
}

/** Resolves relative specifiers to repository-relative paths under `root`. */
function importResolver(root) {
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
  return { relativeTarget, resolveImport };
}

/**
 * Modules the full-run triggers import, transitively, such as what the Vitest
 * setup file imports: a change to one can alter every test, so it runs
 * everything too. Derived on every selection, so nothing needs listing. An
 * import it cannot follow (a computed specifier, a workspace package, a
 * relative path that does not exist) makes every change a full run ("**").
 * Bare package imports change only with the manifests or the lockfile, which
 * are triggers already.
 */
export function derivedFullRunTriggers({ root = REPO_ROOT } = {}) {
  const { resolveImport } = importResolver(root);
  const pending = FULL_RUN_TRIGGERS.flatMap((pattern) =>
    globSync(pattern, { cwd: root }).map(toPosix),
  ).filter(
    (file) => CODE_FILE.test(file) && statSync(path.join(root, file)).isFile(),
  );
  const seen = new Set();
  const derived = new Set();
  while (pending.length > 0) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const { specifiers, computed } = moduleSpecifiers(
      readFileSync(path.join(root, file), "utf8"),
    );
    if (computed) return ["**"];
    for (const specifier of specifiers) {
      if (specifier.startsWith("@asym/")) return ["**"];
      if (!specifier.startsWith(".")) continue;
      const target = resolveImport(file, specifier);
      if (!existsSync(path.join(root, target))) return ["**"];
      derived.add(target);
      if (CODE_FILE.test(target)) pending.push(target);
    }
  }
  return [...derived]
    .filter((file) => !matchesAny(file, FULL_RUN_TRIGGERS))
    .sort();
}

/**
 * Splits a group's test files into those whose imports and repository reads
 * provably stay inside the group's inputs ("scoped", safe to skip when the
 * inputs did not change) and those that must stay in every run, with the
 * reasons. It follows relative imports transitively, and in every module of a
 * test's import closure it keeps the test in the run for:
 * - an import of a workspace package, or of a bare specifier that is neither
 *   a Node built-in nor installed in the root `node_modules` (such as a `@/`
 *   alias);
 * - a relative import, or a `new URL("…", import.meta.url)` target (wrapped or
 *   not), outside the inputs;
 * - an import, mock or URL whose specifier is computed rather than a literal;
 * - a literal first argument to a file-system call or `path.resolve` (resolved
 *   against the working directory, the repository root) that names a
 *   repository path outside the inputs, and the same for any literal argument
 *   to a child-process call;
 * - in a module that reaches the real repository root itself or through any
 *   module it imports: a path literal that names a repository path outside the
 *   inputs, and the joined literal arguments of a `join`/`resolve` call
 *   ("docs", "ci.md") that do.
 * What it cannot see: a path built at run time from variables, string
 * concatenation or interpolation, read from another file, or passed through
 * calls nested more than one level deep. The full runs on develop pushes and
 * merge_group are the backstop for those.
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
  // Where a literal is known to be a path (a file-system call, a join of
  // segments), a bare top-level directory name counts too.
  const namesRepositoryEntry = (literal) => {
    const clean = trimPath(literal);
    return clean !== "" && topLevel.has(clean.split("/")[0]);
  };
  const installed = (specifier) => {
    const name = PACKAGE_NAME.exec(specifier)?.[0];
    return Boolean(name) && existsSync(path.join(root, "node_modules", name));
  };
  const { relativeTarget, resolveImport } = importResolver(root);

  const modules = new Map();
  const analyzeModule = (file) => {
    if (modules.has(file)) return modules.get(file);
    // `problems` always apply; `rootProblems` apply when the module reaches
    // the repository root itself or through a module it imports.
    const result = {
      problems: [],
      rootProblems: [],
      imports: [],
      readsRoot: false,
    };
    modules.set(file, result);
    const source = readFileSync(path.join(root, file), "utf8");
    const reads = (target, into = result.problems) => {
      if (!inside(target)) into.push(`${file} reads ${trimPath(target)}`);
    };
    const followSpecifier = (specifier) => {
      if (specifier.startsWith("@asym/")) {
        result.problems.push(`${file} imports workspace package ${specifier}`);
        return;
      }
      if (!specifier.startsWith(".")) {
        if (!isBuiltin(specifier) && !installed(specifier))
          result.problems.push(
            `${file} imports ${specifier}, which is not a relative path, a Node built-in or an installed package`,
          );
        return;
      }
      const target = resolveImport(file, specifier);
      if (!inside(target)) result.problems.push(`${file} imports ${target}`);
      else if (CODE_FILE.test(target) && existsSync(path.join(root, target)))
        result.imports.push(target);
    };
    const { specifiers, computed } = moduleSpecifiers(source);
    for (const specifier of specifiers) followSpecifier(specifier);
    if (computed) result.problems.push(`${file} imports a computed specifier`);
    // `fileURLToPath(import.meta.url)` compared with process.argv[1] only
    // asks "am I the entry point?"; it reads nothing.
    result.readsRoot = ROOT_ACCESS.test(
      source
        .split("\n")
        .filter((line) => !line.includes("process.argv[1]"))
        .join("\n"),
    );
    for (const [, first] of source.matchAll(URL_READ)) {
      const literal = WHOLE_LITERAL.exec(first);
      if (!literal) {
        result.problems.push(`${file} reads a computed URL`);
        continue;
      }
      const target = relativeTarget(file, literalValue(literal) ?? "");
      if (target === "" || target.startsWith("..")) result.readsRoot = true;
      else reads(target);
    }
    for (const match of source.matchAll(WORKING_DIRECTORY_CALL)) {
      const literal = literalValue(match) ?? "";
      if (namesRepositoryEntry(literal)) reads(literal);
    }
    for (const [, argumentsText] of source.matchAll(CHILD_PROCESS_CALL))
      for (const literal of literalsIn(argumentsText))
        for (const word of literal.split(/\s+/))
          if (namesRepositoryEntry(word)) reads(word);
    for (const literal of literalsIn(source))
      if (namesRepositoryPath(literal)) reads(literal, result.rootProblems);
    for (const [, argumentsText] of source.matchAll(PATH_CALL)) {
      const joined = literalsIn(argumentsText)
        .map(trimPath)
        .filter(Boolean)
        .join("/");
      if (namesRepositoryEntry(joined)) reads(joined, result.rootProblems);
    }
    return result;
  };
  const closureOf = (test) => {
    const seen = new Set();
    const pending = [test];
    while (pending.length > 0) {
      const file = pending.pop();
      if (seen.has(file)) continue;
      seen.add(file);
      pending.push(...analyzeModule(file).imports);
    }
    return seen;
  };
  // A module reaches the root when it resolves the root itself or imports a
  // module that does (a helper exporting `repoRoot`). Fixed point, so import
  // cycles cannot hide a reach.
  const reachesRoot = () => {
    const reach = new Map(
      [...modules].map(([file, result]) => [file, result.readsRoot]),
    );
    for (let changed = true; changed;) {
      changed = false;
      for (const [file, result] of modules)
        if (!reach.get(file) && result.imports.some((dep) => reach.get(dep))) {
          reach.set(file, true);
          changed = true;
        }
    }
    return reach;
  };

  const tests = [
    ...new Set(
      group.tests.flatMap((pattern) =>
        globSync(pattern, { cwd: root }).map(toPosix),
      ),
    ),
  ].sort();
  const closures = new Map(tests.map((test) => [test, closureOf(test)]));
  const reach = reachesRoot();
  const scoped = [];
  const unscoped = [];
  for (const test of tests) {
    const problems = new Set();
    for (const file of closures.get(test)) {
      const result = modules.get(file);
      for (const problem of result.problems) problems.add(problem);
      if (reach.get(file))
        for (const problem of result.rootProblems) problems.add(problem);
    }
    const reasons = [...problems].sort();
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
  deriveTriggers = derivedFullRunTriggers,
} = {}) {
  const context = changeContext(env, readChanges);
  // Only a known change set can narrow anything, so only then is it worth
  // following the triggers' imports.
  const triggers =
    Array.isArray(context.changedFiles) && context.changedFiles.length > 0
      ? [...FULL_RUN_TRIGGERS, ...deriveTriggers()]
      : FULL_RUN_TRIGGERS;
  const selection = selectUnitTests({ ...context, triggers });
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
