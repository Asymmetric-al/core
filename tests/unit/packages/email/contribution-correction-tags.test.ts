import { describe, expect, it } from "vitest";

import {
  CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES,
  getContributionCorrectionRequiredTags,
} from "../../../../packages/email/contribution-correction-tags";
import {
  getMergeTagDefinition,
  getMergeTagDefinitions,
} from "../../../../packages/email/merge-tags";

describe("@asym/email contribution correction tags", () => {
  it("adds donor correction tags to the shared Email Studio registry", () => {
    const keys = getMergeTagDefinitions().map((tag) => tag.key);

    expect(keys).toContain("correction_reason");
    expect(keys).toContain("corrected_amount");
    expect(keys).toContain("refund_amount");
    expect(keys).toContain("donor_portal_link");
    expect(getMergeTagDefinition("support_contact_link")).toEqual(
      expect.objectContaining({ type: "url" }),
    );
  });

  it("defines required tags per correction family and variant", () => {
    expect(
      getContributionCorrectionRequiredTags({
        family: "refund_notification",
        variant: "refund_completed",
      }),
    ).toEqual(
      expect.arrayContaining([
        "full_name",
        "gift_date",
        "donation_amount",
        "refund_amount",
        "donor_portal_link",
      ]),
    );

    expect(
      CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES
        .designation_correction_notification.variants.designation_changed
        .requiredTags,
    ).toContain("corrected_designation_name");
  });
});
