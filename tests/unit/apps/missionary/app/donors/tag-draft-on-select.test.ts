import { describe, expect, it } from "vitest";

import { nextTagDraftOnDonorSelect } from "../../../../../../apps/missionary/app/donors/tag-draft";

describe("nextTagDraftOnDonorSelect", () => {
  it("keeps unsaved tag edits when the same partner is selected again", () => {
    const draft = { donorId: "donor-1", tags: ["major", "church"] };

    expect(nextTagDraftOnDonorSelect(draft, "donor-1")).toBe(draft);
  });

  it("clears the draft when a different partner is selected", () => {
    const draft = { donorId: "donor-1", tags: ["major"] };

    expect(nextTagDraftOnDonorSelect(draft, "donor-2")).toEqual({
      donorId: null,
      tags: [],
    });
  });
});
