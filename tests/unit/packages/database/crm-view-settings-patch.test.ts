import { describe, expect, it } from "vitest";

import { applyCrmViewSettingsPatch } from "../../../../packages/database/types/crm-table-preferences";

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
      { columns: { designation: false } },
      { columns: { designation: true, statusLine: false } },
    );
    expect(result.columns).toEqual({ designation: true, statusLine: false });
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

  it("handles delegatedManagerProfileIds (the key the old hook copy dropped)", () => {
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
