import { describe, expect, it } from "vitest";

import {
  formatSnoozeTime,
  resolveSnoozeUntil,
} from "../../../../../../apps/admin/features/support-hub/lib/snooze";

describe("support snooze wake times", () => {
  it.each([1, 9, 23])("wakes tomorrow at 8:00 when set at %s", (hour) => {
    const now = new Date(2026, 10, 10, hour, 30);
    const wake = new Date(
      resolveSnoozeUntil("tomorrow-morning", now.toISOString()),
    );
    expect([wake.getDate(), wake.getHours(), wake.getMinutes()]).toEqual([
      11, 8, 0,
    ]);
    expect(formatSnoozeTime(wake.toISOString(), now.toISOString())).toMatch(
      /^Tomorrow,/,
    );
  });
  it.each([
    ["in-1-hour", 1],
    ["in-4-hours", 4],
  ])("adds the exact duration for %s", (key, hours) => {
    const now = new Date(2026, 10, 10, 9);
    const wake = resolveSnoozeUntil(
      key as "in-1-hour" | "in-4-hours",
      now.toISOString(),
    );
    expect(new Date(wake).getTime() - now.getTime()).toBe(
      Number(hours) * 3_600_000,
    );
    expect(formatSnoozeTime(wake, now.toISOString())).toMatch(/^Today,/);
  });
});
