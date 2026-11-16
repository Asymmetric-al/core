import { spawn as nodeSpawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import path from "node:path";

import { cleanupLabels, confirmedCleanup } from "./cleanup-state.mjs";
import { removeLabeledContainers } from "./executor.mjs";

const labelPatterns = {
  "core.archon.executor": /^candidate-check$/,
  "core.archon.attempt":
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
  "core.archon.run": /^[A-Za-z0-9][A-Za-z0-9-]{7,127}$/,
  "core.archon.issue": /^[1-9]\d{0,15}$/,
};
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const sameLabels = (left, right) =>
  isRecord(left) &&
  isRecord(right) &&
  Object.keys(left).length === Object.keys(right).length &&
  Object.entries(left).every(
    ([key, value]) => Object.hasOwn(right, key) && right[key] === value,
  );

function ownedLabels(cleanup, supplied, expected) {
  const labels = cleanupLabels(cleanup);
  if (
    !sameLabels(labels, supplied) ||
    Object.keys(labels).length !== Object.keys(labelPatterns).length ||
    !Object.entries(labelPatterns).every(
      ([key, pattern]) =>
        Object.hasOwn(labels, key) &&
        typeof labels[key] === "string" &&
        pattern.test(labels[key]),
    ) ||
    !Number.isSafeInteger(expected.issue) ||
    expected.issue <= 0 ||
    typeof expected.assignment !== "string" ||
    !expected.assignment.trim() ||
    cleanup.runId !== expected.runId ||
    cleanup.assignment !== expected.assignment ||
    cleanup.issue !== expected.issue ||
    labels["core.archon.run"] !== expected.runId ||
    labels["core.archon.issue"] !== String(expected.issue)
  )
    throw new Error(
      "Cleanup receipt does not identify the exact owned executor, run, assignment and issue",
    );
  return labels;
}

const sameEntry = (left, right) =>
  left.dev === right.dev && left.ino === right.ino;

async function trustedDirectory(directory) {
  const info = await lstat(directory);
  if (
    !info.isDirectory() ||
    info.isSymbolicLink() ||
    path.relative(directory, await realpath(directory)) !== ""
  )
    throw new Error("Cleanup artifact directories must be real, not symlinks");
  return info;
}

async function verifyReceipt(reference, labels, artifactsDir) {
  if (typeof artifactsDir !== "string" || !path.isAbsolute(artifactsDir))
    throw new Error("The trusted run artifact root is unavailable");
  const root = path.resolve(artifactsDir);
  const directory = path.join(root, "round");
  const expectedPath = path.join(directory, "cleanup-state.json");
  if (path.resolve(reference.path) !== expectedPath)
    throw new Error(
      "Cleanup receipt is outside the expected trusted run artifact path",
    );
  const rootInfo = await trustedDirectory(root);
  const directoryInfo = await trustedDirectory(directory);
  const info = await lstat(expectedPath);
  if (!info.isFile() || info.isSymbolicLink())
    throw new Error("Cleanup receipt must be a no-follow regular file");
  const file = await open(
    expectedPath,
    constants.O_RDONLY |
      (constants.O_NOFOLLOW ?? 0) |
      (constants.O_NONBLOCK ?? 0),
  );
  try {
    const opened = await file.stat();
    if (
      !opened.isFile() ||
      !sameEntry(info, opened) ||
      opened.size !== reference.bytes
    )
      throw new Error(
        "Cleanup receipt file identity or bytes do not match the retained reference",
      );
    const content = await file.readFile();
    const after = await lstat(expectedPath);
    if (
      !after.isFile() ||
      after.isSymbolicLink() ||
      !sameEntry(opened, after) ||
      !sameEntry(rootInfo, await trustedDirectory(root)) ||
      !sameEntry(directoryInfo, await trustedDirectory(directory)) ||
      path.relative(expectedPath, await realpath(expectedPath)) !== "" ||
      content.byteLength !== reference.bytes ||
      createHash("sha256").update(content).digest("hex") !== reference.sha256
    )
      throw new Error(
        "Cleanup receipt artifact identity, bytes or hash changed",
      );
    const receipt = JSON.parse(content.toString("utf8"));
    if (!isRecord(receipt) || !sameLabels(receipt.labels, labels))
      throw new Error(
        "Cleanup receipt top-level labels differ from the retained reference",
      );
    return reference.sha256;
  } finally {
    await file.close();
  }
}

function commandEvidence(spawn) {
  const commands = [];
  return {
    spawn(executable, args, options) {
      const proof = { complete: false, failed: false, bytes: 0 };
      commands.push(proof);
      const child = spawn(executable, args, options);
      child.once("error", () => {
        proof.failed = true;
      });
      child.once("close", (code, signal) => {
        proof.complete = true;
        if (code !== 0 || signal) proof.failed = true;
      });
      for (const stream of [child.stdout, child.stderr]) {
        stream.on("data", (chunk) => {
          proof.bytes += Buffer.byteLength(chunk);
          if (proof.bytes > 1_048_576) proof.failed = true;
        });
      }
      const kill = child.kill.bind(child);
      child.kill = (...args) => {
        proof.failed = true;
        return kill(...args);
      };
      return child;
    },
    confirmed: () =>
      commands.length > 0 &&
      commands.every((proof) => proof.complete && !proof.failed),
  };
}

export function createCleanupReconciler(trusted, { spawn = nodeSpawn } = {}) {
  const expected = { ...trusted };
  return async function reconcileCleanup(request) {
    try {
      const {
        cleanup,
        labels: supplied,
        runId,
        assignment,
        issue,
      } = structuredClone(request);
      if (
        runId !== expected.runId ||
        assignment !== expected.assignment ||
        issue !== expected.issue
      )
        throw new Error(
          "Cleanup reconciliation identity differs from the trusted round",
        );
      const labels = ownedLabels(cleanup, supplied, expected);
      const receiptSha256 = cleanup.receiptReference
        ? await verifyReceipt(
            cleanup.receiptReference,
            labels,
            expected.artifactsDir,
          )
        : undefined;
      const commands = commandEvidence(spawn);
      const result = await removeLabeledContainers(
        { dockerExecutable: expected.dockerExecutable, labels },
        { spawn: commands.spawn },
      );
      if (
        !commands.confirmed() ||
        result?.ok !== true ||
        result.error ||
        !Array.isArray(result.found) ||
        !Array.isArray(result.remaining) ||
        result.remaining.length !== 0
      )
        throw new Error("The executor did not confirm an empty owned workload");
      const evidence = {
        ...result,
        labels,
        cleanupConfirmed: true,
        reusable: true,
        ...(receiptSha256 ? { receiptSha256 } : {}),
      };
      if (!confirmedCleanup(cleanup, { confirmed: true, evidence }))
        throw new Error(
          "Cleanup confirmation does not satisfy the shared ownership predicate",
        );
      return evidence;
    } catch (error) {
      return {
        ok: false,
        cleanupConfirmed: false,
        reusable: false,
        remaining: null,
        error: {
          name: error?.name ?? "Error",
          message: String(error?.message ?? error).slice(0, 600),
        },
      };
    }
  };
}
