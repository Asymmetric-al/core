import { describe, expect, it } from "vitest";

import {
  isNamedReferenceColumn,
  isReferenceColumn,
  referenceColumnTitle,
} from "../../../../apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/reference-labels";

const labels = {
  missionaryId: [{ value: "5b0c-01", label: "Grace Okafor" }],
  fundId: [{ value: "f-01", label: "Clean Water" }],
};

describe("reference columns", () => {
  it("heads a reference column by the record it names once names load", () => {
    expect(referenceColumnTitle("missionaryId", labels)).toBe("Missionary");
    expect(referenceColumnTitle("fundId", labels)).toBe("Fund");
    expect(referenceColumnTitle("title", labels)).toBeNull();
    // Without names the cells show IDs: the field's own heading stands.
    expect(referenceColumnTitle("missionaryId", {})).toBeNull();
    expect(isNamedReferenceColumn("fundId", { fundId: [] })).toBe(false);
    expect(isNamedReferenceColumn("fundId", labels)).toBe(true);
    // Inherited object keys are not reference columns.
    expect(isReferenceColumn("constructor")).toBe(false);
    expect(
      referenceColumnTitle("toString", {
        toString: [{ value: "x", label: "y" }],
      }),
    ).toBeNull();
  });
});
