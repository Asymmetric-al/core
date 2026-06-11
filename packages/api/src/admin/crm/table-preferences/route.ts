import { NextResponse } from "next/server";
import { z } from "zod";

import { CRM_GIFT_HISTORY_TABLE_ID } from "./row-action";
import {
  getCrmTablePreferences,
  saveCrmTenantTableDefault,
  saveCrmUserTablePreference,
  type CrmViewSettingsPatch,
} from "./service";
import { canManageCrmTenantDefaults } from "./view-settings";
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

const columnsSchema = z
  .object({
    designation: z.boolean().optional(),
    statusLine: z.boolean().optional(),
  })
  .strict();

const filtersSortSchema = z
  .object({
    sortField: z.enum(["giftDate", "amountCents"]).optional(),
    sortDirection: z.enum(["asc", "desc"]).optional(),
    paymentStatus: z.enum(["all", "completed", "refunded"]).optional(),
  })
  .strict();

/**
 * Per-scope semantics (#272): an absent key leaves that scope unchanged,
 * null clears it (scoped reset), a value replaces it.
 */
const savePreferenceSchema = z.object({
  tableId: tableIdSchema.default(CRM_GIFT_HISTORY_TABLE_ID),
  pinnedActionId: z.string().min(1).nullable().optional(),
  columns: columnsSchema.nullable().optional(),
  filtersSort: filtersSortSchema.nullable().optional(),
});

const tenantDefaultSchema = savePreferenceSchema.extend({
  delegatedManagerProfileIds: z.array(z.string().min(1)).optional(),
});

function settingsPatchFromBody(body: {
  columns?: CrmViewSettingsPatch["columns"];
  filtersSort?: CrmViewSettingsPatch["filtersSort"];
  delegatedManagerProfileIds?: string[];
}): CrmViewSettingsPatch {
  const patch: CrmViewSettingsPatch = {};
  if (body.columns !== undefined) {
    patch.columns = body.columns;
  }
  if (body.filtersSort !== undefined) {
    patch.filtersSort = body.filtersSort;
  }
  if (body.delegatedManagerProfileIds !== undefined) {
    patch.delegatedManagerProfileIds = body.delegatedManagerProfileIds;
  }
  return patch;
}

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
      const body = savePreferenceSchema.parse(await ensureJsonBody(request));
      const user = await saveCrmUserTablePreference({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: body.tableId,
        pinnedActionId: body.pinnedActionId,
        settingsPatch: settingsPatchFromBody(body),
      });

      return NextResponse.json({ user, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to save table preferences.",
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
      const profileId = requireProfileId(actor.profileId);
      const body = tenantDefaultSchema.parse(await ensureJsonBody(request));

      // Tenant defaults are capability-gated and audited, never
      // approval-gated (ADR-CD-021). Super admins hold the capability;
      // delegated default managers are listed on the tenant default record.
      // Neither grants contribution operation permissions.
      const capabilities = resolveContributionCapabilities(auth);
      const current = await getCrmTablePreferences({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId,
        tableId: body.tableId,
      });
      const delegatedManagerProfileIds =
        current.tenantDefault?.settings?.delegatedManagerProfileIds ?? [];
      if (
        !canManageCrmTenantDefaults({
          capabilities,
          profileId,
          delegatedManagerProfileIds,
        })
      ) {
        throw new ApiHttpError(
          403,
          "Forbidden: requires crm.gift_history.manage_view_defaults",
        );
      }

      // Only capability holders can change who the delegates are.
      if (
        body.delegatedManagerProfileIds !== undefined &&
        !capabilities.includes("crm.gift_history.manage_view_defaults")
      ) {
        throw new ApiHttpError(
          403,
          "Forbidden: only super admins can change delegated default managers.",
        );
      }

      const tenantDefault = await saveCrmTenantTableDefault({
        supabaseAdmin,
        tenantId: actor.tenantId,
        tableId: body.tableId,
        pinnedActionId: body.pinnedActionId,
        settingsPatch: settingsPatchFromBody(body),
        actorProfileId: profileId,
      });

      return NextResponse.json({ tenantDefault, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to save the tenant default.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
