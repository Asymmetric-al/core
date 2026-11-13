#!/usr/bin/env node
// Installs or upgrades the Core factory on VM 100. Run as root:
//   node install.mjs --stage <dir with pack/ and installation/> [--archon <launcher>] [--plugin <webhook plugin>]
// Idempotent. Every piece is verified before anything changes (everything up
// to the Layout section touches only a temporary home): pinned binary hashes,
// the qualified check image, the engine server and web UI against the
// checksums embedded in the pinned launcher, the provider and forge plugins
// (added into the temporary home by that launcher) against their pins and
// receipts, the settings inputs, the configuration to install (by the staged
// pack's own validator) and the check slots. A policy switch (pack or any
// settings input) is refused unless intake is paused and no work item is live.
// Steps after the layout that need the installed pack (folder registration,
// the run-as identity, initial state) can still fail; the release record is
// written last, so it then still names the previous release and the install
// must be re-run before intake resumes.
import { createHash, randomBytes } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  chmodSync,
  chownSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  ARCHON_COMMIT,
  ARCHON_VERSION,
  MANAGED_POLICY_DIR,
  PIN,
  PLUGINS,
  ROLE_SETTING_FILES,
  archonHomeConfig,
  buildFactoryConfig,
  controlFiles,
  diagnosticsSummary,
  enginePieceAction,
  fileSha,
  legacyCheckSlots,
  liveWorkRefusal,
  managedPolicyFiles,
  nativeClaudeLauncher,
  pinnedIdentity,
  pinnedSource,
  pluginPaths,
  pluginProblem,
  policySwitch,
  retainedAssignments,
  readPlugin,
  settingsDigest,
  stageIdentity,
  systemdUnits,
  webhookSources,
  treeDigest,
} from "./install-logic.mjs";
import {
  nativeAccountDigest,
  serviceNativeIdentity,
} from "../pack/.shared/identity.mjs";

const posix = path.posix;
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce(
      (pairs, value, index, all) =>
        value.startsWith("--")
          ? [
              ...pairs,
              [
                value.slice(2),
                all[index + 1]?.startsWith("--") || all[index + 1] === undefined
                  ? true
                  : all[index + 1],
              ],
            ]
          : pairs,
      [],
    ),
);
const ROOT = "/srv/core-factory";
const HOME = `${ROOT}/archon`;
const CONTROL = `${ROOT}/control`;
const OPT = "/opt/core-archon-factory";
const ARCHON = `/opt/archon/${ARCHON_VERSION}/archon`;
const PLUGIN = `${OPT}/plugins/standard-webhooks.mjs`;
const NODE = "/opt/node-v24.22.1-linux-x64/bin/node";
const BUN_DIR = "/opt/bun-1.4.3";
const CLAUDE = "/home/admin/.local/share/claude/versions/2.1.317";
const PORT = 39190;
const HOST_ID = "core-dev";
const USER_ID = "core-factory";
const IMAGE_TAG = "core-archon-checks:node24.22.1-bun1.4.3-jq";

