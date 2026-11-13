import { readFile } from "node:fs/promises";
import path from "node:path";

// Server-only configuration for the factory state reader and control runner.
// Defaults are the VM 100 installation (scripts/archon-factory/pack/README.md);
// every value can be overridden from the service environment. None of these
// values is ever serialized to the browser. Scope owners and the admission
// limit are not environment settings: they come from core-factory.json
// (readFactoryPolicy below).
export const FACTORY_DEFAULTS = {
  FACTORY_ARCHON_CLI: "/opt/archon/0.14.0/archon",
  FACTORY_CONTROL_SCRIPT:
    "/srv/core-factory/control/.archon/workflows/core-factory/.shared/control.mjs",
  FACTORY_CONTROL_CWD: "/srv/core-factory/control",
  FACTORY_ARCHON_HOME: "/srv/core-factory/archon",
  FACTORY_ARCHON_USER_ID: "core-factory",
  FACTORY_SERVICE_HOME: "/home/admin",
  FACTORY_CLAUDE_PROFILE: "/home/admin/.claude",
  FACTORY_PATH: "/usr/bin:/bin",
  FACTORY_STATE_PROJECT: "_folder/control",
  // The pack's own default (config.mjs DEFAULT_CONFIG_PATH). control.mjs
  // receives it as CORE_FACTORY_CONFIG, and the Console reads scope owners and
  // the admission limit from the same file, so neither has a second source.
  FACTORY_CONFIG_FILE: "/srv/core-factory/control/core-factory.json",
  FACTORY_REPOSITORY: "Asymmetric-al/core",
  FACTORY_READ_TIMEOUT_MS: "20000",
  FACTORY_CONTROL_TIMEOUT_MS: "90000",
} as const;

export type FactoryConfiguration = ReturnType<typeof factoryConfiguration>;

export class FactoryConfigurationError extends Error {
  constructor(public variable: string) {
    super(`Factory adapter configuration is invalid (${variable})`);
  }
}

function pick(
  env: Record<string, string | undefined>,
  key: keyof typeof FACTORY_DEFAULTS,
) {
  const value = env[key]?.trim();
  return value ? value : FACTORY_DEFAULTS[key];
}

function safe(value: string) {
  return !/[\0\r\n]/.test(value);
}

function absolute(key: string, value: string) {
  if (!safe(value) || !path.isAbsolute(value))
    throw new FactoryConfigurationError(key);
  return value;
}

/** An absolute executable, or a JSON argv array (the pack's ARCHON_CLI_COMMAND convention). */
function command(key: string, value: string): string[] {
  if (value.startsWith("[")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new FactoryConfigurationError(key);
    }
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      parsed.some((part) => typeof part !== "string" || !part || !safe(part))
    )
      throw new FactoryConfigurationError(key);
    absolute(key, parsed[0] as string);
    return parsed as string[];
  }
  return [absolute(key, value)];
}

function integer(key: string, value: string, minimum: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum)
    throw new FactoryConfigurationError(key);
  return parsed;
}

export function factoryConfiguration(
  env: Record<string, string | undefined> = process.env,
) {
  const repository = pick(env, "FACTORY_REPOSITORY");
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(repository))
    throw new FactoryConfigurationError("FACTORY_REPOSITORY");
  const userId = pick(env, "FACTORY_ARCHON_USER_ID");
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(userId))
    throw new FactoryConfigurationError("FACTORY_ARCHON_USER_ID");
  const project = pick(env, "FACTORY_STATE_PROJECT");
  if (!/^[A-Za-z0-9_./-]{1,200}$/.test(project))
    throw new FactoryConfigurationError("FACTORY_STATE_PROJECT");
  const searchPath = pick(env, "FACTORY_PATH");
  if (!safe(searchPath)) throw new FactoryConfigurationError("FACTORY_PATH");
  // TEST-ONLY: set by the Playwright fixture run so every view says the data
  // is synthetic. Production never sets it.
  const fixtureLabel =
    env.FACTORY_FIXTURE_LABEL?.replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim()
      .slice(0, 160) || null;
  return {
    fixtureLabel,
    archonCommand: command(
      "FACTORY_ARCHON_CLI",
      pick(env, "FACTORY_ARCHON_CLI"),
    ),
    node: absolute(
      "FACTORY_NODE",
      env.FACTORY_NODE?.trim() || process.execPath,
    ),
    controlScript: absolute(
      "FACTORY_CONTROL_SCRIPT",
      pick(env, "FACTORY_CONTROL_SCRIPT"),
    ),
    cwd: absolute("FACTORY_CONTROL_CWD", pick(env, "FACTORY_CONTROL_CWD")),
    archonHome: absolute(
      "FACTORY_ARCHON_HOME",
      pick(env, "FACTORY_ARCHON_HOME"),
    ),
    home: absolute("FACTORY_SERVICE_HOME", pick(env, "FACTORY_SERVICE_HOME")),
    claudeProfile: absolute(
      "FACTORY_CLAUDE_PROFILE",
      pick(env, "FACTORY_CLAUDE_PROFILE"),
    ),
    configFile: absolute(
      "FACTORY_CONFIG_FILE",
      pick(env, "FACTORY_CONFIG_FILE"),
    ),
    userId,
    project,
    searchPath,
    repository,
    readTimeoutMs: integer(
      "FACTORY_READ_TIMEOUT_MS",
      pick(env, "FACTORY_READ_TIMEOUT_MS"),
      1000,
      120_000,
    ),
    controlTimeoutMs: integer(
      "FACTORY_CONTROL_TIMEOUT_MS",
      pick(env, "FACTORY_CONTROL_TIMEOUT_MS"),
      1000,
      300_000,
    ),
  };
}

