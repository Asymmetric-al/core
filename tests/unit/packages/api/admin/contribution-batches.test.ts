import { describe, expect, it, vi } from "vitest";

import {
  getBulkContributionActionPolicy,
  isBulkPreviewSkippable,
} from "../../../../../packages/api/src/admin/contribution-batches/action-catalog";
import {
  chooseContributionBatchExecutionMode,
  createContributionBatchPreview,
} from "../../../../../packages/api/src/admin/contribution-batches/preview";
import {
  buildContributionBatchCsv,
  summarizeContributionBatchResults,
} from "../../../../../packages/api/src/admin/contribution-batches/results";
import { processContributionBatch } from "../../../../../packages/api/src/admin/contribution-batches/process-batch";

describe("bulk contribution action catalog", () => {
  it("allows preview skipping only for configured low-risk actions", () => {
    expect(isBulkPreviewSkippable("resend_receipt")).toBe(true);
    expect(isBulkPreviewSkippable("crm_repost")).toBe(true);
    expect(isBulkPreviewSkippable("refund")).toBe(false);
    expect(isBulkPreviewSkippable("amount_correction")).toBe(false);
  });

  it("requires preview and background execution for high-risk actions", () => {
    expect(getBulkContributionActionPolicy("refund")).toEqual(
      expect.objectContaining({
        riskLevel: "high",
        requiresConfirmation: true,
        requiresPreview: true,
        backgroundRequired: true,
      }),
    );
  });
});

describe("bulk contribution preview and execution", () => {
  it("runs small low-risk batches immediately and large batches in background", () => {
    expect(
      chooseContributionBatchExecutionMode({
        actionType: "resend_receipt",
        selectedCount: 50,
      }),
    ).toBe("immediate");

    expect(
      chooseContributionBatchExecutionMode({
        actionType: "resend_receipt",
        selectedCount: 51,
      }),
    ).toBe("background");

    expect(
      chooseContributionBatchExecutionMode({
        actionType: "refund",
        selectedCount: 2,
      }),
    ).toBe("background");
  });

  it("uses the same planner for affected and skipped records", () => {
    const preview = createContributionBatchPreview({
      actionType: "resend_receipt",
      records: [
        {
          id: "donation_1",
          stagedGiftId: "staged_1",
          receiptStatus: "pending",
        },
        { id: "donation_2", stagedGiftId: null, receiptStatus: "pending" },
      ],
    });

    expect(preview.affectedRecords).toEqual([
      expect.objectContaining({ contributionId: "donation_1" }),
    ]);
    expect(preview.skippedRecords).toEqual([
      {
        contributionId: "donation_2",
        reason: "Missing staged gift id.",
      },
    ]);
    expect(preview.totalCount).toBe(2);
  });

  it("calls the shared contribution action executor for each executable item", async () => {
    const executeContributionAction = vi
      .fn()
      .mockResolvedValueOnce({ auditEventId: "audit_1", taskIds: [] })
      .mockRejectedValueOnce(new Error("Receipt failed"));

    const result = await processContributionBatch({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      actionType: "resend_receipt",
      sourceSurface: "contribution_hub",
      records: [
        {
          id: "donation_1",
          stagedGiftId: "staged_1",
          receiptStatus: "pending",
        },
        {
          id: "donation_2",
          stagedGiftId: "staged_2",
          receiptStatus: "pending",
        },
      ],
      executeContributionAction,
    });

    expect(executeContributionAction).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("complete_with_issues");
    expect(result.summary).toEqual({
      processed: 2,
      succeeded: 1,
      skipped: 0,
      failed: 1,
      followUpTasksCreated: 0,
    });
  });
});

describe("bulk contribution results", () => {
  it("summarizes mixed results as complete with issues", () => {
    expect(
      summarizeContributionBatchResults([
        { status: "succeeded" },
        { status: "skipped" },
        { status: "failed" },
      ]),
    ).toEqual({
      status: "complete_with_issues",
      processed: 3,
      succeeded: 1,
      skipped: 1,
      failed: 1,
      followUpTasksCreated: 0,
    });
  });

  it("exports CSV with required result fields", () => {
    const csv = buildContributionBatchCsv([
      {
        contributionId: "donation_1",
        donorName: "Ada Donor",
        donorEmail: "ada@example.com",
        amount: 10000,
        currency: "USD",
        action: "resend_receipt",
        status: "succeeded",
        auditEventId: "audit_1",
        taskId: null,
        timestamp: "2026-05-26T00:00:00.000Z",
      },
    ]);

    expect(csv).toContain("contributionId,donorName,donorEmail,amount");
    expect(csv).toContain("donation_1,Ada Donor,ada@example.com,10000");
  });
});
