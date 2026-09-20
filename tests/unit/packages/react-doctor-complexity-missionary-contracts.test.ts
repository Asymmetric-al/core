import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("missionary package high-complexity extraction contracts", () => {
  it("keeps stacked bar rounding on geometry and path helpers", () => {
    const source = readRepoFile(
      "packages/missionary/components/giving-breakdown-chart.tsx",
    );

    expect(source).toContain("type DonationBarKey =");
    expect(source).toContain("function readRenderableBarGeometry(");
    expect(source).toContain("function stackedBarIsBottom(");
    expect(source).toContain("function stackedBarIsTop(");
    expect(source).toContain("function roundedStackedBarPath(");
    expect(source).toContain("function createRoundedBarShape(");
    expect(source).toContain("function RoundedBar(");
    expect(source).toContain(
      'const RecurringBarShape = createRoundedBarShape("recurring");',
    );
    expect(source).toContain(
      'const OneTimeBarShape = createRoundedBarShape("oneTime");',
    );
    expect(source).toContain(
      'const OfflineBarShape = createRoundedBarShape("offline");',
    );

    const roundedBar = source.slice(
      source.indexOf("function RoundedBar("),
      source.indexOf("const RecurringBarShape = createRoundedBarShape"),
    );
    expect(roundedBar).toContain("readRenderableBarGeometry(");
    expect(roundedBar).toContain("roundedStackedBarPath(");
    expect(roundedBar).not.toContain('dataKey === "recurring"');
    expect(roundedBar).not.toContain("const isBottom =");
    expect(roundedBar).not.toContain("const isTop =");
  });

  it("keeps dashboard TaskRow on type, title, meta, and menu siblings", () => {
    const source = readRepoFile("packages/missionary/components/task-row.tsx");

    expect(source).toContain("function TaskRowTypeIcon(");
    expect(source).toContain("function TaskRowTitle(");
    expect(source).toContain("function TaskRowMeta(");
    expect(source).toContain("function TaskRowMenu(");
    expect(source).toContain("export function TaskRow(");

    const taskRow = source.slice(source.indexOf("export function TaskRow("));
    expect(taskRow).toContain("<TaskRowTypeIcon");
    expect(taskRow).toContain("<TaskRowTitle");
    expect(taskRow).toContain("<TaskRowMeta");
    expect(taskRow).toContain("<TaskRowMenu");
    expect(taskRow).toContain("<Checkbox");
    expect(taskRow).not.toContain("View Partner");
    expect(taskRow).not.toContain("Reopen Task");
    expect(taskRow).not.toContain("Mark Complete");
    expect(taskRow).not.toContain('Sparkles className="size-2.5"');
    expect(taskRow).not.toContain('Bell className="size-3"');
  });

  it("keeps TaskDetailsSheet on header, meta, partner, copy, and footer siblings", () => {
    const source = readRepoFile(
      "packages/missionary/components/tasks/task-details-sheet.tsx",
    );

    expect(source).toContain("function taskStatusBadgeClass(");
    expect(source).toContain("function taskPriorityDotClass(");
    expect(source).toContain("function TaskDetailsSheetHeader(");
    expect(source).toContain("function TaskDetailsMetaGrid(");
    expect(source).toContain("function TaskDetailsPartnerSection(");
    expect(source).toContain("function TaskDetailsDescriptionSection(");
    expect(source).toContain("function TaskDetailsNotesSection(");
    expect(source).toContain("function TaskDetailsSheetFooter(");
    expect(source).toContain("export function TaskDetailsSheet(");

    const sheet = source.slice(
      source.indexOf("export function TaskDetailsSheet("),
    );
    expect(sheet).toContain("<TaskDetailsSheetHeader");
    expect(sheet).toContain("<TaskDetailsMetaGrid");
    expect(sheet).toContain("<TaskDetailsPartnerSection");
    expect(sheet).toContain("<TaskDetailsDescriptionSection");
    expect(sheet).toContain("<TaskDetailsNotesSection");
    expect(sheet).toContain("<TaskDetailsSheetFooter");
    expect(sheet).not.toContain("Related Partner");
    expect(sheet).not.toContain("Internal Notes");
    expect(sheet).not.toContain("Mark Done");
    expect(sheet).not.toContain("No partner linked");
    expect(sheet).not.toContain("No description provided.");
  });
});
