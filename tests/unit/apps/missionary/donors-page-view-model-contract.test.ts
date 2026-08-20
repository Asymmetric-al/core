import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary donors page view-model contract", () => {
  it("keeps the donors page view-model file-local and independent of useAuth return shape", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(source).toContain(
      'import type { Profile } from "@asym/database/types";',
    );
    expect(source).toContain("type DonorsPageViewModel = {");
    expect(source).toContain("profile: Profile | null;");
    expect(source).not.toContain("export type DonorsPageViewModel");
    expect(source).not.toContain('ReturnType<typeof useAuth>["profile"]');
  });

  it("keeps table column factories out of the page view-model", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(source).not.toContain("tables:");
    expect(source).not.toContain("ColumnDef");
    expect(source).not.toContain("DataTableResponsive");
    expect(source).not.toContain("createDonorColumns");
    expect(source).not.toContain("createGivingHistoryColumns");
    expect(source).not.toContain("@asym/ui/components/shadcn/data-table");
    expect(source).not.toContain("@tanstack/react-table");
    expect(source).not.toContain("./donors-page-columns");
  });
});
