import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createCrmNamedView,
  deleteCrmNamedView,
  listCrmNamedViews,
  updateCrmNamedView,
} from "./named-views";
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
    issue: z
      .enum([
        "all",
        "needs_attention",
        "receipt_affected",
        "pending_correction",
      ])
      .optional(),
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
  activeViewId: z.string().min(1).nullable().optional(),
});

const tenantDefaultSchema = savePreferenceSchema.extend({
  delegatedManagerProfileIds: z.array(z.string().min(1)).optional(),
});

function settingsPatchFromBody(body: {
  columns?: CrmViewSettingsPatch["columns"];
  filtersSort?: CrmViewSettingsPatch["filtersSort"];
  delegatedManagerProfileIds?: string[];
  activeViewId?: string | null;
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
  if (body.activeViewId !== undefined) {
    patch.activeViewId = body.activeViewId;
  }
  return patch;
}

const namedViewCreateSchema = z.object({
  tableId: tableIdSchema.default(CRM_GIFT_HISTORY_TABLE_ID),
  name: z.string().min(1).max(80),
  isDefault: z.boolean().optional(),
  pinnedActionId: z.string().min(1).nullable().optional(),
  columns: columnsSchema.nullable().optional(),
  filtersSort: filtersSortSchema.nullable().optional(),
});

const namedViewUpdateSchema = z.object({
  tableId: tableIdSchema.default(CRM_GIFT_HISTORY_TABLE_ID),
  name: z.string().min(1).max(80).optional(),
  isDefault: z.boolean().optional(),
  pinnedActionId: z.string().min(1).nullable().optional(),
  columns: columnsSchema.nullable().optional(),
  filtersSort: filtersSortSchema.nullable().optional(),
});

function getViewIdFromPath(request: Request): string {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  const viewsIndex = segments.indexOf("views");
  const viewId = viewsIndex >= 0 ? segments[viewsIndex + 1] : null;
  if (!viewId) {
    throw new ApiHttpError(400, "Missing named view id.");
  }
  return viewId;
}

function namedViewSettingsFromBody(body: {
  columns?: CrmViewSettingsPatch["columns"];
  filtersSort?: CrmViewSettingsPatch["filtersSort"];
}) {
  return {
    ...(body.columns ? { columns: body.columns } : {}),
    ...(body.filtersSort ? { filtersSort: body.filtersSort } : {}),
  };
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

export const GET_NAMED_VIEWS = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.read",
      resourceType: "record",
    });

    try {
      const tableId = resolveTableId(request);
      const views = await listCrmNamedViews({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId,
      });

      return NextResponse.json({ tableId, views, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to load named views.", requestId);
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);

export const POST_NAMED_VIEW = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.write",
      resourceType: "record",
    });

    try {
      const body = namedViewCreateSchema.parse(await ensureJsonBody(request));
      const view = await createCrmNamedView({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: body.tableId,
        name: body.name,
        isDefault: body.isDefault,
        pinnedActionId: body.pinnedActionId ?? null,
        settings: namedViewSettingsFromBody(body),
      });

      return NextResponse.json({ view, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to save the named view.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);

export const PUT_NAMED_VIEW = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.write",
      resourceType: "record",
    });

    try {
      const viewId = getViewIdFromPath(request);
      const body = namedViewUpdateSchema.parse(await ensureJsonBody(request));
      await updateCrmNamedView({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: body.tableId,
        viewId,
        name: body.name,
        isDefault: body.isDefault,
        pinnedActionId: body.pinnedActionId,
        settings:
          body.columns !== undefined || body.filtersSort !== undefined
            ? namedViewSettingsFromBody(body)
            : undefined,
      });

      return NextResponse.json({ ok: true, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to update the named view.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);

export const DELETE_NAMED_VIEW = withOperation(
  async ({ auth, request, requestId, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.write",
      resourceType: "record",
    });

    try {
      const viewId = getViewIdFromPath(request);
      const url = new URL(request.url);
      await deleteCrmNamedView({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: resolveTableId(request),
        viewId,
        nextDefaultViewId: url.searchParams.get("nextDefaultViewId"),
      });

      return NextResponse.json({ ok: true, requestId });
    } catch (error) {
      return toErrorResponse(
        error,
        "Failed to delete the named view.",
        requestId,
      );
    }
  },
  {
    roles: ["staff", "admin", "super_admin"],
  },
);
