import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

function readRepoFile(path: string) {
  return readFileSync(new URL(path, root), "utf8");
}

describe("moderation feed stats", () => {
  it("derives its totals from the feed instead of mock stats", () => {
    const hook = readRepoFile(
      "apps/admin/app/(app)/feed/use-moderation-feed.ts",
    );
    expect(hook).not.toMatch(/MOCK_STATS/);
  });
});
