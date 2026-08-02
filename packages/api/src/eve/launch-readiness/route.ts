import { NextResponse } from "next/server";
import { z } from "zod";

import {
  activateEveLaunchManifest,
  closeEveLaunchCanary,
  createEveLaunchManifest,
  grantEveLaunchPermission,
  reviewEveLaunchManifest,
  setEveReleaseSafetyControl,
} from "./control";
import { resolveEveLaunchRuntimeTarget } from "./runtime-target";
import {
  eveLaunchManifestDocumentSchema,
  eveLaunchPermissionMutationSchema,
  eveLaunchReviewSchema,
  eveLaunchSafeTextSchema,
} from "./schema";
import {
  loadActiveEveModelPolicyBinding,
  loadEveLaunchAdminView,
} from "./store";
import { EVE_LAUNCH_CANARY_IDS } from "./types";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { loadEveGovernanceSnapshot } from "../governance";

const safeReason = eveLaunchSafeTextSchema;
const canaryResultsSchema = z
  .object(
    Object.fromEntries(
      EVE_LAUNCH_CANARY_IDS.map((id) => [id, z.boolean()]),
    ) as Record<(typeof EVE_LAUNCH_CANARY_IDS)[number], z.ZodBoolean>,
  )
  .strict();

const mutationSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("manifest"),
      document: eveLaunchManifestDocumentSchema,
    })
    .strict(),
  eveLaunchReviewSchema.extend({ kind: z.literal("review") }).strict(),
  eveLaunchPermissionMutationSchema
    .extend({ kind: z.literal("permission") })
    .strict(),
  z
    .object({
      expectedStateVersion: z.number().int().positive(),
      justification: safeReason,
      kind: z.literal("activate"),
      manifestId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      expectedStateVersion: z.number().int().positive(),
      kind: z.literal("safety_control"),
      mode: z.enum(["clear_emergency", "disable", "emergency_off"]),
      reason: safeReason,
    })
    .strict(),
  z
    .object({
      kind: z.literal("canary"),
      launchId: z.string().uuid(),
      reason: safeReason,
      results: canaryResultsSchema,
      status: z.enum(["completed", "failed"]),
    })
    .strict(),
]);

async function adminView(input: {
  profileId: string;
  supabaseAdmin: Parameters<
    typeof loadEveGovernanceSnapshot
  >[0]["supabaseAdmin"];
  tenantId: string;
}) {
  const governance = await loadEveGovernanceSnapshot({
    supabaseAdmin: input.supabaseAdmin,
  });
  const activeModelPolicy = await loadActiveEveModelPolicyBinding({
    supabaseAdmin: input.supabaseAdmin,
  });
  const runtimeTarget = governance
    ? resolveEveLaunchRuntimeTarget({
        activeModelPolicy,
        governanceStateVersion: governance.stateVersion,
      })
    : undefined;
  return {
    governance,
    ...(await loadEveLaunchAdminView({
      profileId: input.profileId,
      runtimeTarget,
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
    })),
  };
}

export const GET = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      return NextResponse.json({
        ...(await adminView({
          profileId: auth.profileId,
          supabaseAdmin,
          tenantId: auth.tenantId,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve launch readiness.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const parsed = mutationSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid Eve launch request.", requestId },
        { status: 400 },
      );
    }
    try {
      if (parsed.data.kind === "manifest") {
        await createEveLaunchManifest({
          auth,
          document: parsed.data.document,
          supabaseAdmin,
        });
      } else if (parsed.data.kind === "review") {
        await reviewEveLaunchManifest({
          auth,
          decision: parsed.data.decision,
          manifestId: parsed.data.manifestId,
          reviewerRole: parsed.data.reviewerRole,
          summary: parsed.data.summary,
          supabaseAdmin,
        });
      } else if (parsed.data.kind === "permission") {
        await grantEveLaunchPermission({
          auth,
          enabled: parsed.data.enabled,
          permission: parsed.data.permission,
          profileId: parsed.data.profileId,
          reason: parsed.data.reason,
          supabaseAdmin,
        });
      } else if (parsed.data.kind === "activate") {
        await activateEveLaunchManifest({
          auth,
          expectedStateVersion: parsed.data.expectedStateVersion,
          justification: parsed.data.justification,
          manifestId: parsed.data.manifestId,
          supabaseAdmin,
        });
      } else if (parsed.data.kind === "safety_control") {
        await setEveReleaseSafetyControl({
          auth,
          expectedStateVersion: parsed.data.expectedStateVersion,
          mode: parsed.data.mode,
          reason: parsed.data.reason,
          supabaseAdmin,
        });
      } else {
        await closeEveLaunchCanary({
          auth,
          launchId: parsed.data.launchId,
          reason: parsed.data.reason,
          results: parsed.data.results,
          status: parsed.data.status,
          supabaseAdmin,
        });
      }
      return NextResponse.json({
        ...(await adminView({
          profileId: auth.profileId,
          supabaseAdmin,
          tenantId: auth.tenantId,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to update Eve launch readiness.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);
