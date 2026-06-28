import { describe, expect, it } from "vitest";

import {
  applyCrmRowActionPin,
  applyCrmTablePreferencePatch,
  applyCrmViewSettingsPatch,
} from "../../../../packages/database/types/crm-table-preferences";

describe("applyCrmViewSettingsPatch", () => {
  it("leaves a scope unchanged when its key is absent (undefined)", () => {
    const existing = {
      columns: { designation: false },
      filtersSort: { sortDirection: "asc" as const },
    };
    expect(applyCrmViewSettingsPatch(existing, {})).toEqual(existing);
  });

  it("replaces a scope when given a value", () => {
    const result = applyCrmViewSettingsPatch(
      { columns: { designation: false, statusLine: true } },
      { columns: { designation: true } },
    );
    expect(result.columns).toEqual({ designation: true });
  });

  it("clears a scope when given null (scoped reset)", () => {
    const result = applyCrmViewSettingsPatch(
      {
        columns: { designation: false },
        filtersSort: { sortDirection: "asc" as const },
      },
      { filtersSort: null },
    );
    expect(result).toEqual({ columns: { designation: false } });
    expect("filtersSort" in result).toBe(false);
  });

  it("handles delegatedManagerProfileIds set and reset", () => {
    const set = applyCrmViewSettingsPatch(null, {
      delegatedManagerProfileIds: ["lead-1", "lead-2"],
    });
    expect(set.delegatedManagerProfileIds).toEqual(["lead-1", "lead-2"]);

    const cleared = applyCrmViewSettingsPatch(set, {
      delegatedManagerProfileIds: null,
    });
    expect("delegatedManagerProfileIds" in cleared).toBe(false);
  });

  it("handles activeViewId set and reset", () => {
    const set = applyCrmViewSettingsPatch(null, { activeViewId: "view-1" });
    expect(set.activeViewId).toBe("view-1");

    const cleared = applyCrmViewSettingsPatch(set, { activeViewId: null });
    expect("activeViewId" in cleared).toBe(false);
  });

  it("does not mutate the input layer", () => {
    const existing = { columns: { designation: false } };
    applyCrmViewSettingsPatch(existing, { columns: { designation: true } });
    expect(existing.columns.designation).toBe(false);
  });
});

describe("applyCrmRowActionPin", () => {
  it("preserves existing view settings when the pinned action changes", () => {
    const response = {
      tableId: "crm-gift-history",
      schemaVersion: 2,
      tenantDefault: null,
      user: {
        actionId: "refund",
        schemaVersion: 1,
        settings: {
          activeViewId: "view-1",
          columns: { designation: true, statusLine: false },
        },
      },
    };

    expect(applyCrmRowActionPin(response, "resend_receipt").user).toEqual({
      actionId: "resend_receipt",
      schemaVersion: 1,
      settings: {
        activeViewId: "view-1",
        columns: { designation: true, statusLine: false },
      },
    });
  });

  it("creates a user preference record from the response schema when none exists", () => {
    const response = {
      tableId: "crm-gift-history",
      schemaVersion: 2,
      tenantDefault: null,
      user: null,
    };

    expect(applyCrmRowActionPin(response, "refund").user).toEqual({
      actionId: "refund",
      schemaVersion: 2,
    });
  });
});

describe("applyCrmTablePreferencePatch", () => {
  it("preserves the stored user schema version during optimistic settings saves", () => {
    const response = {
      tableId: "crm-gift-history",
      schemaVersion: 2,
      tenantDefault: null,
      user: {
        actionId: "refund",
        schemaVersion: 1,
        settings: {
          columns: { designation: false, statusLine: true },
        },
      },
    };

    expect(
      applyCrmTablePreferencePatch(response, {
        columns: { designation: true, statusLine: false },
      }).user,
    ).toEqual({
      actionId: "refund",
      schemaVersion: 1,
      settings: {
        columns: { designation: true, statusLine: false },
      },
    });
  });
});
