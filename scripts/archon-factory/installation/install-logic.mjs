// Pure decisions for the factory installer (install.mjs). Everything here is
// deterministic so it can be tested without root, systemd or the VM.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { hasUnconfirmedCleanup } from "../pack/.shared/cleanup-state.mjs";
import {
  MANAGED_POLICY_DIR,
  ROLE_SETTING_FILES,
  managedPolicyFiles,
  settingsDigest,
} from "../pack/.shared/identity.mjs";
import {
  hasNativeFaultHold,
  validWorkItem,
} from "../pack/.shared/workitem.mjs";

export {
  MANAGED_POLICY_DIR,
  ROLE_SETTING_FILES,
  managedPolicyFiles,
  settingsDigest,
};

const posix = path.posix;

export const ARCHON_VERSION = "0.14.0";
export const ARCHON_COMMIT = "8def159a6b2c23e832a5283b4131cfffd9af9344";
export const PIN = {
  // Official v0.14.0 release checksums.txt (docs/ops/archon-vm100-commissioning.md).
  archon: "996d9989933bd7214645840723c48a803e781256435a0f0d22eb4fe645985bab",
  provider: "45995d33f84bc0532e8a1c80a8c00d6a1c5a4bb0cc2ae79bae53979cd5cfb8c7",
  forge: "4ab4917b3a1b746037fac17094098724f01ed35a408b4fd1f301d147eb8c2e28",
  // Observed local identity of the qualified native Claude 2.1.317.
  claude: "eb224419e344575faa4a1f39b290b649425a10cd5ee2ef1d003480cd9ae57eb0",
  // packages/adapters/src/sources/standard-webhooks/source-plugin.ts bundled
  // with `bun build --target=bun` from commit 8def159a (reproduced byte-for-byte).
  webhooks: "182b4ab528d49ea9b7aae7469c3de6a9bfdc9cf6876a22cdeee3d927a6a8e6ea",
  // Inspected image ID of the qualified check executor; a rebuilt image needs
  // requalification and a reviewed pin change, never a silent tag swap.
  checkImage:
    "sha256:2d4fe5a6aba791a8d6e9f445ba4c0849da040dbf2dd0747bf00ea117cce72597",
  // The Node binary that runs the guard hook, check MCP server and timers:
  // bin/node from node-v24.22.1-linux-x64.tar.xz, whose archive hash matched
  // nodejs.org SHASUMS256.txt (6c172a9a…95e6) on 12 November 2026.
  node: "e32e2d16081cf644f88392934288086e7662529d0d43277c34f7aad2207cfafb",
  nodeVersion: "v24.22.1",
};
// Plugins installed through the engine's own checksum-verifying installer,
// then bound to the pinned executable hash through their receipts.
export const PLUGINS = [
  {
    name: "provider",
    id: "coleam00/Archon/plugins/provider-claude",
    executable: "archon-provider-claude",
    sha256: PIN.provider,
    add: ["provider", "add", "claude"],
  },
  {
    name: "forge",
    id: "coleam00/Archon/plugins/forge-github",
    executable: "archon-forge-github",
    sha256: PIN.forge,
    add: [
      "plugin",
      "add",
      `coleam00/Archon/plugins/forge-github@v${ARCHON_VERSION}`,
    ],
  },
];

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const fileSha = (file) => sha(readFileSync(file));

// Content digest of a directory tree: relative paths and file hashes.
export function treeDigest(dir, { include = () => true } = {}) {
  const entries = [];
  const walk = (current) => {
    for (const name of readdirSync(current).sort()) {
      const full = posix.join(current, name);
      const relative = posix.relative(dir, full);
      if (!include(relative)) continue;
      if (statSync(full).isDirectory()) walk(full);
      else entries.push([relative, fileSha(full)]);
    }
  };
  walk(dir);
  return sha(JSON.stringify(entries));
}

