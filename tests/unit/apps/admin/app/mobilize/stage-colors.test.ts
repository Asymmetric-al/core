import { describe, expect, it } from "vitest";

import { STAGE_COLORS } from "../../../../../../apps/admin/app/mobilize/mobilize-sections";

describe("mobilize stage colors", () => {
  it("keeps deployed visually distinct from vetting", () => {
    expect(STAGE_COLORS.Deployed).not.toBe(STAGE_COLORS.Vetting);
    expect(STAGE_COLORS.Deployed).toContain("indigo");
  });
});
