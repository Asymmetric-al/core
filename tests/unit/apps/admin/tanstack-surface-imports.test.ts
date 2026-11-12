import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("admin TanStack surface migrations", () => {
  it("routes contributions through shared database hooks and responsive table", () => {
    const mainBodySource = readRepoFile(
      "apps/admin/app/(app)/contributions/main-body.tsx",
    );
    const pageSource = readRepoFile(
      "apps/admin/app/(app)/contributions/page-client.tsx",
    );

    // The hub renders through the shared ReUI grid composition (with its
    // mobile card list), never a hand-rolled table.
    expect(mainBodySource).toMatch(/DataGridPanel/);
    expect(mainBodySource).toMatch(/renderMobileRow/);
    expect(mainBodySource).not.toMatch(/@tanstack\/react-table/);
    expect(pageSource).toMatch(/useAdminContributions/);
    expect(pageSource).toMatch(/mc-contributions-live/);
  });

  it("loads CRM contacts from shared package hooks instead of app-local mock data", () => {
    const source = readRepoFile("apps/admin/app/(app)/crm/page-client.tsx");

    expect(source).toMatch(/useAdminCrmRecordsInfiniteGrid/);
    expect(source).not.toMatch(/MOCK_CONTACTS/);
  });

  it("loads task data from shared package hooks instead of local mock state", () => {
    const source = readRepoFile("apps/admin/app/(app)/tasks/tasks-content.tsx");

    expect(source).toMatch(/useMissionControlNeedsAttention/);
    expect(source).not.toMatch(
      /useTasksRows|useTaskStaff|useTaskLinkedEntities|SampleDataNotice/,
    );
    expect(source).not.toMatch(/MOCK_TASKS/);
  });

  it("re-exports shared care and location hooks from the admin app", () => {
    const locationsSource = readRepoFile(
      "apps/admin/features/mission-control/locations/hooks/use-locations.ts",
    );
    const careSource = readRepoFile(
      "apps/admin/features/mission-control/care/hooks/use-care.ts",
    );

    expect(locationsSource).toMatch(/@asym\/database\/hooks/);
    expect(careSource).toMatch(/@asym\/database\/hooks/);
  });

  it("keeps disconnected Mobilize free of sample collection hooks", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/mobilize/page-client.tsx",
    );
    expect(source).not.toMatch(/useMobilizeCandidates|SampleDataNotice/);
    expect(source).toContain("Pipeline not connected yet");
  });

  it("moves raw table surfaces onto shared hooks for attendees, mobilize, and teams", () => {
    const eventsSource = readRepoFile(
      "apps/admin/app/(app)/events/page-client.tsx",
    );
    const teamsPageSource = readRepoFile(
      "apps/admin/app/(app)/admin/teams/page-client.tsx",
    );

    expect(eventsSource).not.toMatch(
      /useEventAttendees|SampleDataNotice|MOCK_/,
    );
    expect(eventsSource).toContain("Events is not connected yet");
    expect(teamsPageSource).not.toMatch(
      /useTeams|useTeamMembers|SampleDataNotice/,
    );
    expect(teamsPageSource).toMatch(/DataGridPanel/);
  });
});
