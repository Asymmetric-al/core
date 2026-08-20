import { createHash } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getBulkContributionActionPolicy } from "./action-catalog";
import { chooseContributionBatchExecutionMode } from "./preview";
import {
  markContributionBatchFailed,
  processContributionBatch,
  processPersistedContributionBatch,
} from "./process-batch";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import {
  withOperation,
  type OperationRouteContext,
} from "../../shared/with-operation";
import { executeContributionAction } from "../contribution-operations/actions";
import { parseContributionCommand } from "../contribution-operations/command";
import { createContributionActionDependencies } from "../contribution-operations/dependencies";
import {
  assertContributionActionPermission,
  hasContributionPermission,
  resolveContributionCapabilities,
} from "../contribution-operations/permissions";
import { createMissionControlTaskInSupabase } from "../mission-control-tasks/store";

const batchRecordSchema = z.object({
  id: z.string().uuid(),
  stagedGiftId: z.string().uuid().nullable().optional(),
  receiptStatus: z.string().nullable().optional(),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

const previewSnapshotSchema = z
  .object({
    previewId: z.string().trim().min(1),
    totalCount: z.number().int().positive(),
    selectionHash: z.string().trim().min(1),
  })
  .passthrough();

export const batchRequestSchema = z
  .object({
    actionType: z.enum([
      "resend_receipt",
      "refund",
      "donor_relink",
      "amount_correction",
      "designation_correction",
      "fund_correction",
      "allocation_correction",
      "payment_state_correction",
      "stripe_replay",
    ]),
    confirmationToken: z.string().min(1),
    reason: z.string().trim().min(1).optional(),
    previewSnapshot: previewSnapshotSchema.optional(),
    records: z.array(batchRecordSchema).min(1).max(1000),
  })
  .superRefine((body, ctx) => {
    const seenRecordIds = new Set<string>();

    for (const [index, record] of body.records.entries()) {
      if (seenRecordIds.has(record.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["records", index, "id"],
          message: "Duplicate contribution id in batch request.",
        });
        continue;
      }

      seenRecordIds.add(record.id);
    }
  });

type BatchRequestBody = z.infer<typeof batchRequestSchema>;

function normalizeSelectionValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeSelectionValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, normalizeSelectionValue(item)]),
    );
  }

  return value;
}

export function createContributionBatchSelectionHash(input: {
  actionType: BatchRequestBody["actionType"];
  records: BatchRequestBody["records"];
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        actionType: input.actionType,
        records: input.records.map((record) => ({
          id: record.id,
          stagedGiftId: record.stagedGiftId ?? null,
          payload: normalizeSelectionValue(record.payload ?? {}),
        })),
      }),
    )
    .digest("hex");
}

export function assertPreviewSnapshotMatchesBatchSelection(input: {
  actionType: BatchRequestBody["actionType"];
  previewSnapshot: BatchRequestBody["previewSnapshot"] | undefined;
  records: BatchRequestBody["records"];
}) {
  if (!input.previewSnapshot) {
    throw new ApiHttpError(
      400,
      "High-risk bulk contribution actions require a preview snapshot.",
    );
  }

  if (input.previewSnapshot.totalCount !== input.records.length) {
    throw new ApiHttpError(
      400,
      "Preview snapshot does not match the selected contribution count.",
    );
  }

  const expectedHash = createContributionBatchSelectionHash({
    actionType: input.actionType,
    records: input.records,
  });
  if (input.previewSnapshot.selectionHash !== expectedHash) {
    throw new ApiHttpError(
      400,
      "Preview snapshot does not match the selected contributions.",
    );
  }
}

