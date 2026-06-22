import { describe, expect, it, vi } from "vitest";

import { executeContributionAction } from "../../../../../packages/api/src/admin/contribution-operations/actions";
import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";

const APPROVAL_SUPPRESSED_POLICY = resolveCorrectionApprovalPolicy({
  ownership_mode: "no_approval_required",
  suppressed_gates: [],
  stronger_approval_categories: [],
});

function makeCanonicalContribution(stagedGiftId = "staged_1") {
  return {
    id: "donation_1",
    tenantId: "tenant_1",
    stagedGift: { id: stagedGiftId },
  };
}

describe("contribution operations action executor", () => {
  it("rejects high-risk actions without reason and confirmation", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: ["finance:manage_contributions"],
        actorCapabilities: ["contributions.run_refunds"],
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
    const loadContributionDetail = vi
      .fn()
      .mockResolvedValue(makeCanonicalContribution());

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.manage_receipts"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "resend_receipt",
      payload: { stagedGiftId: " staged_1 " },
      dependencies: {
        sendReceipt,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(sendReceipt).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      contributionId: "donation_1",
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

  it("passes contribution identity to staged gift approval adapters", async () => {
    const approveStagedGift = vi.fn().mockResolvedValue(undefined);
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi
      .fn()
      .mockResolvedValue(makeCanonicalContribution());

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.apply_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "approve_staged_gift",
      reason: "Reviewed staging failure",
      payload: { stagedGiftId: " staged_1 " },
      dependencies: {
        approveStagedGift,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(approveStagedGift).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      contributionId: "donation_1",
      stagedGiftId: "staged_1",
      actorProfileId: "profile_1",
      note: "Reviewed staging failure",
    });
    expect(result.auditEventId).toBe("audit_1");
  });

  it("normalizes top-level staged gift IDs before calling staged adapters", async () => {
    const retryStagedGift = vi.fn().mockResolvedValue(undefined);
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi
      .fn()
      .mockResolvedValue(makeCanonicalContribution());

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.retry_crm_post"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      stagedGiftId: " staged_1 ",
      actionType: "retry_staged_gift",
      reason: "Retry parent gift post",
      payload: { scope: "parent" },
      dependencies: {
        retryStagedGift,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(retryStagedGift).toHaveBeenCalledWith(
      expect.objectContaining({
        contributionId: "donation_1",
        stagedGiftId: "staged_1",
      }),
    );
    expect(appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        stagedGiftId: "staged_1",
      }),
    );
  });

  it.each([
    {
      actionType: "resend_receipt" as const,
      actorCapabilities: ["contributions.manage_receipts"],
      dependencies: {
        sendReceipt: vi.fn(),
        appendAuditEvent: vi.fn(),
      },
    },
    {
      actionType: "approve_staged_gift" as const,
      actorCapabilities: ["contributions.apply_corrections"],
      dependencies: {
        approveStagedGift: vi.fn(),
        appendAuditEvent: vi.fn(),
      },
      reason: "Reviewed staging failure",
    },
    {
      actionType: "retry_staged_gift" as const,
      actorCapabilities: ["contributions.retry_crm_post"],
      dependencies: {
        retryStagedGift: vi.fn(),
        appendAuditEvent: vi.fn(),
      },
      payload: { stagedGiftId: "staged_other", scope: "parent" },
      reason: "Retry parent gift post",
    },
  ])(
    "rejects $actionType when the staged gift does not belong to the contribution",
    async ({
      actionType,
      actorCapabilities,
      dependencies,
      payload,
      reason,
    }) => {
      const loadContributionDetail = vi
        .fn()
        .mockResolvedValue(makeCanonicalContribution("staged_expected"));
      const actionDependencies = {
        ...dependencies,
        loadContributionDetail,
      };

      await expect(
        executeContributionAction({
          tenantId: "tenant_1",
          actorProfileId: "profile_1",
          actorPermissions: [],
          actorCapabilities,
          sourceSurface: "donor_crm_record",
          contributionId: "donation_1",
          actionType,
          reason,
          payload: payload ?? { stagedGiftId: "staged_other" },
          dependencies: actionDependencies,
        }),
      ).rejects.toThrow(/staged gift not found for contribution/i);

      expect(loadContributionDetail).toHaveBeenCalledWith({
        tenantId: "tenant_1",
        contributionId: "donation_1",
      });
      expect(actionDependencies.appendAuditEvent).not.toHaveBeenCalled();
      for (const adapterKey of [
        "sendReceipt",
        "approveStagedGift",
        "retryStagedGift",
      ] as const) {
        const adapter = (
          actionDependencies as Record<typeof adapterKey, unknown>
        )[adapterKey];
        if (adapter) {
          expect(adapter).not.toHaveBeenCalled();
        }
      }
    },
  );

  it("requires the receipt management capability for receipt resends", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.view_detail"],
        sourceSurface: "donor_crm_record",
        contributionId: "donation_1",
        actionType: "resend_receipt",
        payload: { stagedGiftId: "staged_1" },
        dependencies: {
          sendReceipt: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/manage_receipts/);
  });

  it("rejects metadata updates until the mutation adapter exists", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.apply_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "metadata_update",
        payload: { note: "internal note" },
        dependencies: {
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/metadata_update is not implemented/);
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
      expectedRevision: "rev_relink",
      payload: { donorId: " donor_new " },
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
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
      expectedRevision: "rev_relink",
      idempotencyKey: expect.stringMatching(
        /^contribution-action\/tenant_1\/donation_1\/donor_relink\/confirmation-[0-9a-f]{32}$/,
      ),
    });
    expect(createCorrectionRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        correctionType: "donor_relink",
        afterSummary: { donorId: "donor_new" },
        reason: "Merged duplicate donor",
      }),
    );
    expect(appendAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        afterSummary: { donorId: "donor_new" },
        correctionId: "correction_1",
        reason: "Merged duplicate donor",
      }),
    );
    expect(result.correctionId).toBe("correction_1");
    expect(result.auditEventId).toBe("audit_1");
  });

  it("routes donor relinks through correction requests under default approval policy", async () => {
    const relinkDonor = vi.fn();
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_7");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "donor_relink",
      reason: "Merged duplicate donor",
      confirmationToken: "confirm",
      payload: { donorId: "donor_new" },
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: {
        relinkDonor,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(relinkDonor).not.toHaveBeenCalled();
    expect(createCorrectionRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "donor_relink",
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/donor_relink\/confirmation-[0-9a-f]{32}$/,
        ),
        payload: { donorId: "donor_new" },
      }),
    );
    expect(result.approvalStatus).toBe("pending_approval");
    expect(result.correctionRequestId).toBe("request_7");
  });

  it("uses normalized donor IDs for direct fallback idempotency keys", async () => {
    const relinkDonor = vi.fn().mockResolvedValue({
      before: { donorId: "donor_old" },
      after: { donorId: "donor_new" },
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
      donor: { id: "donor_new" },
    });
    const sharedDependencies = {
      relinkDonor,
      createCorrectionRecord,
      appendAuditEvent,
      loadContributionDetail,
    };
    const baseInput = {
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.apply_corrections"],
      sourceSurface: "contribution_hub" as const,
      contributionId: "donation_1",
      actionType: "donor_relink" as const,
      reason: "Merged duplicate donor",
      confirmationToken: "confirm",
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      dependencies: sharedDependencies,
    };

    await executeContributionAction({
      ...baseInput,
      payload: { donorId: " donor_new " },
    });
    await executeContributionAction({
      ...baseInput,
      payload: { donorId: "donor_new" },
    });
    await executeContributionAction({
      ...baseInput,
      payload: { donorId: "donor_other" },
    });

    const idempotencyKeys = relinkDonor.mock.calls.map(
      ([call]) => call.idempotencyKey,
    );
    expect(idempotencyKeys[0]).toMatch(
      /^contribution-action\/tenant_1\/donation_1\/donor_relink\/confirmation-[0-9a-f]{32}$/,
    );
    expect(idempotencyKeys[1]).toBe(idempotencyKeys[0]);
    expect(idempotencyKeys[2]).not.toBe(idempotencyKeys[0]);
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
      idempotencyKey: expect.stringMatching(
        /^correction\/tenant_1\/donation_1\/amount_correction\/confirmation-[0-9a-f]{32}$/,
      ),
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

  it("normalizes and scopes direct correction fallback idempotency keys", async () => {
    const applyCorrection = vi.fn().mockResolvedValue({
      before: { amount: 1000 },
      after: { amount: 1200 },
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });
    const sharedDependencies = {
      applyCorrection,
      createCorrectionRecord,
      appendAuditEvent,
      loadContributionDetail,
    };
    const baseInput = {
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.apply_corrections"],
      sourceSurface: "contribution_hub" as const,
      contributionId: "donation_1",
      actionType: "amount_correction" as const,
      reason: "Corrected imported check amount",
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      dependencies: sharedDependencies,
    };

    await executeContributionAction({
      ...baseInput,
      confirmationToken: " confirm ",
      payload: { amount: 1200 },
    });
    await executeContributionAction({
      ...baseInput,
      actorProfileId: "profile_2",
      confirmationToken: "confirm",
      expectedRevision: "rev_retry",
      payload: { amount: 1200 },
      reason: "Retry after ambiguous provider response",
      sourceSurface: "api",
    });
    await executeContributionAction({
      ...baseInput,
      confirmationToken: "confirm",
      payload: { amount: 1300 },
    });

    const idempotencyKeys = applyCorrection.mock.calls.map(
      ([call]) => call.idempotencyKey,
    );
    expect(idempotencyKeys[0]).toMatch(
      /^correction\/tenant_1\/donation_1\/amount_correction\/confirmation-[0-9a-f]{32}$/,
    );
    expect(idempotencyKeys[1]).toBe(idempotencyKeys[0]);
    expect(idempotencyKeys[2]).not.toBe(idempotencyKeys[0]);
  });

  it("requires an idempotency key before direct generic corrections", async () => {
    const applyCorrection = vi.fn();

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.apply_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "allocation_correction",
        reason: "Split between two funds",
        payload: { allocations: [{ fundId: "fund_2", amount: 500 }] },
        dependencies: {
          applyCorrection,
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/idempotency key/);

    expect(applyCorrection).not.toHaveBeenCalled();
  });

  it("validates approved correction requests and applies the persisted payload", async () => {
    const validateApprovedCorrectionRequest = vi.fn().mockResolvedValue({
      payload: { amount: 1200 },
      reason: "Approved correction request",
    });
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
      actorProfileId: "approver_1",
      actorPermissions: [],
      actorCapabilities: [
        "contributions.approve_corrections",
        "contributions.apply_corrections",
      ],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "amount_correction",
      reason: "Caller supplied override",
      approvedRequestId: "request_1",
      payload: { amount: 9999 },
      dependencies: {
        validateApprovedCorrectionRequest,
        applyCorrection,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(validateApprovedCorrectionRequest).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      contributionId: "donation_1",
      actionType: "amount_correction",
      approvedRequestId: "request_1",
      actorProfileId: "approver_1",
      actorCapabilities: [
        "contributions.approve_corrections",
        "contributions.apply_corrections",
      ],
      expectedRevision: null,
      requestedPayload: { amount: 9999 },
    });
    expect(applyCorrection).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { amount: 1200 },
        reason: "Approved correction request",
        idempotencyKey:
          "approved-correction/tenant_1/donation_1/amount_correction/request_1",
      }),
    );
  });

  it("requires the approval capability before applying an approved request", async () => {
    const validateApprovedCorrectionRequest = vi.fn();

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "approver_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.apply_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "amount_correction",
        confirmationToken: "confirm",
        approvedRequestId: "request_1",
        payload: { amount: 1200 },
        dependencies: {
          validateApprovedCorrectionRequest,
          applyCorrection: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/approve_corrections/);

    expect(validateApprovedCorrectionRequest).not.toHaveBeenCalled();
  });

  it("requires the direct apply capability before applying approved donor relinks", async () => {
    const validateApprovedCorrectionRequest = vi.fn();

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "approver_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.approve_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "donor_relink",
        approvedRequestId: "request_relink",
        payload: { donorId: "donor_new" },
        dependencies: {
          validateApprovedCorrectionRequest,
          relinkDonor: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/apply_corrections/);

    expect(validateApprovedCorrectionRequest).not.toHaveBeenCalled();
  });

  it("requires provider capabilities before applying approved provider requests", async () => {
    const validateApprovedCorrectionRequest = vi.fn();

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "approver_1",
        actorPermissions: [],
        actorCapabilities: [
          "contributions.approve_corrections",
          "contributions.apply_corrections",
        ],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "refund",
        reason: "Approved refund request",
        confirmationToken: "confirm",
        approvedRequestId: "request_refund",
        payload: { amount: 500 },
        dependencies: {
          validateApprovedCorrectionRequest,
          refundContribution: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/run_refunds/);

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "approver_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.approve_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "stripe_replay",
        reason: "Approved replay request",
        confirmationToken: "confirm",
        approvedRequestId: "request_replay",
        payload: { stripeEventId: "evt_123" },
        dependencies: {
          validateApprovedCorrectionRequest,
          replayStripeEvent: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/use_provider_actions/);

    expect(validateApprovedCorrectionRequest).not.toHaveBeenCalled();
  });

  it("uses the approved request id as the idempotency key for approved provider applies", async () => {
    const validateApprovedCorrectionRequest = vi.fn().mockResolvedValue({
      payload: { amount: 500 },
      reason: "Approved refund request",
    });
    const refundContribution = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "succeeded",
      referenceId: "refund_1",
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "approver_1",
      actorPermissions: [],
      actorCapabilities: [
        "contributions.approve_corrections",
        "contributions.run_refunds",
      ],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "refund",
      approvedRequestId: "request_refund",
      payload: { amount: 999 },
      dependencies: {
        validateApprovedCorrectionRequest,
        refundContribution,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(refundContribution).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 500,
        reason: "Approved refund request",
        confirmationToken: "request_refund",
        idempotencyKey:
          "approved-contribution-action/tenant_1/donation_1/refund/request_refund",
      }),
    );
  });

  it("requires approved request validation before bypassing request creation", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "approver_1",
        actorPermissions: [],
        actorCapabilities: [
          "contributions.approve_corrections",
          "contributions.apply_corrections",
        ],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "amount_correction",
        confirmationToken: "confirm",
        approvedRequestId: "request_1",
        payload: { amount: 1200 },
        dependencies: {
          applyCorrection: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/validateApprovedCorrectionRequest/);
  });

  it("records failed provider outcomes for refund attempts", async () => {
    const refundContribution = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "failed",
      errorCode: "card_error",
      errorMessage: "Refund failed for donor@example.com",
      raw: { cardholderName: "Sensitive Name" },
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
      actorCapabilities: ["contributions.run_refunds"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "refund",
      reason: "Duplicate payment",
      confirmationToken: "confirm",
      payload: { amount: 500 },
      expectedRevision: "rev_1",
      idempotencyKey: "refund-key-1",
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
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
    const correctionProviderOutcome =
      createCorrectionRecord.mock.calls[0]?.[0]?.providerOutcome;
    const auditProviderOutcome =
      appendAuditEvent.mock.calls[0]?.[0]?.providerOutcome;

    expect(correctionProviderOutcome).not.toHaveProperty("raw");
    expect(auditProviderOutcome).not.toHaveProperty("raw");
    expect(result.providerOutcome).not.toHaveProperty("raw");
    expect(correctionProviderOutcome?.errorMessage).toBe(
      "Provider action failed. Check provider logs for details.",
    );
    expect(correctionProviderOutcome?.errorMessage).not.toContain(
      "donor@example.com",
    );
    expect(refundContribution).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmationToken: "confirm",
        expectedRevision: "rev_1",
        idempotencyKey: "refund-key-1",
      }),
    );
    expect(result.providerOutcome?.status).toBe("failed");
  });

  it("rejects fractional refund amounts before calling the provider", async () => {
    const refundContribution = vi.fn();

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: ["finance:manage_contributions"],
        actorCapabilities: ["contributions.run_refunds"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "refund",
        reason: "Duplicate payment",
        confirmationToken: "confirm",
        payload: { amount: 12.34 },
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        dependencies: {
          refundContribution,
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/positive safe integer/);

    expect(refundContribution).not.toHaveBeenCalled();
  });

  it("normalizes and scopes direct provider fallback idempotency keys", async () => {
    const refundContribution = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "succeeded",
      referenceId: "refund_1",
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });
    const sharedDependencies = {
      refundContribution,
      createCorrectionRecord,
      appendAuditEvent,
      loadContributionDetail,
    };
    const baseInput = {
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.run_refunds"],
      sourceSurface: "contribution_hub" as const,
      contributionId: "donation_1",
      actionType: "refund" as const,
      reason: "Duplicate payment",
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      dependencies: sharedDependencies,
    };

    await executeContributionAction({
      ...baseInput,
      confirmationToken: " confirm ",
      payload: { amount: 500 },
    });
    await executeContributionAction({
      ...baseInput,
      actorProfileId: "profile_2",
      confirmationToken: "confirm",
      expectedRevision: "rev_retry",
      payload: { amount: 500 },
      reason: "Retry after ambiguous provider response",
      sourceSurface: "api",
    });
    await executeContributionAction({
      ...baseInput,
      confirmationToken: "confirm",
      payload: { amount: 700 },
    });

    const idempotencyKeys = refundContribution.mock.calls.map(
      ([call]) => call.idempotencyKey,
    );
    expect(idempotencyKeys[0]).toMatch(
      /^contribution-action\/tenant_1\/donation_1\/refund\/confirmation-[0-9a-f]{32}$/,
    );
    expect(idempotencyKeys[1]).toBe(idempotencyKeys[0]);
    expect(idempotencyKeys[2]).not.toBe(idempotencyKeys[0]);
    expect(
      refundContribution.mock.calls.map(([call]) => call.confirmationToken),
    ).toEqual(["confirm", "confirm", "confirm"]);
  });

  it("routes Stripe replay through a dedicated provider adapter and audit trail", async () => {
    const replayStripeEvent = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "queued_for_replay",
      referenceId: "evt_123",
      errorMessage: "Replay queued for donor@example.com",
      raw: { customerEmail: "donor@example.com" },
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
      actorCapabilities: ["contributions.use_provider_actions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "stripe_replay",
      reason: "Recover missing webhook",
      confirmationToken: "confirm",
      expectedRevision: "rev_replay",
      payload: { stripeEventId: "evt_123" },
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      dependencies: {
        replayStripeEvent,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(replayStripeEvent).toHaveBeenCalledWith({
      contributionId: "donation_1",
      expectedRevision: "rev_replay",
      idempotencyKey: expect.stringMatching(
        /^contribution-action\/tenant_1\/donation_1\/stripe_replay\/confirmation-[0-9a-f]{32}$/,
      ),
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
    const correctionProviderOutcome =
      createCorrectionRecord.mock.calls[0]?.[0]?.providerOutcome;

    expect(correctionProviderOutcome).not.toHaveProperty("raw");
    expect(correctionProviderOutcome?.errorMessage).toBeNull();
    expect(result.providerOutcome).not.toHaveProperty("raw");
    expect(result.providerOutcome?.referenceId).toBe("evt_123");
  });

  it("allows Stripe replay dependencies to derive the provider event id server-side", async () => {
    const replayStripeEvent = vi.fn().mockResolvedValue({
      provider: "stripe",
      status: "queued_for_replay",
      referenceId: "evt_latest",
    });
    const createCorrectionRecord = vi.fn().mockResolvedValue("correction_1");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.use_provider_actions"],
      sourceSurface: "contribution_hub",
      contributionId: "donation_1",
      actionType: "stripe_replay",
      reason: "Recover missing webhook",
      confirmationToken: "confirm",
      payload: {},
      approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
      dependencies: {
        replayStripeEvent,
        createCorrectionRecord,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(replayStripeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        contributionId: "donation_1",
        payload: {},
        tenantId: "tenant_1",
      }),
    );
  });

  it("routes Stripe replay through correction requests under default approval policy", async () => {
    const replayStripeEvent = vi.fn();
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_8");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "stripe_replay",
      reason: "Recover missing webhook",
      confirmationToken: "confirm",
      payload: { stripeEventId: "evt_123" },
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: {
        replayStripeEvent,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(replayStripeEvent).not.toHaveBeenCalled();
    expect(createCorrectionRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "stripe_replay",
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/stripe_replay\/confirmation-[0-9a-f]{32}$/,
        ),
        payload: { stripeEventId: "evt_123" },
      }),
    );
    expect(result.approvalStatus).toBe("pending_approval");
    expect(result.correctionRequestId).toBe("request_8");
  });

  it("freezes derived Stripe replay event ids when opening approval requests", async () => {
    const replayStripeEvent = vi.fn();
    const resolveReplayStripeEventId = vi.fn().mockResolvedValue("evt_frozen");
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_8");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "stripe_replay",
      reason: "Recover missing webhook",
      confirmationToken: "confirm",
      payload: {},
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: {
        replayStripeEvent,
        resolveReplayStripeEventId,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(replayStripeEvent).not.toHaveBeenCalled();
    expect(resolveReplayStripeEventId).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      contributionId: "donation_1",
      payload: {},
    });
    expect(createCorrectionRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "stripe_replay",
        payload: { stripeEventId: "evt_frozen" },
      }),
    );
  });

  it("routes refunds through correction requests under default approval policy", async () => {
    const refundContribution = vi.fn();
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_9");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const result = await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "refund",
      reason: "Donor requested a refund",
      confirmationToken: "confirm",
      payload: { amount: 500 },
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: {
        refundContribution,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(refundContribution).not.toHaveBeenCalled();
    expect(createCorrectionRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "refund",
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/refund\/confirmation-[0-9a-f]{32}$/,
        ),
      }),
    );
    expect(result.approvalStatus).toBe("pending_approval");
    expect(result.correctionRequestId).toBe("request_9");
  });

  it("requires the run_refunds capability for direct refunds when approval is suppressed", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.request_corrections"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "refund",
        reason: "Duplicate payment",
        confirmationToken: "confirm",
        payload: { amount: 500 },
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        dependencies: {
          refundContribution: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/run_refunds/);
  });

  it("does not let the legacy permission bypass direct provider capabilities", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: ["finance:manage_contributions"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "refund",
        reason: "Duplicate payment",
        confirmationToken: "confirm",
        payload: { amount: 500 },
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        dependencies: {
          refundContribution: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/run_refunds/);

    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: ["finance:manage_contributions"],
        sourceSurface: "contribution_hub",
        contributionId: "donation_1",
        actionType: "stripe_replay",
        reason: "Recover missing webhook",
        confirmationToken: "confirm",
        payload: { stripeEventId: "evt_123" },
        approvalPolicy: APPROVAL_SUPPRESSED_POLICY,
        dependencies: {
          replayStripeEvent: vi.fn(),
          createCorrectionRecord: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/use_provider_actions/);
  });

  it("requires the CRM retry capability for staged gift retries", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.view_detail"],
        sourceSurface: "donor_crm_record",
        contributionId: "donation_1",
        actionType: "retry_staged_gift",
        payload: { stagedGiftId: "staged_1" },
        dependencies: {
          retryStagedGift: vi.fn(),
          appendAuditEvent: vi.fn(),
          loadContributionDetail: vi.fn(),
        },
      }),
    ).rejects.toThrow(/retry_crm_post/);
  });

  it("retries a single designation child record without reposting unrelated lines", async () => {
    const retryDesignationPost = vi.fn().mockResolvedValue(undefined);
    const retryStagedGift = vi.fn();
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi
      .fn()
      .mockResolvedValue(makeCanonicalContribution());

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.retry_crm_post"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "retry_staged_gift",
      payload: {
        stagedGiftId: " staged_1 ",
        scope: "designation",
        allocationId: " alloc_2 ",
      },
      dependencies: {
        retryDesignationPost,
        retryStagedGift,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(retryDesignationPost).toHaveBeenCalledWith(
      expect.objectContaining({
        allocationId: "alloc_2",
        contributionId: "donation_1",
        stagedGiftId: "staged_1",
      }),
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

  it("passes contribution identity to parent staged gift retry adapters", async () => {
    const retryStagedGift = vi.fn().mockResolvedValue(undefined);
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi
      .fn()
      .mockResolvedValue(makeCanonicalContribution());

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.retry_crm_post"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "retry_staged_gift",
      reason: "Retry parent gift post",
      payload: {
        stagedGiftId: " staged_1 ",
        scope: "parent",
      },
      dependencies: {
        retryStagedGift,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(retryStagedGift).toHaveBeenCalledWith({
      tenantId: "tenant_1",
      contributionId: "donation_1",
      stagedGiftId: "staged_1",
      actorProfileId: "profile_1",
      note: "Retry parent gift post",
    });
  });

  it("surfaces the adapter limitation when child record retries are unsupported", async () => {
    await expect(
      executeContributionAction({
        tenantId: "tenant_1",
        actorProfileId: "profile_1",
        actorPermissions: [],
        actorCapabilities: ["contributions.retry_crm_post"],
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
          loadContributionDetail: vi
            .fn()
            .mockResolvedValue(makeCanonicalContribution()),
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
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/amount_correction\/confirmation-[0-9a-f]{32}$/,
        ),
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

  it("includes request context in confirmation-token correction request idempotency", async () => {
    const applyCorrection = vi.fn();
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_2");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    const sharedDependencies = {
      applyCorrection,
      createCorrectionRequest,
      appendAuditEvent,
      loadContributionDetail,
    };

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "amount_correction",
      reason: "Donor reported the wrong amount",
      confirmationToken: "confirm",
      payload: { amount: 1500 },
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: sharedDependencies,
    });
    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_2",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "amount_correction",
      reason: "Different requester with the same acknowledgement token",
      confirmationToken: "confirm",
      payload: { amount: 1500 },
      approvalPolicy: resolveCorrectionApprovalPolicy(null),
      dependencies: sharedDependencies,
    });

    expect(applyCorrection).not.toHaveBeenCalled();
    expect(createCorrectionRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/amount_correction\/confirmation-[0-9a-f]{32}$/,
        ),
      }),
    );
    expect(createCorrectionRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/amount_correction\/confirmation-[0-9a-f]{32}$/,
        ),
      }),
    );
    const firstKey = createCorrectionRequest.mock.calls[0]?.[0]?.idempotencyKey;
    const secondKey =
      createCorrectionRequest.mock.calls[1]?.[0]?.idempotencyKey;
    expect(secondKey).not.toBe(firstKey);
  });

  it("derives context-specific idempotency for pending correction requests without confirmation tokens", async () => {
    const applyCorrection = vi.fn();
    const createCorrectionRequest = vi.fn().mockResolvedValue("request_2");
    const appendAuditEvent = vi.fn().mockResolvedValue("audit_1");
    const loadContributionDetail = vi.fn().mockResolvedValue({
      id: "donation_1",
    });

    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "allocation_correction",
      reason: "Split between two funds",
      payload: {
        allocations: [
          { fundId: "fund_2", amount: 500 },
          { amount: 250, fundId: "fund_3" },
        ],
      },
      approvalPolicy: resolveCorrectionApprovalPolicy({
        ownership_mode: "separation_of_duties",
        suppressed_gates: [],
        stronger_approval_categories: ["allocation_correction"],
      }),
      dependencies: {
        applyCorrection,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });
    await executeContributionAction({
      tenantId: "tenant_1",
      actorProfileId: "profile_2",
      actorPermissions: [],
      actorCapabilities: ["contributions.request_corrections"],
      sourceSurface: "donor_crm_record",
      contributionId: "donation_1",
      actionType: "allocation_correction",
      reason: "Same allocation requested by another staff member",
      payload: {
        allocations: [
          { fundId: "fund_2", amount: 500 },
          { amount: 250, fundId: "fund_3" },
        ],
      },
      approvalPolicy: resolveCorrectionApprovalPolicy({
        ownership_mode: "separation_of_duties",
        suppressed_gates: [],
        stronger_approval_categories: ["allocation_correction"],
      }),
      dependencies: {
        applyCorrection,
        createCorrectionRequest,
        appendAuditEvent,
        loadContributionDetail,
      },
    });

    expect(applyCorrection).not.toHaveBeenCalled();
    expect(createCorrectionRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        actionType: "allocation_correction",
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/allocation_correction\/context-[0-9a-f]{32}$/,
        ),
      }),
    );
    expect(createCorrectionRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        actionType: "allocation_correction",
        idempotencyKey: expect.stringMatching(
          /^correction-request\/tenant_1\/donation_1\/allocation_correction\/context-[0-9a-f]{32}$/,
        ),
      }),
    );
    const firstKey = createCorrectionRequest.mock.calls[0]?.[0]?.idempotencyKey;
    const secondKey =
      createCorrectionRequest.mock.calls[1]?.[0]?.idempotencyKey;
    expect(secondKey).not.toBe(firstKey);
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
