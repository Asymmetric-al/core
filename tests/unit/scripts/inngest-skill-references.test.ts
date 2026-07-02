import { describe, expect, it } from "vitest";

import { findBrokenInngestSkillReferences } from "../../../scripts/verify/inngest-skill-references.mjs";

describe("Inngest skill reference verifier", () => {
  it("keeps vendored Inngest skill markdown links local and readable", async () => {
    await expect(findBrokenInngestSkillReferences()).resolves.toEqual([]);
  });
});
