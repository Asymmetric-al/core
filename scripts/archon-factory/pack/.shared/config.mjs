// Factory configuration: one operator-owned JSON file in the trusted control
// folder. Scripts never read configuration from the candidate checkout.
import { readFileSync } from "node:fs";
import path from "node:path";

export const DEFAULT_CONFIG_PATH =
  "/srv/core-factory/control/core-factory.json";

const absolute = (value) =>
  typeof value === "string" &&
  path.posix.isAbsolute(value) &&
  path.posix.normalize(value) === value &&
  value !== "/" &&
  !/[\0\r\n]/.test(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const record = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const endStates = new Set(["PR_READY", "MERGED"]);

const exactKeys = (value, keys) =>
  record(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));
const storageReserve = (value) => {
  if (typeof value === "number")
    return Number.isSafeInteger(value) && value > 0;
  if (typeof value === "string" && /^[1-9]\d{0,38}$/.test(value))
    value = BigInt(value);
  return typeof value === "bigint" && value > 0n && value <= (1n << 128n) - 1n;
};
const storageReserves = (value) =>
  exactKeys(value, ["minAvailableBytes", "minAvailableInodes"]) &&
  storageReserve(value.minAvailableBytes) &&
  storageReserve(value.minAvailableInodes);
export const storageDirectory = (value) =>
  absolute(value) &&
  value.length <= 4096 &&
  !/[\x00-\x1f\x7f]/.test(value) &&
  !value.endsWith("/");

export function validStoragePolicy(storage) {
  return (
    record(storage) &&
    storage.version === 1 &&
    exactKeys(storage, [
      "version",
      "reserves",
      ...(Object.hasOwn(storage, "additionalTargets")
        ? ["additionalTargets"]
        : []),
    ]) &&
    exactKeys(storage.reserves, ["state", "artifacts", "checkout", "cache"]) &&
    Object.values(storage.reserves).every(storageReserves) &&
    (storage.additionalTargets === undefined ||
      (Array.isArray(storage.additionalTargets) &&
        storage.additionalTargets.length <= 16 &&
        storage.additionalTargets.every(
          (target) =>
            exactKeys(target, [
              "path",
              "minAvailableBytes",
              "minAvailableInodes",
            ]) &&
            storageDirectory(target.path) &&
            storageReserve(target.minAvailableBytes) &&
            storageReserve(target.minAvailableInodes),
        )))
  );
}

export function validateConfig(config) {
  const problems = [];
  const need = (ok, where) => {
    if (!ok) problems.push(where);
  };
  need(record(config) && config.version === 1, "version");
  if (!record(config)) throw new Error("Invalid factory configuration");
  // I10: CLI trigger bindings are retired (every start is a signed webhook);
  // an older configuration that still carries the key is not refused for it.
  const { repository, archon, git, github, executor, owners } = config;
  need(absolute(config.root), "root");
  need(
    record(repository) &&
      /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/.test(repository.slug ?? "") &&
      text(repository.remote) &&
      text(repository.targetBranch) &&
      ["merge", "squash", "rebase"].includes(repository.mergeMethod),
    "repository",
  );
  need(
    record(archon) &&
      absolute(archon.home) &&
      absolute(archon.executable) &&
      text(archon.hostId),
    "archon",
  );
  need(
    record(git) &&
      absolute(git.executable) &&
      text(git.authorName) &&
      text(git.authorEmail),
    "git",
  );
  need(
    record(github) && absolute(github.executable) && absolute(github.configDir),
    "github",
  );
  need(
    record(executor) &&
      absolute(executor.docker) &&
      /^sha256:[a-f0-9]{64}$/.test(executor.image ?? ""),
    "executor",
  );
  need(
    record(owners) &&
      Object.keys(owners).length > 0 &&
      Object.entries(owners).every(
        ([alias, owner]) =>
          /^[a-z][a-z0-9-]{0,39}$/.test(alias) &&
          record(owner) &&
          absolute(owner.profile) &&
          text(owner.githubLogin),
      ),
    "owners",
  );
  need(
    config.nativeIdentity === undefined ||
      (record(config.nativeIdentity) &&
        config.nativeIdentity.provider === "claude" &&
        /^[a-z][a-z0-9-]{0,39}$/.test(config.nativeIdentity.owner ?? "") &&
        absolute(config.nativeIdentity.profile) &&
        owners?.[config.nativeIdentity.owner]?.profile ===
          config.nativeIdentity.profile &&
        absolute(archon?.serviceHome)),
    "nativeIdentity",
  );
  need(
    config.storage === undefined || validStoragePolicy(config.storage),
    "storage",
  );
  need(endStates.has(config.defaultEndState), "defaultEndState");
  need(
    config.reviewProviders === undefined ||
      (Array.isArray(config.reviewProviders) &&
        config.reviewProviders.every(
          (provider) =>
            record(provider) &&
            /^[A-Za-z0-9][A-Za-z0-9-]{0,38}(\[bot\])?$/.test(
              provider.login ?? "",
            ) &&
            typeof provider.required === "boolean" &&
            Array.isArray(provider.skipMarkers) &&
            provider.skipMarkers.every(text),
        )),
    "reviewProviders",
  );
  if (problems.length)
    throw new Error("Invalid factory configuration: " + problems.join(", "));
  return config;
}

export function factoryPaths(config) {
  const root = config.root;
  return {
    root,
    control: path.posix.join(root, "control"),
    mirror: path.posix.join(root, "mirror.git"),
    outbox: path.posix.join(root, "outbox.git"),
    issues: path.posix.join(root, "issues"),
    views: path.posix.join(root, "views"),
    runs: path.posix.join(root, "runs"),
    cache: path.posix.join(root, "cache"),
    locks: path.posix.join(root, "locks"),
  };
}

export const DEFAULT_LIMITS = Object.freeze({
  maxRounds: 8,
  maxFeedbackRounds: 12,
  noProgressRepeats: 2,
  checkWaitMs: 10 * 60_000,
  transientRetries: 3,
  retryCapMs: 120_000,
});

export const limits = (config) => ({
  ...DEFAULT_LIMITS,
  ...(config.limits ?? {}),
});

// Automated PR reviewers readiness waits for or tolerates, e.g.
// [{ login: "coderabbitai[bot]", required: false, skipMarkers: ["Review skipped"] }].
export const reviewProviders = (config) => config.reviewProviders ?? [];

export function loadConfig(
  file = process.env.CORE_FACTORY_CONFIG ?? DEFAULT_CONFIG_PATH,
) {
  return validateConfig(JSON.parse(readFileSync(file, "utf8")));
}
