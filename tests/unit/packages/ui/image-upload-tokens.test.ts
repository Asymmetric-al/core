import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("ImageUpload drag outline tokens", () => {
  it("uses the semantic ring token instead of a zinc palette utility", () => {
    const source = readFileSync(
      "packages/ui/components/primitives/image-upload.tsx",
      "utf8",
    );

    expect(source).not.toMatch(/\bring-zinc-\d+\b/);
    expect(source).toContain("ring-2 ring-ring ring-offset-2 rounded-lg");
  });
});
