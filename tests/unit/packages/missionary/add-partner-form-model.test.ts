import { describe, expect, it } from "vitest";

import {
  createInitialPartnerFormValues,
  partnerIntent,
  toPartnerCommandBody,
} from "../../../../packages/missionary/components/add-partner-form-model";

const VALUES = {
  name: "Alice Johnson",
  email: "alice@example.com",
  phone: "",
  type: "Church",
  frequency: "Annually",
  location: "Denver, CO",
} as const;

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

  it("builds the Add Partner command body from the form alone: no owner, tenant, status or score, a blank phone no phone (AL-2678 WP5 rest)", () => {
    expect(
      toPartnerCommandBody({
        ...VALUES,
        name: " Alice Johnson ",
        location: " Denver, CO ",
      }),
    ).toEqual({
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: null,
      type: "Church",
      frequency: "Annually",
      location: "Denver, CO",
    });
  });

  it("names one intent for the same partner typed again: whitespace runs, the e-mail's case and a blank phone do not change it; another field does (AL-2678 WP5 rest, rule 13)", () => {
    const intent = partnerIntent(VALUES);
    expect(
      partnerIntent({
        ...VALUES,
        name: "Alice  Johnson ",
        email: " ALICE@example.com",
        phone: " ",
        location: "Denver,  CO",
      }),
    ).toBe(intent);
    for (const changed of [
      { name: "Alice Jonson" },
      { email: "alicia@example.com" },
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
