import { describe, expect, it } from "vitest";

import {
  buildMergeCandidate,
  planDonorMerge,
  deriveReceiptCorrectionsForMerge,
  type ReceiptSnapshotRef,
} from "../../src/donate/guest/donor-merge";

/**
 * TDD — merge candidate + auditable merge workflow (Conrad §2.5–§2.6).
 * Terminology LAW: canonical / surviving / primary vs duplicate / secondary /
 * merged — never the legacy dominant/subordinate naming. Merge marks the duplicate merged/redirected (not
 * deleted) and is fully auditable. Receipt snapshots are NOT rewritten.
 */

describe("buildMergeCandidate — opens a reviewable candidate, never an auto-merge (§2.2/§2.4)", () => {
  it("creates an OPEN candidate carrying confidence + signals for human/agent review", () => {
    const mc = buildMergeCandidate({
      id: "mc-1",
      tenantId: "tenant-a",
      existingDonorId: "donor-1",
      incomingDonorId: "donor-2",
      confidence: "possible",
      signals: ["name_exact", "address_similar"],
      createdAt: "2026-07-04T00:00:00Z",
    });
    expect(mc.status).toBe("open");
    expect(mc.confidence).toBe("possible");
    expect(mc.signals).toContain("name_exact");
    expect(mc.existingDonorId).toBe("donor-1");
  });
});

describe("planDonorMerge — auditable, marks duplicate merged/redirected not deleted (§2.5)", () => {
  const base = {
    tenantId: "tenant-a",
    survivingDonorId: "donor-1",
    mergedDonorId: "donor-2",
    actorId: "user-9",
    actorType: "staff" as const,
    reason: "Same household, confirmed by phone",
    confidenceSignals: ["name_exact", "address_similar"] as const,
    affectedRecords: { donations: 3, pledges: 1 },
    decidedAt: "2026-07-04T12:00:00Z",
  };

  it("produces an audit record with who/what/when/why/confidence-signals/affected-records", () => {
    const plan = planDonorMerge({
      ...base,
      confidenceSignals: [...base.confidenceSignals],
    });
    expect(plan.audit.survivingDonorId).toBe("donor-1"); // canonical / surviving
    expect(plan.audit.mergedDonorId).toBe("donor-2"); // duplicate / secondary
    expect(plan.audit.actorId).toBe("user-9");
    expect(plan.audit.actorType).toBe("staff");
    expect(plan.audit.reason).toMatch(/household/);
    expect(plan.audit.confidenceSignals).toContain("address_similar");
    expect(plan.audit.affectedRecords.donations).toBe(3);
    expect(plan.audit.decidedAt).toBe("2026-07-04T12:00:00Z");
  });

  it("marks the DUPLICATE record merged + redirected to the canonical record — never deletes it", () => {
    const plan = planDonorMerge({
      ...base,
      confidenceSignals: [...base.confidenceSignals],
    });
    expect(plan.mergedRecordUpdate.donorId).toBe("donor-2");
    expect(plan.mergedRecordUpdate.recordStatus).toBe("merged");
    expect(plan.mergedRecordUpdate.mergedIntoDonorId).toBe("donor-1"); // redirect pointer
    // there is no delete anywhere in the plan
    expect(JSON.stringify(plan)).not.toMatch(/delete/i);
  });

  it("rejects a self-merge (surviving === merged)", () => {
    expect(() =>
      planDonorMerge({
        ...base,
        mergedDonorId: "donor-1",
        confidenceSignals: [...base.confidenceSignals],
      }),
    ).toThrow();
  });

  it("rejects a merge with no reason (auditability requires a why)", () => {
    expect(() =>
      planDonorMerge({
        ...base,
        reason: "  ",
        confidenceSignals: [...base.confidenceSignals],
      }),
    ).toThrow();
  });

  it("rejects a merge with no tenant id because audit attribution must be tenant-scoped", () => {
    expect(() =>
      planDonorMerge({
        ...base,
        tenantId: " ",
        confidenceSignals: [...base.confidenceSignals],
      }),
    ).toThrow("merge requires a tenant id for the audit record");
  });
});

describe("deriveReceiptCorrectionsForMerge — receipt truth preserved, not silently rewritten (§2.6)", () => {
  const receipts: ReceiptSnapshotRef[] = [
    {
      donationId: "don-1",
      receiptName: "Ada Lovelace",
      receiptEmail: "ada@example.com",
    },
    {
      donationId: "don-2",
      receiptName: "A. Lovelace",
      receiptEmail: "ada.l@work.com",
    },
  ];

  it("keeps each receipt's original snapshot and emits a correction linking it to the surviving donor", () => {
    const out = deriveReceiptCorrectionsForMerge({
      survivingDonorId: "donor-1",
      mergedDonorId: "donor-2",
      mergedDonorReceipts: receipts,
      decidedAt: "2026-07-04T12:00:00Z",
    });
    // snapshots unchanged
    expect(out.preservedReceipts).toEqual(receipts);
    // a correction per receipt, pointing to the canonical donor, WITHOUT mutating the snapshot
    expect(out.corrections).toHaveLength(2);
    const c0 = out.corrections[0]!;
    expect(c0.donationId).toBe("don-1");
    expect(c0.originalReceiptName).toBe("Ada Lovelace");
    expect(c0.originalReceiptEmail).toBe("ada@example.com");
    expect(c0.linkedToDonorId).toBe("donor-1");
    expect(c0.reason).toMatch(/merge/i);
  });
});
