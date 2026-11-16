import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { cleanEnvironment, runProcess } from "./proc.mjs";

export class NativeIdentityRefusal extends Error {
  constructor(code) {
    super(code);
    this.name = "NativeIdentityRefusal";
    this.code = code;
  }
}

const absolute = (value) =>
  typeof value === "string" &&
  path.posix.isAbsolute(value) &&
  path.posix.normalize(value) === value &&
  value !== "/" &&
  !/[\0\r\n]/.test(value);
const hash = (value) =>
  createHash("sha256")
    .update(
      typeof value === "string" || Buffer.isBuffer(value)
        ? value
        : JSON.stringify(value),
    )
    .digest("hex");
const digest = (value) =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const ROLE_SETTING_FILES = [
  ".archon/config.yaml",
  ".claude/settings.json",
  "CLAUDE.md",
  "mcp/core-check.json",
];
export const MANAGED_POLICY_DIR = "/etc/claude-code";

const overrideKey = (key) =>
  /^(ANTHROPIC_|CLAUDE_API_KEY$|CLAUDE_CODE_(OAUTH_TOKEN|API_KEY|PROVIDER_MANAGED_BY_HOST|USE_)|CLAUDE_BIN_PATH$|IS_SANDBOX$|NODE_OPTIONS$|BUN_OPTIONS$|XDG_CONFIG_HOME$)/.test(
    key,
  );

export function assertNativeEnvironment(env, identity) {
  if (
    Object.entries(env).some(
      ([key, value]) => overrideKey(key) && value !== undefined && value !== "",
    )
  )
    throw new NativeIdentityRefusal("identity-environment-override");
  if (env.HOME !== identity.home || env.CLAUDE_CONFIG_DIR !== identity.profile)
    throw new NativeIdentityRefusal("identity-profile-environment-mismatch");
}

function assertNativeSettings(text) {
  let settings;
  try {
    settings = JSON.parse(text);
  } catch {
    throw new NativeIdentityRefusal("identity-settings-invalid");
  }
  if (!object(settings))
    throw new NativeIdentityRefusal("identity-settings-invalid");
  if (
    [
      "apiKeyHelper",
      "awsAuthRefresh",
      "awsCredentialExport",
      "forceLoginMethod",
      "forceLoginOrgUUID",
    ].some((key) => key in settings) ||
    (settings.env !== undefined &&
      (!object(settings.env) ||
        Object.keys(settings.env).some(
          (key) =>
            overrideKey(key) ||
            ["HOME", "CLAUDE_CONFIG_DIR", "ARCHON_HOME"].includes(key),
        )))
  )
    throw new NativeIdentityRefusal("identity-settings-auth-override");
}

export function managedPolicyFiles(dir = MANAGED_POLICY_DIR) {
  if (!existsSync(dir)) return {};
  if (!statSync(dir).isDirectory())
    throw new NativeIdentityRefusal("identity-settings-invalid");
  const files = {};
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      const full = path.posix.join(current, name);
      if (statSync(full).isDirectory()) walk(full);
      else files[path.posix.relative(dir, full)] = readFileSync(full, "utf8");
    }
  };
  walk(dir);
  return files;
}

export function settingsDigest(files, { managed, archonHome } = {}) {
  if (!object(managed))
    throw new Error("the managed Claude Code policy was not read");
  if (typeof archonHome !== "string")
    throw new Error("the ARCHON_HOME config is missing");
  return hash({
    control: ROLE_SETTING_FILES.map((name) => {
      if (typeof files[name] !== "string")
        throw new Error(`role setting file ${name} is missing`);
      if (name === ".claude/settings.json") assertNativeSettings(files[name]);
      return [name, hash(files[name])];
    }),
    managed: Object.keys(managed)
      .sort()
      .map((name) => {
        if (typeof managed[name] !== "string")
          throw new Error(`managed policy file ${name} is unreadable`);
        if (
          name === "managed-settings.json" ||
          /^managed-settings\.d\/.*\.json$/.test(name)
        )
          assertNativeSettings(managed[name]);
        return [name, hash(managed[name])];
      }),
    archonHome: hash(archonHome),
  });
}