const log = (message) => console.log(`[install] ${message}`);
const fail = (message) => {
  console.error(`[install] REFUSED: ${message}`);
  process.exit(1);
};
const run = (command, argv, options = {}) =>
  execFileSync(command, argv, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
const asAdmin = (
  argv,
  { env = {}, home = HOME, cwd = CONTROL, input, timeout, maxBuffer } = {},
) =>
  spawnSync(
    "/usr/sbin/runuser",
    [
      "-u",
      "admin",
      "--",
      "/usr/bin/env",
      "-i",
      `HOME=/home/admin`,
      `PATH=${BUN_DIR}:${posix.dirname(NODE)}:/usr/local/bin:/usr/bin:/bin`,
      `ARCHON_HOME=${home}`,
      `ARCHON_USER_ID=${USER_ID}`,
      "ARCHON_TELEMETRY_DISABLED=1",
      ...Object.entries(env).map(([key, value]) => `${key}=${value}`),
      ...argv,
    ],
    { encoding: "utf8", cwd, input, timeout, maxBuffer },
  );
const tail = (result, size = 600) =>
  `${result.stdout ?? ""}${result.stderr ?? ""}`.slice(-size);
const own = (target, user, group, mode) => {
  chownSync(target, user, group);
  chmodSync(target, mode);
};
const ADMIN = 1000;
const ROOT_ID = 0;
const ADMIN_GID = Number(
  execFileSync("/usr/bin/id", ["-g", "admin"], { encoding: "utf8" }).trim(),
);

// --- Preflight: the actual target and pinned identities ----------------------
if (process.getuid() !== 0) fail("run as root");
if (run("/usr/bin/hostname").trim() !== "core-dev")
  fail("this is not core-dev");
if (run("/usr/bin/id", ["-u", "admin"]).trim() !== "1000")
  fail("admin is not uid 1000");
const stage = args.stage;
if (!stage || !existsSync(posix.join(stage, "pack", "archon-plugin.json")))
  fail("--stage must contain pack/");
const sourceArchon = pinnedSource({
  given: args.archon,
  candidates: [
    "/home/admin/.local/share/core-archon-stage-20261110/bin/archon",
    ARCHON,
  ],
  pin: PIN.archon,
});
if (fileSha(sourceArchon) !== PIN.archon)
  fail(`Archon binary does not match the pinned v${ARCHON_VERSION} checksum`);
if (fileSha(CLAUDE) !== PIN.claude)
  fail("native Claude binary does not match the qualified 2.1.317 identity");
const imageId = String(
  spawnSync(
    "/usr/bin/docker",
    ["image", "inspect", "--format", "{{.Id}}", IMAGE_TAG],
    { encoding: "utf8" },
  ).stdout ?? "",
).trim();
if (imageId !== PIN.checkImage)
  fail(
    `check image ${IMAGE_TAG} is ${imageId || "missing"}, not the qualified ${PIN.checkImage}`,
  );
const pluginSource = pinnedSource({
  given: args.plugin,
  candidates: [
    "/home/admin/core-factory-stage/archon-plugin-build/standard-webhooks.mjs",
    PLUGIN,
  ],
  pin: PIN.webhooks,
});
if (fileSha(pluginSource) !== PIN.webhooks)
  fail("Standard Webhooks source plugin does not match its pinned build");
if (!existsSync("/usr/bin/timeout"))
  fail("/usr/bin/timeout is required by the guard hook wrapper");

const releaseFile = posix.join(CONTROL, ".archon", "core-factory-release.json");
let previous = null;
if (existsSync(releaseFile)) {
  try {
    previous = JSON.parse(readFileSync(releaseFile, "utf8"));
  } catch {
    fail(`the installed release record ${releaseFile} is unreadable`);
  }
}
const nodeVersion = run(NODE, ["--version"]).trim();
if (nodeVersion !== PIN.nodeVersion)
  fail(`${NODE} is ${nodeVersion}, not ${PIN.nodeVersion}`);
const nodeSha = fileSha(NODE);
const nodeIdentity = pinnedIdentity({
  actual: nodeSha,
  pin: PIN.node,
  previous: previous?.node?.sha256,
});
if (!nodeIdentity.ok) fail(`Node ${NODE}: ${nodeIdentity.problem}`);

// --- Pack release identity and installed policy -------------------------------
const packSource = posix.join(stage, "pack");
let identity;
try {
  identity = stageIdentity(stage);
} catch (error) {
  fail(`stage ${stage}: ${error.message}`);
}
const policyRevision = identity.packDigest;
const release = `${OPT}/releases/${policyRevision.slice(0, 16)}`;
const configFile = posix.join(CONTROL, "core-factory.json");
const claudeLauncher = posix.join(release, "bin", "native-claude");
const launcherText = nativeClaudeLauncher({
  node: NODE,
  identityModule: posix.join(release, "pack", ".shared", "identity.mjs"),
  configFile,
});
const launcherIdentity = {
  path: claudeLauncher,
  sha256: createHash("sha256").update(launcherText).digest("hex"),
};
const runtime = posix.join(
  CONTROL,
  ".archon",
  "workflows",
  "core-factory",
  ".shared",
);
const roleFiles = controlFiles({ node: NODE, claude: claudeLauncher, runtime });
const archonHomeText = archonHomeConfig({ claude: claudeLauncher });
let managed;
try {
  managed = managedPolicyFiles();
} catch (error) {
  fail(
    `cannot read the managed Claude Code policy in ${MANAGED_POLICY_DIR}: ${error.message}`,
  );
}
const roleSettingsDigest = settingsDigest(roleFiles, {
  managed,
  archonHome: archonHomeText,
});
const managedNames = Object.keys(managed).sort();
log(
  `pack policy revision ${policyRevision}; role settings ${roleSettingsDigest}${managedNames.length ? ` (managed policy: ${managedNames.join(", ")})` : ""}${identity.sourceCommit ? `; source ${identity.sourceCommit}` : ""}`,
);

let factoryConfig;
let nativeIdentity;
try {
  const existing = existsSync(configFile)
    ? JSON.parse(readFileSync(configFile, "utf8"))
    : {};
  factoryConfig = buildFactoryConfig({
    existing,
    root: ROOT,
    control: CONTROL,
    home: HOME,
    archon: ARCHON,
    hostId: HOST_ID,
    port: PORT,
    image: imageId,
  });
  const { validateConfig } = await import(
    pathToFileURL(posix.join(packSource, ".shared", "config.mjs")).href
  );
  validateConfig(factoryConfig);
  const serviceIdentity = serviceNativeIdentity(factoryConfig);
  const status = asAdmin([CLAUDE, "auth", "status", "--json"], {
    cwd: serviceIdentity.home,
    env: {
      HOME: serviceIdentity.home,
      CLAUDE_CONFIG_DIR: serviceIdentity.profile,
      DISABLE_AUTOUPDATER: "1",
    },
    timeout: 30_000,
    maxBuffer: 64 * 1024,
  });
  if (status.status !== 0) fail("identity-auth-unavailable");
  nativeIdentity = {
    ...serviceIdentity,
    accountDigest: nativeAccountDigest(
      JSON.parse(status.stdout),
      serviceIdentity.profile,
    ),
  };
} catch {
  fail("the native service identity or factory configuration is invalid");
}

// --- Refuse a policy switch while delivery work is live -----------------------
if (
  policySwitch(previous, {
    policyRevision,
    settingsDigest: roleSettingsDigest,
    nativeIdentity,
    claudeLauncher: launcherIdentity,
  })
) {
  // Read through the launcher verified above, not the not-yet-checked install.
  const listing = asAdmin([
    sourceArchon,
    "state",
    "list",
    "--prefix",
    "core/issues/",
    "--values",
    "--project",
    "_folder/control",
  ]);
  const factory = asAdmin([
    sourceArchon,
    "state",
    "get",
    "core/factory",
    "--project",
    "_folder/control",
  ]);
  const refusal = liveWorkRefusal({ listing, factory });
  if (refusal) fail(`installed policy would change: ${refusal}`);
  for (const { issue, status } of retainedAssignments(listing))
    log(
      `issue ${issue} (${status}) stays on the previous release until: control.mjs issue ${issue} adopt-policy`,
    );
}

// --- Engine server and web UI, verified by the pinned launcher -----------------
// `serve --download-only` into an empty home downloads both release assets and
// checks them against the checksums embedded in the launcher (whose own hash is
// pinned). An existing copy in ARCHON_HOME must match that verified download.
const verifyHome = mkdtempSync("/tmp/core-archon-verify-");
process.on("exit", () => rmSync(verifyHome, { recursive: true, force: true }));
own(verifyHome, ADMIN, ADMIN_GID, 0o700);
const download = asAdmin([sourceArchon, "serve", "--download-only"], {
  home: verifyHome,
  cwd: verifyHome,
});
if (download.status !== 0)
  fail(
    `launcher-verified download of the engine server and web UI failed: ${tail(download)}`,
  );
const enginePieces = [
  `server/${ARCHON_VERSION}`,
  `web-dist/${ARCHON_VERSION}`,
].map((piece) => {
  const fresh = posix.join(verifyHome, piece);
  const target = posix.join(HOME, piece);
  const verified = existsSync(fresh) ? treeDigest(fresh) : "";
  const decision = enginePieceAction({
    verified,
    installed: existsSync(target) ? treeDigest(target) : null,
  });
  if (decision.action === "refuse") fail(`${target}: ${decision.problem}`);
  return { piece, fresh, target, verified, action: decision.action };
});

// --- Provider and forge plugins ------------------------------------------------
// One already in ARCHON_HOME must be the pinned executable bound by its
// receipt. A missing one is added into the temporary home by the verified
// launcher (the engine's own checksum-verifying installer), checked there, and
// copied in only after the layout.
const pluginPlan = PLUGINS.map((plugin) => {
  if (existsSync(pluginPaths(HOME, plugin).binary)) {
    const problem = pluginProblem(readPlugin(HOME, plugin), plugin);
    if (problem) fail(`installed ${plugin.name} plugin: ${problem}`);
    return { plugin, action: "keep" };
  }
  const added = asAdmin([sourceArchon, ...plugin.add], {
    home: verifyHome,
    cwd: verifyHome,
  });
  if (added.status !== 0)
    fail(`could not add the ${plugin.name} plugin: ${tail(added)}`);
  const problem = pluginProblem(readPlugin(verifyHome, plugin), plugin);
  if (problem) fail(`the added ${plugin.name} plugin: ${problem}`);
  return { plugin, action: "install" };
});

// --- Check slots ---------------------------------------------------------------
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
};
const legacySlots = legacyCheckSlots(posix.join(ROOT, "locks"), { alive });
if (legacySlots.live.length)
  fail(
    `old-format check slots are held by running processes (${legacySlots.live.map((slot) => `${slot.dir}: pid ${slot.pid}`).join(", ")}); let those checks finish or stop them first`,
  );

