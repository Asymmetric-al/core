import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { resolveCorrectionApprovalPolicy } from "../../../../../packages/api/src/admin/contribution-operations/approval-policy";
import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { resolveTenantReceiptDeliveryPolicy } from "../../../../../packages/api/src/admin/contribution-operations/receipt-delivery";
import {
  actionRequestSchema,
  assertContributionRouteActionSupported,
  decisionRequestSchema,
  isContributionRouteActionSupported,
} from "../../../../../packages/api/src/admin/contribution-operations/route";
import {
  buildContributionReceiptDeliveryView,
  projectContributionDetailForViewer,
  projectCorrectionRequestsForViewer,
} from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";

import type { ContributionDetailInput } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import type { ContributionActionType } from "../../../../../packages/api/src/admin/contribution-operations/types";

const routeSource = readFileSync(
  new URL(
    "../../../../../packages/api/src/admin/contribution-operations/route.ts",
    import.meta.url,
  ),
  "utf8",
);

const VALID_ACTION_REQUEST = {
  contributionId: "00000000-0000-4000-8000-000000000001",
  actionType: "amount_correction",
  reason: "Correct donor-entered amount",
  payload: { amount: 20_000 },
};

describe("admin/contribution-operations route contract", () => {
  it("accepts the routed action source surfaces used by UI and jobs", () => {
    for (const sourceSurface of [
      "contribution_hub",
      "donor_crm_record",
      "automation",
      "bulk_action",
      "api",
    ]) {
      expect(
        actionRequestSchema.parse({
          ...VALID_ACTION_REQUEST,
          sourceSurface,
        }).sourceSurface,
      ).toBe(sourceSurface);
    }
  });

  it("defaults action requests to the api source surface", () => {
    expect(actionRequestSchema.parse(VALID_ACTION_REQUEST).sourceSurface).toBe(
      "api",
    );
  });

  it("accepts refund now that provider refund dependencies are wired", () => {
    expect(isContributionRouteActionSupported("refund")).toBe(true);
    expect(() =>
      assertContributionRouteActionSupported("refund"),
    ).not.toThrow();

    const parsed = actionRequestSchema.safeParse({
      ...VALID_ACTION_REQUEST,
      actionType: "refund",
      reason: "Donor requested a refund",
      confirmationToken: "confirm-refund",
      payload: { amount: 5_000 },
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data?.actionType).toBe("refund");
  });

  it("rejects action types this route dependency set cannot execute", () => {
    const unsupportedActions: ContributionActionType[] = [
      "approve_staged_gift",
      "retry_staged_gift",
      "crm_repost",
      "metadata_update",
      "donor_relink",
    ];

    for (const actionType of unsupportedActions) {
      const parsed = actionRequestSchema.safeParse({
        ...VALID_ACTION_REQUEST,
        actionType,
      });

      expect(isContributionRouteActionSupported(actionType)).toBe(false);
      expect(parsed.success).toBe(false);
      const postingAction = [
        "approve_staged_gift",
        "retry_staged_gift",
        "crm_repost",
      ].includes(actionType);
      if (postingAction) {
        expect(parsed.error?.issues[0]?.message).toMatch(
          /no longer an active product workflow.*historical evidence/i,
        );
        expect(() =>
          assertContributionRouteActionSupported(actionType),
        ).toThrow(/no longer an active product workflow.*historical evidence/i);
      } else {
        expect(parsed.error?.issues[0]?.message).toContain(
          "not supported by this route",
        );
        expect(() =>
          assertContributionRouteActionSupported(actionType),
        ).toThrow(/not supported by this route|dependencies are wired/);
      }
    }
  });

  it("accepts correction decision payloads", () => {
    expect(
      decisionRequestSchema.parse({
        decision: "approve",
        reason: "Finance reviewed the request",
        receiptDelivery: { choice: "defer", deferReason: "Batch later" },
      }),
    ).toEqual({
      decision: "approve",
      reason: "Finance reviewed the request",
      receiptDelivery: { choice: "defer", deferReason: "Batch later" },
    });
  });

  it("attaches receipt delivery context and per-request decision projection on GET", () => {
    const getSection = routeSource.slice(
      routeSource.indexOf("export const GET ="),
      routeSource.indexOf("export const POST ="),
    );

    expect(getSection).toContain("projectCorrectionRequestsForViewer(");
    expect(getSection).toContain('detail.shared.receiptStatus === "sent"');
    expect(getSection).toContain("buildContributionReceiptDeliveryView(");
    expect(getSection).toContain("loadReceiptDeliveryContext(");
    expect(getSection).toContain("receiptDelivery,");
  });

  it("gates the receipt snapshot PDF route on the tenant pdf capability and streams binary", () => {
    const pdfSection = routeSource.slice(
      routeSource.indexOf("export const GET_RECEIPT_SNAPSHOT_PDF ="),
    );

    expect(pdfSection).toContain("assertReceiptSnapshotPdfCapability({");
    expect(pdfSection).toContain(
      "viewerCapabilities: resolveContributionCapabilities(auth),",
    );
    expect(pdfSection).toContain("renderContributionReceiptSnapshotPdf({");
    expect(pdfSection).toContain('"cache-control": "no-store"');
    // The filename is sanitized to safe token characters before it reaches
    // the Content-Disposition header.
    expect(pdfSection).toContain('rendered.filename.replace(/[^\\w.-]/g, "_")');
    expect(pdfSection).toContain(
      '"content-disposition": `attachment; filename="${safeFilename}"`',
    );
    expect(pdfSection).toContain('"content-type": rendered.contentType');
    expect(pdfSection).toContain('roles: ["staff", "admin", "super_admin"]');
  });
});

function detailInputWithCorrectionRequests(
  correctionRequests: NonNullable<
    ContributionDetailInput["correctionRequests"]
  >,
): ContributionDetailInput {
  return {
    donation: {
      id: "donation-1",
      tenantId: "tenant-1",
      donorId: "donor-1",
      missionaryId: null,
      fundId: null,
      amount: 20_000,
      currency: "usd",
      status: "completed",
      donationType: "one_time",
      paymentMethod: "card",
      isRecurring: false,
      recurringInterval: null,
      notes: null,
      stripePaymentIntentId: null,
      stripeChargeId: null,
      giftDate: "2026-05-01",
      campaignId: null,
      pledgeId: null,
      processedAt: null,
      completedAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      refundedAt: null,
      refundAmount: 0,
      source: "online",
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
    },
    correctionRequests,
  };
}

describe("admin/contribution-operations GET payload projections", () => {
  const pendingRequest = {
    id: "req-1",
    actionType: "amount_correction",
    status: "pending",
    reason: "Donor reported a typo",
    requestedByProfileId: "profile-1",
    createdAt: "2026-05-02T00:00:00.000Z",
    receiptDeliveryProposal: { choice: "pdf" as const, deferReason: null },
    receiptAffectedFields: ["amount"],
  };

  it("carries receiptDeliveryProposal and viewerCanDecide per correction request", () => {
    const detail = buildContributionDetail(
      detailInputWithCorrectionRequests([pendingRequest]),
    );
    const projected = projectContributionDetailForViewer(detail, [
      "contributions.view_detail",
    ]);
    const policy = resolveCorrectionApprovalPolicy(null);

    const approverView = projectCorrectionRequestsForViewer(
      projected.correctionRequests,
      {
        policy,
        viewerProfileId: "profile-2",
        viewerCapabilities: ["contributions.approve_corrections"],
      },
    );
    expect(approverView[0]).toMatchObject({
      id: "req-1",
      receiptDeliveryProposal: { choice: "pdf" },
      receiptAffectedFields: ["amount"],
      viewerCanDecide: true,
    });

    const requesterView = projectCorrectionRequestsForViewer(
      projected.correctionRequests,
      {
        policy,
        viewerProfileId: "profile-1",
        viewerCapabilities: ["contributions.approve_corrections"],
      },
    );
    expect(requesterView[0].viewerCanDecide).toBe(false);
  });

  it("builds the receiptDelivery block from tenant policy and donor context", () => {
    const receiptDelivery = buildContributionReceiptDeliveryView({
      policy: resolveTenantReceiptDeliveryPolicy(null),
      donor: { email: null, doNotEmail: false },
      viewerCapabilities: ["contributions.manage_receipts"],
    });

    expect(receiptDelivery).toMatchObject({
      defaultChoice: "pdf",
      deferReasonRequired: true,
      requireDeliveryAction: false,
      donor: { email: null, doNotEmail: false },
    });
    expect(receiptDelivery.options.map((option) => option.choice)).toEqual([
      "email",
      "pdf",
      "defer",
    ]);
    expect(
      receiptDelivery.options.find((option) => option.choice === "email"),
    ).toMatchObject({ available: false });
  });

  it("keeps the concurrency revision stable when display-only receipt fields change", () => {
    const baseline = buildContributionDetail(
      detailInputWithCorrectionRequests([pendingRequest]),
    );
    const displayOnlyChange = buildContributionDetail(
      detailInputWithCorrectionRequests([
        {
          ...pendingRequest,
          receiptDeliveryProposal: {
            choice: "defer",
            deferReason: "Donor asked us to wait",
          },
          receiptAffectedFields: ["amount", "designation"],
        },
      ]),
    );
    const materialChange = buildContributionDetail(
      detailInputWithCorrectionRequests([
        { ...pendingRequest, status: "approved" },
      ]),
    );

    // receiptDeliveryProposal / receiptAffectedFields are display-only
    // context: they must never invalidate a concurrent save (ADR-CD-022).
    expect(displayOnlyChange.revision).toBe(baseline.revision);
    expect(materialChange.revision).not.toBe(baseline.revision);
  });
});