/**
 * The exact, minimal environment every spawned factory process receives. No
 * Console credential or other service variable is inherited. On Windows
 * development hosts the system root is required for process start-up only.
 */
export function factoryEnvironment(
  config: FactoryConfiguration,
  platform: NodeJS.Platform = process.platform,
): Record<string, string> {
  const windows: Record<string, string> = {};
  if (platform === "win32")
    for (const key of ["SystemRoot", "windir"])
      if (process.env[key]) windows[key] = process.env[key] as string;
  return {
    ...windows,
    ARCHON_HOME: config.archonHome,
    ARCHON_USER_ID: config.userId,
    // The owner's Claude profile: control.mjs verifies the retained identity
    // for retry, reopen, release and adopt-policy only in this environment.
    CLAUDE_CONFIG_DIR: config.claudeProfile,
    HOME: config.home,
    PATH: config.searchPath,
    CORE_FACTORY_CONFIG: config.configFile,
  };
}

/**
 * The two factory settings the Console shows and checks, read from the same
 * core-factory.json control.mjs and the selector use: the owner aliases
 * control.mjs accepts for a scope (`owners`) and the selector's admission
 * limit (`limits.admittedIssues`). Each is null when it cannot be read; no
 * built-in owner or limit stands in for it. Only the aliases and the number
 * leave this module: owner profiles, logins and the file path stay here.
 */
export type FactoryPolicy = {
  owners: string[] | null;
  capacity: number | null;
  /** Why a value is unavailable, without paths or system errors; else null. */
  reason: string | null;
};

export type FactoryPolicyReader = () => Promise<FactoryPolicy>;

const OWNER_ALIAS = /^[a-z][a-z0-9-]{0,39}$/;

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function factoryPolicy(text: string): FactoryPolicy {
  let config: unknown;
  try {
    config = JSON.parse(text);
  } catch {
    return {
      owners: null,
      capacity: null,
      reason: "The factory configuration file is not valid JSON",
    };
  }
  const entries =
    record(config) && record(config.owners)
      ? Object.entries(config.owners)
      : [];
  const owners =
    entries.length > 0 &&
    entries.every(([alias, owner]) => OWNER_ALIAS.test(alias) && record(owner))
      ? entries.map(([alias]) => alias)
      : null;
  const limit =
    record(config) && record(config.limits)
      ? config.limits.admittedIssues
      : undefined;
  const capacity =
    typeof limit === "number" && Number.isSafeInteger(limit) && limit >= 1
      ? limit
      : null;
  const problems = [
    ...(owners ? [] : ["owners"]),
    ...(capacity === null ? ["limits.admittedIssues"] : []),
  ];
  return {
    owners,
    capacity,
    reason: problems.length
      ? `The factory configuration has no valid ${problems.join(" or ")}`
      : null,
  };
}

/** Reads the file on every call, as control.mjs does on every command. */
export async function readFactoryPolicy(file: string): Promise<FactoryPolicy> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch {
    return {
      owners: null,
      capacity: null,
      reason: "The factory configuration file could not be read",
    };
  }
  return factoryPolicy(text);
}

export function factoryPolicyReader(
  config: FactoryConfiguration,
): FactoryPolicyReader {
  return () => readFactoryPolicy(config.configFile);
}