// --- Layout --------------------------------------------------------------------
for (const dir of [
  "/opt/archon",
  `/opt/archon/${ARCHON_VERSION}`,
  OPT,
  `${OPT}/releases`,
]) {
  mkdirSync(dir, { recursive: true });
  own(dir, ROOT_ID, ROOT_ID, 0o755);
}
// The running engine executes this file: replace it only when it differs, by
// rename (never in place), and re-check the result.
if (!existsSync(ARCHON) || fileSha(ARCHON) !== PIN.archon) {
  const staged = `${ARCHON}.partial`;
  copyFileSync(sourceArchon, staged);
  if (fileSha(staged) !== PIN.archon)
    fail("the copied Archon binary does not match the pinned checksum");
  renameSync(staged, ARCHON);
  if (fileSha(ARCHON) !== PIN.archon)
    fail("the installed Archon binary does not match the pinned checksum");
}
own(ARCHON, ROOT_ID, ROOT_ID, 0o755);
rmSync(release, { recursive: true, force: true });
cpSync(packSource, posix.join(release, "pack"), { recursive: true });
writeFileSync(
  posix.join(release, "SOURCE.json"),
  JSON.stringify(
    {
      sourceCommit: identity.sourceCommit,
      stageDigest: identity.stageDigest,
      packDigest: policyRevision,
      installedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
if (treeDigest(posix.join(release, "pack")) !== policyRevision)
  fail("the copied pack release does not match the staged pack");
const lockDown = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = posix.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      own(full, ROOT_ID, ROOT_ID, 0o755);
      lockDown(full);
    } else own(full, ROOT_ID, ROOT_ID, 0o644);
  }
};
own(release, ROOT_ID, ROOT_ID, 0o755);
lockDown(release);
mkdirSync(posix.dirname(claudeLauncher), { recursive: true });
own(posix.dirname(claudeLauncher), ROOT_ID, ROOT_ID, 0o755);
writeFileSync(claudeLauncher, launcherText);
own(claudeLauncher, ROOT_ID, ROOT_ID, 0o755);
if (fileSha(claudeLauncher) !== launcherIdentity.sha256)
  fail("the installed native launcher does not match its verified bytes");

