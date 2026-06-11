import { NextResponse } from "next/server";
import { z } from "zod";

import { CRM_GIFT_HISTORY_TABLE_ID } from "./row-action";
import {
  getCrmTablePreferences,
  saveCrmTenantRowActionDefault,
  saveCrmUserRowActionPin,
} from "./service";
import { requireCrmAccess } from "../../../crm/auth/access";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../../shared/http-errors";
import { withOperation } from "../../../shared/with-operation";
import { resolveContributionCapabilities } from "../../contribution-operations/permissions";

const KNOWN_TABLE_IDS = [CRM_GIFT_HISTORY_TABLE_ID] as const;

const tableIdSchema = z.enum(KNOWN_TABLE_IDS);

const savePinSchema = z.object({
  tableId: tableIdSchema.default(CRM_GIFT_HISTORY_TABLE_ID),
  pinnedActionId: z.string().min(1).nullable(),
});

function requireProfileId(profileId: string | null): string {
  if (!profileId) {
    throw new ApiHttpError(
      403,
      "A profile is required to manage table preferences.",
    );
  }

  return profileId;
}

function resolveTableId(request: Request): string {
  const raw =
    new URL(request.url).searchParams.get("tableId") ??
    CRM_GIFT_HISTORY_TABLE_ID;
  const parsed = tableIdSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiHttpError(400, `Unknown table id "${raw}".`);
  }

  return parsed.data;
}

export const GET = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.read",
      resourceType: "record",
    });

    try {
      const preferences = await getCrmTablePreferences({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: resolveTableId(request),
      });

      return NextResponse.json({ ...preferences, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to load CRM table preferences.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);

export const PUT = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.write",
      resourceType: "record",
    });

    try {
      const body = savePinSchema.parse(await ensureJsonBody(request));
      const user = await saveCrmUserRowActionPin({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: body.tableId,
        pinnedActionId: body.pinnedActionId,
      });

      return NextResponse.json({ user, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to save the pinned row action.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);

export const PUT_TENANT_DEFAULT = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.manage_defaults",
      resourceType: "record",
    });

    try {
      // Tenant defaults are capability-gated and audited (ADR-CD-021); the
      // capability never grants contribution operation permissions.
      const capabilities = resolveContributionCapabilities(auth);
      if (!capabilities.includes("crm.gift_history.manage_view_defaults")) {
        throw new ApiHttpError(
          403,
          "Forbidden: requires crm.gift_history.manage_view_defaults",
        );
      }

      const body = savePinSchema.parse(await ensureJsonBody(request));
      const tenantDefault = await saveCrmTenantRowActionDefault({
        supabaseAdmin,
        tenantId: actor.tenantId,
        tableId: body.tableId,
        pinnedActionId: body.pinnedActionId,
        actorProfileId: requireProfileId(actor.profileId),
      });

      return NextResponse.json({ tenantDefault, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to save the tenant default row action.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
