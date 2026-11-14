import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1931: Partner roster columns at their app boundary.
import { createDonorColumns } from "../../../../apps/missionary/app/donors/donors-page-columns";

// The roster sorts through its own Sort menu. Headers that look sortable (or
// open a menu that only hides the column) would be a second, misleading way.
describe("partner roster headers", () => {
  it("shows the visible columns as plain titles", () => {
    const columns = createDonorColumns();
    for (const key of ["name", "status"]) {
      const column = columns.find(
        (candidate) =>
          "accessorKey" in candidate && candidate.accessorKey === key,
      );
      expect(column?.enableSorting, key).toBe(false);
      expect(column?.enableHiding, key).toBe(false);
    }
  });
});
