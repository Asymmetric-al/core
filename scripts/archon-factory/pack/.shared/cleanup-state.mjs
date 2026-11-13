import path from "node:path";

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function cleanupLabels(cleanup) {
  if (!isRecord(cleanup)) return undefined;
  // Set when an inline receipt was archived beside a reference it conflicted with.
  if (cleanup.receiptConflict !== undefined) return undefined;
  const reference = cleanup.receiptReference;
  if (reference !== undefined) {
    if (
      cleanup.receipt !== undefined ||
      !isRecord(reference) ||
      typeof reference.path !== "string" ||
      !(
        path.posix.isAbsolute(reference.path) ||
        path.win32.isAbsolute(reference.path)
      ) ||
      !/^[a-f0-9]{64}$/.test(reference.sha256 ?? "") ||
      !Number.isSafeInteger(reference.bytes) ||
      reference.bytes <= 0 ||
      !isRecord(reference.labels)
    )
      return undefined;
    return reference.labels;
  }
  return isRecord(cleanup.receipt?.labels) ? cleanup.receipt.labels : undefined;
}

export function confirmedCleanup(cleanup, reconciliation) {
  const evidence = reconciliation?.evidence;
  const labels = cleanupLabels(cleanup);
  const required = [
    "core.archon.executor",
    "core.archon.attempt",
    "core.archon.run",
    "core.archon.issue",
  ];
  return (
    !cleanup?.additionalCleanupArtifact &&
    (cleanup?.additionalCleanups === undefined ||
      (Array.isArray(cleanup.additionalCleanups) &&
        Array.isArray(evidence?.additional) &&
        evidence.additional.length === cleanup.additionalCleanups.length &&
        cleanup.additionalCleanups.every((entry, index) =>
          confirmedCleanup(entry, evidence.additional[index]),
        ))) &&
    reconciliation?.confirmed === true &&
    isRecord(labels) &&
    Object.values(labels).every((value) => typeof value === "string") &&
    required.every(
      (key) => typeof labels[key] === "string" && labels[key].length > 0,
    ) &&
    labels["core.archon.executor"] === "candidate-check" &&
    labels["core.archon.run"] === cleanup.runId &&
    labels["core.archon.issue"] === String(cleanup.issue) &&
    (!cleanup.receiptReference ||
      evidence?.receiptSha256 === cleanup.receiptReference.sha256) &&
    evidence?.ok === true &&
    evidence.cleanupConfirmed === true &&
    evidence.reusable === true &&
    Array.isArray(evidence.remaining) &&
    evidence.remaining.length === 0 &&
    isRecord(evidence.labels) &&
    Object.keys(labels).length === Object.keys(evidence.labels).length &&
    Object.entries(labels).every(
      ([key, value]) => evidence.labels[key] === value,
    )
  );
}

export function hasUnconfirmedCleanup(item) {
  return (
    Boolean(item?.cleanup || item?.blocker?.code === "cleanup-unconfirmed") &&
    !confirmedCleanup(item?.cleanup, item?.cleanupReconciliation)
  );
}