export function serviceNativeIdentity(
  config,
  owner = config.nativeIdentity?.owner,
) {
  const binding = config.nativeIdentity;
  if (
    !binding ||
    binding.provider !== "claude" ||
    !/^[a-z][a-z0-9-]{0,39}$/.test(binding.owner ?? "") ||
    !absolute(binding.profile) ||
    !absolute(config.archon?.serviceHome)
  )
    throw new NativeIdentityRefusal("identity-service-binding-required");
  if (owner !== binding.owner)
    throw new NativeIdentityRefusal("identity-owner-mismatch");
  if (config.owners?.[owner]?.profile !== binding.profile)
    throw new NativeIdentityRefusal("identity-profile-mismatch");
  return {
    owner,
    profile: binding.profile,
    provider: "claude",
    home: config.archon.serviceHome,
  };
}

export function nativeAccountDigest(auth, profile) {
  if (
    !object(auth) ||
    auth.loggedIn !== true ||
    auth.authMethod !== "claude.ai" ||
    auth.apiProvider !== "firstParty" ||
    auth.subscriptionType !== "team" ||
    auth.configDirectory !== profile ||
    typeof auth.email !== "string" ||
    !auth.email.trim() ||
    typeof auth.orgId !== "string" ||
    !auth.orgId.trim()
  )
    throw new NativeIdentityRefusal("identity-auth-invalid");
  return hash({
    email: auth.email.trim().toLowerCase(),
    orgId: auth.orgId.trim(),
  });
}

function runIdentityPath(config, runId) {
  if (
    typeof runId !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/.test(runId) ||
    /[\r\n]/.test(runId)
  )
    throw new NativeIdentityRefusal("identity-run-invalid");
  return path.posix.join(config.root, "runs", runId, "native-identity.json");
}

function runIdentityRecord(config, runId, binding) {
  const identity = serviceNativeIdentity(config, binding?.owner);
  if (
    !binding ||
    binding.profile !== identity.profile ||
    binding.provider !== identity.provider ||
    !digest(binding.profileDigest)
  )
    throw new NativeIdentityRefusal("identity-run-binding-invalid");
  return {
    v: 1,
    runId,
    owner: identity.owner,
    profile: identity.profile,
    provider: identity.provider,
    profileDigest: binding.profileDigest,
  };
}

export function readRunIdentity({ config, runId }) {
  const file = runIdentityPath(config, runId);
  try {
    if (
      lstatSync(path.posix.dirname(file)).isSymbolicLink() ||
      !lstatSync(file).isFile() ||
      lstatSync(file).isSymbolicLink()
    )
      throw new NativeIdentityRefusal("identity-run-binding-invalid");
    const binding = JSON.parse(readFileSync(file, "utf8"));
    const expected = runIdentityRecord(config, runId, binding);
    if (
      binding.v !== 1 ||
      binding.runId !== runId ||
      Object.keys(binding).sort().join() !== Object.keys(expected).sort().join()
    )
      throw new NativeIdentityRefusal("identity-run-binding-invalid");
    return expected;
  } catch (error) {
    throw new NativeIdentityRefusal(
      error.code === "ENOENT"
        ? "identity-run-binding-missing"
        : "identity-run-binding-invalid",
    );
  }
}

