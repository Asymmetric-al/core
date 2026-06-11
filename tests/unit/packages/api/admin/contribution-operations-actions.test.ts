import { describe, expect, it, vi } from "vitest";

import { executeContributionAction } from "../../../../../packages/api/src/admin/contribution-operations/actions";
import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";

const APPROVAL_SUPPRESSED_POLICY = resolveCorrectionApprovalPolicy({
  ownership_mode: "no_approval_required",
  suppressed_gates: [],
  stronger_approval_categories: [],
});

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

  it("applies amount corrections before writing correction and audit records", async () => {
    const applyCorrection = vi.fn().mockResolvedValue({
      before: { amount: 1000 },
      after: { amount: 1200 },
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
      amount: { value: 1200 },
    });

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "amount_correction",
      reason: "Corrected imported check amount",
      confirmationToken: "confirm",
      payload: { amount: 1200 },
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      dependencies: {
        applyCorrection,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(applyCorrection).toHaveBeenCalledWith({
      actionType: "amount_correction",
      contributionId: "donation_1",
      payload: { amount: 1200 },
      tenantId: "tenant_1",
      reason: "Corrected imported check amount",
      actorProfileId: "profile_1",
      sourceSurface: "contribution_hub",
      expectedRevision: null,
      idempotencyKey:
        "correction/tenant_1/donation_1/amount_correction/confirm",
    });
    expect(createCorrectionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeSummary: { amount: 1000 },
        afterSummary: { amount: 1200 },
        correctionType: "amount_correction",
        status: "applied",
      }),
    );
  });

  it("records failed provider outcomes for refund attempts", async () => {
    const refundContribution = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "failed",
      errorCode: "card_error",
      errorMessage: "Refund failed",
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "refund",
      reason: "Duplicate payment",
      confirmationToken: "confirm",
      payload: { amount: 500 },
      dependencies: {
        refundContribution,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(createCorrectionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        providerOutcome: expect.objectContaining({
          provider: "stripe",
          status: "failed",
        }),
      }),
    );
    expect(refundContribution).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmationToken: "confirm",
      }),
    );
    expect(result.providerOutcome?.status).toBe("failed");
  });

  it("routes Stripe replay through a dedicated provider adapter and audit trail", async () => {
    const replayStripeEvent = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "queued_for_replay",
      referenceId: "evt_123",
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: ["finance:manage_contributions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "stripe_replay",
      reason: "Recover missing webhook",
      confirmationToken: "confirm",
      payload: { stripeEventId: "evt_123" },
      dependencies: {
        replayStripeEvent,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(replayStripeEvent).toHaveBeenCalledWith({
      contributionId: "donation_1",
      payload: { stripeEventId: "evt_123" },
      tenantId: "tenant_1",
    });
    expect(createCorrectionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        correctionType: "stripe_replay",
        providerOutcome: expect.objectContaining({
          referenceId: "evt_123",
          status: "queued_for_replay",
        }),
      }),
    );
    expect(result.providerOutcome?.referenceId).toBe("evt_123");
  });

  it("retries a single designation child record without reposting unrelated lines", async () => {
    const retryDesignationPost = vi.fn().mockResolvedValue(undefined);
    const retryStagedGift = vi.fn();
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "retry_staged_gift",
      payload: {
        stagedGiftId: "staged_1",
        scope: "designation",
        allocationId: "alloc_2",
      },
      dependencies: {
        retryDesignationPost,
        retryStagedGift,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(retryDesignationPost).toHaveBeenCalledWith(
      expect.objectContaining({ allocationId: "alloc_2" }),
    );
    expect(retryStagedGift).not.toHaveBeenCalled();
    expect(appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        downstreamEffects: expect.objectContaining({
          retryScope: "designation",
          allocationId: "alloc_2",
        }),
      }),
    );
  });

  it("surfaces the adapter limitation when child record retries are unsupported", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        sourceSurface: "donor_crm_record",
        contributionId: "donation_1",
        actionType: "retry_staged_gift",
        payload: {
          stagedGiftId: "staged_1",
          scope: "designation",
          allocationId: "alloc_2",
        },
        dependencies: {
          retryStagedGift: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/does not support posting designation child records/i);
  });

  it("creates a correction request instead of applying high-risk corrections under default policy", async () => {
    const applyCorrection = vi.fn();
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: ["finance:manage_contributions"],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "amount_correction",
      reason: "Donor reported the wrong amount",
      confirmationToken: "confirm",
      payload: { amount: 1500 },
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: {
        applyCorrection,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(applyCorrection).not.toHaveBeenCalled();
    expect(createCorrectionRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant_1",
        contributionId: "donation_1",
        actionType: "amount_correction",
        payload: { amount: 1500 },
        reason: "Donor reported the wrong amount",
        requestedByProfileId: "profile_1",
        sourceSurface: "donor_crm_record",
      }),
    );
    expect(result.correctionRequestId).toBe("request_1");
    expect(result.approvalStatus).toBe("pending_approval");
    expect(result.correctionId).toBeFalsy();
  });

  it("requires the request capability to open a correction request", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.view_detail"],
        sourceSurface: "donor_crm_record",
        contributionId: "donation_1",
        actionType: "allocation_correction",
        reason: "Split between two funds",
        payload: { fundId: "fund_2" },
        approvalPolicy: resolveCorrectionApprovalPolicy({
          ownership_mode: "separation_of_duties",
          suppressed_gates: [],
          stronger_approval_categories: ["allocation_correction"],
        }),
        dependencies: {
          createCorrectionRequest: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/request_corrections/);
  });

  it("requires the apply capability for direct high-risk corrections when approval is suppressed", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.request_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "amount_correction",
        reason: "fix",
        confirmationToken: "confirm",
        payload: { amount: 100 },
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        dependencies: {
          applyCorrection: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/apply_corrections|finance:manage_contributions/);
  });
});