// Identity of what is being installed: the stage's pack and installer tree,
// plus the commit the operator staged from when it is recorded.
export function stageIdentity(stage) {
  const sourceFile = posix.join(stage, "SOURCE_COMMIT");
  const sourceCommit = existsSync(sourceFile)
    ? readFileSync(sourceFile, "utf8").trim()
    : null;
  if (sourceCommit !== null && !/^[a-f0-9]{40}$/.test(sourceCommit))
    throw new Error("SOURCE_COMMIT must hold one full commit id");
  const parts = ["pack", "installation"].filter((part) =>
    existsSync(posix.join(stage, part)),
  );
  return {
    sourceCommit,
    stageDigest: treeDigest(stage, {
      include: (relative) =>
        parts.some(
          (part) => relative === part || relative.startsWith(`${part}/`),
        ),
    }),
    packDigest: treeDigest(posix.join(stage, "pack")),
  };
}

// The PreToolUse guard is the roles' only tool boundary. Claude Code treats a
// hook that exits non-zero (other than 2) or times out as non-blocking, so the
// wrapper turns a crash, a missing interpreter and its own shorter deadline
// into exit 2, which blocks the tool call.
export const GUARD_TIMEOUT = { hook: 30, guard: 25 };
export function guardHookCommand({
  node,
  guard,
  seconds = GUARD_TIMEOUT.guard,
}) {
  return `/usr/bin/timeout -k 3 ${seconds} ${node} ${guard} || { echo "Core guard unavailable; tool call blocked" >&2; exit 2; }`;
}

// The files a role session actually loads from the control folder
// (settingSources ["project"]): project settings with the guard hook, the
// project CLAUDE.md, the check MCP config and the project's Archon config.
export function controlFiles({ node, claude, runtime }) {
  return {
    ".archon/config.yaml": [
      "# Core factory project configuration (installed; do not edit by hand).",
      "assistant: claude",
      "assistants:",
      "  claude:",
      `    claudeBinaryPath: ${claude}`,
      '    settingSources: ["project"]',
      "",
    ].join("\n"),
    ".claude/settings.json":
      JSON.stringify(
        {
          hooks: {
            PreToolUse: [
              {
                matcher: "*",
                hooks: [
                  {
                    type: "command",
                    command: guardHookCommand({
                      node,
                      guard: `${runtime}/guard.mjs`,
                    }),
                    timeout: GUARD_TIMEOUT.hook,
                  },
                ],
              },
            ],
          },
          permissions: { deny: ["Bash", "WebFetch", "WebSearch", "Task"] },
        },
        null,
        2,
      ) + "\n",
    "CLAUDE.md":
      "This folder is the Core factory's trusted control folder. Work only in the absolute paths your assignment names.\n",
    "mcp/core-check.json":
      JSON.stringify(
        {
          "core-check": {
            command: node,
            args: [`${runtime}/check-mcp.mjs`],
            env: {},
          },
        },
        null,
        2,
      ) + "\n",
  };
}

// The engine's global configuration, written to ARCHON_HOME/config.yaml.
export function archonHomeConfig({ claude }) {
  return [
    "store: database",
    "defaultAssistant: claude",
    "assistants:",
    "  claude:",
    `    claudeBinaryPath: ${claude}`,
    "    model: sonnet",
    '    settingSources: ["project"]',
    "tiers:",
    "  small: { provider: claude, model: haiku }",
    "  medium: { provider: claude, model: sonnet }",
    "  large: { provider: claude, model: opus }",
    "concurrency:",
    "  maxConversations: 2",
    "",
  ].join("\n");
}

export function nativeClaudeLauncher({ node, identityModule, configFile }) {
  const quote = (value) => {
    if (
      typeof value !== "string" ||
      !posix.isAbsolute(value) ||
      posix.normalize(value) !== value ||
      /[\0\r\n]/.test(value)
    )
      throw new Error("identity-launcher-path-invalid");
    return "'" + value.replaceAll("'", "'\\''") + "'";
  };
  return `#!/bin/sh\nexec ${quote(node)} ${quote(identityModule)} launch --config ${quote(configFile)} -- "$@"\n`;
}

