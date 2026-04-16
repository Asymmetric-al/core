import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("admin TanStack surface migrations", () => {
  it("routes contributions through shared database hooks and responsive table", () => {
    const liveQuerySource = readRepoFile(
      "apps/admin/app/contributions/live-query.ts",
    );
    const mainBodySource = readRepoFile(
      "apps/admin/app/contributions/main-body.tsx",
    );
    const pageSource = readRepoFile("apps/admin/app/contributions/page.tsx");

    expect(liveQuerySource).toMatch(/@asym\/database\/hooks/);
    expect(mainBodySource).toMatch(/DataTableResponsive/);
    expect(pageSource).toMatch(/useAdminContributions/);
    expect(pageSource).toMatch(/mc-contributions-live/);
  });

  it("loads CRM contacts from shared package hooks instead of app-local mock data", () => {
    const source = readRepoFile("apps/admin/app/crm/page.tsx");

    expect(source).toMatch(/useAdminCrmRecordsInfiniteGrid/);
    expect(source).not.toMatch(/MOCK_CONTACTS/);
  });

  it("loads task data from shared package hooks instead of local mock state", () => {
    const source = readRepoFile("apps/admin/app/tasks/tasks-content.tsx");

    expect(source).toMatch(/useTasksRows/);
    expect(source).toMatch(/useTaskStaff/);
    expect(source).toMatch(/useTaskLinkedEntities/);
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

  it("moves raw table surfaces onto shared hooks for attendees, mobilize, and teams", () => {
    const eventsSource = readRepoFile("apps/admin/app/events/page.tsx");
    const mobilizePageSource = readRepoFile("apps/admin/app/mobilize/page.tsx");
    const mobilizeSectionsSource = readRepoFile(
      "apps/admin/app/mobilize/mobilize-sections.tsx",
    );
    const teamsPageSource = readRepoFile("apps/admin/app/admin/teams/page.tsx");
    const teamsSectionsSource = readRepoFile(
      "apps/admin/app/admin/teams/teams-sections.tsx",
    );

    expect(eventsSource).toMatch(/useEventAttendees/);
    expect(eventsSource).toMatch(/DataTableWrapper/);
    expect(mobilizePageSource).toMatch(/useMobilizeCandidates/);
    expect(mobilizeSectionsSource).toMatch(/DataTableWrapper/);
    expect(teamsPageSource).toMatch(/useTeams/);
    expect(teamsPageSource).toMatch(/useTeamMembers/);
    expect(teamsSectionsSource).toMatch(/DataTableWrapper/);
  });
});
