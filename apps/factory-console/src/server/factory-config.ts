import path from "node:path";

// Server-only configuration for the factory state reader and control runner.
// Defaults are the VM 100 installation (scripts/archon-factory/pack/README.md);
// every value can be overridden from the service environment. None of these
// values is ever serialized to the browser.
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
  FACTORY_SCOPE_OWNERS: "conrad",
  FACTORY_REPOSITORY: "Asymmetric-al/core",
  FACTORY_ADMISSION_CAPACITY: "2",
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
  const owners = pick(env, "FACTORY_SCOPE_OWNERS")
    .split(",")
    .map((owner) => owner.trim())
    .filter(Boolean);
  if (
    !owners.length ||
    owners.some((owner) => !/^[a-z][a-z0-9-]{0,39}$/.test(owner))
  )
    throw new FactoryConfigurationError("FACTORY_SCOPE_OWNERS");
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
  const configFile = env.FACTORY_CONFIG_FILE?.trim() || null;
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
    configFile: configFile ? absolute("FACTORY_CONFIG_FILE", configFile) : null,
    userId,
    project,
    searchPath,
    owners,
    repository,
    capacity: integer(
      "FACTORY_ADMISSION_CAPACITY",
      pick(env, "FACTORY_ADMISSION_CAPACITY"),
      1,
      64,
    ),
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
    ...(config.configFile ? { CORE_FACTORY_CONFIG: config.configFile } : {}),
  };
}
