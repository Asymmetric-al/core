import { describe, expect, it } from "vitest";

import {
  canManageCrmTenantDefaults,
  CRM_GIFT_HISTORY_SYSTEM_VIEW_SETTINGS,
  previewCrmViewSettingsReset,
  resolveCrmGiftHistoryViewSettings,
} from "../../../../../packages/api/src/admin/crm/table-preferences/view-settings";

describe("admin/crm/table-preferences/view-settings", () => {
  it("resolves system defaults when no preference layers exist", () => {
    const resolved = resolveCrmGiftHistoryViewSettings({
      user: null,
      tenantDefault: null,
    });

    expect(resolved.settings).toEqual(CRM_GIFT_HISTORY_SYSTEM_VIEW_SETTINGS);
    expect(resolved.sources).toEqual({
      columns: "system",
      filtersSort: "system",
    });
  });

  it("prefers user scopes, then tenant default scopes, then system", () => {
    const resolved = resolveCrmGiftHistoryViewSettings({
      user: { columns: { designation: false } },
      tenantDefault: {
        columns: { designation: true, statusLine: false },
        filtersSort: { sortDirection: "asc" },
      },
    });

    // User columns win and merge over system defaults for missing keys.
    expect(resolved.settings.columns).toEqual({
      designation: false,
      statusLine: true,
    });
    expect(resolved.sources.columns).toBe("user");

    // Filters/sort fall through to the tenant default scope.
    expect(resolved.settings.filtersSort.sortDirection).toBe("asc");
    expect(resolved.settings.filtersSort.sortField).toBe("giftDate");
    expect(resolved.sources.filtersSort).toBe("tenant_default");
  });

  it("ignores unknown keys from older/newer schema versions", () => {
    const resolved = resolveCrmGiftHistoryViewSettings({
      user: {
        columns: {
          designation: false,
          legacyColumn: true,
        } as Record<string, boolean>,
      },
      tenantDefault: null,
    });

    expect(resolved.settings.columns).toEqual({
      designation: false,
      statusLine: true,
    });
  });

  it("previews a scoped columns reset falling back to the tenant default", () => {
    const preview = previewCrmViewSettingsReset({
      scope: "columns",
      user: {
        settings: { columns: { designation: false, statusLine: false } },
        pinnedActionId: "amount_correction",
      },
      tenantDefault: {
        settings: { columns: { designation: true, statusLine: false } },
        pinnedActionId: null,
      },
    });

    expect(preview.after.settings.columns).toEqual({
      designation: true,
      statusLine: false,
    });
    // Only the selected scope resets; the pin stays.
    expect(preview.after.pinnedActionId).toBe("amount_correction");
    expect(preview.sources.columns).toBe("tenant_default");
    expect(preview.description).toMatch(/columns/i);
    expect(preview.description).toMatch(/tenant default/i);
  });

  it("previews a pinned action reset falling back to system next-best", () => {
    const preview = previewCrmViewSettingsReset({
      scope: "pinnedAction",
      user: {
        settings: null,
        pinnedActionId: "amount_correction",
      },
      tenantDefault: null,
    });

    expect(preview.after.pinnedActionId).toBeNull();
    expect(preview.sources.pinnedAction).toBe("system");
    expect(preview.description).toMatch(/pinned row action/i);
    expect(preview.description).toMatch(/system/i);
  });

  it("previews reset-all across every scope", () => {
    const preview = previewCrmViewSettingsReset({
      scope: "all",
      user: {
        settings: {
          columns: { designation: false },
          filtersSort: { sortDirection: "asc" },
        },
        pinnedActionId: "refund",
      },
      tenantDefault: {
        settings: { filtersSort: { sortDirection: "desc" } },
        pinnedActionId: "resend_receipt",
      },
    });

    expect(preview.after.settings.columns).toEqual(
      CRM_GIFT_HISTORY_SYSTEM_VIEW_SETTINGS.columns,
    );
    expect(preview.after.settings.filtersSort.sortDirection).toBe("desc");
    expect(preview.after.pinnedActionId).toBe("resend_receipt");
    expect(preview.sources).toEqual({
      columns: "system",
      filtersSort: "tenant_default",
      pinnedAction: "tenant_default",
    });
  });

  it("gates tenant default management to capability holders or delegates", () => {
    expect(
      canManageCrmTenantDefaults({
        capabilities: ["crm.gift_history.manage_view_defaults"],
        profileId: "profile-1",
        delegatedManagerProfileIds: [],
      }),
    ).toBe(true);

    expect(
      canManageCrmTenantDefaults({
        capabilities: [],
        profileId: "profile-2",
        delegatedManagerProfileIds: ["profile-2"],
      }),
    ).toBe(true);

    expect(
      canManageCrmTenantDefaults({
        capabilities: ["contributions.run_refunds"],
        profileId: "profile-3",
        delegatedManagerProfileIds: ["profile-2"],
      }),
    ).toBe(false);
  });
});
