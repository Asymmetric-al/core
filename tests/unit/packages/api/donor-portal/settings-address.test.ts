import { describe, expect, it } from "vitest";

import { donorAddressFromRow } from "../../../../../packages/api/src/donor-portal/model";
import { donorPortalPatchSchema } from "../../../../../packages/api/src/donor-portal/settings-patch";

// Donors keep their mailing address up to date for receipts. The stored shape
// is the one the missionary app's partner screens already read.
describe("donor mailing address", () => {
  it("accepts a trimmed address and drops blank optional lines", () => {
    expect(
      donorPortalPatchSchema.parse({
        address: {
          street: " 12 Elm St ",
          street2: "  ",
          city: "Portland",
          state: "OR",
          zip: "97201",
          country: "US",
        },
      }).address,
    ).toEqual({
      street: "12 Elm St",
      city: "Portland",
      state: "OR",
      zip: "97201",
      country: "US",
    });
  });

  it("clears the address with null", () => {
    expect(donorPortalPatchSchema.parse({ address: null }).address).toBeNull();
  });

  it("rejects an address without a street or city", () => {
    expect(() =>
      donorPortalPatchSchema.parse({
        address: { street: "", city: "Portland" },
      }),
    ).toThrow();
    expect(() =>
      donorPortalPatchSchema.parse({
        address: { street: "12 Elm St", city: "" },
      }),
    ).toThrow();
  });

  it("reads stored rows, including older city/state-only ones", () => {
    expect(donorAddressFromRow({ city: "Austin", state: "TX" })).toEqual({
      street: "",
      street2: "",
      city: "Austin",
      state: "TX",
      zip: "",
      country: "",
    });
    expect(donorAddressFromRow(null)).toBeNull();
    expect(donorAddressFromRow("junk")).toBeNull();
  });
});
