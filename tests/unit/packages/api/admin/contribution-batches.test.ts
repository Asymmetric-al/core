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
import {
  processContributionBatch,
  processPersistedContributionBatch,
} from "../../../../../packages/api/src/admin/contribution-batches/process-batch";
import { batchRequestSchema } from "../../../../../packages/api/src/admin/contribution-batches/route";

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

  it("creates follow-up tasks for important failed records", async () => {
    const executeContributionAction = vi
      .fn()
      .mockRejectedValueOnce(new Error("Stripe failed"));
    const createFollowUpTask = vi.fn().mockResolvedValue("task_1");

    const result = await processContributionBatch({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      actionType: "refund",
      sourceSurface: "contribution_hub",
      records: [
        { id: "donation_1", stagedGiftId: "staged_1", receiptStatus: "sent" },
      ],
      executeContributionAction,
      createFollowUpTask,
    });

    expect(createFollowUpTask).toHaveBeenCalledWith(
      expect.objectContaining({
        contributionId: "donation_1",
        reason: "Stripe failed",
      }),
    );
    expect(result.summary.followUpTasksCreated).toBe(1);
    expect(result.results[0]?.taskId).toBe("task_1");
  });

  it("accepts high-risk and large background route inputs", () => {
    expect(() =>
      batchRequestSchema.parse({
        actionType: "refund",
        confirmationToken: "confirm",
        reason: "Bulk refund review",
        previewSnapshot: { previewId: "preview_1" },
        records: [
          {
            id: "00000000-0000-4000-8000-000000000001",
            stagedGiftId: null,
          },
        ],
      }),
    ).not.toThrow();
  });

  it("executes persisted batches with stored reason and confirmation", async () => {
    const itemUpdates: Array<Record<string, unknown>> = [];
    const batchUpdates: Array<Record<string, unknown>> = [];
    const supabaseAdmin = {
      from(table: string) {
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          order() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "contribution_hub",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batch_items") {
              itemUpdates.push(payload);
            } else {
              batchUpdates.push(payload);
            }
            return builder;
          },
        };

        if (table === "contribution_operation_batch_items") {
          builder.order = () =>
            Promise.resolve({
              data: [
                {
                  id: "item_1",
                  donation_id: "donation_1",
                  staged_gift_id: "staged_1",
                },
              ],
              error: null,
            }) as never;
        }

        return builder;
      },
    };
    const executeContributionAction = vi.fn().mockResolvedValue({
      auditEventId: "audit_1",
      taskIds: ["task_1"],
    });

    await processPersistedContributionBatch({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
      actorProfileId: "actor_1",
      actorPermissions: ["finance:manage_contributions"],
      executeContributionAction,
    });

    expect(executeContributionAction).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "bulk refund",
        confirmationToken: "confirm_1",
        actorPermissions: ["finance:manage_contributions"],
      }),
    );
    expect(itemUpdates).toContainEqual(
      expect.objectContaining({
        status: "succeeded",
        operation_audit_event_id: "audit_1",
        task_id: "task_1",
      }),
    );
    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "complete",
        processed_count: 1,
        succeeded_count: 1,
      }),
    );
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
