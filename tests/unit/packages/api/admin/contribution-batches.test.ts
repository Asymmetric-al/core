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
  markContributionBatchFailed,
  processContributionBatch,
  processPersistedContributionBatch,
} from "../../../../../packages/api/src/admin/contribution-batches/process-batch";

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

  it("passes per-record payload through for immediate high-risk records", async () => {
    const executeContributionAction = vi
      .fn()
      .mockResolvedValue({ auditEventId: "audit_1", taskIds: [] });

    const result = await processContributionBatch({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      actionType: "refund",
      sourceSurface: "contribution_hub",
      reason: "Bulk refund review",
      confirmationToken: "confirm",
      actorPermissions: ["finance:manage_contributions"],
      records: [
        {
          id: "donation_1",
          stagedGiftId: null,
          payload: { amount: 2500 },
        },
      ],
      executeContributionAction,
    });

    expect(executeContributionAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "refund",
        contributionId: "donation_1",
        reason: "Bulk refund review",
        confirmationToken: "confirm",
        actorPermissions: ["finance:manage_contributions"],
        payload: { amount: 2500 },
      }),
    );
    expect(result.status).toBe("complete");
  });

  it("skips destructive corrections when required payload is missing", async () => {
    const executeContributionAction = vi.fn();

    const result = await processContributionBatch({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      actionType: "fund_correction",
      sourceSurface: "contribution_hub",
      reason: "Correct designation",
      confirmationToken: "confirm",
      actorPermissions: ["finance:manage_contributions"],
      records: [{ id: "donation_1", stagedGiftId: null, payload: {} }],
      executeContributionAction,
    });

    expect(executeContributionAction).not.toHaveBeenCalled();
    expect(result.results[0]).toEqual(
      expect.objectContaining({
        contributionId: "donation_1",
        status: "skipped",
        skipReason: "Missing payload.fundId for fund correction.",
      }),
    );
    expect(result.summary).toEqual(
      expect.objectContaining({ processed: 1, skipped: 1, succeeded: 0 }),
    );
  });

  it("preserves explicit correction payload for executable records", async () => {
    const executeContributionAction = vi
      .fn()
      .mockResolvedValue({ auditEventId: "audit_1", taskIds: [] });

    await processContributionBatch({
      tenantId: "tenant_1",
      actorProfileId: "actor_1",
      actionType: "fund_correction",
      sourceSurface: "contribution_hub",
      reason: "Correct designation",
      confirmationToken: "confirm",
      actorPermissions: ["finance:manage_contributions"],
      records: [
        {
          id: "donation_1",
          stagedGiftId: null,
          payload: { fundId: "fund_1" },
        },
      ],
      executeContributionAction,
    });

    expect(executeContributionAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: "fund_correction",
        contributionId: "donation_1",
        payload: { fundId: "fund_1" },
      }),
    );
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
        {
          id: "donation_1",
          stagedGiftId: "staged_1",
          receiptStatus: "sent",
          payload: { amount: 2500 },
        },
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

  it("accepts high-risk and large background route inputs", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    const { batchRequestSchema } =
      await import("../../../../../packages/api/src/admin/contribution-batches/route");

    const parsed = batchRequestSchema.parse({
      actionType: "refund",
      confirmationToken: "confirm",
      reason: "Bulk refund review",
      previewSnapshot: { previewId: "preview_1" },
      records: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          stagedGiftId: null,
          payload: { amount: 2500 },
        },
      ],
    });

    expect(parsed.records[0]?.payload).toEqual({ amount: 2500 });
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
                  payload: { amount: 2500 },
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
        payload: { amount: 2500 },
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

  it("does not rerun already finished persisted batches", async () => {
    const supabaseAdmin = {
      from() {
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "contribution_hub",
              status: "complete",
              processed_count: 3,
              succeeded_count: 2,
              skipped_count: 0,
              failed_count: 1,
              follow_up_task_count: 1,
            },
            error: null,
          }),
        };
        return builder;
      },
    };
    const executeContributionAction = vi.fn();

    const result = await processPersistedContributionBatch({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
      actorProfileId: "actor_1",
      actorPermissions: ["finance:manage_contributions"],
      executeContributionAction,
    });

    expect(executeContributionAction).not.toHaveBeenCalled();
    expect(result.summary).toEqual({
      processed: 3,
      succeeded: 2,
      skipped: 0,
      failed: 1,
      followUpTasksCreated: 1,
    });
  });

  it("finalizes the batch when no pending rows are claimed", async () => {
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
            return Promise.resolve({ data: [], error: null }) as never;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "contribution_hub",
              status: "running",
              processed_count: 1,
              succeeded_count: 1,
              skipped_count: 0,
              failed_count: 0,
              follow_up_task_count: 0,
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batches") {
              batchUpdates.push(payload);
            }
            return builder;
          },
        };

        return builder;
      },
    };
    const executeContributionAction = vi.fn();

    const result = await processPersistedContributionBatch({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
      actorProfileId: "actor_1",
      actorPermissions: ["finance:manage_contributions"],
      executeContributionAction,
    });

    expect(executeContributionAction).not.toHaveBeenCalled();
    expect(result.status).toBe("complete");
    expect(result.summary.succeeded).toBe(1);
    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "complete",
        finished_at: expect.any(String),
      }),
    );
  });

  it("marks a batch failed so persistence/processing errors never strand it as running", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const supabaseAdmin = {
      from() {
        const builder = {
          update(payload: Record<string, unknown>) {
            batchUpdates.push(payload);
            return builder;
          },
          eq() {
            return builder;
          },
          then<TResult>(
            onfulfilled: (value: { error: null }) => TResult,
          ): Promise<TResult> {
            return Promise.resolve({ error: null }).then(onfulfilled);
          },
        };
        return builder;
      },
    };

    await markContributionBatchFailed({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
    });

    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        finished_at: expect.any(String),
      }),
    );
  });

  it("never throws while marking a batch failed (best-effort cleanup)", async () => {
    const supabaseAdmin = {
      from() {
        const builder = {
          update() {
            return builder;
          },
          eq() {
            return builder;
          },
          then<TResult>(
            onfulfilled: (value: { error: { message: string } }) => TResult,
          ): Promise<TResult> {
            return Promise.resolve({
              error: { message: "connection lost" },
            }).then(onfulfilled);
          },
        };
        return builder;
      },
    };

    await expect(
      markContributionBatchFailed({
        supabaseAdmin: supabaseAdmin as never,
        tenantId: "tenant_1",
        batchId: "batch_1",
      }),
    ).resolves.toBeUndefined();
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
