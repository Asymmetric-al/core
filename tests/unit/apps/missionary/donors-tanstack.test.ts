import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary donors TanStack migration", () => {
  it("uses the shared missionary donor hook and shared tables for both donor surfaces", () => {
    const source = readRepoFile("apps/missionary/app/donors/page.tsx");

    expect(source).toMatch(/useMissionaryDonorRows/);
    expect(source).toMatch(/DataTableResponsive/);
    expect(source).not.toMatch(/useDataTableVirtualization/);
    expect(source).not.toMatch(/<table/);
  });
});
