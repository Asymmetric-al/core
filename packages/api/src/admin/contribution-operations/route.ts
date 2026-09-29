import { NextResponse } from "next/server";
import { z } from "zod";

import { executeContributionAction } from "./actions";
import { recordCorrectionApprovalOutcome } from "./approval-notifications";
import { parseContributionCommand } from "./command";
import {
  decideContributionCorrectionRequest,
  loadContributionCorrectionRequest,
  loadCorrectionApprovalPolicy,
} from "./correction-requests";
import { createContributionActionDependencies } from "./dependencies";
import {
  loadReceiptDeliveryContext,
  replayStripeEventThroughContributionOperations,
} from "./operations";
import {
  hasContributionPermission,
  resolveContributionCapabilities,
} from "./permissions";
import { resolveViewerProviderDashboardTestMode } from "./provider-dashboard";
import {
  assertReceiptSnapshotPdfCapability,
  renderContributionReceiptSnapshotPdf,
} from "./receipt-pdf";
import {
  assertContributionRouteActionSupported,
  isContributionRouteActionSupported,
  unsupportedContributionRouteActionMessage,
} from "./route-action-support";
import { loadContributionDetailFromSupabase } from "./store";
import {
  CONTRIBUTION_ACTION_TYPES,
  CONTRIBUTION_SOURCE_SURFACES,
  type ContributionPermission,
} from "./types";
import {
  buildContributionReceiptDeliveryView,
  projectContributionActionResultForViewer,
  projectContributionDetailForViewer,
  projectCorrectionRequestsForViewer,
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

import type { ContributionReceiptDeliveryView } from "./viewer-projection";
import type { AuthenticatedContext } from "@asym/auth/context";

export { replayStripeEventThroughContributionOperations };
export { projectContributionActionResultForViewer };
export {
  assertContributionRouteActionSupported,
  isContributionRouteActionSupported,
} from "./route-action-support";

const actionTypeSchema = z
  .enum(CONTRIBUTION_ACTION_TYPES)
  .superRefine((actionType, ctx) => {
    if (isContributionRouteActionSupported(actionType)) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: unsupportedContributionRouteActionMessage(actionType),
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
      // the viewer projection appends (#270), mirroring CRM inline actions,
      // so it is loaded alongside the detail read on every request.
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
      const viewerCapabilities = resolveContributionCapabilities(auth);
      // Mode-aware dashboard proof links: the tenant Stripe key is resolved
      // only for provider-capable viewers, and only the test-mode boolean
      // reaches the projection.
      const providerDashboardTestMode =
        await resolveViewerProviderDashboardTestMode({
          supabaseAdmin,
          tenantId: auth.tenantId,
          viewerCapabilities,
        });
      const projected = projectContributionDetailForViewer(
        detail,
        viewerCapabilities,
        { approvalPolicy, providerDashboardTestMode },
      );

      // The same tenant policy also drives correction-request decidability
      // (#263) for viewers on gifts that have pending requests.
      const correctionRequests =
        projected.correctionRequests.length > 0
          ? projectCorrectionRequestsForViewer(projected.correctionRequests, {
              policy: approvalPolicy,
              viewerProfileId: auth.profileId,
              viewerCapabilities,
            })
          : [];

      // Delivery context only matters once a receipt was communicated; a
      // never-sent receipt cannot be invalidated by a correction (#263).
      let receiptDelivery: ContributionReceiptDeliveryView | null = null;
      if (detail.shared.receiptStatus === "sent") {
        const receiptContext = await loadReceiptDeliveryContext({
          supabaseAdmin,
          tenantId: auth.tenantId,
          donorId: detail.donor?.id ?? null,
        });
        receiptDelivery = buildContributionReceiptDeliveryView({
          policy: receiptContext.policy,
          donor: receiptContext.donor,
          viewerCapabilities,
        });
      }

      const contribution = {
        ...projected,
        correctionRequests,
        receiptDelivery,
      };

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
      const viewerCapabilities = resolveContributionCapabilities(auth);
      const approvalPolicy = await loadCorrectionApprovalPolicy({
        supabaseAdmin,
        tenantId: auth.tenantId,
      });
      const result = await executeContributionAction({
        tenantId: auth.tenantId,
        actorProfileId: auth.profileId,
        actorPermissions: actorPermissionsFromAuth(auth),
        actorCapabilities: viewerCapabilities,
        approvalPolicy,
        sourceSurface: body.sourceSurface,
        contributionId: body.contributionId,
        stagedGiftId: body.stagedGiftId ?? null,
        command: parseContributionCommand(body.actionType, body.payload),
        reason: body.reason ?? null,
        confirmationToken: body.confirmationToken ?? null,
        expectedRevision: body.expectedRevision ?? null,
        idempotencyKey: body.idempotencyKey ?? null,
        dependencies: createContributionActionDependencies(supabaseAdmin),
      });

      // Same mode-aware dashboard links as GET so the canonical detail an
      // action returns never disagrees with the detail endpoint.
      const providerDashboardTestMode =
        await resolveViewerProviderDashboardTestMode({
          supabaseAdmin,
          tenantId: auth.tenantId,
          viewerCapabilities,
        });
      const projectedResult = projectContributionActionResultForViewer(
        result,
        viewerCapabilities,
        { approvalPolicy, providerDashboardTestMode },
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

      const viewerCapabilities = resolveContributionCapabilities(auth);

      // The decision service intentionally checks for an idempotent replay
      // before lazily loading tenant policy. Do not pre-load policy here.
      const outcome = await decideContributionCorrectionRequest({
        supabaseAdmin,
        tenantId: auth.tenantId,
        requestId: correctionRequestId,
        decision: body.decision,
        reason: body.reason ?? null,
        receiptDelivery: body.receiptDelivery ?? null,
        deciderProfileId: auth.profileId,
        deciderCapabilities: viewerCapabilities,
        dependencies: createContributionActionDependencies(supabaseAdmin),
        recordOutcome: recordCorrectionApprovalOutcome,
      });

      // Consistency with GET / POST actions: project provider identifiers for
      // the viewer. Not a leak today (deciders already hold
      // contributions.use_provider_actions) but kept defense-in-depth.
      const providerDashboardTestMode = outcome.result
        ? await resolveViewerProviderDashboardTestMode({
            supabaseAdmin,
            tenantId: auth.tenantId,
            viewerCapabilities,
          })
        : false;
      const projectedResult = outcome.result
        ? projectContributionActionResultForViewer(
            outcome.result,
            viewerCapabilities,
            {
              approvalPolicy: outcome.approvalPolicy,
              providerDashboardTestMode,
            },
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

/**
 * Streams the durable updated-receipt PDF for a stored snapshot (#263).
 * Binary responses pass through `withOperation` untouched — its error
 * normalization only rewrites non-OK `application/json` bodies.
 */
export const GET_RECEIPT_SNAPSHOT_PDF = withOperation(
  async ({ supabaseAdmin, auth, requestId, routeContext }) => {
    try {
      const snapshotId = await getRouteParam(
        routeContext,
        "snapshotId",
        "Missing receipt snapshot id.",
      );

      // Tenant policy names the capability required to generate updated
      // receipt PDFs; enforce it before touching the snapshot (ADR-CD-024).
      const receiptContext = await loadReceiptDeliveryContext({
        supabaseAdmin,
        tenantId: auth.tenantId,
        donorId: null,
      });
      assertReceiptSnapshotPdfCapability({
        policy: receiptContext.policy,
        viewerCapabilities: resolveContributionCapabilities(auth),
      });

      const rendered = await renderContributionReceiptSnapshotPdf({
        supabaseAdmin,
        tenantId: auth.tenantId,
        snapshotId,
      });

      // Sanitize the filename to safe token characters. Snapshot ids are
      // DB-generated UUIDs today, but a stray quote or control character would
      // otherwise produce a malformed Content-Disposition header value.
      const safeFilename = rendered.filename.replace(/[^\w.-]/g, "_");

      return new NextResponse(Buffer.from(rendered.pdf), {
        headers: {
          "cache-control": "no-store",
          "content-disposition": `attachment; filename="${safeFilename}"`,
          "content-type": rendered.contentType,
        },
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to render the updated receipt PDF.",
        requestId,
      );
    }
  },
  { roles: ["staff", "admin", "super_admin"] },
);
