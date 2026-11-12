import { beforeAll, describe, expect, it } from "vitest";

/**
 * CRM grids size to their panel: the name column takes the leftover width,
 * and lower-priority columns start hidden when the panel cannot fit them, so
 * names are not cut off while low-value columns hold space and the grid never
 * scrolls sideways by default.
 */

type Visibility = Record<string, boolean>;
type Layout = {
  columnVisibility: Visibility;
  columnSizing: Record<string, number>;
};
type LayoutColumn = { id: string; size: number; minSize?: number };

let resolveCrmGridLayout: (input: {
  width: number | null;
  columns: LayoutColumn[];
  fillColumnId: string;
  tiers: Visibility[];
  overrides: Visibility;
  keepVisible?: string[];
  fillMinimums?: Array<number | undefined>;
}) => Layout;
let crmGridLayoutColumns: (columns: never) => LayoutColumn[];
let diffCrmColumnVisibility: (
  next: Visibility,
  defaults: Visibility,
) => Visibility;

beforeAll(async () => {
  ({ resolveCrmGridLayout, crmGridLayoutColumns, diffCrmColumnVisibility } =
    await import("../../../../../apps/admin/app/(app)/crm/use-crm-grid-layout"));
});

const columns = [
  { id: "name", size: 260, minSize: 240 },
  { id: "type", size: 110 },
  { id: "owner", size: 180 },
  { id: "amount", size: 130 },
  { id: "tags", size: 120 },
];

const tiers = [{}, { tags: false }, { tags: false, owner: false }];

function visibleTotal(layout: Layout): number {
  return columns
    .filter((column) => layout.columnVisibility[column.id] !== false)
    .reduce(
      (sum, column) => sum + (layout.columnSizing[column.id] ?? column.size),
      0,
    );
}

describe("CRM grid layout", () => {
  it("keeps the widest tier and declared sizes before the panel is measured", () => {
    const layout = resolveCrmGridLayout({
      width: null,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: {},
    });
    expect(layout.columnVisibility).toEqual({});
    expect(layout.columnSizing).toEqual({});
  });

  it("gives the leftover width to the name column when every column fits", () => {
    const layout = resolveCrmGridLayout({
      width: 1000,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: {},
    });
    expect(layout.columnVisibility).toEqual({});
    expect(layout.columnSizing).toEqual({ name: 1000 - 110 - 180 - 130 - 120 });
    expect(visibleTotal(layout)).toBe(1000);
  });

  it("drops to the first tier that fits instead of scrolling sideways", () => {
    const medium = resolveCrmGridLayout({
      width: 700,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: {},
    });
    expect(medium.columnVisibility).toEqual({ tags: false });
    expect(visibleTotal(medium)).toBe(700);

    const narrow = resolveCrmGridLayout({
      width: 500,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: {},
    });
    expect(narrow.columnVisibility).toEqual({ tags: false, owner: false });
    expect(visibleTotal(narrow)).toBe(500);
  });

  it("lets View menu choices win and keeps the name at its minimum", () => {
    const layout = resolveCrmGridLayout({
      width: 500,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: { tags: true, owner: true },
    });
    expect(layout.columnVisibility).toEqual({ tags: true, owner: true });
    // Too many columns for the panel: the name holds its minimum and the
    // grid scrolls, rather than squeezing the name to nothing.
    expect(layout.columnSizing).toEqual({ name: 240 });
  });

  it("keeps a sorted or filtered column visible, dropping to a tier that fits it", () => {
    // tags is hidden from the second tier on, but it is the sorted column.
    const layout = resolveCrmGridLayout({
      width: 700,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: {},
      keepVisible: ["tags"],
    });
    expect(layout.columnVisibility).toEqual({ tags: true, owner: false });
    expect(visibleTotal(layout)).toBe(700);
  });

  it("still lets a View menu choice hide a kept column", () => {
    const layout = resolveCrmGridLayout({
      width: 1000,
      columns,
      fillColumnId: "name",
      tiers,
      overrides: { tags: false },
      keepVisible: ["tags"],
    });
    expect(layout.columnVisibility.tags).toBe(false);
  });

  it("chooses a tier only when it leaves the name its tier minimum", () => {
    // The widest tier needs the name at 400px or more, not just its 240px
    // column minimum; below that the next tier (tags hidden) is used.
    const resolve = (width: number) =>
      resolveCrmGridLayout({
        width,
        columns,
        fillColumnId: "name",
        tiers,
        overrides: {},
        fillMinimums: [400],
      });
    // 110 + 180 + 130 + 120 = 540 beside the name: 940 leaves it 400.
    expect(resolve(940).columnVisibility).toEqual({});
    expect(resolve(940).columnSizing).toEqual({ name: 400 });
    expect(resolve(939).columnVisibility).toEqual({ tags: false });
    expect(visibleTotal(resolve(939))).toBe(939);
  });

  it("reads ids and sizes from column definitions", () => {
    expect(
      crmGridLayoutColumns([
        { id: "displayName", size: 260, minSize: 240 },
        { accessorKey: "recordType", size: 110 },
        { accessorKey: "tags" },
      ] as never),
    ).toEqual([
      { id: "displayName", size: 260, minSize: 240 },
      { id: "recordType", size: 110, minSize: undefined },
      { id: "tags", size: 150, minSize: undefined },
    ]);
  });

  it("stores only the columns the viewer changed from the defaults", () => {
    expect(
      diffCrmColumnVisibility(
        { tags: false, owner: true, type: true },
        { tags: false },
      ),
    ).toEqual({});
    expect(
      diffCrmColumnVisibility({ tags: true, owner: false }, { tags: false }),
    ).toEqual({ tags: true, owner: false });
  });
});

