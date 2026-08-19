import { readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

const donorsDir = new URL("apps/missionary/app/donors/", root);

describe("missionary Partners page module shape", () => {
  it("keeps the route default export as the public interface without blocking Instant Navigation", () => {
    const page = readRepoFile("apps/missionary/app/donors/page.tsx");
    const client = readRepoFile(
      "apps/missionary/app/donors/donors-page-client.tsx",
    );

    expect(page).toContain('export { default } from "./donors-page-client"');
    expect(page).toContain('title: "Partners"');
    expect(page).not.toMatch(/^\s*await\b/m);
    expect(page).not.toMatch(/\bawait\s+[A-Za-z_$]/);
    expect(page).not.toMatch(/getAuthContext/);
    expect(page).not.toMatch(/export const instant = false/);
    expect(page).not.toMatch(/<Suspense/);

    expect(client).toContain("DonorsPageViewProvider");
    expect(client).toContain("DonorsPageContent");
    expect(client).not.toContain("function DonorsPageView");
    expect(client).not.toContain("DonorsPageContent {...viewModel}");
  });

  it("keeps the fat view-model file-local and drops compiler opt-out from app donors files", () => {
    const hook = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );

    expect(hook).toContain("export function DonorsPageViewProvider");
    expect(hook).toContain("export function useDonorsPageViewFields");
    expect(hook).not.toContain("export function DonorsPageContent");
    expect(hook).not.toContain("export type DonorsPageViewModel");

    const donorFiles = readdirSync(donorsDir).filter((name) =>
      /\.(tsx|ts)$/.test(name),
    );

    for (const name of donorFiles) {
      const source = readFileSync(new URL(name, donorsDir), "utf8");
      expect(source, name).not.toContain('"use no memo"');
    }
  });

  it("keeps Gift Anonymity by refusing TanStack DB live queries on the Partners surface", () => {
    const donorFiles = readdirSync(donorsDir).filter((name) =>
      /\.(tsx|ts)$/.test(name),
    );

    for (const name of donorFiles) {
      const source = readFileSync(new URL(name, donorsDir), "utf8");
      expect(source, name).not.toMatch(/useLiveQuery/);
      expect(source, name).not.toMatch(/getMissionaryScopedDonorCollections/);
      expect(source, name).not.toMatch(/buildMissionaryDonorRows/);
    }
  });

  it("keeps list virtualization enabled on the roster adapter", () => {
    const roster = readRepoFile(
      "apps/missionary/app/donors/donors-page-roster.tsx",
    );

    expect(roster).toMatch(/virtualization:\s*\{[\s\S]*enabled:\s*true,/);
    expect(roster).toMatch(/estimateSize:\s*88,/);
    expect(roster).not.toMatch(/shouldVirtualizeDonorList/);
  });
});
