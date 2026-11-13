/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from "vitest";

import { knownDonorRecipient } from "../../../../packages/database/hooks/donor-portal";
import { getQueryClient } from "../../../../packages/database/providers/query-client";

const jordan = {
  id: "m-jordan",
  name: "Jordan Hale",
  avatarUrl: "https://example.test/j.jpg",
};

afterEach(() => {
  getQueryClient().clear();
});

// Checkout is public. It may name a recipient only from portal data this
// visit already loaded, and must never fetch account data itself.
describe("knownDonorRecipient", () => {
  it("names a missionary the donor already gives to", () => {
    getQueryClient().setQueryData(["donor", "portal"], {
      donations: [{ missionary: jordan }],
      recurringGifts: [],
    });
    expect(knownDonorRecipient("m-jordan")).toEqual(jordan);
    expect(knownDonorRecipient("m-someone-else")).toBeNull();
  });

  it("knows no one before the donor's portal data has loaded", () => {
    expect(knownDonorRecipient("m-jordan")).toBeNull();
    expect(knownDonorRecipient(null)).toBeNull();
  });
});
