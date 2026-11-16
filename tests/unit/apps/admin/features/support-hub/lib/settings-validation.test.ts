import { describe, expect, it } from "vitest";
import {
  durationPartsToMinutes,
  toDurationParts,
} from "../../../../../../../apps/admin/features/support-hub/lib/duration";
import { macroActionIssue } from "../../../../../../../apps/admin/features/support-hub/lib/macro-action-validation";

describe("Support settings validation", () => {
  it("uses the largest exact duration unit and refuses invalid minute results", () => {
    expect(toDurationParts(480)).toEqual({ amount: "8", unit: "hours" });
    expect(durationPartsToMinutes({ amount: "2", unit: "days" })).toBe(2880);
    for (const amount of [
      "",
      "0",
      "-1",
      "Infinity",
      "0.001",
      "9007199254740992",
    ]) {
      expect(durationPartsToMinutes({ amount, unit: "hours" })).toBeNull();
    }
  });
  it("validates action targets, whole snooze hours and trimmed notes", () => {
    expect(macroActionIssue({ kind: "assign_agent", agentId: "" })).toBe(
      "Choose an agent.",
    );
    expect(macroActionIssue({ kind: "snooze", hours: 1.5 })).toBeTruthy();
    expect(
      macroActionIssue({ kind: "add_private_note", bodyText: "  " }),
    ).toBeTruthy();
    expect(macroActionIssue({ kind: "snooze", hours: 2 })).toBeNull();
  });
});
