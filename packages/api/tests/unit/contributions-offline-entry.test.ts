import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  recordOfflineContribution,
  type OfflineEntryDependencies,
} from "../../src/admin/contributions/offline-entry";

import type { OfflineContributionRequest } from "../../src/schemas/contributions-offline";

/**
 * TDD — offline entry orchestration (spec §6). Dependency-injected so the §6
 * invariants are provable with NO live DB.
 */

const actor = { tenantId: "tenant-1", actorProfileId: "profile-9" };

function deps(): OfflineEntryDependencies & {
  resolveKnownDonor: ReturnType<typeof vi.fn>;
  insertContribution: ReturnType<typeof vi.fn>;
  appendAudit: ReturnType<typeof vi.fn>;
} {
  return {
    resolveKnownDonor: vi.fn().mockResolvedValue({ donorId: "donor-created" }),
    insertContribution: vi
      .fn()
      .mockResolvedValue({ contributionId: "contrib-1" }),
    appendAudit: vi.fn().mockResolvedValue({ auditEventId: "audit-1" }),
  };
}

const unknownGift: OfflineContributionRequest = {
  donorMode: "unknown_offline",
  amount: 20,
  currency: "usd",
  receivedDate: "2026-07-01",
  method: "cash",
  designation: { fundId: "fund-1" },
};

const knownGift: OfflineContributionRequest = {
  donorMode: "known",
  donorInput: { firstName: "Ada", lastName: "Lovelace" },
  amount: 100,
  currency: "usd",
  receivedDate: "2026-07-01",
  method: "check",
  designation: { fundId: "fund-1" },
  anonymousToRecipient: true,
  receiptRequested: true,
};

describe("recordOfflineContribution", () => {
  let d: ReturnType<typeof deps>;
  beforeEach(() => {
    d = deps();
  });

  it("unknown gift NEVER resolves a donor, stores donor_id null, not receiptable", async () => {
    const res = await recordOfflineContribution({
      input: unknownGift,
      actor,
      deps: d,
    });

    expect(d.resolveKnownDonor).not.toHaveBeenCalled(); // §6.2 no fake donor data
    expect(res.donorId).toBeNull();
    expect(res.donorIdentityStatus).toBe("unknown_offline");
    expect(res.receiptStatus).toBe("not_receiptable");
    expect(d.insertContribution).toHaveBeenCalledWith(
      expect.objectContaining({
        donor_id: null,
        tenant_id: "tenant-1",
        entered_by_user_id: "profile-9",
        source: "offline",
        donor_identity_status: "unknown_offline",
      }),
    );
  });

  it("known gift resolves/creates a donor and stores donor_id", async () => {
    const res = await recordOfflineContribution({
      input: knownGift,
      actor,
      deps: d,
    });

    expect(d.resolveKnownDonor).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      donorId: undefined,
      donorInput: { firstName: "Ada", lastName: "Lovelace" },
    });
    expect(res.donorId).toBe("donor-created");
    expect(res.receiptStatus).toBe("pending");
    expect(d.insertContribution).toHaveBeenCalledWith(
      expect.objectContaining({
        donor_id: "donor-created",
        anonymous_to_recipient: true,
        source: "offline",
      }),
    );
  });

  it("always writes exactly one audit event tagged offline", async () => {
    await recordOfflineContribution({ input: unknownGift, actor, deps: d });
    expect(d.appendAudit).toHaveBeenCalledTimes(1);
    expect(d.appendAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "offline_gift_entry",
        sourceSurface: "offline",
        contributionId: "contrib-1",
        actorProfileId: "profile-9",
        donorMode: "unknown_offline",
      }),
    );
  });

  it("returns the created contribution + audit ids", async () => {
    const res = await recordOfflineContribution({
      input: knownGift,
      actor,
      deps: d,
    });
    expect(res.contributionId).toBe("contrib-1");
    expect(res.auditEventId).toBe("audit-1");
  });
});
