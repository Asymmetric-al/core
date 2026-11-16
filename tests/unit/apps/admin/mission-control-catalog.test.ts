import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { tiles } from "@asym/config/tiles";
import { WORKFLOWS } from "@asym/lib/mission-control/tiles";
import { describe, expect, it } from "vitest";

describe("Mission Control supported destinations", () => {
  it("only offers module and shortcut links backed by actual pages", () => {
    const appRoot = resolve("apps/admin/app/(app)");
    for (const tile of tiles) {
      if (tile.unavailableReason) continue;
      for (const href of [
        tile.route,
        ...tile.quickActions.map((action) => action.href),
      ]) {
        const pathname = href.split("?")[0]!.replace(/^\//, "");
        // Web Studio is Payload's admin, served by its catch-all route.
        const page = pathname.startsWith("web-studio")
          ? resolve(
              "apps/admin/app/(payload)/web-studio/[[...segments]]/page.tsx",
            )
          : resolve(appRoot, pathname, "page.tsx");
        expect(existsSync(page), href).toBe(true);
      }
    }
  });
  it("does not promise a create or download workflow through a browse destination", () => {
    const crm = tiles.find((tile) => tile.id === "crm")!;
    const contributions = tiles.find((tile) => tile.id === "contributions")!;
    const reports = tiles.find((tile) => tile.id === "reports")!;
    expect(crm.quickActions[0]).toMatchObject({
      label: "Browse CRM",
      href: "/crm",
    });
    expect(contributions.quickActions[0]).toMatchObject({
      label: "View contributions",
      href: "/contributions",
    });
    expect(reports.quickActions[0]).toMatchObject({
      label: "View reports",
      href: "/reports",
    });
  });
});

/**
 * Pages that say their main job is not connected yet. Home must not send
 * anyone there as if the job could be done: /events and /mobilize show
 * "not connected" notices, and Organization updates disables Publish.
 */
const NOT_CONNECTED = ["/events", "/mobilize", "/feed/org-updates"];

describe("Home promises only what each module can do today", () => {
  it("marks Events as not set up, so it is not counted as openable", () => {
    const events = tiles.find((tile) => tile.id === "events")!;
    expect(events.unavailableReason).toBe("Events is not connected yet.");
  });

  it("offers no shortcut or common task into a page that is not connected", () => {
    const destinations = [
      ...tiles
        .filter((tile) => !tile.unavailableReason)
        .flatMap((tile) => tile.quickActions.map((action) => action.href)),
      ...WORKFLOWS.map((workflow) => workflow.route),
    ];
    for (const href of NOT_CONNECTED) {
      expect(destinations, href).not.toContain(href);
    }
  });

  it("starts every common task in a module that is set up", () => {
    for (const workflow of WORKFLOWS) {
      const tile = tiles.find((entry) => entry.id === workflow.primaryTile);
      expect(tile, workflow.id).toBeDefined();
      expect(tile!.unavailableReason, workflow.id).toBeUndefined();
    }
  });

  it("describes Mobilize by its working locations map, not the pipeline", () => {
    const mobilize = tiles.find((tile) => tile.id === "mobilize")!;
    const copy = `${mobilize.purpose} ${mobilize.inside}`;
    expect(copy).toMatch(/locations/i);
    expect(copy).toMatch(/not set up yet/i);
    expect(mobilize.inside).not.toMatch(/Pipeline|Stages|Candidate profiles/);
  });

  it("describes Ministry Updates and Tasks as the pages work today", () => {
    const feed = tiles.find((tile) => tile.id === "feed")!;
    expect(`${feed.purpose} ${feed.inside}`).not.toMatch(/publish/i);
    const tasks = tiles.find((tile) => tile.id === "tasks")!;
    // The Tasks page is the follow-up queue; it has no personal to-dos or
    // due dates.
    expect(`${tasks.purpose} ${tasks.inside}`).not.toMatch(
      /to-dos|due dates|my tasks|calls/i,
    );
    expect(tasks.purpose).toMatch(/follow-ups/i);
  });
});
