import { spawn as nodeSpawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const idPattern = /^[a-f0-9]{64}$/;
const attemptPattern =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const runIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/;
// Labels the factory selects on when it reconciles or cancels containers.
const LABEL_VALUES = {
  "core.archon.executor": /^candidate-check$/,
  "core.archon.attempt": attemptPattern,
  "core.archon.run": runIdPattern,
  "core.archon.issue": /^[1-9]\d{0,15}$/,
};
const defaults = {
  cpus: 2,
  memoryMb: 2048,
  pids: 128,
  timeoutMs: 900_000,
  controlTimeoutMs: 5000,
  outputBytes: 1_048_576,
};
const ceilings = {
  cpus: 16,
  memoryMb: 32768,
  pids: 8192,
  timeoutMs: 7_200_000,
  controlTimeoutMs: 30000,
  outputBytes: 16_777_216,
};

export class CheckCleanupError extends Error {
  constructor(receipt, cause) {
    super(
      "Owned check cleanup is uncertain; retain workspace and do not reuse the slot",
      { cause },
    );
    this.name = "CheckCleanupError";
    this.receipt = receipt;
  }
}

// The cache directories a scratch mount may cover, by exact name.
export const SCRATCH_NAMES = new Set([".vite-temp", ".vite", ".cache"]);

async function validate(input) {
  if (
    !path.isAbsolute(input.dockerExecutable ?? "") ||
    /[\0\r\n]/.test(input.dockerExecutable)
  )
    throw new Error("Absolute Docker executable required");
  if (!/^sha256:[a-f0-9]{64}$/.test(input.image ?? ""))
    throw new Error("Operator-pinned full image ID required");
  if (
    !Array.isArray(input.command) ||
    !input.command.length ||
    input.command.some(
      (arg) => typeof arg !== "string" || arg.includes("\0"),
    ) ||
    !input.command[0] ||
    input.command[0].startsWith("-")
  )
    throw new Error("Command must be a nonempty executable argument array");
  const user = input.user ?? "1000:1000";
  if (!/^[1-9]\d{0,8}:[1-9]\d{0,8}$/.test(user))
    throw new Error("Non-root numeric UID:GID required");
  const limits = { ...defaults, ...input.limits };
  for (const [key, value] of Object.entries(limits)) {
    if (
      !(key in defaults) ||
      !Number.isFinite(value) ||
      value < 1 ||
      value > ceilings[key] ||
      (key !== "cpus" && !Number.isInteger(value))
    )
      throw new Error("Invalid check resource limit: " + key);
  }
  for (const directory of [input.workspaceRoot, input.workspaceDirectory]) {
    if (
      typeof directory !== "string" ||
      !path.isAbsolute(directory) ||
      /["\0\r\n]/.test(directory)
    )
      throw new Error("Absolute unambiguous disposable paths required");
    if (
      !(await lstat(directory)).isDirectory() ||
      (await lstat(directory)).isSymbolicLink() ||
      path.relative(path.resolve(directory), await realpath(directory)) !== ""
    )
      throw new Error("Disposable directories must be real, not symlinks");
  }
  const root = await realpath(input.workspaceRoot);
  const workspace = await realpath(input.workspaceDirectory);
  if (path.dirname(workspace) !== root || root === path.parse(root).root)
    throw new Error(
      "Workspace must be a direct disposable child of a dedicated root",
    );
  const network = input.network ?? "none";
  if (!["none", "bridge"].includes(network))
    throw new Error("Network must be none or an explicit bridge exception");
  const tmpfsMb = input.tmpfsMb ?? 256;
  if (!Number.isInteger(tmpfsMb) || tmpfsMb < 64 || tmpfsMb > 16384)
    throw new Error("Invalid /tmp size");
  const workspaceTarget = input.workspaceTarget ?? "/candidate";
  const targetOk = (target) =>
    typeof target === "string" &&
    path.posix.isAbsolute(target) &&
    path.posix.normalize(target) === target &&
    target !== "/" &&
    !/["\0\r\n]/.test(target);
  if (!targetOk(workspaceTarget) || workspaceTarget === "/tmp")
    throw new Error("Invalid workspace target");
  const mounts = [];
  for (const mount of input.mounts ?? []) {
    if (
      !mount ||
      typeof mount.source !== "string" ||
      !path.isAbsolute(mount.source) ||
      /["\0\r\n]/.test(mount.source) ||
      !targetOk(mount.target) ||
      mount.target === workspaceTarget ||
      (mount.target.startsWith(workspaceTarget + "/") && !mount.readOnly) ||
      mount.target === "/tmp" ||
      typeof mount.readOnly !== "boolean"
    )
      throw new Error("Invalid extra mount");
    const stat = await lstat(mount.source);
    if (!stat.isDirectory() || stat.isSymbolicLink())
      throw new Error("Extra mounts must be real directories");
    const source = await realpath(mount.source);
    if (source === path.parse(source).root)
      throw new Error("Refusing to mount a filesystem root");
    if (mounts.some((other) => other.target === mount.target))
      throw new Error("Duplicate mount target");
    mounts.push({ source, target: mount.target, readOnly: mount.readOnly });
  }
  // Scratch: a private, empty tmpfs over one cache directory that sits
  // directly inside a read-only mount (node_modules/.vite-temp and the like).
  // A tool the candidate's own tests start can then write its cache without
  // the dependencies themselves becoming writable. The directory must already
  // exist in the mount's source, created by the trusted side.
  const scratch = [];
  for (const target of input.scratch ?? []) {
    const parent = mounts.find(
      (mount) =>
        mount.readOnly &&
        typeof target === "string" &&
        target.startsWith(mount.target + "/"),
    );
    const name = parent ? target.slice(parent.target.length + 1) : "";
    if (
      !parent ||
      !targetOk(target) ||
      !SCRATCH_NAMES.has(name) ||
      scratch.includes(target)
    )
      throw new Error("Invalid scratch mount");
    const stat = await lstat(path.join(parent.source, name)).catch(() => null);
    if (!stat?.isDirectory() || stat.isSymbolicLink())
      throw new Error("A scratch mount needs an existing cache directory");
    scratch.push(target);
  }
  if (input.attempt !== undefined && !attemptPattern.test(input.attempt))
    throw new Error("Invalid check attempt id");
  if (input.runId !== undefined && !runIdPattern.test(input.runId))
    throw new Error("Invalid run label");
  if (
    input.issue !== undefined &&
    (!Number.isSafeInteger(input.issue) || input.issue <= 0)
  )
    throw new Error("Invalid issue label");
  const env = {};
  for (const [key, value] of Object.entries(input.env ?? {})) {
    if (
      !/^[A-Z][A-Z0-9_]{0,63}$/.test(key) ||
      /(^|_)(TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIALS?|AUTH|APIKEY|KEY|PRIVATE)(_|$)/.test(
        key,
      ) ||
      /^(GH|GITHUB|ANTHROPIC|CLAUDE|ARCHON|AWS|SSH|NPM_CONFIG__AUTH|DOCKER)_/.test(
        key,
      ) ||
      typeof value !== "string" ||
      /[\0\r\n]/.test(value)
    )
      throw new Error("Environment key not permitted: " + key);
    env[key] = value;
  }
  return {
    limits,
    user,
    root,
    workspace,
    network,
    tmpfsMb,
    workspaceTarget,
    mounts,
    scratch,
    env,
  };
}

function runDocker(
  spawn,
  executable,
  args,
  { signal, timeoutMs, outputBytes },
) {
  return new Promise((resolve) => {
    let child;
    let timer;
    let killTimer;
    let done = false;
    let interrupted = false;
    let overflow = false;
    let bytes = 0;
    const stdout = [];
    const stderr = [];
    const finish = (code, error, clientSettled) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(killTimer);
      signal?.removeEventListener("abort", interrupt);
      resolve({
        code,
        error,
        clientSettled,
        interrupted,
        overflow,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      });
    };
    const interrupt = () => {
      if (done || interrupted) return;
      interrupted = true;
      killTimer = setTimeout(
        () => finish(null, new Error("Docker client did not settle"), false),
        Math.min(timeoutMs, 1000),
      );
      try {
        child.kill("SIGKILL");
      } catch {
        finish(null, new Error("Docker client kill failed"), false);
      }
    };
    if (signal?.aborted) {
      finish(null, null, true);
      return;
    }
    try {
      child = spawn(executable, args, {
        shell: false,
        env: {},
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });
    } catch (error) {
      finish(null, error, true);
      return;
    }
    const collect = (chunks) => (chunk) => {
      if (done || overflow) return;
      const buffer = Buffer.from(chunk);
      const remaining = outputBytes - bytes;
      chunks.push(buffer.subarray(0, Math.max(0, remaining)));
      bytes += Math.min(buffer.length, remaining);
      if (buffer.length > remaining) {
        overflow = true;
        interrupt();
      }
    };
    child.stdout.on("data", collect(stdout));
    child.stderr.on("data", collect(stderr));
    child.once("error", (error) => finish(null, error, false));
    child.once("close", (code) => finish(code, null, true));
    timer = setTimeout(interrupt, timeoutMs);
    signal?.addEventListener("abort", interrupt, { once: true });
    if (signal?.aborted) interrupt();
  });
}

export async function executeCandidateCheck(input, { spawn = nodeSpawn } = {}) {
  const {
    limits,
    user,
    root,
    workspace,
    network,
    tmpfsMb,
    workspaceTarget,
    mounts,
    scratch,
    env,
  } = await validate(input);
  const attempt = input.attempt ?? randomUUID();
  const labels = {
    "core.archon.executor": "candidate-check",
    "core.archon.attempt": attempt,
    ...(input.runId !== undefined ? { "core.archon.run": input.runId } : {}),
    ...(input.issue !== undefined
      ? { "core.archon.issue": String(input.issue) }
      : {}),
  };
  const receipt = {
    status: "failed",
    exitCode: null,
    containerId: null,
    containerName: "core-check-" + attempt,
    labels,
    image: input.image,
    workspaceDirectory: workspace,
    workspaceTarget,
    network,
    mounts,
    command: [...input.command],
    limits,
    stdout: "",
    stderr: "",
    cleanupConfirmed: false,
    reusable: false,
  };
  if (input.signal?.aborted)
    return {
      ...receipt,
      status: "cancelled",
      cleanupConfirmed: true,
      reusable: true,
    };
  const configDirectory = await mkdtemp(path.join(root, ".docker-check-"));
  receipt.configDirectory = configDirectory;
  await writeFile(path.join(configDirectory, "config.json"), '{"auths":{}}', {
    mode: 0o600,
  });
  const prefix = [
    "--config",
    configDirectory,
    "--host",
    "unix:///var/run/docker.sock",
  ];
  const controller = new AbortController();
  let reason;
  let unsettledClient = false;
  const cancel = () => {
    reason ??= "cancelled";
    controller.abort();
  };
  input.signal?.addEventListener("abort", cancel, { once: true });
  if (input.signal?.aborted) cancel();
  const deadline = setTimeout(() => {
    reason ??= "timed_out";
    controller.abort();
  }, limits.timeoutMs);
  const docker = async (args, candidate = false, cleanup = false) => {
    const result = await runDocker(
      spawn,
      input.dockerExecutable,
      [...prefix, ...args],
      {
        signal: cleanup ? undefined : controller.signal,
        timeoutMs: candidate ? limits.timeoutMs : limits.controlTimeoutMs,
        outputBytes: candidate ? limits.outputBytes : 65536,
      },
    );
    unsettledClient ||= !result.clientSettled;
    return result;
  };
  const inspect = async (target, cleanup = false) => {
    const result = await docker(
      ["inspect", "--type", "container", target],
      false,
      cleanup,
    );
    if (
      result.code !== 0 ||
      result.error ||
      result.overflow ||
      result.interrupted
    )
      throw new Error("Container inspect unavailable");
    const containers = JSON.parse(result.stdout);
    if (!Array.isArray(containers) || containers.length !== 1)
      throw new Error("Ambiguous container inspect");
    const container = containers[0];
    if (
      !idPattern.test(container.Id ?? "") ||
      (receipt.containerId && receipt.containerId !== container.Id) ||
      container.Image !== input.image ||
      Object.entries(labels).some(
        ([key, value]) => container.Config?.Labels?.[key] !== value,
      )
    )
      throw new Error("Container identity mismatch");
    receipt.containerId = container.Id;
    if (
      !container.State ||
      typeof container.State.Running !== "boolean" ||
      typeof container.State.Paused !== "boolean" ||
      typeof container.State.Restarting !== "boolean"
    )
      throw new Error("Container state uncertain");
    return container;
  };
  const stopped = (container) =>
    container.State.Running === false &&
    container.State.Paused === false &&
    container.State.Restarting === false &&
    ["created", "exited", "dead"].includes(container.State.Status);
  let attemptedCreate = false;
  try {
    if (controller.signal.aborted) {
      receipt.status = reason;
    } else {
      attemptedCreate = true;
      const created = await docker([
        "create",
        "--name",
        receipt.containerName,
        ...Object.entries(labels).flatMap(([key, value]) => [
          "--label",
          key + "=" + value,
        ]),
        "--pull",
        "never",
        // A real init reaps orphaned processes and forwards signals, as on a
        // hosted runner; without it Core tests that stop setsid'd children
        // observe zombies.
        "--init",
        "--network",
        network,
        "--read-only",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges",
        "--user",
        user,
        "--cpus",
        String(limits.cpus),
        "--memory",
        limits.memoryMb + "m",
        "--memory-swap",
        limits.memoryMb + "m",
        "--pids-limit",
        String(limits.pids),
        "--restart",
        "no",
        "--log-driver",
        "none",
        "--no-healthcheck",
        "--ipc",
        "none",
        "--ulimit",
        "core=0",
        // Docker parses --mount as CSV: both paths are quoted fields, so a
        // comma in a path cannot add mount options.
        "--mount",
        'type=bind,"source=' + workspace + '","target=' + workspaceTarget + '"',
        ...mounts.flatMap((mount) => [
          "--mount",
          'type=bind,"source=' +
            mount.source +
            '","target=' +
            mount.target +
            '"' +
            (mount.readOnly ? ",readonly" : ""),
        ]),
        "--tmpfs",
        "/tmp:rw,exec,nosuid,nodev,size=" + tmpfsMb + "m,mode=1777",
        ...scratch.flatMap((target) => [
          "--tmpfs",
          target + ":rw,exec,nosuid,nodev,size=256m,mode=1777",
        ]),
        "--workdir",
        workspaceTarget,
        "--env",
        "HOME=/tmp",
        "--env",
        "CI=1",
        ...Object.entries(env).flatMap(([key, value]) => [
          "--env",
          key + "=" + value,
        ]),
        "--entrypoint",
        input.command[0],
        input.image,
        ...input.command.slice(1),
      ]);
      if (
        created.code !== 0 ||
        created.error ||
        created.overflow ||
        created.interrupted ||
        !idPattern.test(created.stdout.trim())
      )
        throw new Error("Create not confirmed");
      receipt.containerId = created.stdout.trim();
      const container = await inspect(receipt.containerId);
      if (!stopped(container))
        throw new Error("Unexpected active container before start");
      const expected = [
        { source: workspace, target: workspaceTarget, readOnly: false },
        ...mounts,
      ];
      if (
        !Array.isArray(container.Mounts) ||
        container.Mounts.length !== expected.length ||
        expected.some(
          (mount) =>
            !container.Mounts.some(
              (actual) =>
                actual.Type === "bind" &&
                actual.Source === mount.source &&
                actual.Destination === mount.target &&
                actual.RW === !mount.readOnly,
            ),
        )
      )
        throw new Error("Unexpected image volume or mount");
      const result = await docker(
        ["start", "--attach", receipt.containerId],
        true,
      );
      receipt.stdout = result.stdout;
      receipt.stderr = result.stderr;
      if (result.overflow) reason ??= "output_limit";
      const final = await inspect(receipt.containerId, true);
      receipt.status = reason ?? "failed";
      receipt.exitCode = Number.isInteger(final.State.ExitCode)
        ? final.State.ExitCode
        : null;
      if (
        !reason &&
        !result.error &&
        !result.interrupted &&
        result.code === 0 &&
        stopped(final) &&
        final.State.Status === "exited" &&
        receipt.exitCode === 0
      )
        receipt.status = "passed";
    }
  } catch {
    receipt.status = reason ?? "failed";
  } finally {
    clearTimeout(deadline);
    input.signal?.removeEventListener("abort", cancel);
  }
  try {
    if (attemptedCreate) {
      let container = await inspect(
        receipt.containerId ?? receipt.containerName,
        true,
      );
      if (!stopped(container)) {
        await docker(["kill", receipt.containerId], false, true);
        container = await inspect(receipt.containerId, true);
      }
      if (!stopped(container) || unsettledClient)
        throw new Error("Workload or Docker client not confirmed stopped");
      receipt.exitCode = Number.isInteger(container.State.ExitCode)
        ? container.State.ExitCode
        : null;
      const removed = await docker(
        ["rm", "--volumes", receipt.containerId],
        false,
        true,
      );
      if (
        removed.code !== 0 ||
        removed.error ||
        removed.interrupted ||
        removed.overflow ||
        removed.stdout.trim() !== receipt.containerId
      )
        throw new Error("Container removal not confirmed");
    }
    await rm(configDirectory, { recursive: true });
    receipt.cleanupConfirmed = true;
    receipt.reusable = true;
    return receipt;
  } catch (cause) {
    throw new CheckCleanupError(receipt, cause);
  }
}

// Kill and remove every container carrying all of `labels` (for example one
// check attempt, or every check of a cancelled run), then list again. ok is
// true only when the second listing confirms that none remain.
export async function removeLabeledContainers(
  { dockerExecutable, labels, timeoutMs = 30_000, configRoot = os.tmpdir() },
  { spawn = nodeSpawn } = {},
) {
  if (
    !path.isAbsolute(dockerExecutable ?? "") ||
    /[\0\r\n]/.test(dockerExecutable)
  )
    throw new Error("Absolute Docker executable required");
  const selected = Object.entries(labels ?? {});
  if (
    !selected.length ||
    selected.some(([key, value]) => !LABEL_VALUES[key]?.test(String(value)))
  )
    throw new Error(
      "Container labels must name a factory run, issue or attempt",
    );
  const configDirectory = await mkdtemp(path.join(configRoot, "core-docker-"));
  const prefix = [
    "--config",
    configDirectory,
    "--host",
    "unix:///var/run/docker.sock",
  ];
  const filters = selected.flatMap(([key, value]) => [
    "--filter",
    `label=${key}=${value}`,
  ]);
  const docker = (args) =>
    runDocker(spawn, dockerExecutable, [...prefix, ...args], {
      timeoutMs,
      outputBytes: 1_048_576,
    });
  const list = async () => {
    const result = await docker([
      "ps",
      "--all",
      "--quiet",
      "--no-trunc",
      ...filters,
    ]);
    if (
      result.code !== 0 ||
      result.error ||
      result.interrupted ||
      result.overflow
    )
      throw new Error("Container listing unavailable");
    const ids = result.stdout.split(/\s+/).filter(Boolean);
    if (ids.some((id) => !idPattern.test(id)))
      throw new Error("Unexpected container listing");
    return ids;
  };
  try {
    await writeFile(path.join(configDirectory, "config.json"), '{"auths":{}}', {
      mode: 0o600,
    });
    const found = await list();
    for (const id of found) await docker(["rm", "--force", "--volumes", id]);
    const remaining = found.length ? await list() : [];
    return { ok: remaining.length === 0, found, remaining };
  } catch (error) {
    return { ok: false, found: [], remaining: null, error: error.message };
  } finally {
    await rm(configDirectory, { recursive: true, force: true });
  }
}
