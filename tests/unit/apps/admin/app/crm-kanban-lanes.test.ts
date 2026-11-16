import { beforeAll, describe, expect, it } from "vitest";

type LaneCue = (
  lanes: ReadonlyArray<{ label: string; left: number; width: number }>,
  view: { scrollLeft: number; clientWidth: number },
) => { direction: "after" | "before"; text: string } | null;

let crmKanbanLaneCue: LaneCue;

/**
 * The phone board's sideways cue names only the lanes that are actually off
 * screen, in the direction they lie, and leaves once every lane is in view.
 */

// Three 300px lanes with 16px gaps in a 358px-wide scroller.
const LANES = [
  { label: "Active", left: 16, width: 300 },
  { label: "Prospect", left: 332, width: 300 },
  { label: "Inactive", left: 648, width: 300 },
];

describe("crmKanbanLaneCue", () => {
  beforeAll(async () => {
    ({ crmKanbanLaneCue } =
      await import("../../../../../apps/admin/app/(app)/crm/kanban-view"));
  }, 120_000);

  it("names the lanes to the right at the start", () => {
    expect(
      crmKanbanLaneCue(LANES, { scrollLeft: 0, clientWidth: 358 }),
    ).toEqual({
      direction: "after",
      text: "Scroll sideways for Prospect and Inactive",
    });
  });

  it("names only the lanes still to the right after scrolling", () => {
    expect(
      crmKanbanLaneCue(LANES, { scrollLeft: 316, clientWidth: 358 }),
    ).toEqual({ direction: "after", text: "Scroll sideways for Inactive" });
  });

  it("points back to the lanes passed once the last lane is in view", () => {
    expect(
      crmKanbanLaneCue(LANES, { scrollLeft: 632, clientWidth: 358 }),
    ).toEqual({
      direction: "before",
      text: "Scroll back for Active and Prospect",
    });
  });

  it("says nothing when every lane fits", () => {
    expect(
      crmKanbanLaneCue(LANES, { scrollLeft: 0, clientWidth: 1000 }),
    ).toBeNull();
  });
});
