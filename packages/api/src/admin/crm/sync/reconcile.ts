import { serverEnv } from "@asym/env";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireCrmAccess } from "../../../crm/auth/access";
import { runCrmReconciliation } from "../../../crm/reconciliation/run";
import { resolveCrmSyncRuntimeConfig } from "../../../crm/sync/config";
import { isCrmSyncDomain } from "../../../crm/sync/domains";
import { createSupabaseCrmSyncStore } from "../../../crm/sync/store";
import { revalidateAdminCrmCache } from "../../../shared/cache-tags";
import { ensureJsonBody, toErrorResponse } from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";

import type { CrmSyncDomain } from "../../../crm/sync/types";

const reconcileRequestSchema = z.object({
  domain: z
    .custom<CrmSyncDomain>(
      (value) => typeof value === "string" && isCrmSyncDomain(value),
      "Invalid CRM sync domain.",
    )
    .optional(),
  tenantId: z.string().uuid().optional(),
});

export const POST = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const body = reconcileRequestSchema.parse(await ensureJsonBody(request));
    const actor = requireCrmAccess(auth, {
      action: "crm.sync.reconcile",
      resourceType: "sync",
      resourceTenantId: body.tenantId,
    });

    try {
      const run = await runCrmReconciliation(
        createSupabaseCrmSyncStore(supabaseAdmin),
        resolveCrmSyncRuntimeConfig(serverEnv),
        {
          tenantId: actor.tenantId,
          domain: body.domain,
          requestedByProfileId: actor.profileId,
        },
      );

      revalidateAdminCrmCache(actor.tenantId);

      return NextResponse.json({ run, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to run CRM reconciliation.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
