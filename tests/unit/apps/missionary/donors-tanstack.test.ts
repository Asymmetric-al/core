import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary donors TanStack migration", () => {
  it("uses the shared missionary donor hook on the page view-model", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(source).toMatch(/useMissionaryDonorRows/);
    expect(source).not.toMatch(/useDataTableVirtualization/);
    expect(source).not.toMatch(/<table/);
    expect(source).not.toMatch(/DataTableResponsive/);
  });

  it("renders the partner roster through the shared table adapter", () => {
    const source = readRepoFile(
      "apps/missionary/app/donors/donors-page-roster.tsx",
    );

    expect(source).toMatch(/DataTableResponsive/);
    expect(source).not.toMatch(/useDataTableVirtualization/);
    expect(source).not.toMatch(/<table/);
    expect(source).not.toMatch(/from "@tanstack\/react-table"/);
  });

  it("keeps missionary donor identity behind the server-redacted hook contract", () => {
    const source = readRepoFile("packages/database/hooks/missionary-donors.ts");

    expect(source).toMatch(/useInfiniteQuery/);
    expect(source).toMatch(/\/api\/missionary\/donors/);
    expect(source).toMatch(/hasMore/);
    expect(source).toMatch(/isLoadingMore/);
    expect(source).toMatch(/loadMore/);
    expect(source).toMatch(/\["donors", "missionary"/);

    expect(source).not.toMatch(/useLiveQuery/);
    expect(source).not.toMatch(/getMissionaryScopedDonorCollections/);
    expect(source).not.toMatch(/buildMissionaryDonorRows/);
  });
});
