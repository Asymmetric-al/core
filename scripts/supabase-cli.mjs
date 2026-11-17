// The repository's Supabase CLI runner (`bun run supabase -- <command>`). It
// uses a CLI on the PATH only when its version equals the pin, and otherwise
// runs the pinned version through npx, with npm's project set to an empty
// directory outside the repository: run from the repository itself, npm reads
// the root package.json, whose `overrides` clash with a direct dependency
// (EOVERRIDE). The CLI itself still runs in the caller's directory. With
// SUPABASE_CLI_FORCE_PINNED=1 (the release job, whose workflow installs the
// pinned CLI with supabase/setup-cli) it never fetches one: without the pinned
// CLI on the PATH it stops and says to install it. PINNED_SUPABASE_CLI_VERSION
// below is the repository's one pin; the workflows read it from this file.
//
// Before any `db reset` it reads the environment marker of the database the
// CLI would reset and refuses anything not marked `disposable` (plan 7.5,
// AL-2674): the `--db-url` value and the local stack through psql, a linked
// project through the CLI's own `db query --linked`. A marker that cannot be
// read refuses too. There is no override flag. The one-off first rebuild of a
// hosted database is a named step of the release job and does not go through
// this runner. It refuses `config push` outright until WP3 (guardConfigPush).
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseStatusDatabaseUrl } from "./db/require-disposable-database.mjs";
import {
  requireDisposableDatabase,
  requireDisposableTarget,
} from "./lib/environment-marker.mjs";

const PINNED_SUPABASE_CLI_VERSION = "2.121.0";
const forcePinned = process.env.SUPABASE_CLI_FORCE_PINNED === "1";
const pinnedVersion =
  process.env.SUPABASE_CLI_VERSION?.trim() || PINNED_SUPABASE_CLI_VERSION;
const useShell = process.platform === "win32";

/** CLI flags that take a value (`db reset` and the global flags), so their values are not commands. */
const VALUE_FLAGS = new Set([
  "--db-url",
  "--project-ref",
  "--workdir",
  "--version",
  "--last",
  "--sql-paths",
  "--profile",
  "--log-level",
  "--output-format",
  "--output",
  "-o",
  "--network-id",
  "--dns-resolver",
  "--agent",
  "--completions",
]);

/** The command words of a CLI invocation, and its flags by name with every value given. */
function splitArgs(args) {
  const words = [];
  const flags = new Map();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--") {
      words.push(...args.slice(i + 1));
      break;
    }
    if (!arg.startsWith("-")) {
      words.push(arg);
      continue;
    }
    const eq = arg.indexOf("=");
    const name = eq > 0 ? arg.slice(0, eq) : arg;
    let value = eq > 0 ? arg.slice(eq + 1) : true;
    if (eq < 0 && VALUE_FLAGS.has(name)) {
      value = args[i + 1];
      i += 1;
    }
    flags.set(name, [...(flags.get(name) ?? []), value]);
  }
  return { words, flags };
}

/**
 * Refuses (throws) `config push`. It pushes supabase/config.toml's Auth
 * section to a hosted project: TOTP multi-factor is off there (local stacks
 * have no use for it), and the site URL and redirect allowlist are local
 * values, so a push would switch hosted TOTP off and replace the hosted
 * allowlist. WP3 makes each hosted project's site URL and allowlist source
 * (implementation record, section 9); until then hosted Auth settings change
 * only in the Supabase dashboard.
 */
export function guardConfigPush(args) {
  const { words } = splitArgs(args);
  if (words[0] === "config" && words[1] === "push")
    throw new Error(
      "refusing to run config push: supabase/config.toml would switch TOTP multi-factor off on the hosted project and replace its site URL and redirect allowlist with local values. WP3 makes each hosted project's site URL and redirect allowlist source; until then change hosted Auth settings in the Supabase dashboard.",
    );
}

/**
 * The database a `db reset` would reset: `{ kind: "local", workdir }`,
 * `{ kind: "db-url", url }` or `{ kind: "linked", projectRef, workdir }`; null
 * for any other command. Throws when the target is ambiguous or incomplete.
 */
export function parseResetTarget(args) {
  const { words, flags } = splitArgs(args);
  if (words[0] !== "db" || words[1] !== "reset") return null;

  const refuse = (why) => {
    throw new Error(`refusing to reset: ${why}`);
  };
  const last = (name) => flags.get(name)?.at(-1);
  const on = (name) => flags.has(name) && last(name) !== "false";
  const valued = (name) => {
    if (!flags.has(name)) return null;
    const value = last(name);
    if (typeof value !== "string" || !value.trim())
      refuse(`${name} needs a value`);
    return value.trim();
  };
  const url = valued("--db-url");
  const projectRef = valued("--project-ref");
  const workdir = valued("--workdir");
  const linked = on("--linked");
  if ([url !== null, linked, on("--local")].filter(Boolean).length > 1)
    refuse("the command names more than one of --db-url, --linked and --local");
  if (projectRef !== null && !linked)
    refuse("--project-ref is accepted only with --linked");
  if (url !== null) return { kind: "db-url", url };
  if (linked) return { kind: "linked", projectRef, workdir };
  return { kind: "local", workdir };
}

/** The rows of `db query -o json` output, ignoring the CLI's progress lines. Throws when there are none. */
export function parseQueryRows(output) {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  let rows;
  try {
    rows = start < 0 ? null : JSON.parse(output.slice(start, end + 1));
  } catch {
    rows = null;
  }
  if (!Array.isArray(rows))
    throw new Error(
      `the CLI printed no rows: ${output.trim().split("\n").pop()?.slice(0, 200) ?? ""}`,
    );
  return rows;
}

