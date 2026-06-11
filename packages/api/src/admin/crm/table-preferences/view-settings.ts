import type {
  CrmGiftHistoryColumnSettings,
  CrmGiftHistoryFiltersSortSettings,
  CrmGiftHistoryViewSettings,
  CrmViewSettingsLayer,
  CrmViewSettingsScope,
  CrmViewSettingsSource,
} from "@asym/database/types";

/**
 * CRM gift-history view settings (issue #272, ADR-CD-021).
 *
 * One settings surface groups columns, filters/sort, and the pinned row
 * action. The server record is the source of truth; every scope falls back
 * from user preference to tenant default to system default, and granular
 * resets clear only the selected scope with a preview of what changes.
 */

export const CRM_GIFT_HISTORY_SYSTEM_VIEW_SETTINGS: CrmGiftHistoryViewSettings =
  {
    columns: {
      designation: true,
      statusLine: true,
    },
    filtersSort: {
      sortField: "giftDate",
      sortDirection: "desc",
      paymentStatus: "all",
      issue: "all",
    },
  };

function mergeColumns(
  layer: Partial<CrmGiftHistoryColumnSettings> | null | undefined,
  base: CrmGiftHistoryColumnSettings,
): CrmGiftHistoryColumnSettings {
  return {
    designation:
      typeof layer?.designation === "boolean"
        ? layer.designation
        : base.designation,
    statusLine:
      typeof layer?.statusLine === "boolean"
        ? layer.statusLine
        : base.statusLine,
  };
}

const SORT_FIELDS: CrmGiftHistoryFiltersSortSettings["sortField"][] = [
  "giftDate",
  "amountCents",
];
const SORT_DIRECTIONS: CrmGiftHistoryFiltersSortSettings["sortDirection"][] = [
  "asc",
  "desc",
];
const PAYMENT_STATUS_FILTERS: CrmGiftHistoryFiltersSortSettings["paymentStatus"][] =
  ["all", "completed", "refunded"];
const ISSUE_FILTERS: CrmGiftHistoryFiltersSortSettings["issue"][] = [
  "all",
  "needs_attention",
  "receipt_affected",
  "pending_correction",
];

function mergeFiltersSort(
  layer: Partial<CrmGiftHistoryFiltersSortSettings> | null | undefined,
  base: CrmGiftHistoryFiltersSortSettings,
): CrmGiftHistoryFiltersSortSettings {
  return {
    sortField: SORT_FIELDS.includes(
      layer?.sortField as CrmGiftHistoryFiltersSortSettings["sortField"],
    )
      ? layer!.sortField!
      : base.sortField,
    sortDirection: SORT_DIRECTIONS.includes(
      layer?.sortDirection as CrmGiftHistoryFiltersSortSettings["sortDirection"],
    )
      ? layer!.sortDirection!
      : base.sortDirection,
    paymentStatus: PAYMENT_STATUS_FILTERS.includes(
      layer?.paymentStatus as CrmGiftHistoryFiltersSortSettings["paymentStatus"],
    )
      ? layer!.paymentStatus!
      : base.paymentStatus,
    issue: ISSUE_FILTERS.includes(
      layer?.issue as CrmGiftHistoryFiltersSortSettings["issue"],
    )
      ? layer!.issue!
      : base.issue,
  };
}

export interface ResolvedCrmViewSettings {
  settings: CrmGiftHistoryViewSettings;
  sources: {
    columns: CrmViewSettingsSource;
    filtersSort: CrmViewSettingsSource;
  };
}

/**
 * Per-scope fallback: a scope comes wholesale from the highest layer that
 * sets it (user, then tenant default), merged over system defaults so keys
 * added in newer schema versions stay safe.
 */
