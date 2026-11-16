import { describe, expect, it } from "vitest";

import {
  ATTENTION_URGENCY,
  attentionUrgency,
  FOLLOW_UP_NOT_LINKED,
  followUpLink,
} from "../../../../../../apps/admin/features/mission-control/needs-attention/attention-vocabulary";

describe("Mission Control attention vocabulary", () => {
  it("names each stored urgency once, with one tone", () => {
    expect(ATTENTION_URGENCY).toEqual({
      critical: { label: "Critical", variant: "destructive" },
      high: { label: "High", variant: "warning" },
      normal: { label: "Normal", variant: "outline" },
    });
  });

  it("shows an unknown urgency as itself instead of hiding it as normal", () => {
    expect(attentionUrgency("high")).toBe(ATTENTION_URGENCY.high);
    expect(attentionUrgency("blocked")).toEqual({
      label: "Blocked",
      variant: "outline",
    });
  });

  it("links a follow-up to its gift, else its donor, else nothing", () => {
    expect(
      followUpLink({ contributionId: "gift 1", donorId: "donor-1" }),
    ).toEqual({
      href: "/contributions/gift%201",
      label: "Open contribution",
    });
    expect(followUpLink({ contributionId: null, donorId: "donor/2" })).toEqual({
      href: "/crm?donor=donor%2F2",
      label: "Open donor",
    });
    expect(followUpLink({ contributionId: null, donorId: null })).toBeNull();
    expect(FOLLOW_UP_NOT_LINKED).toBe("Not linked to a gift or donor yet");
  });
});
