import { describe, expect, it } from "vitest";

import { STAGE_VARIANTS } from "../../../../../../apps/admin/app/(app)/mobilize/stage-colors";

describe("mobilize stage tones", () => {
  it("keeps deployed visually distinct from vetting", () => {
    expect(STAGE_VARIANTS.Deployed).not.toBe(STAGE_VARIANTS.Vetting);
    // Resolved semantic colors and light/dark contrast are checked in the
    // shared theme fixture; the deployed/vetting distinction stays observable.
  });
});
