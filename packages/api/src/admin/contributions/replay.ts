import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import {
  claimStripeRawEvent,
  completeStripeRawEvent,
  recordStripeRawEventFailure,
} from "../../stripe/event-store";
import {
  getRawPayloadEvent,
  loadStripeRawEventForReplay,
  markStripeRawEventForReplay,
} from "../../stripe/replay";
import { handleStripeWebhookEvent } from "../../stripe/webhooks";
import { executeContributionAction } from "../contribution-operations/actions";
import { hasContributionPermission } from "../contribution-operations/permissions";
import {
  appendContributionOperationAuditEvent,
  createContributionCorrectionRecord,
  loadContributionDetailFromSupabase,
} from "../contribution-operations/store";

const replaySchema = z.object({
  stripeEventId: z.string().min(1),
  reason: z.string().max(1000).nullable().optional(),
  confirmationToken: z.string().max(200).nullable().optional(),
});

function actorPermissionsFromAuth(
  auth: { role: string | null } & Parameters<
    typeof hasContributionPermission
  >[0],
) {
  return hasContributionPermission(auth, "finance:manage_contributions")
    ? (["finance:manage_contributions"] as const)
    : [];
}

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    try {
      const body = replaySchema.parse(await ensureJsonBody(request));

      if (!body.reason?.trim()) {
        throw new ApiHttpError(400, "A reason is required for stripe_replay.");
      }
      if (!body.confirmationToken?.trim()) {
        throw new ApiHttpError(
          400,
          "A confirmation token is required for stripe_replay.",
        );
      }
      if (!hasContributionPermission(auth, "finance:manage_contributions")) {
        throw new ApiHttpError(
          403,
          "Forbidden: requires finance:manage_contributions",
        );
      }

      const rawEvent = await loadStripeRawEventForReplay({
        supabaseAdmin,
        stripeEventId: body.stripeEventId,
        tenantId: auth.tenantId,
      });
      if (!rawEvent.donationId) {
        throw new ApiHttpError(
          409,
          "Stripe raw event is not linked to a contribution.",
        );
      }

      const result = await executeContributionAction({
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        actorPermissions: [...actorPermissionsFromAuth(auth)],
        sourceSurface: "contribution_hub",
        contributionId: rawEvent.donationId,
        actionType: "stripe_replay",
        reason: body.reason ?? null,
        confirmationToken: body.confirmationToken ?? null,
        payload: { stripeEventId: body.stripeEventId },
        dependencies: {
          replayStripeEvent: async () => {
            await markStripeRawEventForReplay({
              supabaseAdmin,
              rawEventId: rawEvent.id,
            });
            const claim = await claimStripeRawEvent({
              supabaseAdmin,
              rawEventId: rawEvent.id,
            });
            if (!claim.claimed) {
              throw new ApiHttpError(
                409,
                "Stripe raw event is not replayable.",
              );
            }

            const event = getRawPayloadEvent(rawEvent);
            try {
              const outcome = await handleStripeWebhookEvent(
                supabaseAdmin,
                event,
                {
                  rawEventId: rawEvent.id,
                  stripeEventId: rawEvent.stripeEventId,
                },
              );
              await completeStripeRawEvent({
                supabaseAdmin,
                rawEventId: rawEvent.id,
                lockId: claim.lockId,
                status: outcome.handled ? "processed" : "ignored",
                outcome: {
                  action: outcome.action,
                  donationId: outcome.donationId,
                  handled: outcome.handled,
                  paymentIntentId: outcome.paymentIntentId,
                  reason: outcome.reason,
                  stagedGiftId: outcome.stagedGiftId,
                },
                stagedGiftId: outcome.stagedGiftId ?? null,
              });

              return {
                provider: "stripe" as const,
                status: outcome.handled ? "processed" : "ignored",
                referenceId: rawEvent.stripeEventId,
                raw: {
                  action: outcome.action,
                  donationId: outcome.donationId,
                  reason: outcome.reason,
                  stagedGiftId: outcome.stagedGiftId,
                },
              };
            } catch (error) {
              await recordStripeRawEventFailure({
                supabaseAdmin,
                rawEventId: rawEvent.id,
                lockId: claim.lockId,
                error,
              });
              return {
                provider: "stripe" as const,
                status: "failed",
                referenceId: rawEvent.stripeEventId,
                errorMessage:
                  error instanceof Error
                    ? error.message
                    : "Stripe replay failed.",
              };
            }
          },
          appendAuditEvent: (event) =>
            appendContributionOperationAuditEvent({ supabaseAdmin, event }),
          createCorrectionRecord: (correction) =>
            createContributionCorrectionRecord({
              supabaseAdmin,
              correction,
            }),
          loadContributionDetail: ({ contributionId, tenantId }) =>
            loadContributionDetailFromSupabase({
              supabaseAdmin,
              tenantId,
              contributionId,
            }),
        },
      });

      return NextResponse.json({ replayed: result, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to replay giving item.", requestId);
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