export function bindRunIdentity({ config, runId, binding }) {
  const file = runIdentityPath(config, runId);
  const expected = runIdentityRecord(config, runId, binding);
  mkdirSync(path.posix.dirname(file), { recursive: true, mode: 0o750 });
  if (lstatSync(path.posix.dirname(file)).isSymbolicLink())
    throw new NativeIdentityRefusal("identity-run-binding-invalid");
  try {
    writeFileSync(file, JSON.stringify(expected) + "\n", {
      flag: "wx",
      mode: 0o640,
    });
  } catch (error) {
    if (error.code !== "EEXIST")
      throw new NativeIdentityRefusal("identity-run-binding-unavailable");
  }
  const observed = readRunIdentity({ config, runId });
  if (JSON.stringify(observed) !== JSON.stringify(expected))
    throw new NativeIdentityRefusal("identity-run-binding-drift");
  return observed;
}

function nodeExecution({ runId, env }) {
  runIdentityPath({ root: "/" }, runId);
  let execution;
  try {
    execution = JSON.parse(env.ARCHON_NODE_EXECUTION);
  } catch {
    throw new NativeIdentityRefusal("identity-run-execution-mismatch");
  }
  if (
    env.WORKFLOW_ID !== runId ||
    execution?.runId !== runId ||
    typeof execution.path !== "string" ||
    typeof execution.invocation?.id !== "string" ||
    !execution.invocation.id ||
    typeof execution.attempt?.id !== "string" ||
    !execution.attempt.id
  )
    throw new NativeIdentityRefusal("identity-run-execution-mismatch");
  return execution;
}

// Whether `execution` is the run's first node and nothing ran before it.
// The engine's own credential preflight launches Claude before any node; the
// installed launcher refuses that unbound launch, so the pinned engine records
// the undecided check ahead of the workflow start. No other event may precede
// the node.
const PREFLIGHT_EVENTS = new Set(["credential_check_inconclusive"]);
export function isInitialNode({ events, runId, execution, step }) {
  if (!Array.isArray(events)) return false;
  const started = events.filter(
    (event) => event?.event_type === "workflow_started",
  );
  const current = events.filter(
    (event) => event?.event_type === "node_started",
  );
  const preflight = events.filter((event) =>
    PREFLIGHT_EVENTS.has(event?.event_type),
  );
  return (
    events.length === 2 + preflight.length &&
    started.length === 1 &&
    current.length === 1 &&
    events.every((event) => event?.workflow_run_id === runId) &&
    current[0].step_name === step &&
    execution?.runId === runId &&
    execution.path === step &&
    Array.isArray(execution.invocation?.loopPath) &&
    execution.invocation.loopPath.length === 0 &&
    typeof execution.invocation.id === "string" &&
    execution.invocation.id !== "" &&
    typeof execution.attempt?.id === "string" &&
    execution.attempt.id !== "" &&
    current[0].data?.invocation?.id === execution.invocation.id &&
    current[0].data?.attempt?.id === execution.attempt.id
  );
}

export async function ensureInitialRunIdentity({
  config,
  runId,
  env = process.env,
  fetchImpl = fetch,
  verifyIdentity = verifyNativeIdentity,
}) {
  const execution = nodeExecution({ runId, env });
  let binding;
  try {
    binding = readRunIdentity({ config, runId });
  } catch (error) {
    if (error.code !== "identity-run-binding-missing") throw error;
  }
  if (binding) {
    await verifyIdentity({
      config,
      owner: binding.owner,
      expectedDigest: binding.profileDigest,
      env,
    });
    return binding;
  }
  let metadata;
  try {
    if (
      !Number.isInteger(config.archon.port) ||
      config.archon.port < 1 ||
      config.archon.port > 65535
    )
      throw new Error();
    const response = await fetchImpl(
      `http://127.0.0.1:${config.archon.port}/api/workflows/runs/${runId}`,
      { redirect: "error", signal: AbortSignal.timeout(10_000) },
    );
    if (!response.ok) throw new Error();
    const text = await response.text();
    if (text.length > 1024 * 1024) throw new Error();
    metadata = JSON.parse(text);
  } catch {
    throw new NativeIdentityRefusal("identity-run-metadata-unavailable");
  }
  const initialPaths = {
    "core-select": "facts",
    "core-answer": "facts",
    "core-analyze": "collect",
    "core-probe": "identity",
  };
  if (
    metadata?.run?.id !== runId ||
    metadata.run.status !== "running" ||
    metadata.run.parent_run_id !== null ||
    metadata.run.adopted_from_run_id !== null ||
    !isInitialNode({
      events: metadata.events,
      runId,
      execution,
      step: initialPaths[metadata.run.workflow_name],
    })
  )
    throw new NativeIdentityRefusal("identity-initial-run-required");
  binding = await verifyIdentity({
    config,
    owner: config.nativeIdentity?.owner,
    env,
  });
  return bindRunIdentity({ config, runId, binding });
}