// The installed core-factory.json. Operator-owned values (owners, end state,
// review providers, limits) are kept from the existing file. No trigger
// bindings: every start is a signed Standard Webhooks delivery.
export const DEFAULT_CHECK_QUEUE_MS = 600_000;
export function buildFactoryConfig({
  existing = {},
  root,
  control,
  home,
  archon,
  hostId,
  port,
  image,
}) {
  return {
    version: 1,
    installation: "core-dev-vm100",
    root,
    repository: {
      slug: "Asymmetric-al/core",
      remote: "https://github.com/Asymmetric-al/core.git",
      targetBranch: "develop",
      mergeMethod: "merge",
    },
    archon: {
      home,
      executable: archon,
      hostId,
      port,
      serviceHome: "/home/admin",
    },
    git: {
      executable: "/usr/bin/git",
      authorName: "Conrad O",
      authorEmail: "79217644+cobmojo@users.noreply.github.com",
    },
    github: { executable: "/usr/bin/gh", configDir: `${root}/credentials/gh` },
    executor: { docker: "/usr/bin/docker", image },
    owners: existing.owners ?? {
      conrad: { profile: "/home/admin/.claude", githubLogin: "cobmojo" },
    },
    nativeIdentity: existing.nativeIdentity ?? {
      owner: "conrad",
      profile: "/home/admin/.claude",
      provider: "claude",
    },
    ...(existing.storage === undefined ? {} : { storage: existing.storage }),
    defaultEndState: existing.defaultEndState ?? "PR_READY",
    // Automated PR reviewers readiness waits for, e.g.
    // [{ login: "coderabbitai[bot]", required: true, skipMarkers: ["Review skipped"] }].
    reviewProviders: existing.reviewProviders ?? [],
    webhooks: {
      secretFile: `${root}/credentials/webhook.env`,
      sourcesFile: `${control}/sources.json`,
    },
    limits: {
      admittedIssues: 2,
      heavyCheckSlots: 1,
      maxRounds: 8,
      maxFeedbackRounds: 12,
      checkWaitMs: 600000,
      checkQueueMs: DEFAULT_CHECK_QUEUE_MS,
      agingIntervalMs: 86400000,
      maxAgingBonus: 10,
      ...(existing.limits ?? {}),
    },
  };
}

// The previous check server recorded a slot's owner as a bare PID. The current
// one reads a slot without an attempt id as busy, so a stale legacy slot would
// block every check: remove one whose process is gone, report a live one.
export function legacyCheckSlots(locks, { alive }) {
  const plan = { remove: [], live: [] };
  if (!existsSync(locks)) return plan;
  for (const name of readdirSync(locks).sort()) {
    if (!/^check-slot-\d+$/.test(name)) continue;
    const dir = posix.join(locks, name);
    let owner;
    try {
      owner = readFileSync(posix.join(dir, "owner"), "utf8").trim();
    } catch {
      continue;
    }
    if (!/^\d+$/.test(owner)) continue;
    const pid = Number(owner);
    if (alive(pid)) plan.live.push({ dir, pid });
    else plan.remove.push(dir);
  }
  return plan;
}

// Installed policy is the pack plus the role settings. Switching either
// under live rounds strands them, so it requires a drained factory.
export function policySwitch(previous, current) {
  if (!previous) return false;
  return (
    previous.policyRevision !== current.policyRevision ||
    previous.settingsDigest !== current.settingsDigest ||
    previous.claudeLauncher?.path !== current.claudeLauncher?.path ||
    previous.claudeLauncher?.sha256 !== current.claudeLauncher?.sha256 ||
    ["owner", "profile", "provider", "home", "accountDigest"].some(
      (key) => previous.nativeIdentity?.[key] !== current.nativeIdentity?.[key],
    )
  );
}

const parse = (stdout) => {
  try {
    return JSON.parse(stdout);
  } catch {
    return undefined;
  }
};
const SETTLED = new Set(["BLOCKED", "PR_READY", "stopped", "MERGED"]);

