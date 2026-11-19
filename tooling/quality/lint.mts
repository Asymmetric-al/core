import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
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

function hasFindings(stdout: string, json: boolean) {
  if (!json)
    return /: (?:warning|error) [\w@/-]+\([\w-]+\)|:\d+:\d+: (?:warning|error)\b|\bFound (?:[1-9]\d* warnings?|\d+ warnings? and [1-9]\d* errors?)\b/i.test(
      stripVTControlCharacters(stdout),
    );
  try {
    const report: unknown = JSON.parse(stdout);
    return (
      typeof report === "object" &&
      report !== null &&
      "diagnostics" in report &&
      Array.isArray(report.diagnostics) &&
      report.diagnostics.length > 0
    );
  } catch {
    return false;
  }
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
    if (fix) args.push("--fix");
    if (json) args.push("--format", "json");
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
    const failure =
      /Error running JS plugin|Failed to (?:parse oxlint configuration file|load config|find tsgolint executable)|Error running tsgolint|typescript\(tsconfig-error\)/i;
    const stdout = result.stdout.toString();
    if (failure.test(stdout) || failure.test(result.stderr.toString()))
      return 2;
    if (result.status === 0) return 0;
    if (result.status === 1 && hasFindings(stdout, json)) return 1;
    throw new Error(`Oxlint failed (exit ${result.status})`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 2;
  }
}

if (import.meta.main) process.exitCode = run(process.argv.slice(2));
