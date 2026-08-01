import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("ContentModerationStatsSection", () => {
  it("omits the aggregate comments stat and renders the remaining six stats", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/feed/content-moderation-sections.tsx",
    );
    const section = source.slice(
      source.indexOf("export function ContentModerationStatsSection"),
      source.indexOf("export function ContentModerationTabsSection"),
    );

    expect(section).toMatch(/grid-cols-2 md:grid-cols-6/);
    expect(section).not.toMatch(/label="Comments"/);
    expect(section).toMatch(/label="Total Posts"/);
    expect(section).toMatch(/label="Flagged"/);
    expect(section).toMatch(/label="Hidden"/);
    expect(section).toMatch(/label="Pending"/);
    expect(section).toMatch(/label="Flagged Comments"/);
    expect(section).toMatch(/label="Actions Today"/);
  });

  it("keeps every moderation stat tile the same size", () => {
    const source = readRepoFile(
      "apps/admin/app/(app)/feed/content-moderation-sections.tsx",
    );
    const statCard = source.slice(
      source.indexOf("function StatCard"),
      source.indexOf("function StatusBadge"),
    );

    expect(statCard).toMatch(/h-full/);
    expect(statCard).toMatch(/min-h-32/);
    expect(statCard).toMatch(/grid h-full/);
  });
});