// Fail closed: the state listing and core/factory must both be read, intake
// must be paused, and retained execution ownership must be settled.
export function liveWorkRefusal({ listing, factory }) {
  if (listing?.status !== 0)
    return `cannot list work items (archon state list exited ${listing?.status ?? "without a status"})`;
  const documents = parse(listing.stdout)?.documents;
  if (!Array.isArray(documents))
    return "the work-item listing has no documents array";
  const items = documents.filter((doc) =>
    /^core\/issues\/\d+$/.test(doc?.name ?? ""),
  );
  if (factory?.status !== 0)
    return `cannot read core/factory (archon state get exited ${factory?.status ?? "without a status"})`;
  const parsed = parse(factory.stdout);
  if (!parsed || typeof parsed !== "object" || !("value" in parsed))
    return "core/factory could not be parsed";
  const value = parsed.value;
  if (value === null) {
    if (items.length) return "core/factory is missing while work items exist";
  } else if (value?.v !== 1 || value.intake !== "paused")
    return `intake is ${value?.intake ?? "unknown"}; pause intake or drain the factory first`;
  for (const doc of items) {
    const issue = doc.name.slice("core/issues/".length);
    if (hasUnconfirmedCleanup(doc.value))
      return `work item ${issue}: cleanup-unconfirmed; reconcile exact-run cleanup before switching policy`;
    if (hasNativeFaultHold(doc.value))
      return `work item ${issue}: native-fault-held; preserve ownership before switching policy`;
    if (doc.lease?.live === true)
      return `work item ${issue} has a live execution lease`;
    if (
      doc.lease !== null &&
      (!doc.lease ||
        typeof doc.lease !== "object" ||
        Array.isArray(doc.lease) ||
        typeof doc.lease.runId !== "string" ||
        !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(doc.lease.runId ?? "") ||
        doc.lease.live !== false)
    )
      return `work item ${issue}: lease evidence is unavailable or ambiguous; read actual lease ownership before switching policy`;
    if (!validWorkItem(doc.value))
      return `malformed work item ${issue} (${doc.value?.status ?? "unknown"}); cannot prove it is drained`;
    if (doc.value.run !== null)
      return `work item ${issue} retains an unreconciled execution run`;
    if (doc.value.status === "MERGED" && doc.value.route !== null)
      return `work item ${issue} retains an unreconciled execution route`;
  }
  // A settled assignment starts no round by itself, so it may stay: its
  // rounds refuse `policy-changed` until `issue <n> adopt-policy`. Anything
  // that can still start a round must finish or be stopped first.
  const unsettled = items.filter((doc) => !SETTLED.has(doc.value.status));
  if (unsettled.length)
    return `unsettled assignments: ${unsettled.map((doc) => `${doc.name.slice("core/issues/".length)} (${doc.value.status})`).join(", ")}; let each finish or stop it (issue <n> stop) before changing the release`;
  return null;
}

// The assignments a release change leaves on their old release, for the
// installer's notice. Empty when the listing cannot be read.
export function retainedAssignments(listing) {
  const documents =
    listing?.status === 0 ? parse(listing.stdout)?.documents : null;
  if (!Array.isArray(documents)) return [];
  return documents
    .filter(
      (doc) =>
        /^core\/issues\/\d+$/.test(doc?.name ?? "") &&
        ["BLOCKED", "PR_READY", "stopped"].includes(doc.value?.status),
    )
    .map((doc) => ({
      issue: Number(doc.name.slice("core/issues/".length)),
      status: doc.value.status,
    }));
}

// A plugin directory is accepted only when its receipt binds exactly the
// pinned executable.
export function pluginReceiptProblem(receipt, { id, executable, sha256 }) {
  if (!receipt || typeof receipt !== "object")
    return "receipt is missing or unreadable";
  if (receipt.id !== id)
    return `receipt names ${receipt.id ?? "no id"}, expected ${id}`;
  if (receipt.manifest?.executable !== executable)
    return `receipt executable is ${receipt.manifest?.executable ?? "missing"}`;
  const files = Array.isArray(receipt.files) ? receipt.files : [];
  if (
    files.length !== 1 ||
    files[0]?.path !== executable ||
    files[0]?.sha256 !== sha256
  )
    return `receipt files do not bind ${executable} to the pinned checksum`;
  return "";
}

