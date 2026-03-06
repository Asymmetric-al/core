import { describe, expect, it } from "vitest";

import { mockContributions } from "../../apps/admin/app/contributions/data";
import {
  contributionStatusDotColor,
  formatContributionDate,
  getContributionDonorInitials,
  getContributionDonorName,
  getContributionReceiptDotColor,
  getContributionReceiptLabel,
} from "../../apps/admin/app/contributions/display";

describe("contributions display helpers", () => {
  it("uses a shared status color mapping", () => {
    expect(contributionStatusDotColor.Succeeded).toBe("bg-emerald-500");
    expect(contributionStatusDotColor.Failed).toBe("bg-destructive");
  });

  it("formats contribution dates consistently", () => {
    expect(formatContributionDate("2025-12-28")).toBe("Dec 28, 2025");
    expect(
      formatContributionDate("2025-12-28", {
        weekday: "short",
      }),
    ).toBe("Sun, Dec 28, 2025");
  });

  it("derives donor display values from the contribution record", () => {
    expect(getContributionDonorName(mockContributions[0])).toBe(
      "Sarah Mitchell",
    );
    expect(getContributionDonorInitials(mockContributions[0])).toBe("SM");

    expect(getContributionDonorName(mockContributions[2])).toBe("Anonymous");
    expect(
      getContributionDonorName(mockContributions[2], "Anonymous Donor"),
    ).toBe("Anonymous Donor");
    expect(getContributionDonorInitials(mockContributions[2])).toBe("?");
  });

  it("uses a shared receipt presentation contract", () => {
    expect(getContributionReceiptLabel(true)).toBe("Sent");
    expect(getContributionReceiptLabel(false)).toBe("Pending");
    expect(getContributionReceiptDotColor(true)).toBe("bg-emerald-500");
    expect(getContributionReceiptDotColor(false)).toBe(
      "bg-muted-foreground/40",
    );
  });
});
