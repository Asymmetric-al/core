import { describe, expect, it } from "vitest";

import {
  createInitialPartnerFormValues,
  toPartnerInsertPayload,
} from "../../../../packages/missionary/components/add-partner-form-model";

describe("packages/missionary/components/add-partner-form-model", () => {
  it("creates stable empty defaults for new partner forms", () => {
    expect(createInitialPartnerFormValues()).toEqual({
      name: "",
      email: "",
      phone: "",
      type: "Individual",
      frequency: "Monthly",
      location: "",
    });
  });

  it("builds the donor insert payload with safe defaults", () => {
    const payload = toPartnerInsertPayload({
      missionaryId: "missionary-123",
      values: {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "",
        type: "Church",
        frequency: "Annually",
        location: "Denver, CO",
      },
    });

    expect(payload).toEqual({
      missionary_id: "missionary-123",
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: null,
      type: "Church",
      frequency: "Annually",
      location: "Denver, CO",
      status: "Active",
      total_given: 0,
      last_gift_amount: 0,
      score: 70,
    });
  });
});
