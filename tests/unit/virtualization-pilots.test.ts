import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("virtualization pilot screens", () => {
  it("keeps donor history virtualization enabled instead of threshold-toggling", () => {
    const source = readRepoFile(
      "apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx",
    );

    expect(source).not.toMatch(
      /const shouldVirtualize = filteredTransactions\.length > 30;/,
    );
    expect(source).toMatch(/enabled:\s*true,/);
  });

  it("keeps missionary donor list virtualization enabled instead of threshold-toggling", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(source).not.toMatch(
      /const shouldVirtualizeDonorList = filteredDonors\.length > 30;/,
    );
    expect(source).toMatch(/enabled:\s*true,/);
  });
});