describe("CRM records column budget", () => {
  /** The records panel at a 1440px viewport, measured in the browser. */
  const DESKTOP_PANEL_WIDTH = 1172;
  /** "monthly-donor" badge, gap and "+1" plus the cell's 12px padding. */
  const TAGS_CONTENT_WIDTH = 146;

  it("puts record identity before tags at 1440px and brings tags back on wider panels", async () => {
    const { getCrmColumns, CRM_COLUMN_TIERS, CRM_FILL_COLUMN_ID } =
      await import("../../../../../apps/admin/app/(app)/crm/columns");
    const recordColumns = crmGridLayoutColumns(
      getCrmColumns({ onViewRecord: () => {} }) as never,
    );
    const resolve = (width: number) =>
      resolveCrmGridLayout({
        width,
        columns: recordColumns,
        fillColumnId: CRM_FILL_COLUMN_ID,
        tiers: CRM_COLUMN_TIERS,
        overrides: {},
        keepVisible: ["lastTouchAt"],
      });

    const desktop = resolve(DESKTOP_PANEL_WIDTH);
    for (const id of [
      "recordType",
      "assignedMissionaryName",
      "lastGiftAt",
      "lastTouchAt",
    ]) {
      expect(desktop.columnVisibility[id]).not.toBe(false);
    }
    // Long organisation names ("Northfield Community Bank") stay readable;
    // tags wait in View.
    expect(desktop.columnSizing[CRM_FILL_COLUMN_ID]).toBeGreaterThanOrEqual(
      300,
    );
    expect(desktop.columnVisibility.tags).toBe(false);

    const wide = resolve(1500);
    expect(wide.columnVisibility.tags).not.toBe(false);
    const tags = recordColumns.find((column) => column.id === "tags");
    expect(tags?.size).toBeGreaterThanOrEqual(TAGS_CONTENT_WIDTH);
    expect(wide.columnSizing[CRM_FILL_COLUMN_ID]).toBeGreaterThanOrEqual(280);
  });

  it("offers only columns the records list fills, and names updated_at for what it is", async () => {
    const { getCrmColumns, CRM_COLUMN_TIERS } =
      await import("../../../../../apps/admin/app/(app)/crm/columns");
    const columns = getCrmColumns({ onViewRecord: () => {} }) as Array<{
      id?: string;
      accessorKey?: string;
      meta?: { headerTitle?: string };
    }>;
    const ids = columns.map((column) => column.id ?? column.accessorKey);
    // The list API always returns these as null.
    expect(ids).not.toContain("fundsGivenToSummary");
    expect(ids).not.toContain("nextTaskSummary");
    for (const tier of CRM_COLUMN_TIERS) {
      expect(Object.keys(tier)).not.toContain("fundsGivenToSummary");
      expect(Object.keys(tier)).not.toContain("nextTaskSummary");
    }
    // The record's last update, not its last interaction; the id stays for
    // saved sorts and links.
    const updated = columns.find(
      (column) => column.accessorKey === "lastTouchAt",
    );
    expect(updated?.meta?.headerTitle).toBe("Updated");
  });

  it("keeps the row actions on screen at a 1024px window", async () => {
    const { getCrmColumns, CRM_COLUMN_TIERS, CRM_FILL_COLUMN_ID } =
      await import("../../../../../apps/admin/app/(app)/crm/columns");
    const recordColumns = crmGridLayoutColumns(
      getCrmColumns({ onViewRecord: () => {} }) as never,
    );
    /** The records panel at 1024px with the sidebar open. */
    const INTERMEDIATE_PANEL_WIDTH = 758;
    const layout = resolveCrmGridLayout({
      width: INTERMEDIATE_PANEL_WIDTH,
      columns: recordColumns,
      fillColumnId: CRM_FILL_COLUMN_ID,
      tiers: CRM_COLUMN_TIERS,
      overrides: {},
      keepVisible: ["lastTouchAt"],
    });
    const visibleWidth = recordColumns
      .filter((column) => layout.columnVisibility[column.id] !== false)
      .reduce(
        (sum, column) =>
          sum +
          (column.id === CRM_FILL_COLUMN_ID
            ? (column.minSize ?? column.size)
            : column.size),
        0,
      );
    expect(visibleWidth).toBeLessThanOrEqual(INTERMEDIATE_PANEL_WIDTH);
    expect(layout.columnVisibility.actions).not.toBe(false);
    expect(layout.columnVisibility.lifetimeGiving).not.toBe(false);
  });
});