mkdirSync(`${OPT}/plugins`, { recursive: true });
own(`${OPT}/plugins`, ROOT_ID, ROOT_ID, 0o755);
if (pluginSource !== PLUGIN) copyFileSync(pluginSource, PLUGIN);
own(PLUGIN, ROOT_ID, ROOT_ID, 0o644);
if (fileSha(PLUGIN) !== PIN.webhooks)
  fail(
    "the installed Standard Webhooks plugin does not match its pinned build",
  );

mkdirSync(ROOT, { recursive: true });
own(ROOT, ADMIN, ADMIN_GID, 0o750);
for (const dir of [
  "archon",
  "mirror.git",
  "issues",
  "views",
  "runs",
  "cache",
  "cache/bun",
  "locks",
  "credentials",
  "credentials/gh",
  "backups",
  "logs",
]) {
  const full = posix.join(ROOT, dir);
  mkdirSync(full, { recursive: true });
  own(
    full,
    ADMIN,
    ADMIN_GID,
    dir.startsWith("credentials") || dir === "archon" || dir === "backups"
      ? 0o700
      : 0o750,
  );
}
for (const dir of legacySlots.remove)
  rmSync(dir, { recursive: true, force: true });

// --- Trusted control folder (root-owned, admin-readable) ---------------------
mkdirSync(CONTROL, { recursive: true });
own(CONTROL, ROOT_ID, ADMIN_GID, 0o750);
for (const dir of [".archon", ".archon/workflows", ".claude", "mcp"]) {
  const full = posix.join(CONTROL, dir);
  mkdirSync(full, { recursive: true });
  own(full, ROOT_ID, ADMIN_GID, 0o750);
}
// CLI trigger bindings are no longer written: every start is a signed
// Standard Webhooks delivery to the engine's own source (sources.json).
rmSync(posix.join(CONTROL, "bindings"), { recursive: true, force: true });
const installedPack = posix.join(
  CONTROL,
  ".archon",
  "workflows",
  "core-factory",
);
rmSync(installedPack, { recursive: true, force: true });
cpSync(posix.join(release, "pack"), installedPack, { recursive: true });
const lockControl = (dir) => {
  own(dir, ROOT_ID, ADMIN_GID, 0o750);
  for (const name of readdirSync(dir)) {
    const full = posix.join(dir, name);
    if (statSync(full).isDirectory()) lockControl(full);
    else own(full, ROOT_ID, ADMIN_GID, 0o640);
  }
};
lockControl(installedPack);
const writeControl = (relative, content) => {
  const full = posix.join(CONTROL, relative);
  writeFileSync(full, content);
  own(full, ROOT_ID, ADMIN_GID, 0o640);
};
for (const [relative, content] of Object.entries(roleFiles))
  writeControl(relative, content);