async function getBatchIdFromRouteContext(
  routeContext: OperationRouteContext | undefined,
) {
  const params = await routeContext?.params;
  const batchId = params?.batchId;
  if (Array.isArray(batchId)) {
    return batchId[0] ?? null;
  }

  return typeof batchId === "string" && batchId.length > 0 ? batchId : null;
}

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const body = batchRequestSchema.parse(await ensureJsonBody(request));
      const executionMode = chooseContributionBatchExecutionMode({
        actionType: body.actionType,
        selectedCount: body.records.length,
      });
      const bulkPolicy = getBulkContributionActionPolicy(body.actionType);
      assertContributionActionPermission(auth, body.actionType);
      const actorPermissions = hasContributionPermission(
        auth,
        "finance:manage_contributions",
      )
        ? (["finance:manage_contributions"] as const)
        : [];
      const actorCapabilities = resolveContributionCapabilities(auth);

      if (bulkPolicy.riskLevel === "high" && !body.reason) {
        throw new ApiHttpError(
          400,
          "High-risk bulk contribution actions require a reason.",
        );
      }
      if (bulkPolicy.riskLevel === "high") {
        assertPreviewSnapshotMatchesBatchSelection({
          actionType: body.actionType,
          previewSnapshot: body.previewSnapshot,
          records: body.records,
        });
      }

      if (executionMode === "background") {
        const { data, error } = await supabaseAdmin
          .from("contribution_operation_batches")
          .insert({
            tenant_id: auth.tenantId,
            operation: body.actionType,
            risk_level: bulkPolicy.riskLevel,
            source_surface: "bulk_action",
            status: "running",
            execution_mode: "background",
            total_count: body.records.length,
            reason: body.reason ?? null,
            selection_snapshot: {
              records: body.records,
            },
            preview_snapshot: body.previewSnapshot ?? {},
            confirmation_snapshot: {
              confirmationToken: body.confirmationToken,
            },
            created_by_profile_id: auth.profileId,
            started_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        const batchId = (data as { id?: string } | null)?.id ?? null;

        if (batchId) {
          const { error: itemError } = await supabaseAdmin
            .from("contribution_operation_batch_items")
            .insert(
              body.records.map((record, index) => ({
                batch_id: batchId,
                tenant_id: auth.tenantId,
                record_index: index,
                resource_type: "donation",
                resource_id: record.id,
                donation_id: record.id,
                staged_gift_id: record.stagedGiftId ?? null,
                payload: record.payload ?? {},
                status: "pending",
                result: {},
              })),
            );
          if (itemError) {
            // The batch row already exists as `running`; without this it
            // would be stranded there forever after the item insert failed.
            await markContributionBatchFailed({
              supabaseAdmin,
              tenantId: auth.tenantId,
              batchId,
            });
            throw new Error(itemError.message);
          }
        }

        return NextResponse.json({
          batch: {
            id: batchId,
            status: "running",
            executionMode,
            summary: {
              processed: 0,
              succeeded: 0,
              skipped: 0,
              failed: 0,
              followUpTasksCreated: 0,
            },
          },
          nextAction: batchId
            ? {
                method: "POST",
                href: `/api/admin/contribution-batches/${batchId}/process`,
              }
            : null,
          requestId,
        });
      }

      const contributionActionDependencies =
        createContributionActionDependencies(supabaseAdmin);
      const batch = await processContributionBatch({
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        actionType: body.actionType,
        sourceSurface: "bulk_action",
        reason: body.reason ?? null,
        confirmationToken: body.confirmationToken,
        actorPermissions: [...actorPermissions],
        actorCapabilities,
        records: body.records.map((record) => ({
          id: record.id,
          receiptStatus: record.receiptStatus,
          stagedGiftId: record.stagedGiftId ?? null,
          payload: record.payload ?? {},
        })),
        executeContributionAction: (actionInput) => {
          const { actionType, payload, ...rest } = actionInput;
          return executeContributionAction({
            ...rest,
            command: parseContributionCommand(actionType, payload),
            actorPermissions: actionInput.actorPermissions ?? [],
            actorCapabilities: actionInput.actorCapabilities,
            confirmationToken: body.confirmationToken,
            reason: body.reason ?? actionInput.reason,
            dependencies: contributionActionDependencies,
          });
        },
        createFollowUpTask: async ({ contributionId, reason }) => {
          const result = await createMissionControlTaskInSupabase({
            supabaseAdmin,
            tenantId: auth.tenantId,
            title: "Resolve bulk contribution action failure",
            description: reason,
            issueType:
              body.actionType === "resend_receipt"
                ? "receipt_failed"
                : "provider_failed",
            actorProfileId: auth.profileId,
            linkedRecords: [
              {
                type: "contribution",
                id: contributionId,
              },
            ],
          });

          return result.taskId;
        },
      });

      return NextResponse.json({ batch, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to process contribution batch.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

export const POST_PROCESS_BATCH = withOperation(
  async ({ auth, requestId, routeContext, supabaseAdmin }) => {
    try {
      const batchId = await getBatchIdFromRouteContext(routeContext);
      if (!batchId) {
        throw new ApiHttpError(400, "Missing batch id.");
      }

      const contributionActionDependencies =
        createContributionActionDependencies(supabaseAdmin);
      const batch = await processPersistedContributionBatch({
        supabaseAdmin,
        tenantId: auth.tenantId,
        batchId,
        actorProfileId: auth.profileId,
        actorPermissions: hasContributionPermission(
          auth,
          "finance:manage_contributions",
        )
          ? ["finance:manage_contributions"]
          : [],
        actorCapabilities: resolveContributionCapabilities(auth),
        assertActionPermission: (actionType) =>
          assertContributionActionPermission(auth, actionType),
        executeContributionAction: (actionInput) => {
          const { actionType, payload, ...rest } = actionInput;
          return executeContributionAction({
            ...rest,
            command: parseContributionCommand(actionType, payload),
            actorPermissions: actionInput.actorPermissions ?? [],
            actorCapabilities: actionInput.actorCapabilities,
            confirmationToken: actionInput.confirmationToken,
            reason: actionInput.reason,
            dependencies: contributionActionDependencies,
          });
        },
        createFollowUpTask: async ({ contributionId, reason, actionType }) => {
          const result = await createMissionControlTaskInSupabase({
            supabaseAdmin,
            tenantId: auth.tenantId,
            title: "Resolve bulk contribution action failure",
            description: reason,
            issueType:
              actionType === "resend_receipt"
                ? "receipt_failed"
                : "provider_failed",
            actorProfileId: auth.profileId,
            linkedRecords: [
              {
                type: "contribution",
                id: contributionId,
              },
            ],
          });

          return result.taskId;
        },
      });

      return NextResponse.json({ batch, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to process contribution batch.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
