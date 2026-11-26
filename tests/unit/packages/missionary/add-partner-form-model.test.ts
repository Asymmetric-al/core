import { describe, expect, it } from "vitest";

import {
  createInitialPartnerFormValues,
  partnerIntent,
  partnerSchema,
  toPartnerCommandBody,
} from "../../../../packages/missionary/components/add-partner-form-model";

const VALUES = {
  name: "Alice Johnson",
  phone: "",
  type: "Church",
  frequency: "Annually",
  location: "Denver, CO",
} as const;

describe("packages/missionary/components/add-partner-form-model", () => {
  it("creates stable empty defaults for new partner forms, with no e-mail (fix round F1)", () => {
    expect(createInitialPartnerFormValues()).toEqual({
      name: "",
      phone: "",
      type: "Individual",
      frequency: "Monthly",
      location: "",
    });
    expect(Object.keys(partnerSchema.shape)).not.toContain("email");
  });

  it("builds the Add Partner command body from the form alone: no e-mail, owner, tenant, status or score, a blank phone no phone (AL-2678 WP5 rest; fix round F1)", () => {
    expect(
      toPartnerCommandBody({
        ...VALUES,
        name: " Alice Johnson ",
        location: " Denver, CO ",
      }),
    ).toEqual({
      name: "Alice Johnson",
      phone: null,
      type: "Church",
      frequency: "Annually",
      location: "Denver, CO",
    });
  });

  it("names one intent for the same partner typed again: whitespace runs, a blank phone and the invisible characters the database strips do not change it; another field does (rule 13; fix round, the review's small point)", () => {
    const intent = partnerIntent(VALUES);
    expect(
      partnerIntent({
        ...VALUES,
        name: "Alice  Johnson​ ",
        phone: " ⁠",
        location: "Denver,　 CO﻿",
      }),
    ).toBe(intent);
    for (const changed of [
      { name: "Alice Jonson" },
      { phone: "555 0100" },
      { type: "Individual" as const },
      { frequency: "Monthly" as const },
      { location: "Boulder, CO" },
    ])
      expect([changed, partnerIntent({ ...VALUES, ...changed })]).not.toEqual([
        changed,
        intent,
      ]);
  });
});
