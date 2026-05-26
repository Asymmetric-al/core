import { NextResponse } from "next/server";
import { z } from "zod";

import { chooseContributionBatchExecutionMode } from "./preview";
import { processContributionBatch } from "./process-batch";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { executeContributionAction } from "../contribution-operations/actions";
import { appendContributionOperationAuditEvent } from "../contribution-operations/store";
import { createMissionControlTaskInSupabase } from "../mission-control-tasks/store";

const batchRecordSchema = z.object({
  id: z.string().uuid(),
  stagedGiftId: z.string().uuid().nullable().optional(),
  receiptStatus: z.string().nullable().optional(),
});

const batchRequestSchema = z.object({
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
            confirmation_snapshot: {
              confirmationToken: body.confirmationToken,
            },
            created_by_profile_id: auth.profileId,
            started_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);

        return NextResponse.json({
          batch: {
            id: (data as { id?: string } | null)?.id ?? null,
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
        records: body.records.map((record) => ({
          id: record.id,
          receiptStatus: record.receiptStatus,
          stagedGiftId: record.stagedGiftId ?? null,
        })),
        executeContributionAction: (actionInput) =>
          executeContributionAction({
            ...actionInput,
            actorPermissions: [],
            confirmationToken: body.confirmationToken,
            dependencies: {
              sendReceipt: ({ stagedGiftId, tenantId }) =>
                sendStagedGiftReceipt({
                  supabaseAdmin,
                  stagedGiftId,
                  tenantId,
                }),
              appendAuditEvent: (event) =>
                appendContributionOperationAuditEvent({
                  supabaseAdmin,
                  event,
                }),
              loadContributionDetail: async ({ contributionId, tenantId }) => ({
                id: contributionId,
                tenantId,
              }),
            },
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