// Where a plugin lives in an ARCHON_HOME: its executable and its receipt.
export function pluginPaths(home, { id, executable }) {
  const receiptDir = posix.join(home, "plugins", "installed", id);
  return {
    binary: posix.join(home, "plugins", executable),
    receiptDir,
    receipt: posix.join(receiptDir, "receipt.json"),
  };
}

export function readPlugin(home, plugin) {
  const paths = pluginPaths(home, plugin);
  let receipt = null;
  try {
    receipt = JSON.parse(readFileSync(paths.receipt, "utf8"));
  } catch {}
  return {
    sha256: existsSync(paths.binary) ? fileSha(paths.binary) : null,
    receipt,
  };
}

// A plugin is accepted only as the pinned executable bound by its receipt.
export function pluginProblem({ sha256, receipt }, plugin) {
  if (!sha256) return "the executable is missing";
  if (sha256 !== plugin.sha256)
    return `the executable does not match the pinned checksum ${plugin.sha256}`;
  const problem = pluginReceiptProblem(receipt, plugin);
  return problem ? `receipt: ${problem}` : "";
}

// Where a pinned file is taken from: the path the operator gave, otherwise
// the first candidate whose bytes match the pin (the build copy of the first
// install, then the installed copy an update still has). With no match the
// first candidate is returned, and the caller's own pin check refuses it.
export function pinnedSource({ given, candidates, pin, sha = fileSha }) {
  if (given) return given;
  const matches = (file) => {
    try {
      return sha(file) === pin;
    } catch {
      return false;
    }
  };
  return candidates.find(matches) ?? candidates[0];
}

// A binary pinned by constant when known, otherwise by the hash the previous
// release recorded (the first install records it).
export function pinnedIdentity({ actual, pin, previous }) {
  if (pin)
    return actual === pin
      ? { ok: true, source: "pin" }
      : {
          ok: false,
          problem: `sha256 ${actual} does not match the pinned ${pin}`,
        };
  if (previous)
    return actual === previous
      ? { ok: true, source: "previous-release" }
      : {
          ok: false,
          problem: `sha256 ${actual} differs from the previously installed ${previous}`,
        };
  return { ok: true, source: "recorded" };
}

// Engine artifacts the launcher downloads and verifies against the checksums
// embedded in the pinned binary. An existing copy must match a fresh verified
// download; a missing one is installed from it.
export function enginePieceAction({ verified, installed }) {
  if (!verified)
    return { action: "refuse", problem: "the verified download is missing" };
  if (installed === null) return { action: "install" };
  return installed === verified
    ? { action: "keep" }
    : {
        action: "refuse",
        problem:
          "the installed copy differs from the launcher-verified release asset",
      };
}

// Post-install diagnostics. Advisory checks (doctor, engine health while the
// operator may have the engine stopped) are recorded but do not fail the run.
export function diagnosticsSummary(checks) {
  return {
    ok: checks
      .filter((check) => check.required !== false)
      .every((check) => check.ok),
    checks: checks.map(({ name, ok, required = true, status, output }) => ({
      name,
      ok,
      required,
      status,
      output: String(output ?? "").slice(-2000),
    })),
  };
}

