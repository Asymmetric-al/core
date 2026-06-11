import {
  makeDisplayDate,
  todayDateInputValue,
} from "../../../../apps/donor/lib/dates";
import { describe, expect, it } from "vitest";

describe("makeDisplayDate", () => {
  it("parses a date-only string in local time (regression: off-by-one west of UTC)", () => {
    const d = makeDisplayDate("2026-06-11");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(11);
    expect(d.getHours()).toBe(0);
  });

  it("parses a full ISO timestamp via native Date (preserves UTC instant)", () => {
    const d = makeDisplayDate("2026-06-11T14:30:00.000Z");
    expect(d.getTime()).toBe(Date.parse("2026-06-11T14:30:00.000Z"));
  });

  it("returns a Date close to now when called with no argument", () => {
    const before = Date.now();
    const d = makeDisplayDate(undefined);
    const after = Date.now();
    expect(d.getTime()).toBeGreaterThanOrEqual(before);
    expect(d.getTime()).toBeLessThanOrEqual(after + 5000);
  });

  it("handles a numeric timestamp", () => {
    const d = makeDisplayDate(1760000000000);
    expect(d.getTime()).toBe(1760000000000);
  });
});

describe("todayDateInputValue", () => {
  it("returns a YYYY-MM-DD string matching today's local date components", () => {
    const value = todayDateInputValue();
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(value).toBe(expected);
  });
});
