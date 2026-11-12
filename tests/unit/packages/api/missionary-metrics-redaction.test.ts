import { describe, expect, it } from "vitest";

import { redactAnonymousGiftDonors } from "../../../../packages/api/src/missionaries/metrics";

const gift = (id: string, donorId: string | null) => ({
  id,
  amount: 5000,
  donor_id: donorId,
});

describe("missionary metrics gift redaction", () => {
  // Same rule as the missionary portal (spec §7.2): a gift from a donor who
  // hasn't chosen to be named carries no donor id the missionary could use to
  // link it to other gifts.
  it("keeps the donor id only for donors who chose to be named", () => {
    const rows = redactAnonymousGiftDonors(
      [gift("g1", "named"), gift("g2", "anonymous"), gift("g3", "unset")],
      [
        {
          id: "named",
          giving_preferences: { defaultAnonymousToRecipient: false },
        },
        {
          id: "anonymous",
          giving_preferences: { defaultAnonymousToRecipient: true },
        },
        { id: "unset", giving_preferences: null },
      ],
    );
    expect(rows.map((row) => row.donor_id)).toEqual(["named", null, null]);
  });

  it("fails closed when the donor's preferences can't be found", () => {
    const rows = redactAnonymousGiftDonors([gift("g1", "missing")], []);
    expect(rows[0]?.donor_id).toBeNull();
  });

  it("leaves gifts without a donor as they are", () => {
    const rows = redactAnonymousGiftDonors([gift("g1", null)], []);
    expect(rows).toEqual([gift("g1", null)]);
  });
});
