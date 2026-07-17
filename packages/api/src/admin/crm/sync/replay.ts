import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireCrmAccess } from "../../../crm/auth/access";
import { resolveCrmSyncRuntimeConfig } from "../../../crm/sync/config";
import {
  replayInboundWebhookEvent,
  replayOutboundJob,
} from "../../../crm/sync/replay";
import { createSupabaseCrmSyncStore } from "../../../crm/sync/store";
import { revalidateAdminCrmCache } from "../../../shared/cache-tags";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

const replayRequestSchema = z
  .object({
    eventId: z.string().uuid().optional(),
    outboundJobId: z.string().uuid().optional(),
  })
  .refine((value) => Boolean(value.eventId) !== Boolean(value.outboundJobId), {
    message: "Provide exactly one of eventId or outboundJobId.",
  });

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.sync.replay",
      resourceType: "sync",
    });
    const body = replayRequestSchema.parse(await ensureJsonBody(request));
    const store = createSupabaseCrmSyncStore(supabaseAdmin);
    const config = resolveCrmSyncRuntimeConfig(serverEnv);

    try {
      if (body.eventId) {
        const event = await store.loadInboundEvent(body.eventId);
        if (!event) {
          throw new ApiHttpError(404, "CRM webhook event not found.");
        }
        if (!actor.isSuperAdmin && event.tenantId !== actor.tenantId) {
          throw new ApiHttpError(403, "Forbidden: CRM tenant mismatch.");
        }
        const replayed = await replayInboundWebhookEvent(store, config, event);
        revalidateAdminCrmCache(event.tenantId);
        return NextResponse.json({ replayed, requestId });
      }

      if (!body.outboundJobId) {
        throw new ApiHttpError(400, "Missing CRM outbound job id.");
      }
      const job = await store.loadOutboundJob(body.outboundJobId);
      if (!job) {
        throw new ApiHttpError(404, "CRM outbound job not found.");
      }
      if (!actor.isSuperAdmin && job.tenantId !== actor.tenantId) {
        throw new ApiHttpError(403, "Forbidden: CRM tenant mismatch.");
      }
      const replayed = await replayOutboundJob(store, config, job);
      revalidateAdminCrmCache(job.tenantId);
      return NextResponse.json({ replayed, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to replay CRM sync item.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
