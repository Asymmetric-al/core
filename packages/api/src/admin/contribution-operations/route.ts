import { NextResponse } from "next/server";
import { z } from "zod";

import { executeContributionAction } from "./actions";
import { recordCorrectionApprovalOutcome } from "./approval-notifications";
import {
  decideContributionCorrectionRequest,
  loadCorrectionApprovalPolicy,
} from "./correction-requests";
import { createContributionActionDependencies } from "./dependencies";
import { replayStripeEventThroughContributionOperations } from "./operations";
import {
  hasContributionPermission,
  resolveContributionCapabilities,
} from "./permissions";
import { loadContributionDetailFromSupabase } from "./store";
import { projectContributionDetailForViewer } from "./viewer-projection";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

import type { ContributionDetail } from "./detail-read-model";
import type {
  ContributionActionResult,
  ContributionActionType,
  ContributionPermission,
  ContributionProviderOutcome,
  ContributionSourceSurface,
} from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";

export { replayStripeEventThroughContributionOperations };

/**
 * Strip raw provider identifiers from a provider outcome for viewers lacking
 * contributions.use_provider_actions. `referenceId` (e.g. a Stripe `re_`/`pi_`
 * id), `raw` (the provider payload), and `errorMessage` (which can embed ids)
 * are removed; the non-sensitive provider/status/errorCode workflow fields are
 * kept so the UI can still show what happened.
 */
function redactProviderOutcomeForViewer(
  outcome: ContributionProviderOutcome | null | undefined,
): ContributionProviderOutcome | null | undefined {
  if (!outcome) {
    return outcome;
  }

  return {
    provider: outcome.provider,
    status: outcome.status,
    errorCode: outcome.errorCode ?? null,
    referenceId: null,
  };
}

/**
 * Apply the same viewer projection the GET detail endpoint uses to an action
 * result before returning it (ADR-CD-014). Without this, a viewer lacking
 * contributions.use_provider_actions (e.g. donor-care invoking resend_receipt,
 * or finance-staff running a suppressed-approval refund) would receive raw
 * Stripe identifiers carried on the result -- both on
 * result.canonicalContribution (which the GET endpoint nulls) and on
 * result.providerOutcome (the live refund/charge id and raw provider payload).
 */
export function projectContributionActionResultForViewer<
  TResult extends ContributionActionResult,
>(result: TResult, viewerCapabilities: string[]): TResult {
  const hasProviderAccess = viewerCapabilities.includes(
    "contributions.use_provider_actions",
  );

  const canonical = result.canonicalContribution;
  const projected: TResult =
    canonical && typeof canonical === "object"
      ? {
          ...result,
          canonicalContribution: projectContributionDetailForViewer(
            canonical as ContributionDetail,
            viewerCapabilities,
          ),
        }
      : result;

  if (hasProviderAccess || result.providerOutcome == null) {
    return projected;
  }

  return {
    ...projected,
    providerOutcome: redactProviderOutcomeForViewer(result.providerOutcome),
  };
}

const actionTypeSchema = z.enum([
  "resend_receipt",
  "approve_staged_gift",
  "retry_staged_gift",
  "crm_repost",
  "metadata_update",
  "refund",
  "donor_relink",
  "amount_correction",
  "designation_correction",
  "fund_correction",
  "allocation_correction",
  "receipt_correction",
  "statement_correction",
  "payment_state_correction",
  "stripe_replay",
]);

const sourceSurfaceSchema = z.enum([
  "contribution_hub",
  "donor_crm_record",
  "automation",
  "bulk_action",
  "api",
]);

