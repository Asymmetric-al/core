import { describe, expect, it, vi } from "vitest";

import { executeContributionAction } from "../../../../../packages/api/src/admin/contribution-operations/actions";

describe("contribution operations action executor", () => {
  it("rejects high-risk actions without reason and confirmation", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: ["finance:manage_contributions"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "refund",
        payload: { amount: 1000 },
        dependencies: {},
      }),
    ).rejects.toThrow("reason");
  });

  it("executes receipt resend through the shared contract and writes audit", async () => {
    const sendReceipt = vi.fn().mockResolvedValue({
      status: "sent",
      sendLogId: "send_1",
    });
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
      tenantId: "tenant_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "resend_receipt",
      payload: { stagedGiftId: "staged_1" },
      dependencies: {
        sendReceipt,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(sendReceipt).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      stagedGiftId: "staged_1",
    });
    expect(appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        contributionId: "donation_1",
        actionType: "resend_receipt",
        sourceSurface: "donor_crm_record",
      }),
    );
    expect(result.auditEventId).toBe("audit_1");
    expect(result.canonicalContribution.id).toBe("donation_1");
    expect(result.providerOutcome).toEqual({
      provider: "resend",
      status: "sent",
      referenceId: "send_1",
    });
  });

  it("creates correction and audit records for donor relinking", async () => {
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const relinkDonor = vi.fn().mockResolvedValue({
      before: { donorId: "donor_old" },
      after: { donorId: "donor_new" },
    });
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
      donor: { id: "donor_new" },
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "donor_relink",
      reason: "Merged duplicate donor",
      confirmationToken: "confirm",
      payload: { donorId: "donor_new" },
      dependencies: {
        createCorrectionRecord,
        appendAuditEvent,
        relinkDonor,
        loadContributionDetail,
      },
    });

    expect(relinkDonor).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      contributionId: "donation_1",
      donorId: "donor_new",
    });
    expect(createCorrectionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        correctionType: "donor_relink",
        reason: "Merged duplicate donor",
      }),
    );
    expect(appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        correctionId: "correction_1",
        reason: "Merged duplicate donor",
      }),
    );
    expect(result.correctionId).toBe("correction_1");
    expect(result.auditEventId).toBe("audit_1");
  });
});
