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
    const adapterFiles = [
      "donors-page-client.tsx",
      "donors-page-content.tsx",
      "donors-page-detail.tsx",
      "donors-page-detail-overview.tsx",
      "donors-page-detail-contact.tsx",
      "donors-page-detail-recurring.tsx",
      "donors-page-dialogs.tsx",
      "donors-page-header.tsx",
      "donors-page-roster.tsx",
      "donors-page-states.tsx",
      "donors-page-stats.tsx",
    ];

    for (const name of donorFiles) {
      const source = readFileSync(new URL(name, donorsDir), "utf8");
      expect(source, name).not.toMatch(/useLiveQuery/);
      expect(source, name).not.toMatch(/getMissionaryScopedDonorCollections/);
      expect(source, name).not.toMatch(/buildMissionaryDonorRows/);
    }

    const viewHook = readRepoFile(
      "apps/missionary/app/donors/use-donors-page-view.tsx",
    );
    expect(viewHook).toMatch(
      /import\s+\{[^}]*useMissionaryDonorRows[^}]*\}\s+from\s+"@asym\/database\/hooks"/,
    );
    expect(viewHook).toContain("toPartnerSafeDonor");

    for (const name of adapterFiles) {
      const source = readRepoFile(`apps/missionary/app/donors/${name}`);
      expect(source, name).not.toMatch(
        /import\s+(?!type\b)[^;]*useMissionaryDonorRows/,
      );
      expect(source, name).not.toMatch(
        /import\s+(?!type\b)[^;]*from\s+"\.\/donor-mutation-client"/,
      );
    }
  });

  it("keeps list virtualization enabled on the roster adapter", () => {
    const roster = readRepoFile(
      "apps/missionary/app/donors/donors-page-roster.tsx",
    );

    expect(roster).toMatch(/virtualization:\s*\{[\s\S]*enabled:\s*true,/);
    expect(roster).toMatch(/estimateSize:\s*88,/);
    expect(roster).toMatch(/enablePagination:\s*false/);
    expect(roster).not.toMatch(/shouldVirtualizeDonorList/);
    expect(roster).not.toContain("<ScrollArea");
    expect(roster).not.toContain("emptyState=");
  });

  it("documents server-redacted partner loading instead of client RLS", () => {
    const page = readRepoFile("apps/missionary/app/donors/page.tsx");

    expect(page).toContain("GET /api/missionary/donors");
    expect(page).toContain("supabaseAdmin");
    expect(page).not.toContain("under RLS");
  });

  it("keeps Export disabled until an export handler exists", () => {
    const header = readRepoFile(
      "apps/missionary/app/donors/donors-page-header.tsx",
    );

    expect(header).toMatch(/<Button[\s\S]*disabled[\s\S]*>[\s\S]*Export/);
  });

  it("names loading, error, filter, sort, and pressable controls", () => {
    const states = readRepoFile(
      "apps/missionary/app/donors/donors-page-states.tsx",
    );
    const roster = readRepoFile(
      "apps/missionary/app/donors/donors-page-roster.tsx",
    );
    const stats = readRepoFile(
      "apps/missionary/app/donors/donors-page-stats.tsx",
    );
    const dialogs = readRepoFile(
      "apps/missionary/app/donors/donors-page-dialogs.tsx",
    );

    expect(states).toContain('role="status"');
    expect(states).toContain('aria-busy="true"');
    expect(states).toContain('aria-label="Loading partners"');
    expect(states).toContain('role="alert"');
    expect(roster).toContain('aria-label="Sort partners"');
    expect(roster).toContain('aria-label="Filter partners"');
    expect(roster).toContain("Search partners");
    expect(roster).toContain('type="button"');
    expect(roster).toContain("Needs Attention");
    expect(stats).toContain("needsAttention");
    expect(stats).toContain("aria-pressed");
    expect(dialogs).toContain("aria-pressed");
  });

  it("splits detail tabs so the shell stays under the 1k-line bar", () => {
    const detail = readRepoFile(
      "apps/missionary/app/donors/donors-page-detail.tsx",
    );
    const overview = readRepoFile(
      "apps/missionary/app/donors/donors-page-detail-overview.tsx",
    );
    const contact = readRepoFile(
      "apps/missionary/app/donors/donors-page-detail-contact.tsx",
    );
    const recurring = readRepoFile(
      "apps/missionary/app/donors/donors-page-detail-recurring.tsx",
    );

    expect(detail.split("\n").length).toBeLessThan(1000);
    expect(detail).toContain("DonorsPageDetailOverview");
    expect(detail).toContain("DonorsPageDetailContact");
    expect(detail).toContain("DonorsPageDetailRecurring");
    expect(detail).not.toContain("No activity recorded yet");
    expect(detail).not.toContain("Mailing Address");
    expect(detail).not.toContain("Scheduled giving commitments");
    expect(overview).toContain("No activity recorded yet");
    expect(contact).toContain("Mailing Address");
    expect(contact).toContain("CONTACT_COLOR_CLASSES");
    expect(contact).toContain("hover:text-emerald-600");
    expect(contact).toContain("hover:text-purple-600");
    expect(recurring).toContain("Scheduled giving commitments");
    expect(detail).not.toMatch(/text-\$\{/);
    expect(contact).not.toMatch(/text-\$\{/);
  });
});