const actionRequestSchema = z.object({
  contributionId: z.string().uuid(),
  stagedGiftId: z.string().uuid().nullable().optional(),
  actionType: actionTypeSchema,
  sourceSurface: sourceSurfaceSchema.default("api"),
  reason: z.string().max(1000).nullable().optional(),
  confirmationToken: z.string().max(200).nullable().optional(),
  expectedRevision: z.string().max(200).nullable().optional(),
  idempotencyKey: z.string().max(200).nullable().optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

function getContributionIdFromPath(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const index = segments.indexOf("contribution-operations");
  return index >= 0 ? (segments[index + 1] ?? null) : null;
}

function actorPermissionsFromAuth(
  auth: AuthenticatedContext,
): ContributionPermission[] {
  return hasContributionPermission(auth, "finance:manage_contributions")
    ? ["finance:manage_contributions"]
    : [];
}

export const GET = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const contributionId = getContributionIdFromPath(request);
      if (!contributionId) {
        throw new ApiHttpError(400, "Missing contribution id.");
      }

      const detail = await loadContributionDetailFromSupabase({
        supabaseAdmin,
        tenantId: auth.tenantId,
        contributionId,
      });
      const contribution = projectContributionDetailForViewer(
        detail,
        resolveContributionCapabilities(auth),
      );

      return NextResponse.json({ contribution, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load contribution operation detail.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const body = actionRequestSchema.parse(await ensureJsonBody(request));
      const approvalPolicy = await loadCorrectionApprovalPolicy({
        supabaseAdmin,
        tenantId: auth.tenantId,
      });
      const result = await executeContributionAction({
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        actorPermissions: actorPermissionsFromAuth(auth),
        actorCapabilities: resolveContributionCapabilities(auth),
        approvalPolicy,
        sourceSurface: body.sourceSurface as ContributionSourceSurface,
        contributionId: body.contributionId,
        stagedGiftId: body.stagedGiftId ?? null,
        actionType: body.actionType as ContributionActionType,
        reason: body.reason ?? null,
        confirmationToken: body.confirmationToken ?? null,
        expectedRevision: body.expectedRevision ?? null,
        idempotencyKey: body.idempotencyKey ?? null,
        payload: body.payload,
        dependencies: createContributionActionDependencies(supabaseAdmin),
      });

      const projectedResult = projectContributionActionResultForViewer(
        result,
        resolveContributionCapabilities(auth),
      );

      return NextResponse.json({ result: projectedResult, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to execute contribution action.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);

const decisionRequestSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().max(1000).nullable().optional(),
  receiptDelivery: z
    .object({
      choice: z.enum(["email", "pdf", "defer"]),
      deferReason: z.string().max(1000).nullable().optional(),
    })
    .nullable()
    .optional(),
});

function getCorrectionRequestIdFromPath(request: Request): string | null {
  const pathname = new URL(request.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const index = segments.indexOf("correction-requests");
  return index >= 0 ? (segments[index + 1] ?? null) : null;
}

export const POST_CORRECTION_REQUEST_DECISION = withOperation(
  async ({ request, supabaseAdmin, auth, requestId }) => {
    try {
      const correctionRequestId = getCorrectionRequestIdFromPath(request);
      if (!correctionRequestId) {
        throw new ApiHttpError(400, "Missing correction request id.");
      }

      const body = decisionRequestSchema.parse(await ensureJsonBody(request));
      const outcome = await decideContributionCorrectionRequest({
        supabaseAdmin,
        tenantId: auth.tenantId,
        requestId: correctionRequestId,
        decision: body.decision,
        reason: body.reason ?? null,
        receiptDelivery: body.receiptDelivery ?? null,
        deciderProfileId: auth.profileId,
        deciderCapabilities: resolveContributionCapabilities(auth),
        dependencies: createContributionActionDependencies(supabaseAdmin),
        recordOutcome: recordCorrectionApprovalOutcome,
      });

      // Consistency with GET / POST actions: project provider identifiers for
      // the viewer. Not a leak today (deciders already hold
      // contributions.use_provider_actions) but kept defense-in-depth.
      const projectedResult = outcome.result
        ? projectContributionActionResultForViewer(
            outcome.result,
            resolveContributionCapabilities(auth),
          )
        : null;

      return NextResponse.json({
        request: outcome.request,
        result: projectedResult,
        idempotentReplay: outcome.idempotentReplay ?? false,
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to decide correction request.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
