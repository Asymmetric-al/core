import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary-app high-complexity extraction contracts", () => {
  it("keeps DonorsPageContent on header, stats, list, detail, and dialog siblings", () => {
    const content = readRepoFile(
      "apps/missionary/app/donors/donors-page-content.tsx",
    );
    const view = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(content).toContain("export function DonorsPageContent(");
    expect(content).toContain("<DonorsPageHeader");
    expect(content).toContain("<DonorsPageStats");
    expect(content).toContain("<DonorsPageRoster");
    expect(content).toContain("<DonorsPageDetail");
    expect(content).toContain("<DonorsPageActivityDialogs");
    expect(content).not.toContain("Manage your support network");
    expect(content).not.toContain("Search partners...");
    expect(content).not.toContain("Select a Partner");

    expect(view).toContain("export function DonorsPageViewProvider(");
    expect(view).toContain("export function useDonorsPageViewFields(");
    expect(view).not.toContain("function DonorsPageHeader(");
    expect(view).not.toContain("function DonorsPageContent(");
  });
});
