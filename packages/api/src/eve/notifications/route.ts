import { NextResponse } from "next/server";
import { z } from "zod";

import { createEveNotificationChannelDefaults } from "./registry";
import {
  ensureEveNotificationChannelConfigs,
  loadEveNotificationAdminView,
  setEveNotificationRecipient,
  updateEveNotificationChannel,
} from "./store";
import { EVE_NOTIFICATION_CHANNELS } from "./types";
import { toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { traceEveAuditEvent } from "../audit/record";
import { createEveAuditStore } from "../audit/store";
import { EVE_ENGINEERING_FINDING_SEVERITIES } from "../engineering-monitors/types";
import { loadEveGovernanceSnapshot } from "../governance";

const mutationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("channel"),
    channel: z.enum(EVE_NOTIFICATION_CHANNELS),
    enabled: z.boolean().optional(),
    paused: z.boolean().optional(),
    minimumSeverity: z.enum(EVE_ENGINEERING_FINDING_SEVERITIES).optional(),
    richDetailEnabled: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("recipient"),
    profileId: z.string().uuid(),
    enabled: z.boolean(),
    optedOut: z.boolean(),
  }),
]);

async function ensureDefaults(input: {
  supabaseAdmin: Parameters<
    typeof loadEveGovernanceSnapshot
  >[0]["supabaseAdmin"];
  tenantId: string;
}) {
  const governance = await loadEveGovernanceSnapshot({
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!governance) throw new Error("Eve governance state is unavailable.");
  await ensureEveNotificationChannelConfigs({
    configs: createEveNotificationChannelDefaults({
      policyVersion: governance.stateVersion,
      tenantId: input.tenantId,
    }),
    supabaseAdmin: input.supabaseAdmin,
  });
  return governance;
}

export const GET = withOperation(
  async ({ auth, requestId, supabaseAdmin }) => {
    try {
      await ensureDefaults({ supabaseAdmin, tenantId: auth.tenantId });
      return NextResponse.json({
        ...(await loadEveNotificationAdminView({
          supabaseAdmin,
          tenantId: auth.tenantId,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load Eve notifications.",
        requestId,
      );
    }
  },
  { roles: ["admin", "super_admin"] },
);

export const PATCH = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const parsed = mutationSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid Eve notification request.", requestId },
        { status: 400 },
      );
    }
    try {
      const governance = await ensureDefaults({
        supabaseAdmin,
        tenantId: auth.tenantId,
      });
      if (parsed.data.kind === "channel") {
        await updateEveNotificationChannel({
          ...parsed.data,
          policyVersion: governance.stateVersion,
          supabaseAdmin,
          tenantId: auth.tenantId,
        });
      } else {
        await setEveNotificationRecipient({
          ...parsed.data,
          supabaseAdmin,
          tenantId: auth.tenantId,
        });
      }
      await traceEveAuditEvent({
        store: createEveAuditStore(supabaseAdmin),
        event: {
          action: "notification.configuration_updated",
          change: parsed.data,
          decision: {
            rationale:
              "A platform owner changed an app-owned notification setting.",
            risk: "External operator delivery configuration",
            reversalOrFollowUp:
              "Pause or disable the channel in Mission Control.",
          },
          evidence: { requestId },
          identity: createAdminEveAuditIdentity(auth),
          modelRole: "not_used",
          policy: {
            governanceStateVersion: governance.stateVersion,
            id: "eve-email-discord-notifications-v1",
            status: "updated",
          },
          result: "succeeded",
          target:
            parsed.data.kind === "channel"
              ? `notification:${parsed.data.channel}`
              : `notification-recipient:${parsed.data.profileId}`,
          toolName: "eve_notification_configuration",
        },
      });
      return NextResponse.json({
        ...(await loadEveNotificationAdminView({
          supabaseAdmin,
          tenantId: auth.tenantId,
        })),
        requestId,
      });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to update Eve notifications.",
        requestId,
      );
    }
  },
  { roles: ["super_admin"] },
);