writeControl(
  "core-factory.json",
  JSON.stringify(factoryConfig, null, 2) + "\n",
);

// --- ARCHON_HOME from verified pieces ------------------------------------------
for (const piece of enginePieces)
  if (piece.action === "install") {
    mkdirSync(posix.dirname(piece.target), { recursive: true });
    cpSync(piece.fresh, piece.target, { recursive: true });
    if (treeDigest(piece.target) !== piece.verified)
      fail(
        `${piece.target} does not match the verified download after copying`,
      );
  }
writeFileSync(posix.join(HOME, "config.yaml"), archonHomeText);
for (const { plugin, action } of pluginPlan) {
  if (action !== "install") continue;
  const from = pluginPaths(verifyHome, plugin);
  const to = pluginPaths(HOME, plugin);
  mkdirSync(posix.dirname(to.binary), { recursive: true });
  rmSync(to.receiptDir, { recursive: true, force: true });
  mkdirSync(posix.dirname(to.receiptDir), { recursive: true });
  cpSync(from.receiptDir, to.receiptDir, { recursive: true });
  copyFileSync(from.binary, to.binary);
  chmodSync(to.binary, 0o755);
  const problem = pluginProblem(readPlugin(HOME, plugin), plugin);
  if (problem) fail(`the ${plugin.name} plugin after copying: ${problem}`);
}
run("/usr/bin/chown", ["-R", "admin:admin", HOME]);
chmodSync(HOME, 0o700);
// Re-read every settings input as installed.
const installedSettings = Object.fromEntries(
  ROLE_SETTING_FILES.map((name) => [
    name,
    readFileSync(posix.join(CONTROL, name), "utf8"),
  ]),
);
if (
  settingsDigest(installedSettings, {
    managed: managedPolicyFiles(),
    archonHome: readFileSync(posix.join(HOME, "config.yaml"), "utf8"),
  }) !== roleSettingsDigest
)
  fail("the installed settings do not match what was verified");

// --- Register the control folder and read the run-as identity ----------------
const probe = asAdmin([ARCHON, "project", "list", "--json"]);
const registered = (JSON.parse(probe.stdout || "{}").projects ?? []).some(
  (project) => project.default_cwd === CONTROL,
);
if (!registered) {
  // Registering a folder project happens on its first run; the identity probe
  // makes no model request.
  const reg = asAdmin(
    [ARCHON, "workflow", "run", "core-probe", "--folder", "--cwd", CONTROL],
    { env: { CORE_FACTORY_CONFIG: `${CONTROL}/core-factory.json` } },
  );
  if (reg.status !== 0) fail(`folder registration probe failed: ${tail(reg)}`);
}
const whoami = asAdmin([ARCHON, "trigger", "whoami", "--json"]);
let runAsUserId;
try {
  runAsUserId = JSON.parse(whoami.stdout).runAsUserId;
} catch {
  fail(`trigger whoami failed: ${String(whoami.stderr).slice(-400)}`);
}

