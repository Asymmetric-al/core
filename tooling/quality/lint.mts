import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stripVTControlCharacters } from "node:util";

const root = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
const bin = (name: string) =>
  path.join(
    root,
    "node_modules/.bin",
    process.platform === "win32" ? `${name}.exe` : name,
  );
const usage =
  "Run: node tooling/quality/lint.mts [--typed] [--fix] [--format json] [paths...]";

export function threadSettings(cpus: number, parallel: string | undefined) {
  const count = Math.max(1, Math.floor(cpus / (parallel === "1" ? 4 : 1)));
  return { argument: `--threads=${count}`, rayon: String(count) };
}

function isOutside(absolute: string) {
  const relative = path.relative(root, absolute);
  return (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  );
}

function repoPath(input: string) {
  const absolute = path.resolve(input);
  let ancestor = absolute;
  while (!existsSync(ancestor) && path.dirname(ancestor) !== ancestor)
    ancestor = path.dirname(ancestor);
  if (isOutside(absolute) || isOutside(realpathSync(ancestor)))
    throw new Error(`Path outside repository: ${input}`);
  return path.relative(root, absolute).split(path.sep).join("/") || ".";
}

function gitFixEntries(scope: string[]) {
  return execFileSync(
    "git",
    [
      "--literal-pathspecs",
      "ls-files",
      "-z",
      "-t",
      "--stage",
      "--others",
      "--directory",
      "--exclude-standard",
      "--",
      ...scope,
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  ).split("\0");
}

function directoryLinkTarget(name: string) {
  const absolute = path.join(root, name);
  if (!lstatSync(absolute, { throwIfNoEntry: false })?.isSymbolicLink()) return;
  const isDirectory = statSync(absolute, {
    throwIfNoEntry: false,
  })?.isDirectory();
  if (isDirectory === undefined) return; // A dangling link has nothing for a fix to write through.
  const target = realpathSync(absolute);
  if (isOutside(target))
    throw new Error(
      `${isDirectory ? "Directory" : "File"} link outside repository: ${name}`,
    );
  if (!isDirectory) return;
  return path.relative(root, target).split(path.sep).join("/") || ".";
}

function checkFixScope(paths: string[]) {
  const inspected = new Set<string>();
  const expanded = new Set<string>();
  let pending = paths.map((name) => {
    const absolute = path.join(root, name);
    return existsSync(absolute) ? repoPath(realpathSync(absolute)) : name;
  });
  while (pending.length) {
    const entries = gitFixEntries([...new Set(pending)]);
    pending = [];
    for (const entry of entries) {
      if (!entry) continue;
      const untracked = entry.startsWith("? ");
      const name = untracked
        ? entry.slice(2).replace(/\/$/, "")
        : entry.slice(entry.indexOf("\t") + 1);
      // Start at the entry itself: a tracked file replaced by a link keeps its index mode, so only
      // its working-tree type shows the link.
      let candidate = name;
      while (candidate !== "." && !inspected.has(candidate)) {
        inspected.add(candidate);
        const target = directoryLinkTarget(candidate);
        if (target) pending.push(target);
        candidate = path.posix.dirname(candidate);
      }
      if (
        untracked &&
        entry.endsWith("/") &&
        !expanded.has(name) &&
        !lstatSync(path.join(root, name)).isSymbolicLink()
      ) {
        expanded.add(name);
        for (const child of readdirSync(path.join(root, name), {
          withFileTypes: true,
        })) {
          if (
            child.name !== ".git" &&
            (child.isDirectory() || child.isSymbolicLink())
          )
            pending.push(`${name}/${child.name}`);
        }
      }
    }
  }
}

const toolFailure =
  /^[ \t]*(?:[x×!⚠][ \t]+)?(?:Error running JS plugin|Failed to (?:parse oxlint configuration file|load config|find tsgolint executable|write file|open file)|Error running tsgolint|typescript\(tsconfig-error\))/im;

function classifyOutput(stdout: string, json: boolean) {
  const plain = stripVTControlCharacters(stdout);
  if (toolFailure.test(plain)) return 2;
  if (!json)
    return /: (?:warning|error) [\w@/-]+\([\w-]+\)|:\d+:\d+: (?:warning|error)\b|\bFound (?:[1-9]\d* warnings?|\d+ warnings? and [1-9]\d* errors?)\b/i.test(
      plain,
    )
      ? 1
      : 0;
  try {
    const report: unknown = JSON.parse(stdout);
    if (
      typeof report === "object" &&
      report !== null &&
      "diagnostics" in report &&
      Array.isArray(report.diagnostics)
    ) {
      if (
        report.diagnostics.some(
          (diagnostic) =>
            toolFailure.test(diagnostic.message) ||
            diagnostic.code === "typescript(tsconfig-error)",
        )
      )
        return 2;
      if (report.diagnostics.length) return 1;
    }
  } catch {
    return 0;
  }
  return 0;
}

export function run(argv: string[], { backendPath = bin("tsrs-lint") } = {}) {
  try {
    const paths: string[] = [];
    let typed = false;
    let fix = false;
    let json = false;
    const input = argv.values();
    for (const arg of input) {
      if (arg === "--typed") typed = true;
      else if (arg === "--fix") fix = true;
      else if (arg === "--format" && input.next().value === "json") json = true;
      else if (arg.startsWith("-")) throw new Error(`Refused ${arg}. ${usage}`);
      else paths.push(repoPath(arg));
    }

    const suppressions = path.join(root, "oxlint-suppressions.json");
    if (existsSync(suppressions))
      throw new Error(`Refusing implicit suppressions: ${suppressions}`);
    const threads = threadSettings(
      cpus().length,
      process.env.CORE_LINT_PARALLEL,
    );
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      RAYON_NUM_THREADS: threads.rayon,
    };
    if (typed) {
      for (const key of Object.keys(env)) {
        if (/^(?:OXLINT_TSGOLINT_|TSRS_)/i.test(key)) delete env[key];
      }
      if (!existsSync(backendPath))
        throw new Error(`Missing TSRS lint backend: ${backendPath}`);
      env.OXLINT_TSGOLINT_PATH = backendPath;
      env.TSRS_FAST = "0";
    }

    const args = [
      "--config",
      path.join(root, "oxlint.config.mts"),
      "--disable-nested-config",
      "--deny-warnings",
      threads.argument,
    ];
    if (typed) args.push("--type-aware");
    if (fix) {
      checkFixScope(paths.length ? paths : ["."]);
      args.push("--fix");
    }
    // Always name the format: under GitHub Actions Oxlint otherwise switches to its `github`
    // reporter, which drops the tool-failure text classified below.
    args.push("--format", json ? "json" : "default");
    if (paths.length) args.push("--no-error-on-unmatched-pattern");
    args.push("--", ...(paths.length ? paths : ["."]));

    const result = spawnSync(bin("oxlint"), args, {
      cwd: root,
      env,
      shell: false,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) throw result.error;
    if (result.signal) throw new Error(`Oxlint terminated by ${result.signal}`);
    const classification = classifyOutput(result.stdout.toString(), json);
    if (
      classification === 2 ||
      toolFailure.test(stripVTControlCharacters(result.stderr.toString()))
    )
      return 2;
    if (result.status === 0) return 0;
    if (result.status === 1 && classification === 1) return 1;
    throw new Error(`Oxlint failed (exit ${result.status})`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 2;
  }
}

if (import.meta.main) process.exitCode = run(process.argv.slice(2));
