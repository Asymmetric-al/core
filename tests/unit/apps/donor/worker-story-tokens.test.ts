import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("worker story tokens", () => {
  it("uses semantic color utilities instead of zinc or raw white", () => {
    const source = readFileSync(
      "apps/donor/app/(public)/(solid)/workers/[id]/worker-story.tsx",
      "utf8",
    );

    expect(source).not.toMatch(/\b(?:text|border|bg)-zinc-\d+\b/);
    expect(source).not.toMatch(/\bbg-white\b/);
    expect(source).toContain("text-foreground");
    expect(source).toContain("text-muted-foreground");
    expect(source).toContain("bg-card");
    expect(source).toContain("border-border");
  });
});
