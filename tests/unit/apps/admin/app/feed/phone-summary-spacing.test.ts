import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

/**
 * On phones the sample notice, the summary cards and the queue share one
 * column, so the page rhythm tightens there to bring the first post closer
 * to the top. Larger screens keep the wider rhythm.
 */
describe("Moderation phone spacing before the first post", () => {
  const source = readFileSync(
    new URL(
      "apps/admin/app/(app)/feed/content-moderation-page-client.tsx",
      root,
    ),
    "utf8",
  );

  it("tightens the page stack on phones only", () => {
    expect(source).toContain('className="flex flex-col gap-4 sm:gap-6"');
    expect(source).not.toContain('className="flex flex-col gap-6"');
  });

  it("tightens the gap between the summary and the queue on phones only", () => {
    expect(source).toContain(
      'className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12"',
    );
  });
});
