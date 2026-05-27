import { after, NextResponse } from "next/server";
import { z } from "zod";

import { chooseContributionBatchExecutionMode } from "./preview";
import {
  processContributionBatch,
  processPersistedContributionBatch,
} from "./process-batch";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { executeContributionAction } from "../contribution-operations/actions";
import { createContributionActionDependencies } from "../contribution-operations/dependencies";
import {
  assertContributionActionPermission,
  hasContributionPermission,
} from "../contribution-operations/permissions";
import { createMissionControlTaskInSupabase } from "../mission-control-tasks/store";

const batchRecordSchema = z.object({
  id: z.string().uuid(),
  stagedGiftId: z.string().uuid().nullable().optional(),
  receiptStatus: z.string().nullable().optional(),
});

export const batchRequestSchema = z.object({
  actionType: z.enum([
    "resend_receipt",
    "crm_repost",
    "refund",
    "donor_relink",
    "amount_correction",
    "designation_correction",
    "fund_correction",
    "payment_state_correction",
    "stripe_replay",
  ]),
  confirmationToken: z.string().min(1),
  reason: z.string().trim().min(1).optional(),
  previewSnapshot: z.record(z.string(), z.unknown()).optional(),
  records: z.array(batchRecordSchema).min(1).max(1000),
});

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const body = batchRequestSchema.parse(await ensureJsonBody(request));
      const executionMode = chooseContributionBatchExecutionMode({
        actionType: body.actionType,
        selectedCount: body.records.length,
      });
      assertContributionActionPermission(auth, body.actionType);
      const actorPermissions = hasContributionPermission(
        auth,
        "finance:manage_contributions",
      )
        ? (["finance:manage_contributions"] as const)
        : [];

      const isHighRisk =
        body.actionType !== "resend_receipt" &&
        body.actionType !== "crm_repost";
      if (isHighRisk && !body.reason) {
        throw new ApiHttpError(
          400,
          "High-risk bulk contribution actions require a reason.",
        );
      }
      if (isHighRisk && !body.previewSnapshot) {
        throw new ApiHttpError(
          400,
          "High-risk bulk contribution actions require a preview snapshot.",
        );
      }

      const contributionActionDependencies =
        createContributionActionDependencies(supabaseAdmin);

      if (executionMode === "background") {
        const { data, error } = await supabaseAdmin
          .from("contribution_operation_batches")
          .insert({
            tenant_id: auth.tenantId,
            operation: body.actionType,
            risk_level:
              body.actionType === "resend_receipt" ||
              body.actionType === "crm_repost"
                ? "low"
                : "high",
            source_surface: "contribution_hub",
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
                status: "pending",
                result: {},
              })),
            );
          if (itemError) throw new Error(itemError.message);
          after(async () => {
            try {
              await processPersistedContributionBatch({
                supabaseAdmin,
                tenantId: auth.tenantId,
                batchId,
                actorProfileId: auth.profileId,
                actorPermissions: [...actorPermissions],
                assertActionPermission: (actionType) =>
                  assertContributionActionPermission(auth, actionType),
                executeContributionAction: (actionInput) =>
                  executeContributionAction({
                    ...actionInput,
                    actorPermissions: actionInput.actorPermissions ?? [],
                    confirmationToken: actionInput.confirmationToken,
                    reason: actionInput.reason,
                    dependencies: contributionActionDependencies,
                  }),
                createFollowUpTask: async ({
                  contributionId,
                  reason,
                  actionType,
                }) => {
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
            } catch (error) {
              console.error("[contribution-batches] Background batch failed", {
                batchId,
                error,
              });
            }
          });
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
          requestId,
        });
      }

      const batch = await processContributionBatch({
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        actionType: body.actionType,
        sourceSurface: "contribution_hub",
        reason: body.reason ?? null,
        confirmationToken: body.confirmationToken,
        actorPermissions: [...actorPermissions],
        records: body.records.map((record) => ({
          id: record.id,
          receiptStatus: record.receiptStatus,
          stagedGiftId: record.stagedGiftId ?? null,
        })),
        executeContributionAction: (actionInput) =>
          executeContributionAction({
            ...actionInput,
            actorPermissions: actionInput.actorPermissions ?? [],
            confirmationToken: body.confirmationToken,
            reason: body.reason ?? actionInput.reason,
            dependencies: contributionActionDependencies,
          }),
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
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const pathnameParts = new URL(request.url).pathname.split("/");
      const batchId = pathnameParts.at(-2);
      if (typeof batchId !== "string" || batchId.length === 0) {
        throw new Error("Missing batch id.");
      }

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
        assertActionPermission: (actionType) =>
          assertContributionActionPermission(auth, actionType),
        executeContributionAction: (actionInput) =>
          executeContributionAction({
            ...actionInput,
            actorPermissions: actionInput.actorPermissions ?? [],
            confirmationToken: actionInput.confirmationToken,
            reason: actionInput.reason,
            dependencies: createContributionActionDependencies(supabaseAdmin),
          }),
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