// Server-owned starts: one Standard Webhooks source per factory workflow. The
// engine commits each signed receipt and starts the run under its own host.
const secretFile = `${ROOT}/credentials/webhook.env`;
if (!existsSync(secretFile))
  writeFileSync(
    secretFile,
    `CORE_FACTORY_SIGNING_SECRET=whsec_${randomBytes(32).toString("base64")}\n`,
    { mode: 0o600 },
  );
own(secretFile, ADMIN, ADMIN_GID, 0o600);
writeControl(
  "sources.json",
  JSON.stringify(
    {
      version: 1,
      sources: webhookSources({
        plugin: PLUGIN,
        hostId: HOST_ID,
        runAsUserId,
        control: CONTROL,
        lanes: factoryConfig.limits.admittedIssues,
      }),
    },
    null,
    2,
  ) + "\n",
);
// --- Initial state: intake paused until an operator authorizes scope ----------
const factoryDoc = asAdmin([
  ARCHON,
  "state",
  "get",
  "core/factory",
  "--project",
  "_folder/control",
]);
if (factoryDoc.status === 0 && JSON.parse(factoryDoc.stdout).value === null) {
  const now = new Date().toISOString();
  const value = {
    v: 1,
    intake: "paused",
    mode: "run",
    mergeHold: false,
    reason: "Installed; no scope admitted yet.",
    updatedAt: now,
    updatedBy: "installer",
    requests: [],
  };
  const put = asAdmin(
    [
      ARCHON,
      "state",
      "put",
      "core/factory",
      "--if-revision",
      "0",
      "--project",
      "_folder/control",
    ],
    { input: JSON.stringify(value) },
  );
  if (put.status !== 0)
    fail(
      `could not initialize core/factory: ${String(put.stderr).slice(-300)}`,
    );
}

// --- Release record: written only after every piece was verified -------------
function hostVersions() {
  const first = (command, argv) => {
    const result = spawnSync(command, argv, { encoding: "utf8" });
    return result.status === 0
      ? String(result.stdout).trim().split("\n")[0].slice(0, 200)
      : null;
  };
  const osRelease = existsSync("/etc/os-release")
    ? (/^PRETTY_NAME="?([^"\n]*)"?$/m.exec(
        readFileSync("/etc/os-release", "utf8"),
      )?.[1] ?? null)
    : null;
  return {
    os: osRelease,
    kernel: first("/usr/bin/uname", ["-r"]),
    docker: first("/usr/bin/docker", ["--version"]),
    gh: first("/usr/bin/gh", ["--version"]),
    git: first("/usr/bin/git", ["--version"]),
    bun: first(`${BUN_DIR}/bun`, ["--version"]),
  };
}
const releaseRecord =
  JSON.stringify(
    {
      policyRevision,
      sourceCommit: identity.sourceCommit,
      stageDigest: identity.stageDigest,
      release,
      installedAt: new Date().toISOString(),
      archon: {
        path: ARCHON,
        sha256: PIN.archon,
        version: ARCHON_VERSION,
        commit: ARCHON_COMMIT,
        server: enginePieces[0].verified,
        webDist: enginePieces[1].verified,
      },
      plugins: Object.fromEntries(
        PLUGINS.map((plugin) => [
          plugin.name,
          {
            id: plugin.id,
            path: pluginPaths(HOME, plugin).binary,
            sha256: plugin.sha256,
          },
        ]),
      ),
      webhooksPlugin: PIN.webhooks,
      claudeBinary: CLAUDE,
      claudeBinarySha256: PIN.claude,
      claudeLauncher: { path: claudeLauncher, sha256: fileSha(claudeLauncher) },
      nativeIdentity,
      settingsDigest: roleSettingsDigest,
      settingsFiles: ROLE_SETTING_FILES,
      settingsInputs: {
        managedPolicy: { dir: MANAGED_POLICY_DIR, files: managedNames },
        archonHomeConfig: posix.join(HOME, "config.yaml"),
      },
      node: {
        path: NODE,
        version: nodeVersion,
        sha256: nodeSha,
        verifiedBy: nodeIdentity.source,
      },
      checkImage: imageId,
      host: hostVersions(),
    },
    null,
    2,
  ) + "\n";
