import { NextResponse } from "next/server";
import { z } from "zod";

import { processContributionBatch } from "./process-batch";
import { sendStagedGiftReceipt } from "../../giving/receipts";
import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { executeContributionAction } from "../contribution-operations/actions";
import { appendContributionOperationAuditEvent } from "../contribution-operations/store";

const batchRecordSchema = z.object({
  id: z.string().uuid(),
  stagedGiftId: z.string().uuid().nullable().optional(),
  receiptStatus: z.string().nullable().optional(),
});

const batchRequestSchema = z.object({
  actionType: z.enum(["resend_receipt", "crm_repost"]),
  confirmationToken: z.string().min(1),
  records: z.array(batchRecordSchema).min(1).max(50),
});

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const body = batchRequestSchema.parse(await ensureJsonBody(request));
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
