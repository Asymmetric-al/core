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
    expect(isBulkPreviewSkippable("crm_repost")).toBe(false);
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
    expect(getBulkContributionActionPolicy("allocation_correction")).toEqual(
      expect.objectContaining({
        riskLevel: "high",
        requiresPreview: true,
        backgroundRequired: true,
      }),
    );
    expect(getBulkContributionActionPolicy("crm_repost")).toEqual(
      expect.objectContaining({
        riskLevel: "high",
        requiresPreview: true,
      }),
    );
  });
});

describe("bulk contribution preview and execution", () => {
  it("runs small low-risk batches immediately and large batches in background", () => {
    expect(
      chooseContributionBatchExecutionMode({
        actionType: "resend_receipt",
        selectedCount: 10,
      }),
    ).toBe("immediate");

    expect(
      chooseContributionBatchExecutionMode({
        actionType: "resend_receipt",
        selectedCount: 11,
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
      actorCapabilities: ["contributions.run_refunds"],
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
        actorCapabilities: ["contributions.run_refunds"],
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
    const { batchRequestSchema, createContributionBatchSelectionHash } =
      await import("../../../../../packages/api/src/admin/contribution-batches/route");
    const records = [
      {
        id: "00000000-0000-4000-8000-000000000001",
        stagedGiftId: null,
        payload: { amount: 2500 },
      },
    ];

    const parsed = batchRequestSchema.parse({
      actionType: "refund",
      confirmationToken: "confirm",
      reason: "Bulk refund review",
      previewSnapshot: {
        previewId: "preview_1",
        totalCount: records.length,
        selectionHash: createContributionBatchSelectionHash({
          actionType: "refund",
          records,
        }),
      },
      records,
    });

    expect(parsed.records[0]?.payload).toEqual({ amount: 2500 });
  });

  it("rejects retired CRM repost batch inputs", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    const { batchRequestSchema } =
      await import("../../../../../packages/api/src/admin/contribution-batches/route");

    const parsed = batchRequestSchema.safeParse({
      actionType: "crm_repost",
      confirmationToken: "confirm",
      records: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          stagedGiftId: "00000000-0000-4000-8000-000000000002",
          payload: {},
        },
      ],
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate contribution ids in a batch request", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    const { batchRequestSchema, createContributionBatchSelectionHash } =
      await import("../../../../../packages/api/src/admin/contribution-batches/route");
    const records = [
      {
        id: "00000000-0000-4000-8000-000000000001",
        stagedGiftId: null,
        payload: { amount: 2500 },
      },
      {
        id: "00000000-0000-4000-8000-000000000001",
        stagedGiftId: null,
        payload: { amount: 5000 },
      },
    ];

    expect(() =>
      batchRequestSchema.parse({
        actionType: "refund",
        confirmationToken: "confirm",
        reason: "Bulk refund review",
        previewSnapshot: {
          previewId: "preview_1",
          totalCount: records.length,
          selectionHash: createContributionBatchSelectionHash({
            actionType: "refund",
            records,
          }),
        },
        records,
      }),
    ).toThrow("Duplicate contribution id in batch request.");
  });

  it("rejects mismatched high-risk preview snapshots", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";
    const {
      assertPreviewSnapshotMatchesBatchSelection,
      createContributionBatchSelectionHash,
    } =
      await import("../../../../../packages/api/src/admin/contribution-batches/route");
    const records = [
      {
        id: "00000000-0000-4000-8000-000000000001",
        stagedGiftId: null,
        payload: { amount: 2500 },
      },
    ];

    expect(() =>
      assertPreviewSnapshotMatchesBatchSelection({
        actionType: "refund",
        previewSnapshot: {
          previewId: "preview_1",
          totalCount: records.length,
          selectionHash: "wrong-hash",
        },
        records,
      }),
    ).toThrow("Preview snapshot does not match the selected contributions.");

    const originalSelectionHash = createContributionBatchSelectionHash({
      actionType: "refund",
      records,
    });
    expect(() =>
      assertPreviewSnapshotMatchesBatchSelection({
        actionType: "refund",
        previewSnapshot: {
          previewId: "preview_1",
          totalCount: records.length,
          selectionHash: originalSelectionHash,
        },
        records: [
          {
            ...records[0]!,
            payload: { amount: 5000 },
          },
        ],
      }),
    ).toThrow("Preview snapshot does not match the selected contributions.");
  });

  it("executes persisted batches with stored reason and confirmation", async () => {
    const itemUpdates: Array<Record<string, unknown>> = [];
    const batchUpdates: Array<Record<string, unknown>> = [];
    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim" | "claim-update" | "summary" = "summary";
        let activeItemUpdate: Record<string, unknown> | null = null;
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns?.includes("donation_id")
            ) {
              itemSelectMode = "claim";
            }
            if (
              table === "contribution_operation_batch_items" &&
              columns === "id" &&
              activeItemUpdate?.status === "running"
            ) {
              itemSelectMode = "claim-update";
            }
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          order() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batch_items") {
              itemUpdates.push(payload);
              activeItemUpdate = payload;
            } else {
              batchUpdates.push(payload);
            }
            return builder;
          },
          limit() {
            return Promise.resolve({
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
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            const value =
              table === "contribution_operation_batch_items" &&
              itemSelectMode === "summary"
                ? {
                    data: [
                      {
                        id: "item_1",
                        status: "succeeded",
                        task_id: "task_1",
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }
                : table === "contribution_operation_batch_items" &&
                    itemSelectMode === "claim-update"
                  ? {
                      data: [{ id: "item_1" }],
                      error: null,
                    }
                  : { error: null };
            return Promise.resolve(value).then(onfulfilled);
          },
        };

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
      actorCapabilities: ["contributions.run_refunds"],
      executeContributionAction,
    });

    expect(executeContributionAction).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "bulk refund",
        confirmationToken: "confirm_1",
        actorPermissions: ["finance:manage_contributions"],
        actorCapabilities: ["contributions.run_refunds"],
        sourceSurface: "bulk_action",
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

  it("retires persisted crm_repost batches without claiming items into the executor", async () => {
    const itemUpdates: Array<Record<string, unknown>> = [];
    const batchUpdates: Array<Record<string, unknown>> = [];
    let openItemsFailed = false;
    const supabaseAdmin = {
      from(table: string) {
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          order() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "crm_repost",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk repost",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
              created_at: new Date().toISOString(),
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batch_items") {
              itemUpdates.push(payload);
              if (payload.status === "failed") {
                openItemsFailed = true;
              }
            } else {
              batchUpdates.push(payload);
            }
            return builder;
          },
          limit(): never {
            throw new Error("Retired batches must not claim pending items.");
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            const value = {
              data: [
                {
                  id: "item_1",
                  status: openItemsFailed ? "failed" : "pending",
                  task_id: null,
                  updated_at: new Date().toISOString(),
                },
              ],
              error: null,
            };
            return Promise.resolve(value).then(onfulfilled);
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
      actorCapabilities: ["contributions.retry_crm_post"],
      executeContributionAction,
    });

    // Legacy rows retire cleanly: no executor call means no per-item
    // missing-dependency failures and no provider-failed follow-up tasks.
    expect(executeContributionAction).not.toHaveBeenCalled();
    expect(itemUpdates).toContainEqual(
      expect.objectContaining({
        status: "failed",
        error_message: expect.stringMatching(
          /no longer an active product workflow/i,
        ),
      }),
    );
    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        processed_count: 1,
        failed_count: 1,
        follow_up_task_count: 0,
      }),
    );
    expect(result.status).toBe("failed");
    expect(result.summary).toEqual(
      expect.objectContaining({ failed: 1, followUpTasksCreated: 0 }),
    );
  });

  it("selects a bounded candidate set before claiming persisted batch items", async () => {
    const pendingRows = [
      {
        id: "item_1",
        donation_id: "donation_1",
        staged_gift_id: "staged_1",
        payload: { amount: 1000 },
      },
      {
        id: "item_2",
        donation_id: "donation_2",
        staged_gift_id: "staged_2",
        payload: { amount: 2000 },
      },
      {
        id: "item_3",
        donation_id: "donation_3",
        staged_gift_id: "staged_3",
        payload: { amount: 3000 },
      },
    ];
    let requestedLimit: number | null = null;
    let claimedIds: string[] = [];

    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim" | "claim-update" | "summary" = "summary";
        let activeItemUpdate: Record<string, unknown> | null = null;
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns?.includes("donation_id")
            ) {
              itemSelectMode = "claim";
            }
            if (
              table === "contribution_operation_batch_items" &&
              columns === "id" &&
              activeItemUpdate?.status === "running"
            ) {
              itemSelectMode = "claim-update";
            }
            return builder;
          },
          eq() {
            return builder;
          },
          in(column: string, values: string[]) {
            if (
              table === "contribution_operation_batch_items" &&
              column === "id"
            ) {
              claimedIds = [...values];
            }
            return builder;
          },
          order() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batch_items") {
              activeItemUpdate = payload;
            }
            return builder;
          },
          limit(limit: number) {
            requestedLimit = limit;
            return Promise.resolve({
              data: pendingRows.slice(0, limit),
              error: null,
            }) as never;
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            const value =
              table === "contribution_operation_batch_items" &&
              itemSelectMode === "claim-update"
                ? {
                    data: claimedIds.map((id) => ({ id })),
                    error: null,
                  }
                : table === "contribution_operation_batch_items" &&
                    itemSelectMode === "summary"
                  ? {
                      data: [
                        {
                          id: "item_1",
                          status: "succeeded",
                          task_id: null,
                          updated_at: new Date().toISOString(),
                        },
                        {
                          id: "item_2",
                          status: "succeeded",
                          task_id: null,
                          updated_at: new Date().toISOString(),
                        },
                        {
                          id: "item_3",
                          status: "pending",
                          task_id: null,
                          updated_at: new Date().toISOString(),
                        },
                      ],
                      error: null,
                    }
                  : { error: null };
            return Promise.resolve(value).then(onfulfilled);
          },
        };

        return builder;
      },
    };
    const executeContributionAction = vi.fn().mockResolvedValue({
      auditEventId: "audit_1",
      taskIds: [],
    });

    const result = await processPersistedContributionBatch({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
      actorProfileId: "actor_1",
      actorCapabilities: ["contributions.run_refunds"],
      chunkSize: 2,
      executeContributionAction,
    });

    expect(requestedLimit).toBe(2);
    expect(claimedIds).toEqual(["item_1", "item_2"]);
    expect(executeContributionAction).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("running");
    expect(result.summary).toEqual(
      expect.objectContaining({
        processed: 2,
        succeeded: 2,
      }),
    );
  });

  it("updates persisted duplicate contribution rows by batch item id", async () => {
    const itemUpdates: Array<{
      id: string;
      payload: Record<string, unknown>;
    }> = [];
    let activeItemUpdate: Record<string, unknown> | null = null;

    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim" | "claim-update" | "summary" = "summary";
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns?.includes("donation_id")
            ) {
              itemSelectMode = "claim";
            }
            if (
              table === "contribution_operation_batch_items" &&
              columns === "id" &&
              activeItemUpdate?.status === "running"
            ) {
              itemSelectMode = "claim-update";
            }
            return builder;
          },
          eq(column: string, value: unknown) {
            if (
              table === "contribution_operation_batch_items" &&
              column === "id" &&
              activeItemUpdate
            ) {
              itemUpdates.push({
                id: String(value),
                payload: activeItemUpdate,
              });
            }
            return builder;
          },
          in() {
            return builder;
          },
          order() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batch_items") {
              activeItemUpdate = payload;
            }
            return builder;
          },
          limit() {
            return Promise.resolve({
              data: [
                {
                  id: "item_1",
                  donation_id: "donation_1",
                  staged_gift_id: "staged_1",
                  payload: { amount: 2500 },
                },
                {
                  id: "item_2",
                  donation_id: "donation_1",
                  staged_gift_id: "staged_2",
                  payload: { amount: 5000 },
                },
              ],
              error: null,
            }) as never;
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            const value =
              table === "contribution_operation_batch_items" &&
              itemSelectMode === "summary"
                ? {
                    data: [
                      {
                        id: "item_1",
                        status: "succeeded",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                      {
                        id: "item_2",
                        status: "failed",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }
                : table === "contribution_operation_batch_items" &&
                    itemSelectMode === "claim-update"
                  ? {
                      data: [{ id: "item_1" }, { id: "item_2" }],
                      error: null,
                    }
                  : { error: null };
            return Promise.resolve(value).then(onfulfilled);
          },
        };

        return builder;
      },
    };
    const executeContributionAction = vi
      .fn()
      .mockResolvedValueOnce({ auditEventId: "audit_1", taskIds: [] })
      .mockRejectedValueOnce(new Error("second item failed"));

    await processPersistedContributionBatch({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
      actorProfileId: "actor_1",
      actorCapabilities: ["contributions.run_refunds"],
      executeContributionAction,
    });

    expect(itemUpdates).toEqual([
      {
        id: "item_1",
        payload: expect.objectContaining({
          status: "succeeded",
          operation_audit_event_id: "audit_1",
        }),
      },
      {
        id: "item_2",
        payload: expect.objectContaining({
          status: "failed",
          error_message: "second item failed",
        }),
      },
    ]);
  });

  it("does not mark successful actions failed when result persistence fails", async () => {
    const itemUpdates: Array<Record<string, unknown>> = [];
    let activeItemUpdate: Record<string, unknown> | null = null;

    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim-update" | "summary" = "summary";
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns === "id" &&
              activeItemUpdate?.status === "running"
            ) {
              itemSelectMode = "claim-update";
            }
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          order() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batch_items") {
              activeItemUpdate = payload;
              itemUpdates.push(payload);
            }
            return builder;
          },
          limit() {
            return Promise.resolve({
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
          },
          then<TResult>(
            onfulfilled: (value: {
              error: { message: string } | null;
            }) => TResult,
          ): Promise<TResult> {
            const error =
              table === "contribution_operation_batch_items" &&
              activeItemUpdate?.status === "succeeded"
                ? { message: "result persistence failed" }
                : null;
            const value =
              table === "contribution_operation_batch_items" &&
              itemSelectMode === "claim-update"
                ? { data: [{ id: "item_1" }], error: null }
                : { error };
            return Promise.resolve(value).then(onfulfilled);
          },
        };

        return builder;
      },
    };
    const executeContributionAction = vi.fn().mockResolvedValue({
      auditEventId: "audit_1",
      taskIds: [],
    });

    await expect(
      processPersistedContributionBatch({
        supabaseAdmin: supabaseAdmin as never,
        tenantId: "tenant_1",
        batchId: "batch_1",
        actorProfileId: "actor_1",
        actorCapabilities: ["contributions.run_refunds"],
        executeContributionAction,
      }),
    ).rejects.toThrow("result persistence failed");

    expect(executeContributionAction).toHaveBeenCalledTimes(1);
    expect(itemUpdates.map((update) => update.status)).toEqual([
      "running",
      "succeeded",
    ]);
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

  it("requires the batch creator to process a persisted background batch", async () => {
    const executeContributionAction = vi.fn();
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
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
              created_by_profile_id: "actor_2",
            },
            error: null,
          }),
        };
        return builder;
      },
    };

    await expect(
      processPersistedContributionBatch({
        supabaseAdmin: supabaseAdmin as never,
        tenantId: "tenant_1",
        batchId: "batch_1",
        actorProfileId: "actor_1",
        executeContributionAction,
      }),
    ).rejects.toThrow(
      "Only the batch creator can process this contribution batch.",
    );
    expect(executeContributionAction).not.toHaveBeenCalled();
  });

  it("finalizes the batch when no pending rows are claimed", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim" | "summary" = "summary";
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns?.includes("donation_id")
            ) {
              itemSelectMode = "claim";
            }
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
          limit() {
            return Promise.resolve({ data: [], error: null }) as never;
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            const value =
              table === "contribution_operation_batch_items" &&
              itemSelectMode === "summary"
                ? {
                    data: [
                      {
                        id: "item_1",
                        status: "succeeded",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }
                : { error: null };
            return Promise.resolve(value).then(onfulfilled);
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

  it("uses immediate-mode terminal status semantics for persisted finalization", async () => {
    async function finalizeWithSummaryRows(
      summaryRows: Array<Record<string, unknown>>,
    ) {
      const batchUpdates: Array<Record<string, unknown>> = [];
      const supabaseAdmin = {
        from(table: string) {
          let itemSelectMode: "claim" | "summary" = "summary";
          const builder = {
            select(columns?: string) {
              if (
                table === "contribution_operation_batch_items" &&
                columns?.includes("donation_id")
              ) {
                itemSelectMode = "claim";
              }
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
              if (table === "contribution_operation_batches") {
                batchUpdates.push(payload);
              }
              return builder;
            },
            limit() {
              return Promise.resolve({ data: [], error: null }) as never;
            },
            then<TResult>(
              onfulfilled: (value: {
                data?: Array<Record<string, unknown>>;
                error: null;
              }) => TResult,
            ): Promise<TResult> {
              const value =
                table === "contribution_operation_batch_items" &&
                itemSelectMode === "summary"
                  ? { data: summaryRows, error: null }
                  : { error: null };
              return Promise.resolve(value).then(onfulfilled);
            },
          };

          return builder;
        },
      };

      const result = await processPersistedContributionBatch({
        supabaseAdmin: supabaseAdmin as never,
        tenantId: "tenant_1",
        batchId: "batch_1",
        actorProfileId: "actor_1",
        executeContributionAction: vi.fn(),
      });

      return { batchUpdates, result };
    }

    const skipped = await finalizeWithSummaryRows([
      {
        id: "item_1",
        status: "skipped",
        task_id: null,
        updated_at: new Date().toISOString(),
      },
    ]);
    expect(skipped.result.status).toBe("complete_with_issues");
    expect(skipped.batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "complete_with_issues",
        skipped_count: 1,
      }),
    );

    const failed = await finalizeWithSummaryRows([
      {
        id: "item_1",
        status: "failed",
        task_id: null,
        updated_at: new Date().toISOString(),
      },
    ]);
    expect(failed.result.status).toBe("failed");
    expect(failed.batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        failed_count: 1,
      }),
    );
  });

  it("does not complete the batch while claimed rows are still running", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim" | "summary" = "summary";
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns?.includes("donation_id")
            ) {
              itemSelectMode = "claim";
            }
            return builder;
          },
          eq() {
            return builder;
          },
          order() {
            return builder;
          },
          limit() {
            return Promise.resolve({ data: [], error: null }) as never;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
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
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            const value =
              table === "contribution_operation_batch_items" &&
              itemSelectMode === "summary"
                ? {
                    data: [
                      {
                        id: "item_1",
                        status: "running",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }
                : { error: null };
            return Promise.resolve(value).then(onfulfilled);
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
      executeContributionAction,
    });

    expect(executeContributionAction).not.toHaveBeenCalled();
    expect(result.status).toBe("running");
    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "running",
        processed_count: 0,
      }),
    );
    expect(batchUpdates[0]).not.toHaveProperty("finished_at");
  });

  it("fails stale running rows before finalizing an otherwise empty claim", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const itemUpdates: Array<Record<string, unknown>> = [];
    let summaryReads = 0;
    const staleUpdatedAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const supabaseAdmin = {
      from(table: string) {
        let itemSelectMode: "claim" | "summary" = "summary";
        let updatePayload: Record<string, unknown> | null = null;
        const builder = {
          select(columns?: string) {
            if (
              table === "contribution_operation_batch_items" &&
              columns?.includes("donation_id")
            ) {
              itemSelectMode = "claim";
            }
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          order() {
            return builder;
          },
          limit() {
            return Promise.resolve({ data: [], error: null }) as never;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            updatePayload = payload;
            if (table === "contribution_operation_batches") {
              batchUpdates.push(payload);
            }
            if (
              table === "contribution_operation_batch_items" &&
              payload.status === "failed"
            ) {
              itemUpdates.push(payload);
            }
            return builder;
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            if (
              table !== "contribution_operation_batch_items" ||
              itemSelectMode !== "summary" ||
              updatePayload
            ) {
              return Promise.resolve({ error: null }).then(onfulfilled);
            }

            summaryReads += 1;
            const value =
              summaryReads === 1
                ? {
                    data: [
                      {
                        id: "item_1",
                        status: "running",
                        task_id: null,
                        updated_at: staleUpdatedAt,
                      },
                    ],
                    error: null,
                  }
                : {
                    data: [
                      {
                        id: "item_1",
                        status: "failed",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  };
            return Promise.resolve(value).then(onfulfilled);
          },
        };

        return builder;
      },
    };

    const result = await processPersistedContributionBatch({
      supabaseAdmin: supabaseAdmin as never,
      tenantId: "tenant_1",
      batchId: "batch_1",
      actorProfileId: "actor_1",
      executeContributionAction: vi.fn(),
    });

    expect(itemUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        error_message:
          "Batch item processing timed out before a result was recorded.",
      }),
    );
    expect(result.status).toBe("failed");
    expect(result.summary.failed).toBe(1);
    expect(batchUpdates.at(-1)).toEqual(
      expect.objectContaining({
        status: "failed",
        finished_at: expect.any(String),
      }),
    );
  });

  it("fails stale open items before processing an abandoned persisted batch", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const itemUpdates: Array<Record<string, unknown>> = [];
    let summaryReads = 0;
    const staleCreatedAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const supabaseAdmin = {
      from(table: string) {
        let updatePayload: Record<string, unknown> | null = null;
        const builder = {
          select() {
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          single: async () => ({
            data: {
              id: "batch_1",
              operation: "refund",
              source_surface: "bulk_action",
              status: "running",
              reason: "bulk refund",
              confirmation_snapshot: { confirmationToken: "confirm_1" },
              created_at: staleCreatedAt,
            },
            error: null,
          }),
          update(payload: Record<string, unknown>) {
            updatePayload = payload;
            if (table === "contribution_operation_batches") {
              batchUpdates.push(payload);
            }
            if (table === "contribution_operation_batch_items") {
              itemUpdates.push(payload);
            }
            return builder;
          },
          then<TResult>(
            onfulfilled: (value: {
              data?: Array<Record<string, unknown>>;
              error: null;
            }) => TResult,
          ): Promise<TResult> {
            if (
              table !== "contribution_operation_batch_items" ||
              updatePayload
            ) {
              return Promise.resolve({ error: null }).then(onfulfilled);
            }

            summaryReads += 1;
            const value =
              summaryReads === 1
                ? {
                    data: [
                      {
                        id: "item_1",
                        status: "pending",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }
                : {
                    data: [
                      {
                        id: "item_1",
                        status: "failed",
                        task_id: null,
                        updated_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  };
            return Promise.resolve(value).then(onfulfilled);
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
      executeContributionAction,
    });

    expect(executeContributionAction).not.toHaveBeenCalled();
    expect(itemUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        error_message:
          "Batch processing timed out before all items recorded a result.",
      }),
    );
    expect(result.status).toBe("failed");
    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        failed_count: 1,
        finished_at: expect.any(String),
      }),
    );
  });

  it("marks a batch failed so persistence/processing errors never strand it as running", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const itemUpdates: Array<Record<string, unknown>> = [];
    const supabaseAdmin = {
      from(table: string) {
        const builder = {
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batches") {
              batchUpdates.push(payload);
            } else {
              itemUpdates.push(payload);
            }
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
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

    expect(itemUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        error_message:
          "Batch processing failed before this item recorded a result.",
      }),
    );
    expect(batchUpdates[0]).toEqual(
      expect.objectContaining({
        status: "failed",
        finished_at: expect.any(String),
      }),
    );
  });

  it("still marks the batch failed when open item cleanup fails", async () => {
    const batchUpdates: Array<Record<string, unknown>> = [];
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const supabaseAdmin = {
      from(table: string) {
        const builder = {
          update(payload: Record<string, unknown>) {
            if (table === "contribution_operation_batches") {
              batchUpdates.push(payload);
            }
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
            return builder;
          },
          then<TResult>(
            onfulfilled: (value: {
              error: { message: string } | null;
            }) => TResult,
          ): Promise<TResult> {
            return Promise.resolve({
              error:
                table === "contribution_operation_batch_items"
                  ? { message: "item cleanup failed" }
                  : null,
            }).then(onfulfilled);
          },
        };
        return builder;
      },
    };

    try {
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
    } finally {
      consoleError.mockRestore();
    }
  });

  it("never throws while marking a batch failed (best-effort cleanup)", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const supabaseAdmin = {
      from() {
        const builder = {
          update() {
            return builder;
          },
          eq() {
            return builder;
          },
          in() {
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

    try {
      await expect(
        markContributionBatchFailed({
          supabaseAdmin: supabaseAdmin as never,
          tenantId: "tenant_1",
          batchId: "batch_1",
        }),
      ).resolves.toBeUndefined();
    } finally {
      consoleError.mockRestore();
    }
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