function assertLaunchArguments(args) {
  if (
    !Array.isArray(args) ||
    args.length === 0 ||
    args.some(
      (argument) => typeof argument !== "string" || /[\0\r\n]/.test(argument),
    )
  )
    throw new NativeIdentityRefusal("identity-launch-arguments-refused");
  if (JSON.stringify(args) === '["--version"]') return "version";
  if (JSON.stringify(args) === '["plugin","list","--json"]') return "plugins";
  if (
    !args[0].startsWith("-") ||
    args.includes("--version") ||
    args.some((argument) =>
      /^--(?:api-key|base-url|api-key-helper|config-dir|home|provider)(?:=|$)/.test(
        argument,
      ),
    )
  )
    throw new NativeIdentityRefusal("identity-launch-arguments-refused");
  let sources = 0;
  let settings = 0;
  for (let index = 0; index < args.length; index++) {
    const flag = args[index].split("=", 1)[0];
    if (!["--settings", "--setting-sources"].includes(flag)) continue;
    const value = args[index].includes("=")
      ? args[index].slice(flag.length + 1)
      : args[++index];
    if (flag === "--setting-sources") {
      if (++sources !== 1 || !["", "project"].includes(value))
        throw new NativeIdentityRefusal("identity-launch-settings-refused");
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new NativeIdentityRefusal("identity-launch-settings-refused");
    }
    if (
      ++settings !== 1 ||
      !object(parsed) ||
      Object.keys(parsed).sort().join() !==
        "enabledPlugins,syncClaudeAiPlugins" ||
      parsed.syncClaudeAiPlugins !== false ||
      !object(parsed.enabledPlugins) ||
      Object.values(parsed.enabledPlugins).some(
        (enabled) => typeof enabled !== "boolean",
      )
    )
      throw new NativeIdentityRefusal("identity-launch-settings-refused");
  }
  if (sources !== 1)
    throw new NativeIdentityRefusal("identity-launch-settings-refused");
  return "model";
}

export async function planNativeClaude({
  config,
  args,
  env = process.env,
  readFile = readFileSync,
  verifyIdentity = verifyNativeIdentity,
}) {
  const kind = assertLaunchArguments(args);
  const identity = serviceNativeIdentity(config);
  assertNativeEnvironment(env, identity);
  let binding;
  if (kind !== "version") {
    nodeExecution({ runId: env.WORKFLOW_ID, env });
    binding = readRunIdentity({ config, runId: env.WORKFLOW_ID });
  }
  await verifyIdentity({
    config,
    owner: binding?.owner ?? identity.owner,
    expectedDigest: binding?.profileDigest,
    env,
  });
  let executable;
  try {
    executable = JSON.parse(
      readFile(
        path.posix.join(
          config.root,
          "control",
          ".archon",
          "core-factory-release.json",
        ),
        "utf8",
      ),
    ).claudeBinary;
    if (!absolute(executable)) throw new Error();
  } catch {
    throw new NativeIdentityRefusal("identity-release-invalid");
  }
  return { executable, args: [...args], env: { ...env } };
}

