import { NextResponse } from "next/server";
import { z } from "zod";

import { executeContributionAction } from "./actions";
import { recordCorrectionApprovalOutcome } from "./approval-notifications";
import {
  decideContributionCorrectionRequest,
  loadContributionCorrectionRequest,
  loadCorrectionApprovalPolicy,
} from "./correction-requests";
import { createContributionActionDependencies } from "./dependencies";
import { replayStripeEventThroughContributionOperations } from "./operations";
import {
  hasContributionPermission,
  resolveContributionCapabilities,
} from "./permissions";
import { loadContributionDetailFromSupabase } from "./store";
import {
  CONTRIBUTION_ACTION_TYPES,
  CONTRIBUTION_SOURCE_SURFACES,
  type ContributionActionType,
  type ContributionPermission,
} from "./types";
import {
  projectContributionActionResultForViewer,
  projectContributionDetailForViewer,
} from "./viewer-projection";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../shared/http-errors";
import {
  withOperation,
  type OperationRouteContext,
} from "../../shared/with-operation";

import type { AuthenticatedContext } from "@asym/auth/context";

export { replayStripeEventThroughContributionOperations };
export { projectContributionActionResultForViewer };

const UNSUPPORTED_ROUTE_ACTION_TYPES = new Set<ContributionActionType>([
  "metadata_update",
  "refund",
  "donor_relink",
]);

export function isContributionRouteActionSupported(
  actionType: ContributionActionType,
): boolean {
  return !UNSUPPORTED_ROUTE_ACTION_TYPES.has(actionType);
}

function unsupportedRouteActionMessage(
  actionType: ContributionActionType,
): string {
  switch (actionType) {
    case "metadata_update":
      return "metadata_update is not supported by this route yet.";
    case "refund":
      return "refund is not supported by this route until provider refund dependencies are wired.";
    case "donor_relink":
      return "donor_relink is not supported by this route until donor relink dependencies are wired.";
    default:
      return `${actionType} is not supported by this route.`;
  }
}

export function assertContributionRouteActionSupported(
  actionType: ContributionActionType,
): void {
  if (isContributionRouteActionSupported(actionType)) {
    return;
  }

  throw new ApiHttpError(501, unsupportedRouteActionMessage(actionType));
}

const actionTypeSchema = z
  .enum(CONTRIBUTION_ACTION_TYPES)
  .superRefine((actionType, ctx) => {
    if (isContributionRouteActionSupported(actionType)) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: unsupportedRouteActionMessage(actionType),
    });
  });

const sourceSurfaceSchema = z.enum(CONTRIBUTION_SOURCE_SURFACES);

export const actionRequestSchema = z.object({
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

async function getRouteParam(
  routeContext: OperationRouteContext | undefined,
  paramName: string,
  missingMessage: string,
): Promise<string> {
  const params = await routeContext?.params;
  const value = params?.[paramName];
  const resolved = Array.isArray(value) ? value[0] : value;
  if (!resolved) {
    throw new ApiHttpError(400, missingMessage);
  }

  return resolved;
}

function actorPermissionsFromAuth(
  auth: AuthenticatedContext,
): ContributionPermission[] {
  return hasContributionPermission(auth, "finance:manage_contributions")
    ? ["finance:manage_contributions"]
    : [];
}

export const GET = withOperation(
  async ({ supabaseAdmin, auth, requestId, routeContext }) => {
    try {
      const contributionId = await getRouteParam(
        routeContext,
        "contributionId",
        "Missing contribution id.",
      );

      // The approval policy shapes which correction/replay request entries
      // the viewer projection appends (#270), mirroring CRM inline actions.
      const [detail, approvalPolicy] = await Promise.all([
        loadContributionDetailFromSupabase({
          supabaseAdmin,
          tenantId: auth.tenantId,
          contributionId,
        }),
        loadCorrectionApprovalPolicy({
          supabaseAdmin,
          tenantId: auth.tenantId,
        }),
      ]);
      const contribution = projectContributionDetailForViewer(
        detail,
        resolveContributionCapabilities(auth),
        { approvalPolicy },
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
        sourceSurface: body.sourceSurface,
        contributionId: body.contributionId,
        stagedGiftId: body.stagedGiftId ?? null,
        actionType: body.actionType,
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
        { approvalPolicy },
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

export const decisionRequestSchema = z.object({
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

export const POST_CORRECTION_REQUEST_DECISION = withOperation(
  async ({ request, supabaseAdmin, auth, requestId, routeContext }) => {
    try {
      const correctionRequestId = await getRouteParam(
        routeContext,
        "requestId",
        "Missing correction request id.",
      );

      const body = decisionRequestSchema.parse(await ensureJsonBody(request));
      if (body.decision === "approve") {
        const correctionRequest = await loadContributionCorrectionRequest({
          supabaseAdmin,
          tenantId: auth.tenantId,
          requestId: correctionRequestId,
        });
        assertContributionRouteActionSupported(correctionRequest.actionType);
      }

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
