import { describe, expect, it } from "vitest";

import {
  formatRelative,
  hoursUntil,
  isPastDue,
  minutesBetween,
} from "../../../../../../apps/admin/features/support-hub/lib/time";

const NOW = "2026-04-15T12:00:00.000Z";

describe("isPastDue", () => {
  it("returns true when the due date is before now", () => {
    expect(isPastDue("2026-04-15T11:00:00.000Z", NOW)).toBe(true);
  });

  it("returns false when the due date is in the future", () => {
    expect(isPastDue("2026-04-15T13:00:00.000Z", NOW)).toBe(false);
  });

  it("returns false when no due date is set", () => {
    expect(isPastDue(null, NOW)).toBe(false);
  });
});

describe("hoursUntil", () => {
  it("returns the positive hours remaining for a future date", () => {
    expect(hoursUntil("2026-04-15T15:00:00.000Z", NOW)).toBe(3);
  });

  it("returns null when no target is set", () => {
    expect(hoursUntil(null, NOW)).toBeNull();
  });
});

describe("minutesBetween", () => {
  it("computes inclusive minute deltas", () => {
    expect(
      minutesBetween("2026-04-15T11:00:00.000Z", "2026-04-15T11:45:00.000Z"),
    ).toBe(45);
  });

  it("returns null for missing endpoints", () => {
    expect(minutesBetween(null, NOW)).toBeNull();
  });
});

describe("formatRelative", () => {
  it("returns 'just now' for sub-minute deltas", () => {
    expect(formatRelative(NOW, NOW)).toBe("just now");
  });

  it("collapses to minutes / hours / days / weeks / months", () => {
    expect(formatRelative("2026-04-15T11:30:00.000Z", NOW)).toBe("30m");
    expect(formatRelative("2026-04-15T08:00:00.000Z", NOW)).toBe("4h");
    expect(formatRelative("2026-04-13T12:00:00.000Z", NOW)).toBe("2d");
    expect(formatRelative("2026-04-01T12:00:00.000Z", NOW)).toBe("2w");
    expect(formatRelative("2026-01-15T12:00:00.000Z", NOW)).toBe("3mo");
  });
});
