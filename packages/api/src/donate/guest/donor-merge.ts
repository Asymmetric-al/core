/**
 * Donor merge — merge candidates + auditable merge workflow (pure, no I/O).
 * Source: Conrad blocker answers §2.5–§2.6 (2026-07-04).
 *
 * TERMINOLOGY LAW (§2.5): use canonical / primary / SURVIVING record and
 * duplicate / secondary / MERGED record — never the legacy dominant/subordinate naming.
 *
 * Rules encoded here:
 *   §2.2/§2.4 — possible/low matches become OPEN merge candidates for
 *               human/agent review; they are never auto-merged.
 *   §2.5      — a merge is fully AUDITABLE (who/what/when/why/confidence-signals/
 *               affected-records) and marks the duplicate record merged +
 *               redirected to the surviving record — it is NEVER deleted.
 *   §2.6      — a later merge MUST NOT silently rewrite receipt truth: receipt
 *               identity snapshots are preserved and the merge emits a
 *               correction/link record instead of mutating the snapshot.
 */

import type { DonorMatchConfidence, DonorMatchSignal } from "./donor-matching";

export type MergeCandidateStatus =
  | "open"
  | "resolved_merged"
  | "resolved_rejected";
export type MergeActorType = "staff" | "agent";
export type ReviewableDonorMatchConfidence = Extract<
  DonorMatchConfidence,
  "possible" | "low"
>;

export interface MergeCandidate {
  id: string;
  tenantId: string;
  /** The existing canonical-candidate donor under review. */
  existingDonorId: string;
  /** The newly created/incoming donor that may be a duplicate (nullable). */
  incomingDonorId: string | null;
  confidence: ReviewableDonorMatchConfidence;
  signals: DonorMatchSignal[];
  status: MergeCandidateStatus;
  createdAt: string;
}

function isReviewableConfidence(
  confidence: DonorMatchConfidence,
): confidence is ReviewableDonorMatchConfidence {
  return confidence === "possible" || confidence === "low";
}

export function buildMergeCandidate(input: {
  id: string;
  tenantId: string;
  existingDonorId: string;
  incomingDonorId: string | null;
  confidence: ReviewableDonorMatchConfidence;
  signals: DonorMatchSignal[];
  createdAt: string;
}): MergeCandidate {
  const tenantId = input.tenantId.trim();
  if (!tenantId) {
    throw new Error("merge candidate requires a tenant id");
  }
  if (!input.existingDonorId.trim()) {
    throw new Error("merge candidate requires an existing donor id");
  }
  if (!isReviewableConfidence(input.confidence)) {
    throw new Error("merge candidate confidence must be possible or low");
  }
  return {
    id: input.id,
    tenantId,
    existingDonorId: input.existingDonorId,
    incomingDonorId: input.incomingDonorId,
    confidence: input.confidence,
    signals: [...input.signals],
    status: "open", // review-first; never opens as an auto-merge (§2.2/§2.4)
    createdAt: input.createdAt,
  };
}

export interface DonorMergeAudit {
  tenantId: string;
  /** canonical / primary / surviving record. */
  survivingDonorId: string;
  /** duplicate / secondary / merged record. */
  mergedDonorId: string;
  actorId: string;
  actorType: MergeActorType;
  reason: string;
  confidenceSignals: DonorMatchSignal[];
  affectedRecords: Record<string, number>;
  decidedAt: string;
}

export interface DonorMergePlan {
  audit: DonorMergeAudit;
  /**
   * The DUPLICATE record gets a server-only REDIRECT row to the surviving
   * record. Public donor rows are never deleted or stamped with merge metadata.
   */
  redirectRecord: {
    tenantId: string;
    mergedDonorId: string;
    survivingDonorId: string;
    mergedAt: string;
  };
  survivingDonorId: string;
  /** Receipt snapshots are preserved, not rewritten (§2.6). */
  receiptTruth: "preserved";
}

export function planDonorMerge(input: {
  tenantId: string;
  survivingDonorId: string;
  mergedDonorId: string;
  actorId: string;
  actorType: MergeActorType;
  reason: string;
  confidenceSignals: DonorMatchSignal[];
  affectedRecords: Record<string, number>;
  decidedAt: string;
}): DonorMergePlan {
  const tenantId = input.tenantId.trim();
  const surviving = input.survivingDonorId.trim();
  const merged = input.mergedDonorId.trim();
  if (!tenantId) {
    throw new Error("merge requires a tenant id for the audit record");
  }
  if (!surviving || !merged) {
    throw new Error("merge requires both a surviving and a merged donor id");
  }
  if (surviving === merged) {
    throw new Error("cannot merge a donor record into itself");
  }
  if (!input.reason.trim()) {
    // Auditability (§2.5) requires a WHY.
    throw new Error("merge requires a reason for the audit record");
  }
  if (!input.actorId.trim()) {
    throw new Error("merge requires an actor id for the audit record");
  }

  return {
    audit: {
      tenantId,
      survivingDonorId: surviving,
      mergedDonorId: merged,
      actorId: input.actorId,
      actorType: input.actorType,
      reason: input.reason.trim(),
      confidenceSignals: [...input.confidenceSignals],
      affectedRecords: { ...input.affectedRecords },
      decidedAt: input.decidedAt,
    },
    redirectRecord: {
      tenantId,
      mergedDonorId: merged,
      survivingDonorId: surviving,
      mergedAt: input.decidedAt,
    },
    survivingDonorId: surviving,
    receiptTruth: "preserved",
  };
}

export interface ReceiptSnapshotRef {
  donationId: string;
  receiptName: string;
  receiptEmail: string;
}

export interface ReceiptMergeCorrection {
  donationId: string;
  /** The snapshot as issued at time of gift — carried through unchanged. */
  originalReceiptName: string;
  originalReceiptEmail: string;
  /** The surviving/canonical donor the gift is now linked to for reporting. */
  linkedToDonorId: string;
  reason: string;
  correctedAt: string;
}

export interface ReceiptMergeResult {
  /** The receipts, snapshot fields untouched (§2.6). */
  preservedReceipts: ReceiptSnapshotRef[];
  /** One correction per receipt linking it to the surviving donor — the audit trail. */
  corrections: ReceiptMergeCorrection[];
}

/**
 * A donor merge must NOT silently rewrite receipt truth (§2.6). This preserves
 * every receipt's identity snapshot and emits a correction record that LINKS the
 * gift to the surviving/canonical donor for reporting — an explicit audit trail
 * rather than an in-place mutation of the historical receipt.
 */
export function deriveReceiptCorrectionsForMerge(input: {
  survivingDonorId: string;
  mergedDonorId: string;
  mergedDonorReceipts: ReceiptSnapshotRef[];
  decidedAt: string;
}): ReceiptMergeResult {
  const surviving = input.survivingDonorId.trim();
  const merged = input.mergedDonorId.trim();
  if (surviving === merged) {
    throw new Error("cannot derive receipt corrections for a self-merge");
  }

  return {
    preservedReceipts: input.mergedDonorReceipts.map((r) => ({ ...r })),
    corrections: input.mergedDonorReceipts.map((r) => ({
      donationId: r.donationId,
      originalReceiptName: r.receiptName,
      originalReceiptEmail: r.receiptEmail,
      linkedToDonorId: surviving,
      reason: `donor merge ${input.mergedDonorId} → ${input.survivingDonorId}; receipt snapshot preserved`,
      correctedAt: input.decidedAt,
    })),
  };
}