// The engine's signed webhook sources (control/sources.json). The engine runs
// one run at a time among runs that share a resource and a folder, whatever
// the resource's capacity, so delivery gets one single-run resource per lane.
// A resource's capacity cannot change once it has been used, which is why the
// lanes use names of their own instead of the earlier shared resource.
export function webhookSources({
  plugin,
  hostId,
  runAsUserId,
  control,
  lanes,
}) {
  const source = (
    bindingId,
    workflowName,
    resource,
    capacity,
    overlap,
    mapped,
  ) => ({
    sourceInstanceId: `core-factory-${bindingId}`,
    module: plugin,
    config: {
      version: 1,
      signingSecretEnv: "CORE_FACTORY_SIGNING_SECRET",
      bindings: [
        {
          bindingId,
          hostId,
          runAsUserId,
          resource,
          capacity,
          overlap,
          inputMapping: Object.fromEntries(
            mapped.map((name) => [name, `/${name}`]),
          ),
          launch: {
            cwd: control,
            workflowName,
            inputs: {},
            isolation: { kind: "in-place" },
          },
        },
      ],
    },
  });
  const count = Number.isSafeInteger(lanes) && lanes > 0 ? lanes : 1;
  return [
    source("select", "core-select", "core-factory:admission", 1, "skip", []),
    ...Array.from({ length: count }, (_, index) =>
      source(
        `deliver-${index + 1}`,
        "core-deliver",
        `core-factory:delivery-${index + 1}`,
        1,
        "queue",
        ["issue", "assignment"],
      ),
    ),
    source("answer", "core-answer", "core-factory:chat", 1, "queue", [
      "question",
      "conversation",
      "request",
    ]),
    source("analyze", "core-analyze", "core-factory:analysis", 1, "skip", [
      "trigger",
      "scope",
      "request",
    ]),
    source("probe", "core-probe", "core-factory:probe", 1, "queue", ["mode"]),
  ];
}

export function systemdUnits({
  archon,
  node,
  port,
  hostId,
  root,
  control,
  runtime,
  backupScript,
  environment,
}) {
  const env = environment.map((pair) => `Environment=${pair}`).join("\n");
  return {
    "core-archon.service": `[Unit]
Description=Core factory Archon engine (one installation, trigger host ${hostId})
After=network-online.target docker.service
Wants=network-online.target
StartLimitIntervalSec=600
StartLimitBurst=5

[Service]
Type=exec
User=admin
Group=admin
WorkingDirectory=${control}
${env}
UnsetEnvironment=CLAUDE_BIN_PATH ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL ANTHROPIC_CUSTOM_HEADERS CLAUDE_API_KEY CLAUDE_CODE_API_KEY CLAUDE_CODE_OAUTH_TOKEN CLAUDE_CODE_API_KEY_HELPER_FD CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST CLAUDE_CODE_USE_BEDROCK CLAUDE_CODE_USE_VERTEX CLAUDE_CODE_USE_FOUNDRY IS_SANDBOX NODE_OPTIONS BUN_OPTIONS XDG_CONFIG_HOME
EnvironmentFile=${root}/credentials/webhook.env
ExecStart=${archon} serve --port ${port}
Restart=on-failure
RestartSec=10
TimeoutStopSec=90
KillMode=mixed
UMask=0027

[Install]
WantedBy=multi-user.target
`,
    // No dependency on the engine (Requires= would restart an engine the
    // operator stopped): the pass is skipped, not failed, while it is down.
    "core-factory-intake.service": `[Unit]
Description=Core factory admission pass (signed server-owned start of core-select)
After=core-archon.service

[Service]
Type=oneshot
User=admin
Group=admin
WorkingDirectory=${control}
${env}
ExecCondition=/usr/bin/systemctl is-active --quiet core-archon.service
ExecStartPre=-${node} ${runtime}/orphans.mjs reap
ExecStart=${node} ${runtime}/webhook.mjs fire select --delivery-id tick
TimeoutStartSec=120
`,
    "core-factory-intake.timer": `[Unit]
Description=Periodic Core factory admission and sweep

[Timer]
OnBootSec=5min
OnUnitActiveSec=10min
RandomizedDelaySec=30
Persistent=false

[Install]
WantedBy=timers.target
`,
    "core-factory-backup.service": `[Unit]
Description=Core factory coherent backup

[Service]
Type=oneshot
User=admin
Group=admin
WorkingDirectory=${root}
${env}
ExecStart=${node} ${backupScript}
TimeoutStartSec=3600
`,
    "core-factory-backup.timer": `[Unit]
Description=Daily Core factory backup

[Timer]
OnCalendar=*-*-* 03:30:00
RandomizedDelaySec=15min
Persistent=true

[Install]
WantedBy=timers.target
`,
  };
}
