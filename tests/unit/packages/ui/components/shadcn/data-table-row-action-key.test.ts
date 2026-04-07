import { describe, expect, it } from "vitest";

import { getDataTableRowActionKey } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-row-action-key";

describe("getDataTableRowActionKey", () => {
  it("uses id when provided so duplicate labels stay unique", () => {
    const a = { id: "edit", label: "Open" };
    const b = { id: "view", label: "Open" };
    expect(getDataTableRowActionKey(a, 0)).toBe("edit");
    expect(getDataTableRowActionKey(b, 1)).toBe("view");
  });

  it("falls back to index when id is omitted", () => {
    expect(getDataTableRowActionKey({ label: "Open" }, 2)).toBe(2);
  });
});