writeControl(".archon/core-factory-release.json", releaseRecord);
// The same record stays beside the release's own files: `adopt-policy` proves
// a retained assignment's identity against the release it was bound under.
writeFileSync(posix.join(release, "release.json"), releaseRecord);
own(posix.join(release, "release.json"), ROOT_ID, ADMIN_GID, 0o640);

// --- systemd units ---------------------------------------------------------------
const units = systemdUnits({
  archon: ARCHON,
  node: NODE,
  port: PORT,
  hostId: HOST_ID,
  root: ROOT,
  control: CONTROL,
  runtime,
  backupScript: `${release}/pack/.shared/backup.mjs`,
  environment: [
    `HOME=${nativeIdentity.home}`,
    `PATH=${BUN_DIR}:${posix.dirname(NODE)}:/usr/local/bin:/usr/bin:/bin`,
    `ARCHON_HOME=${HOME}`,
    `ARCHON_USER_ID=${USER_ID}`,
    `ARCHON_TRIGGER_HOST=${HOST_ID}`,
    "ARCHON_TELEMETRY_DISABLED=1",
    "HOST=127.0.0.1",
    `CLAUDE_CONFIG_DIR=${nativeIdentity.profile}`,
    "DISABLE_AUTOUPDATER=1",
    "TITLE_GENERATION_MODEL=haiku",
    `CORE_FACTORY_CONFIG=${CONTROL}/core-factory.json`,
    `ARCHON_WEBHOOK_SOURCES=${CONTROL}/sources.json`,
  ],
});
for (const [name, text] of Object.entries(units)) {
  writeFileSync(`/etc/systemd/system/${name}`, text);
  own(`/etc/systemd/system/${name}`, ROOT_ID, ROOT_ID, 0o644);
}
run("/usr/bin/systemctl", ["daemon-reload"]);
// Boot persistence only: nothing is started here, so an engine the operator
// stopped for this update stays stopped until they start it.
run("/usr/bin/systemctl", [
  "enable",
  "core-archon.service",
  "core-factory-intake.timer",
  "core-factory-backup.timer",
]);

// --- Post-install diagnostics ----------------------------------------------------
const checkOf = (name, result, required = true) => ({
  name,
  required,
  ok: result.status === 0,
  status: result.status,
  output: tail(result, 2000),
});
const engine = spawnSync(
  "/usr/bin/systemctl",
  ["is-active", "core-archon.service"],
  { encoding: "utf8" },
);
let health = {
  name: "health",
  required: false,
  ok: false,
  status: null,
  output: "core-archon.service is not active",
};
if (engine.stdout.trim() === "active") {
  try {
    const response = await fetch(`http://127.0.0.1:${PORT}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    health = {
      ...health,
      ok: response.ok,
      status: response.status,
      output: (await response.text()).slice(0, 2000),
    };
  } catch (error) {
    health = { ...health, output: String(error?.message ?? error) };
  }
}
const diagnostics = diagnosticsSummary([
  checkOf("version", asAdmin([ARCHON, "version"])),
  checkOf(
    "validate-workflows",
    asAdmin([ARCHON, "validate", "workflows", "--json"]),
  ),
  checkOf(
    "doctor",
    asAdmin([ARCHON, "doctor"], {
      env: {
        HOME: nativeIdentity.home,
        CLAUDE_CONFIG_DIR: nativeIdentity.profile,
      },
    }),
    false,
  ),
  {
    name: "engine-active",
    required: false,
    ok: engine.stdout.trim() === "active",
    status: engine.status,
    output: engine.stdout.trim(),
  },
  health,
]);
writeControl(
  ".archon/core-factory-diagnostics.json",
  JSON.stringify(
    { at: new Date().toISOString(), release, ...diagnostics },
    null,
    2,
  ) + "\n",
);
for (const check of diagnostics.checks)
  log(
    `diagnostic ${check.name}: ${check.ok ? "ok" : check.required ? "FAILED" : "not ok (advisory)"}`,
  );
log(
  `installed release ${release}; control ${CONTROL}; engine unit core-archon.service on 127.0.0.1:${PORT}`,
);
log(
  `run-as user ${runAsUserId}; intake remains paused until a scope is authorized`,
);
if (!diagnostics.ok) {
  console.error(
    `[install] required diagnostics failed; keep intake paused and inspect ${CONTROL}/.archon/core-factory-diagnostics.json`,
  );
  process.exitCode = 1;
}