export async function launchNativeClaude({
  spawnImpl = spawn,
  signals = process,
  ...options
}) {
  const launch = await planNativeClaude(options);
  return new Promise((resolve, reject) => {
    let child;
    const forwards = ["SIGINT", "SIGTERM", "SIGHUP"].map((signal) => [
      signal,
      () => child.kill(signal),
    ]);
    const finish = (error, result) => {
      for (const [signal, forward] of forwards) signals.off(signal, forward);
      if (error)
        reject(new NativeIdentityRefusal("identity-launch-unavailable"));
      else resolve(result);
    };
    try {
      child = spawnImpl(launch.executable, launch.args, {
        env: launch.env,
        stdio: "inherit",
        shell: false,
        windowsHide: true,
      });
      for (const [signal, forward] of forwards) signals.on(signal, forward);
      child.once("error", () => finish(true));
      child.once("close", (code, signal) => finish(false, { code, signal }));
    } catch {
      finish(true);
    }
  });
}

// The binaries a release binds into every profile digest.
const releaseBinaries = (release) => [
  { path: release?.claudeBinary, sha256: release?.claudeBinarySha256 },
  release?.claudeLauncher,
  release?.node,
  release?.archon,
  release?.plugins?.provider,
];
const validBinaries = (binaries) =>
  binaries.every(
    (binary) =>
      object(binary) && absolute(binary.path) && digest(binary.sha256),
  );
const profileDigestOf = (identity, accountDigest, release, binaries) =>
  hash({
    ...identity,
    accountDigest,
    policyRevision: release.policyRevision,
    settings: release.settingsDigest,
    binaries,
  });

// The profile digest the account verified now would have had under a previous
// release, from that release's own record. Equality with a retained digest
// proves the same owner, profile, provider, home and account; nothing in the
// record is trusted beyond that equality.
function predecessorDigest(identity, accountDigest, predecessor) {
  const binaries = releaseBinaries(predecessor);
  if (
    !object(predecessor) ||
    !digest(predecessor.policyRevision) ||
    !digest(predecessor.settingsDigest) ||
    !object(predecessor.nativeIdentity) ||
    ["owner", "profile", "provider", "home"].some(
      (key) => predecessor.nativeIdentity[key] !== identity[key],
    ) ||
    !validBinaries(binaries)
  )
    throw new NativeIdentityRefusal("identity-predecessor-invalid");
  // The previous release was installed under another account.
  if (predecessor.nativeIdentity.accountDigest !== accountDigest)
    throw new NativeIdentityRefusal("identity-account-drift");
  return profileDigestOf(identity, accountDigest, predecessor, binaries);
}

