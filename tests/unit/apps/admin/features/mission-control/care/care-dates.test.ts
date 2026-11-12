import { expect, it } from "vitest";

import { formatLastContact } from "../../../../../../../apps/admin/features/mission-control/care/components/care-display";
import {
  daysSince,
  formatDate,
} from "../../../../../../../apps/admin/features/mission-control/care/utils";

it.each([null, "", "invalid"])(
  "treats %s as no contact rather than NaN or the epoch",
  (value) => {
    expect(daysSince(value)).toBeNull();
    expect(formatDate(value)).toBe("");
    expect(formatLastContact(value)).toBe("No check-in yet");
  },
);

it("supports both timestamps and date-only values as calendar days", () => {
  const now = new Date("2026-11-11T12:00:00");
  expect(daysSince("2026-11-10T23:00:00", now)).toBe(1);
  expect(daysSince("2026-11-10", now)).toBe(1);
  expect(formatDate("2026-11-10T10:00:00")).toBe("Nov 10, 2026");
});
