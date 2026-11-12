import { readFileSync } from "node:fs";
import path from "node:path";

import {
  factoryPaths,
  storageDirectory,
  validStoragePolicy,
} from "./config.mjs";
import { checkStorage } from "./storage.mjs";

const posix = path.posix;
const operations = new Set(["admission", "publish", "merge"]);
const refusals = new Set([
  "STORAGE_CONFIG_INVALID",
  "STORAGE_NOFOLLOW_UNAVAILABLE",
  "STORAGE_IO_UNAVAILABLE",
  "STORAGE_DIRECTORY_UNAVAILABLE",
  "STORAGE_DIRECTORY_UNTRUSTED",
  "STORAGE_DIRECTORY_CHANGED",
  "STORAGE_STATFS_UNAVAILABLE",
  "STORAGE_CAPACITY_INVALID",
  "STORAGE_BYTES_LOW",
  "STORAGE_INODES_LOW",
  "STORAGE_PROBE_FAILED",
  "STORAGE_PROBE_CHANGED",
  "STORAGE_PROBE_MISMATCH",
  "STORAGE_PROBE_CLEANUP_FAILED",
  "STORAGE_CLOSE_FAILED",
]);
const refusal = (code) => ({ ok: false, code });
const contains = (parent, child) =>
  parent === child || child.startsWith(parent === "/" ? "/" : `${parent}/`);
const readMounts = () => readFileSync("/proc/self/mountinfo", "utf8");

function writerTargets({ config, operation, runId, artifacts, where }) {
  if (
    !operations.has(operation) ||
    !storageDirectory(config.root) ||
    !storageDirectory(config.archon?.home) ||
    typeof runId !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(runId) ||
    !storageDirectory(artifacts)
  )
    return null;
  if (
    operation !== "admission" &&
    (!where || ![where.root, where.repo, where.outbox].every(storageDirectory))
  )
    return null;
  const paths = factoryPaths(config);
  const home = config.archon.home;
  // What the service writes on VM 100. The engine keeps its store in
  // ARCHON_HOME and every run's artifacts, logs and workflow source under
  // ARCHON_HOME/workspaces. The control folder is root-owned and never written
  // by the service; each issue has its own outbox (publish and merge add it).
  const entries = [
    ["native-home", home, "state"],
    ["native-workspaces", posix.join(home, "workspaces"), "artifacts"],
    ["factory-root", paths.root, "state"],
    ["factory-runs", paths.runs, "state"],
    ["factory-run", posix.join(paths.runs, runId), "state"],
    ["factory-issues", paths.issues, "checkout"],
    ["factory-views", paths.views, "checkout"],
    ["factory-locks", paths.locks, "state"],
    ["factory-mirror", paths.mirror, "checkout"],
    ["factory-cache", paths.cache, "cache"],
    ["effective-artifacts", artifacts, "artifacts"],
    ...(operation === "admission"
      ? []
      : [
          ["artifact-ledger", posix.join(artifacts, "round"), "artifacts"],
          ["checkout-root", where.root, "checkout"],
          ["checkout", where.repo, "checkout"],
          ["checkout-outbox", where.outbox, "checkout"],
        ]),
  ];
  return [
    ...entries.map(([role, directory, category]) => ({
      role,
      path: directory,
      ...config.storage.reserves[category],
    })),
    ...(config.storage.additionalTargets ?? []).map((target, index) => ({
      role: `additional-${index}`,
      ...target,
    })),
  ];
}

function mountTopology(text, targets) {
  if (
    typeof text !== "string" ||
    !text.length ||
    Buffer.byteLength(text) > 1024 * 1024
  )
    throw new Error();
  const mounts = text
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const fields = line.split(" ");
      const separator = fields.indexOf("-");
      if (
        fields.length < 10 ||
        separator < 6 ||
        separator + 3 >= fields.length ||
        !/^\d+$/.test(fields[0]) ||
        !/^\d+$/.test(fields[1]) ||
        !/^\d+:\d+$/.test(fields[2])
      )
        throw new Error();
      if (/\\(?![0-7]{3})/.test(fields[4])) throw new Error();
      const directory = fields[4].replace(/\\([0-7]{3})/g, (_match, octal) =>
        String.fromCharCode(Number.parseInt(octal, 8)),
      );
      if (directory !== "/" && !storageDirectory(directory)) throw new Error();
      return { path: directory, line };
    });
  if (!mounts.some((mount) => mount.path === "/")) throw new Error();
  const relevant = mounts.filter((mount) =>
    targets.some(
      (target) =>
        contains(target.path, mount.path) || contains(mount.path, target.path),
    ),
  );
  return {
    mounts: relevant,
    snapshot: relevant
      .map((mount) => mount.line)
      .sort()
      .join("\n"),
  };
}

export async function checkFactoryStorage(
  context,
  { check = checkStorage, readMountInfo = readMounts } = {},
) {
  if (context?.config?.storage === undefined)
    return refusal("STORAGE_POLICY_MISSING");
  if (!validStoragePolicy(context.config.storage))
    return refusal("STORAGE_POLICY_INVALID");
  const operation = context.operation;
  const targets = writerTargets(context);
  if (!targets) return refusal("STORAGE_CONTEXT_INVALID");
  let topology;
  try {
    topology = mountTopology(readMountInfo(), targets);
  } catch {
    return refusal("STORAGE_MOUNTS_UNAVAILABLE");
  }
  const roots = [...targets];
  for (const mount of topology.mounts) {
    if (targets.some((target) => target.path === mount.path)) continue;
    const parent = roots
      .filter((target) => contains(target.path, mount.path))
      .sort((left, right) => right.path.length - left.path.length)[0];
    if (parent)
      targets.push({
        ...parent,
        role: `child-mount-${targets.length}`,
        path: mount.path,
      });
  }
  if (targets.length > 64) return refusal("STORAGE_TARGETS_EXCEEDED");
  for (let offset = 0; offset < targets.length; offset += 16) {
    const batch = targets.slice(offset, offset + 16);
    let result;
    try {
      result = await check({
        operation,
        targets: batch.map(
          ({ path: directory, minAvailableBytes, minAvailableInodes }) => ({
            path: directory,
            minAvailableBytes,
            minAvailableInodes,
          }),
        ),
      });
    } catch {
      return refusal("STORAGE_IO_UNAVAILABLE");
    }
    if (
      result?.ok === true &&
      result.code === "STORAGE_READY" &&
      result.operation === operation
    )
      continue;
    if (result?.ok !== false || !refusals.has(result.code))
      return refusal("STORAGE_IO_UNAVAILABLE");
    if (result.targetIndex === undefined) return refusal(result.code);
    if (
      !Number.isSafeInteger(result.targetIndex) ||
      result.targetIndex < 0 ||
      result.targetIndex >= batch.length
    )
      return refusal("STORAGE_IO_UNAVAILABLE");
    return {
      ok: false,
      code: result.code,
      targetIndex: offset + result.targetIndex,
      role: batch[result.targetIndex].role,
    };
  }
  try {
    if (mountTopology(readMountInfo(), roots).snapshot !== topology.snapshot)
      return refusal("STORAGE_MOUNTS_CHANGED");
  } catch {
    return refusal("STORAGE_MOUNTS_UNAVAILABLE");
  }
  return {
    ok: true,
    code: "STORAGE_READY",
    operation,
    targetCount: targets.length,
  };
}
