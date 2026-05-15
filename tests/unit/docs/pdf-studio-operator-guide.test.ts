import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("PDF Studio operator guide", () => {
  it("documents provider rollback and archive recovery paths", async () => {
    const guide = await readFile(
      "docs/features/pdf-studio/operator-guide.md",
      "utf8",
    );

    expect(guide).toContain("NEXT_PUBLIC_UNLAYER_PROJECT_ID");
    expect(guide).toContain("PDF_STUDIO_NATIVE_BUILDER_ROLLOUT=legacy_only");
    expect(guide).toContain("server-side DocRaptor");
    expect(guide).toContain("status='archived'");
    expect(guide).toContain("Restore the prior admin Vercel deployment");
  });
});