export function resolveCrmGiftHistoryViewSettings(input: {
  user: CrmViewSettingsLayer | null;
  tenantDefault: CrmViewSettingsLayer | null;
}): ResolvedCrmViewSettings {
  const system = CRM_GIFT_HISTORY_SYSTEM_VIEW_SETTINGS;

  const columnsSource: CrmViewSettingsSource = input.user?.columns
    ? "user"
    : input.tenantDefault?.columns
      ? "tenant_default"
      : "system";
  const filtersSortSource: CrmViewSettingsSource = input.user?.filtersSort
    ? "user"
    : input.tenantDefault?.filtersSort
      ? "tenant_default"
      : "system";

  const columnsLayer =
    columnsSource === "user"
      ? input.user?.columns
      : columnsSource === "tenant_default"
        ? input.tenantDefault?.columns
        : null;
  const filtersSortLayer =
    filtersSortSource === "user"
      ? input.user?.filtersSort
      : filtersSortSource === "tenant_default"
        ? input.tenantDefault?.filtersSort
        : null;

  return {
    settings: {
      columns: mergeColumns(columnsLayer, system.columns),
      filtersSort: mergeFiltersSort(filtersSortLayer, system.filtersSort),
    },
    sources: {
      columns: columnsSource,
      filtersSort: filtersSortSource,
    },
  };
}

export interface CrmViewSettingsResetPreview {
  scope: CrmViewSettingsScope;
  description: string;
  after: {
    settings: CrmGiftHistoryViewSettings;
    pinnedActionId: string | null;
  };
  sources: {
    columns: CrmViewSettingsSource;
    filtersSort: CrmViewSettingsSource;
    pinnedAction: CrmViewSettingsSource;
  };
}

interface PreferenceLayerWithPin {
  settings: CrmViewSettingsLayer | null;
  pinnedActionId: string | null;
}

function describeFallback(source: CrmViewSettingsSource): string {
  return source === "tenant_default"
    ? "the tenant default"
    : "the system default";
}

/**
 * Computes the effective state after resetting the selected scope, without
 * applying anything — resets always preview before they run (ADR-CD-021).
 */
export function previewCrmViewSettingsReset(input: {
  scope: CrmViewSettingsScope;
  user: PreferenceLayerWithPin | null;
  tenantDefault: PreferenceLayerWithPin | null;
}): CrmViewSettingsResetPreview {
  const resetColumns = input.scope === "columns" || input.scope === "all";
  const resetFiltersSort =
    input.scope === "filtersSort" || input.scope === "all";
  const resetPin = input.scope === "pinnedAction" || input.scope === "all";

  const userAfter: CrmViewSettingsLayer = {
    columns: resetColumns ? null : (input.user?.settings?.columns ?? null),
    filtersSort: resetFiltersSort
      ? null
      : (input.user?.settings?.filtersSort ?? null),
  };

  const resolved = resolveCrmGiftHistoryViewSettings({
    user: userAfter,
    tenantDefault: input.tenantDefault?.settings ?? null,
  });

  const userPinAfter = resetPin ? null : (input.user?.pinnedActionId ?? null);
  const tenantPin = input.tenantDefault?.pinnedActionId ?? null;
  const pinnedActionId = userPinAfter ?? tenantPin;
  const pinnedActionSource: CrmViewSettingsSource = userPinAfter
    ? "user"
    : tenantPin
      ? "tenant_default"
      : "system";

  const changes: string[] = [];
  if (resetColumns) {
    changes.push(
      `Columns return to ${describeFallback(resolved.sources.columns)}.`,
    );
  }
  if (resetFiltersSort) {
    changes.push(
      `Filters and sort return to ${describeFallback(resolved.sources.filtersSort)}.`,
    );
  }
  if (resetPin) {
    changes.push(
      tenantPin
        ? "The pinned row action returns to the tenant default."
        : "The pinned row action returns to the system next-best action.",
    );
  }

  return {
    scope: input.scope,
    description: changes.join(" "),
    after: {
      settings: resolved.settings,
      pinnedActionId,
    },
    sources: {
      columns: resolved.sources.columns,
      filtersSort: resolved.sources.filtersSort,
      pinnedAction: pinnedActionSource,
    },
  };
}

/**
 * Tenant defaults are managed by capability holders (super admins, or staff
 * the capability was delegated to via the tenant default record). The
 * delegation never grants contribution operation permissions (ADR-CD-021).
 */
export function canManageCrmTenantDefaults(input: {
  capabilities: string[];
  profileId: string | null;
  delegatedManagerProfileIds: string[];
}): boolean {
  if (input.capabilities.includes("crm.gift_history.manage_view_defaults")) {
    return true;
  }

  return Boolean(
    input.profileId &&
    input.delegatedManagerProfileIds.includes(input.profileId),
  );
}
