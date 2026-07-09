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
import { resolveCanManageCrmTenantDefaults } from "./view-settings";
import { requireCrmAccess } from "../../../crm/auth/access";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../../../shared/http-errors";
import {
  withOperation,
  type OperationRouteContext,
} from "../../../shared/with-operation";
import { resolveContributionCapabilities } from "../../contribution-operations/permissions";

const KNOWN_TABLE_IDS = [CRM_GIFT_HISTORY_TABLE_ID] as const;

const tableIdSchema = z.enum(KNOWN_TABLE_IDS);
const profileIdSchema = z.string().uuid();

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
  activeViewId: z.string().uuid().nullable().optional(),
});

const tenantDefaultSchema = savePreferenceSchema
  .omit({ activeViewId: true })
  .extend({
    delegatedManagerProfileIds: z.array(profileIdSchema).nullable().optional(),
  });

function settingsPatchFromBody(body: {
  columns?: CrmViewSettingsPatch["columns"];
  filtersSort?: CrmViewSettingsPatch["filtersSort"];
  delegatedManagerProfileIds?: string[] | null;
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

const optionalViewIdSchema = z.string().uuid().nullable();

async function getViewIdFromRouteContext(
  routeContext: OperationRouteContext | undefined,
): Promise<string> {
  const params = await routeContext?.params;
  const viewId = params?.viewId;
  const resolved = Array.isArray(viewId) ? viewId[0] : viewId;
  if (!resolved) {
    throw new ApiHttpError(400, "Missing named view id.");
  }

  return resolved;
}

function namedViewSettingsFromBody(body: {
  columns?: CrmViewSettingsPatch["columns"];
  filtersSort?: CrmViewSettingsPatch["filtersSort"];
}): CrmViewSettingsPatch {
  const patch: CrmViewSettingsPatch = {};
  if (body.columns !== undefined) {
    patch.columns = body.columns;
  }
  if (body.filtersSort !== undefined) {
    patch.filtersSort = body.filtersSort;
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
      const profileId = requireProfileId(actor.profileId);
      const preferences = await getCrmTablePreferences({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId,
        tableId: resolveTableId(request),
      });

      // Same gate PUT_TENANT_DEFAULT enforces (issue #272): visibility of the
      // tenant-default management UI follows the write authority exactly.
      const canManageTenantDefaults = resolveCanManageCrmTenantDefaults({
        capabilities: resolveContributionCapabilities(auth),
        profileId,
        tenantDefault: preferences.tenantDefault,
      });

      return NextResponse.json({
        ...preferences,
        canManageTenantDefaults,
        requestId,
      });
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
      const actorCanManageDefaults = capabilities.includes(
        "crm.gift_history.manage_view_defaults",
      );
      const current = await getCrmTablePreferences({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId,
        tableId: body.tableId,
      });
      if (
        !resolveCanManageCrmTenantDefaults({
          capabilities,
          profileId,
          tenantDefault: current.tenantDefault,
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
        !actorCanManageDefaults
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
        actorCanManageDefaults,
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
  async ({ auth, request, requestId, routeContext, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.write",
      resourceType: "record",
    });

    try {
      const viewId = await getViewIdFromRouteContext(routeContext);
      const body = namedViewUpdateSchema.parse(await ensureJsonBody(request));
      const view = await updateCrmNamedView({
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

      return NextResponse.json({ ok: true, view, requestId });
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
  async ({ auth, request, requestId, routeContext, supabaseAdmin }) => {
    const actor = requireCrmAccess(auth, {
      action: "crm.table_preferences.write",
      resourceType: "record",
    });

    try {
      const viewId = await getViewIdFromRouteContext(routeContext);
      const url = new URL(request.url);
      const nextDefaultViewId = optionalViewIdSchema.parse(
        url.searchParams.get("nextDefaultViewId"),
      );
      await deleteCrmNamedView({
        supabaseAdmin,
        tenantId: actor.tenantId,
        profileId: requireProfileId(actor.profileId),
        tableId: resolveTableId(request),
        viewId,
        nextDefaultViewId,
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
