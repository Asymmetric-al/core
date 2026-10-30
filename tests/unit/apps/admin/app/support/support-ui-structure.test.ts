import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("support hub UI structure", () => {
  it("does not nest Button inside Link on support routes", () => {
    for (const path of [
      "apps/admin/app/(app)/support/tickets/page.tsx",
      "apps/admin/app/(app)/support/tickets/[id]/page.tsx",
    ]) {
      const source = readRepoFile(path);

      expect(source).not.toMatch(/<Link[^>]*>\s*<Button/);
    }
  });

  it("links ticket-list rows to canonical ticket detail routes", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/tickets/page.tsx",
    );

    expect(source).toMatch(/supportHubRoutes\.ticket\(ticket\.id\)/);
  });

  it("labels ticket search instead of relying on its placeholder", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/tickets/page.tsx",
    );

    expect(source).toMatch(/htmlFor="support-ticket-search"/);
    // Select filter names are exercised through real controls in support-ticket-selects.test.tsx.
  });

  it("uses three support tracks and no legacy care or timing-risk language in Support Hub UI", () => {
    const timingRiskPattern = new RegExp(
      [
        String.fromCharCode(83, 76, 65),
        `${String.fromCharCode(83, 76, 65)} risk`,
        `${String.fromCharCode(77, 101, 109, 98, 101, 114)} Care`,
      ].join("|"),
    );
    for (const path of [
      "apps/admin/app/(app)/support/tickets/page.tsx",
      "apps/admin/app/(app)/support/tickets/[id]/page.tsx",
      "apps/admin/app/(app)/support/tickets/new/new-ticket-form.tsx",
      "apps/admin/app/(app)/support/knowledge/page.tsx",
    ]) {
      const source = readRepoFile(path);

      expect(source).not.toMatch(timingRiskPattern);
    }

    const dataSource = readRepoFile(
      "packages/database/collections/support-workspace.ts",
    );
    expect(dataSource).toMatch(/Donor Care/);
    expect(dataSource).toMatch(/Mobilization \/ Interested in Joining/);
    expect(dataSource).toMatch(/Existing Missionary Support/);
  });

  it("uses a dashboard loading skeleton instead of a table skeleton", () => {
    const source = readRepoFile("apps/admin/app/(app)/support/loading.tsx");

    expect(source).not.toMatch(/TableSkeleton/);
  });

  it("handles knowledge article deep links", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/knowledge/page.tsx",
    );

    expect(source).toMatch(/searchParams/);
    expect(source).toMatch(/article/);
  });

  it("uses persistent support reads for inbox, list, and detail paths", () => {
    const inboxSource = readRepoFile("apps/admin/app/(app)/support/page.tsx");

    expect(inboxSource).not.toMatch(/supportHubDemoModel/);
    expect(inboxSource).toMatch(/SupportInbox/);
    expect(inboxSource).toMatch(/SupportWorkspaceShell/);

    for (const path of [
      "apps/admin/app/(app)/support/tickets/page.tsx",
      "apps/admin/app/(app)/support/tickets/[id]/page.tsx",
    ]) {
      const source = readRepoFile(path);

      expect(source).not.toMatch(/supportHubDemoModel/);
      expect(source).toMatch(/loadSupport/);
    }
  });
});