// With `predecessor` (the record of the release an assignment was bound
// under), `expectedDigest` is proven against that release instead of the
// installed one: the explicit policy transition. The returned digest is always
// the installed release's.
export async function verifyNativeIdentity({
  config,
  owner,
  expectedDigest,
  predecessor,
  env = process.env,
  run = runProcess,
  readFile = readFileSync,
  readManaged = managedPolicyFiles,
}) {
  const identity = serviceNativeIdentity(config, owner);
  assertNativeEnvironment(env, identity);
  if (env.ARCHON_HOME !== config.archon.home)
    throw new NativeIdentityRefusal("identity-archon-home-mismatch");
  let release;
  try {
    release = JSON.parse(
      readFile(
        path.posix.join(
          config.root,
          "control",
          ".archon",
          "core-factory-release.json",
        ),
        "utf8",
      ),
    );
  } catch {
    throw new NativeIdentityRefusal("identity-release-unavailable");
  }
  const installed = release.nativeIdentity;
  if (
    !digest(release.policyRevision) ||
    !digest(release.settingsDigest) ||
    !object(installed) ||
    !digest(installed.accountDigest)
  )
    throw new NativeIdentityRefusal("identity-release-invalid");
  if (
    ["owner", "profile", "provider", "home"].some(
      (key) => installed[key] !== identity[key],
    )
  )
    throw new NativeIdentityRefusal("identity-service-binding-drift");
  const binaries = releaseBinaries(release);
  if (
    binaries.some(
      (binary) => !binary || !absolute(binary.path) || !digest(binary.sha256),
    ) ||
    release.claudeBinary === release.claudeLauncher.path ||
    release.archon.path !== config.archon.executable ||
    release.plugins.provider.path !==
      path.posix.join(config.archon.home, "plugins", "archon-provider-claude")
  )
    throw new NativeIdentityRefusal("identity-release-invalid");
  try {
    if (
      binaries.some((binary) => hash(readFile(binary.path)) !== binary.sha256)
    )
      throw new NativeIdentityRefusal("identity-binary-drift");
  } catch {
    throw new NativeIdentityRefusal("identity-binary-drift");
  }
  try {
    if (
      release.settingsInputs?.managedPolicy?.dir !== MANAGED_POLICY_DIR ||
      release.settingsInputs?.archonHomeConfig !==
        path.posix.join(config.archon.home, "config.yaml")
    )
      throw new NativeIdentityRefusal("identity-settings-drift");
    const files = Object.fromEntries(
      ROLE_SETTING_FILES.map((name) => [
        name,
        readFile(path.posix.join(config.root, "control", name), "utf8"),
      ]),
    );
    const observed = settingsDigest(files, {
      managed: readManaged(MANAGED_POLICY_DIR),
      archonHome: readFile(release.settingsInputs.archonHomeConfig, "utf8"),
    });
    if (observed !== release.settingsDigest)
      throw new NativeIdentityRefusal("identity-settings-drift");
  } catch {
    throw new NativeIdentityRefusal("identity-settings-drift");
  }
  let status;
  try {
    status = await run([release.claudeBinary, "auth", "status", "--json"], {
      cwd: path.posix.join(config.root, "control"),
      env: cleanEnvironment({
        HOME: identity.home,
        CLAUDE_CONFIG_DIR: identity.profile,
        DISABLE_AUTOUPDATER: "1",
      }),
      timeoutMs: 30_000,
      maxOutput: 64 * 1024,
    });
  } catch {
    throw new NativeIdentityRefusal("identity-auth-unavailable");
  }
  let accountDigest;
  try {
    if (status.code !== 0)
      throw new NativeIdentityRefusal("identity-auth-invalid");
    accountDigest = nativeAccountDigest(
      JSON.parse(status.stdout),
      identity.profile,
    );
  } catch {
    throw new NativeIdentityRefusal("identity-auth-invalid");
  }
  if (accountDigest !== installed.accountDigest)
    throw new NativeIdentityRefusal("identity-account-drift");
  const profileDigest = profileDigestOf(
    identity,
    accountDigest,
    release,
    binaries,
  );
  if (predecessor !== undefined) {
    if (
      !digest(expectedDigest) ||
      expectedDigest !== predecessorDigest(identity, accountDigest, predecessor)
    )
      throw new NativeIdentityRefusal("identity-drift");
  } else if (
    expectedDigest !== undefined &&
    (!digest(expectedDigest) || expectedDigest !== profileDigest)
  )
    throw new NativeIdentityRefusal("identity-drift");
  return {
    owner: identity.owner,
    profile: identity.profile,
    provider: identity.provider,
    profileDigest,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    if (
      process.argv[2] !== "launch" ||
      process.argv[3] !== "--config" ||
      process.argv[5] !== "--"
    )
      throw new NativeIdentityRefusal("identity-launch-arguments-refused");
    const result = await launchNativeClaude({
      config: loadConfig(process.argv[4]),
      args: process.argv.slice(6),
    });
    if (result.signal) process.kill(process.pid, result.signal);
    else process.exitCode = result.code ?? 1;
  } catch (error) {
    process.stderr.write(
      (error instanceof NativeIdentityRefusal
        ? error.code
        : "identity-launch-unavailable") + "\n",
    );
    process.exitCode = 1;
  }
}