let invocation;
/**
 * The command and leading arguments that run the pinned CLI, probed once: the
 * CLI on the PATH when it reports the pinned version; otherwise npx with an
 * empty npm project outside the repository (removed when this process exits),
 * or, under SUPABASE_CLI_FORCE_PINNED=1, an error that says to install it.
 */
function cliInvocation() {
  if (invocation) return invocation;
  const probe = spawnSync("supabase", ["--version"], {
    stdio: "pipe",
    env: process.env,
    shell: useShell,
  });
  const found =
    !probe.error && probe.status === 0 ? probe.stdout.toString().trim() : null;
  if (found === pinnedVersion)
    return (invocation = { command: "supabase", prefix: [], global: true });
  if (forcePinned)
    throw new Error(
      `the Supabase CLI ${pinnedVersion} must be installed on the PATH (found ${found || "none"}). The release workflow installs it with supabase/setup-cli; elsewhere install that version (https://supabase.com/docs/guides/local-development/cli/getting-started) and run again.`,
    );
  const npmProject = mkdtempSync(path.join(tmpdir(), "core-supabase-npx-"));
  process.on("exit", () =>
    rmSync(npmProject, { recursive: true, force: true }),
  );
  return (invocation = {
    command: "npx",
    prefix: ["--prefix", npmProject, "-y", `supabase@${pinnedVersion}`],
    global: false,
  });
}

/** Runs the CLI with `args` and captures its output. */
function captureCli(args) {
  const { command, prefix } = cliInvocation();
  const result = spawnSync(command, [...prefix, ...args], {
    env: process.env,
    encoding: "utf8",
    shell: useShell,
  });
  if (result.error)
    throw new Error(`could not run the Supabase CLI: ${result.error.message}`);
  return result;
}

/** The local stack's database URL, from `supabase status`. */
function readLocalDatabaseUrl({ workdir }) {
  const result = captureCli([
    "status",
    "--output",
    "env",
    ...(workdir ? ["--workdir", workdir] : []),
  ]);
  const url =
    result.status === 0 ? parseStatusDatabaseUrl(result.stdout ?? "") : null;
  if (!url)
    throw new Error(
      "refusing to reset: the local Supabase stack's database URL could not be read (is `bun run supabase -- start` running?)",
    );
  return url;
}

/** A linked project's marker, read through `db query --linked`. */
function readLinkedMarker({ projectRef, workdir }) {
  // The SQL goes in a file: on Windows the CLI runs through a shell, which
  // would split a query passed as an argument.
  const dir = mkdtempSync(path.join(tmpdir(), "core-marker-"));
  try {
    const file = path.join(dir, "marker.sql");
    writeFileSync(file, "select platform.environment_kind() as kind;\n");
    const result = captureCli([
      "db",
      "query",
      "--linked",
      ...(projectRef ? ["--project-ref", projectRef] : []),
      ...(workdir ? ["--workdir", workdir] : []),
      "-o",
      "json",
      "--file",
      useShell ? `"${file}"` : file,
    ]);
    const rows = parseQueryRows(`${result.stdout ?? ""}`);
    if (result.status !== 0 || rows.length !== 1)
      throw new Error(
        `the CLI could not read the marker: ${(result.stderr ?? "").trim().split("\n").pop() ?? ""}`,
      );
    return rows[0]?.kind ?? null;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Refuses (throws) a `db reset` whose target is not marked disposable. Returns
 * the target, or null for any other command.
 */
export function guardReset(
  args,
  {
    requireUrl = requireDisposableDatabase,
    localUrl = readLocalDatabaseUrl,
    readLinked = readLinkedMarker,
  } = {},
) {
  const target = parseResetTarget(args);
  if (!target) return null;
  if (target.kind === "db-url")
    requireUrl({ databaseUrl: target.url, action: "reset" });
  else if (target.kind === "local")
    requireUrl({ databaseUrl: localUrl(target), action: "reset" });
  else
    requireDisposableTarget({
      where: `the linked project${target.projectRef ? ` ${target.projectRef}` : ""}`,
      action: "reset",
      readKind: () => readLinked(target),
    });
  return target;
}

function printGlobalInstallHint() {
  console.warn("==> Install Supabase CLI globally for faster startup:");

  if (process.platform === "win32") {
    console.warn(
      "    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git",
    );
    console.warn("    scoop install supabase");
  } else {
    console.warn("    brew install supabase/tap/supabase");
  }

  console.warn(
    "==> Docs: https://supabase.com/docs/guides/local-development/cli/getting-started",
  );
}

/** Runs the CLI with `args` after the config-push and reset guards; returns its exit status. */
export function main(args = process.argv.slice(2)) {
  let selected;
  try {
    guardConfigPush(args);
    guardReset(args);
    selected = cliInvocation();
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    return 1;
  }

  const { command, prefix, global } = selected;
  if (!global) {
    console.warn(
      `==> Global Supabase CLI does not match ${pinnedVersion}; using pinned fallback supabase@${pinnedVersion} via npx.`,
    );
    printGlobalInstallHint();
  }
  const result = spawnSync(command, [...prefix, ...args], {
    stdio: "inherit",
    env: process.env,
    shell: useShell,
  });
  if (result.error)
    console.error(
      global
        ? `error: Failed to execute global supabase CLI: ${result.error.message}`
        : `error: Failed to execute pinned Supabase CLI fallback: ${result.error.message}`,
    );
  return result.status ?? 1;
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) process.exit(main());
