import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("donor history TanStack migration", () => {
  it("uses the shared donor history hook and responsive data table", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx",
    );

    expect(source).toMatch(/useDonorHistoryTransactions/);
    expect(source).toMatch(/DataTableResponsive/);
    expect(source).not.toMatch(/useDataTableVirtualization/);
    expect(source).not.toMatch(/<table/);
  });
});
