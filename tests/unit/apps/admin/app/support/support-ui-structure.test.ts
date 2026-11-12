import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("support hub UI structure", () => {
  it("links the empty inbox to the existing inbox settings route", () => {
    const inbox = readRepoFile(
      "apps/admin/features/support-hub/components/SupportInbox.tsx",
    );
    expect(inbox).toContain('settingsHref="/support/settings/inbox"');
    expect(() =>
      readRepoFile("apps/admin/app/(app)/support/settings/inbox/page.tsx"),
    ).not.toThrow();
  });
  it("renders the phone conversation sheet only below lg, never over the desktop pane", () => {
    const inbox = readRepoFile(
      "apps/admin/features/support-hub/components/SupportInbox.tsx",
    );
    // A Base UI sheet portals out of a CSS-hidden wrapper, so a `lg:hidden`
    // div cannot hide it; the sheet must be gated in render.
    expect(inbox).toMatch(/isDesktop \? null : \(\s*<ConversationDetail/);
    expect(inbox).not.toMatch(
      /<div className="lg:hidden">\s*<ConversationDetail/,
    );
  });

  it("keeps the desktop conversation pane in view, one screen tall, so the reply box is never below the fold", () => {
    const inbox = readRepoFile(
      "apps/admin/features/support-hub/components/SupportInbox.tsx",
    );
    // The pane sticks under the app header and is as tall as the viewport;
    // the thread scrolls inside it with the composer pinned at its foot.
    const pane = inbox.match(
      /className="([^"]*)"\s*>\s*<ConversationDetail[\s\S]*?layout="inline"/,
    );
    expect(pane).not.toBeNull();
    const classes = pane![1]!.split(" ");
    expect(classes).toEqual(
      expect.arrayContaining([
        "lg:sticky",
        "lg:top-12",
        "lg:self-start",
        "lg:h-svh",
        "lg:pb-16",
      ]),
    );
    // Opening a conversation brings the whole pane into view, scrolling only
    // as far as needed, so the reply box is on screen without a hunt.
    expect(inbox).toMatch(/scrollIntoView\?\.\(\{\s*block: "nearest"/);
  });

  it("keeps the reply box compact so the thread keeps room in the desktop pane", () => {
    const editor = readRepoFile(
      "apps/admin/features/support-hub/components/detail/composer/SupportTipTapEditor.tsx",
    );
    const composer = readRepoFile(
      "apps/admin/features/support-hub/components/detail/composer/ConversationComposer.tsx",
    );
    expect(editor).toContain("min-h-20");
    expect(editor).not.toContain("min-h-35");
    // The placeholder carries the "/" and "@" hints; a second hint row only
    // takes height from the thread.
    expect(composer).toContain(
      '"Write a reply… Type / for a canned response."',
    );
    expect(composer).toContain(
      '"Write an internal note… Type @ to mention a teammate."',
    );
    for (const hint of [
      "Type / for a canned response.",
      "Type @ to mention a teammate.",
    ]) {
      expect(composer.split(hint), hint).toHaveLength(2);
    }
  });

  it("keeps every board lane on screen without sideways scrolling: one row when wide, two by two otherwise", () => {
    const board = readRepoFile(
      "apps/admin/features/support-hub/components/board/SupportBoardView.tsx",
    );
    const lane = readRepoFile(
      "apps/admin/features/support-hub/components/board/BoardColumn.tsx",
    );
    // The board's width depends on whether the conversation pane is open,
    // so a container query decides: stacked on phones, two by two at medium
    // widths, then all four in one row once each lane has room. A sideways
    // row hid Resolved off screen with nothing to say it was there.
    expect(board).toContain("@container");
    expect(board).toMatch(/@lg:grid-cols-2/);
    expect(board).toMatch(/@5xl:grid-cols-4/);
    expect(board).not.toMatch(/overflow-x-auto/);
    expect(board).not.toMatch(/@lg:flex-row/);
    expect(lane).not.toMatch(/min-w-64/);
    // Every card stays in page flow at every width. A capped lane that
    // scrolled inside itself hid half the Open lane (a Past due card among
    // them) at 1024 and 640 with only a clipped card as a cue.
    expect(lane).not.toMatch(/max-h-/);
    expect(lane).not.toMatch(/overflow-y-auto/);
    expect(board).not.toMatch(/max-h-/);
    expect(board).not.toMatch(/overflow-y-auto/);
  });

  it("describes the Notifications page by what it controls today", () => {
    const page = readRepoFile(
      "apps/admin/app/(app)/support/settings/notifications/page.tsx",
    );
    expect(page).not.toContain("once Support Hub starts sending them");
    const preferences = readRepoFile(
      "apps/admin/features/support-hub/components/settings/notifications/NotificationPreferencesForm.tsx",
    );
    expect(preferences).toContain("For you");
    expect(page).toContain("NotificationPreferencesForm");
  });

  it("titles the SLA page as its card and settings link do", () => {
    const page = readRepoFile(
      "apps/admin/app/(app)/support/settings/sla/page.tsx",
    );
    const card = readRepoFile(
      "apps/admin/features/support-hub/components/settings/sla/SlaPolicyList.tsx",
    );
    expect(card).toContain('title="SLA policies"');
    expect(page).toContain('title: "SLA policies · Support settings"');
  });

  it("keeps each board lane a full-height drop target beside a taller neighbour", () => {
    const board = readRepoFile(
      "apps/admin/features/support-hub/components/board/SupportBoardView.tsx",
    );
    const lane = readRepoFile(
      "apps/admin/features/support-hub/components/board/BoardColumn.tsx",
    );
    // The drop handlers sit on the lane itself, so a lane shrunk to its
    // cards leaves dead space under it where a drop does nothing. Lanes in
    // a row stretch to the tallest one, and the one-row board keeps a
    // generous floor so even an all-empty board has tall drop targets.
    expect(board).not.toMatch(/items-start/);
    expect(board).toMatch(/@5xl:min-h-120/);
    expect(lane).toMatch(/self-stretch/);
    // An empty lane's drop box fills the whole lane, not a strip at the top.
    expect(lane).toMatch(/"flex min-h-24 flex-1 items-center/);
  });

  it("keeps the inbox chrome short on phones so the first conversation starts on screen", () => {
    const stats = readRepoFile(
      "apps/admin/features/support-hub/components/stats/StatsStrip.tsx",
    );
    const shell = readRepoFile(
      "apps/admin/features/support-hub/components/workspace/SupportWorkspaceShell.tsx",
    );
    const inbox = readRepoFile(
      "apps/admin/features/support-hub/components/SupportInbox.tsx",
    );
    // Each metric's detail fits one line of a phone card (two cards a row).
    const details = [...stats.matchAll(/detail="([^"]+)"/g)].map(
      (match) => match[1]!,
    );
    expect(details.length).toBeGreaterThan(0);
    for (const detail of details) {
      expect(detail.length, detail).toBeLessThanOrEqual(22);
    }
    // Tighter gaps on phones, the roomier ones from sm up.
    expect(shell).toContain("gap-4 sm:gap-6");
    expect(inbox).toContain('className="space-y-3 sm:space-y-4"');
    expect(inbox).toMatch(/"flex flex-col gap-2 sm:gap-3"/);
  });

  it("puts the phone view select and saved views on one row before the first conversation", () => {
    const inbox = readRepoFile(
      "apps/admin/features/support-hub/components/SupportInbox.tsx",
    );
    const savedViews = readRepoFile(
      "apps/admin/features/support-hub/components/views/SavedViewsBar.tsx",
    );
    // Phones: the view select, saved views and Save filter share one row
    // that never wraps; from sm the tab strip takes its own row.
    expect(inbox).toContain(
      '"flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between"',
    );
    // The saved view chips scroll sideways in that row on phones and join
    // the wrapping row again from sm.
    expect(savedViews).toMatch(
      /className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto[^"]*\*:shrink-0[^"]*sm:contents"/,
    );
    // From sm the section must shrink to its row and wrap the chips
    // (flex: 0 1 auto). flex: none kept it at its full one-line width, so
    // many saved views ran off the page or under the open conversation.
    const section = savedViews.match(
      /aria-label="Saved views"\s*className="([^"]+)"/,
    )?.[1];
    expect(section?.split(" ")).toEqual(
      expect.arrayContaining(["sm:flex-initial", "sm:flex-wrap"]),
    );
    expect(section).not.toMatch(/\bsm:flex-none\b/);
    // The "Saved views" and "Save filter" words stay for screen readers on
    // phones; the icons carry them on screen.
    expect(savedViews).toMatch(/"sr-only sm:not-sr-only">Saved views</);
    expect(savedViews).toMatch(/"sr-only sm:not-sr-only">Save filter</);
    // The empty-state hint is a third line on a phone; Save filter says it.
    expect(savedViews).toMatch(
      /className="hidden text-xs text-muted-foreground sm:inline"[\s\S]*No saved views yet/,
    );
  });

  it("shares the phone search row with the layout toggle and puts the three filters on one row", () => {
    const toolbar = readRepoFile(
      "apps/admin/features/support-hub/components/toolbar/InboxToolbar.tsx",
    );
    const status = readRepoFile(
      "apps/admin/features/support-hub/components/toolbar/StatusFilter.tsx",
    );
    const assignee = readRepoFile(
      "apps/admin/features/support-hub/components/toolbar/AssigneeFilter.tsx",
    );
    // The filter group drops below search + layout on phones and returns to
    // its place (before the toggle, as in the tab order) from sm.
    expect(toolbar).toMatch(
      /"order-last flex w-full items-center gap-2 sm:order-none sm:w-auto sm:flex-wrap lg:ml-auto"/,
    );
    expect(toolbar).toMatch(/"min-w-0 flex-1 sm:min-w-64 sm:max-w-md"/);
    // Status and Assignee share the room Labels leaves, never wider.
    expect(
      toolbar.match(
        /"min-w-0 flex-1 sm:flex-none">\s*<(StatusFilter|AssigneeFilter)/g,
      ),
    ).toHaveLength(2);
    expect(status).toContain('className="w-full sm:w-40"');
    // Labels shows its tag icon on phones (the trigger keeps its name), so
    // the status and assignee values are not cut off beside it.
    const labels = readRepoFile(
      "apps/admin/features/support-hub/components/toolbar/LabelFilter.tsx",
    );
    expect(labels).toContain(
      '<span className="sr-only sm:not-sr-only">Labels</span>',
    );
    // The placeholder fits beside the layout toggle on a 390px phone.
    const placeholder = toolbar.match(/placeholder="([^"]+)"/);
    expect(placeholder?.[1]?.length).toBeLessThanOrEqual(24);
    expect(assignee).toContain('className="w-full sm:w-45"');
  });

  it("keeps the inbox filters in view while the board scrolls, beside the open conversation", () => {
    const inbox = readRepoFile(
      "apps/admin/features/support-hub/components/SupportInbox.tsx",
    );
    // Tabs and filters sit in the inbox column, so they stay above the
    // board (not across the pane) and stick under the app header.
    const filters = inbox.match(
      /<div\s+aria-label="Inbox filters"[\s\S]*?className=\{cn\(([\s\S]*?)\)\}/,
    );
    expect(filters).not.toBeNull();
    expect(filters![1]).toContain("lg:sticky lg:top-12");
    // Only on the board: the grid's selection bar sticks there in the table.
    expect(filters![1]).toMatch(/state\.layout === "board"/);
    // Saved views share the tabs' row instead of adding one above them.
    expect(inbox).toMatch(/<ViewTabs[\s\S]*?<SavedViewsBar \/>/);
  });

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

    expect(source).toContain("SupportTicketsTable");
    const table = readRepoFile(
      "apps/admin/features/support-hub/components/tickets/SupportTicketsTable.tsx",
    );
    expect(table).toMatch(/supportHubRoutes\.ticket\(ticket\.id\)/);
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

  it("does not claim a sample knowledge library is available", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/support/knowledge/page.tsx",
    );

    expect(source).not.toContain("supportHubDemoModel");
    expect(source).toContain("Knowledge library isn’t available yet");
    expect(source).toContain("/support/settings/canned-responses");
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
