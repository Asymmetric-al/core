import { describe, expect, it } from "vitest";

import {
  isWithinBusinessHours,
  minutesWithinBusinessHours,
} from "../../../../../../apps/admin/features/support-hub/lib/business-hours";
import type { SupportBusinessHours } from "../../../../../../apps/admin/features/support-hub/types";

const SCHEDULE: SupportBusinessHours = {
  id: "biz-1",
  tenantId: "tenant-1",
  name: "Standard",
  timezone: "UTC",
  weeklySchedule: [
    { day: "monday", enabled: true, openTime: "09:00", closeTime: "17:00" },
    { day: "tuesday", enabled: true, openTime: "09:00", closeTime: "17:00" },
    { day: "wednesday", enabled: true, openTime: "09:00", closeTime: "17:00" },
    { day: "thursday", enabled: true, openTime: "09:00", closeTime: "17:00" },
    { day: "friday", enabled: true, openTime: "09:00", closeTime: "17:00" },
    { day: "saturday", enabled: false, openTime: "10:00", closeTime: "14:00" },
    { day: "sunday", enabled: false, openTime: "10:00", closeTime: "14:00" },
  ],
  holidays: [
    {
      id: "holiday-2026-thxg",
      date: "2026-11-26T00:00:00.000Z",
      label: "Thanksgiving",
    },
  ],
  isDefault: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("isWithinBusinessHours", () => {
  it("returns true for a Tuesday at 10am UTC", () => {
    expect(isWithinBusinessHours(SCHEDULE, "2026-04-14T10:00:00.000Z")).toBe(
      true,
    );
  });

  it("returns false outside the daily window", () => {
    expect(isWithinBusinessHours(SCHEDULE, "2026-04-14T18:00:00.000Z")).toBe(
      false,
    );
  });

  it("returns false on a configured holiday even within open hours", () => {
    expect(isWithinBusinessHours(SCHEDULE, "2026-11-26T10:00:00.000Z")).toBe(
      false,
    );
  });

  it("returns false on a disabled day (Saturday)", () => {
    expect(isWithinBusinessHours(SCHEDULE, "2026-04-18T10:00:00.000Z")).toBe(
      false,
    );
  });

  it("accepts HTML type=time values such as 09:00:00", () => {
    const htmlClockSchedule: SupportBusinessHours = {
      ...SCHEDULE,
      weeklySchedule: SCHEDULE.weeklySchedule.map((entry) =>
        entry.day === "tuesday"
          ? { ...entry, openTime: "09:00:00", closeTime: "17:00:00" }
          : entry,
      ),
    };

    expect(
      isWithinBusinessHours(htmlClockSchedule, "2026-04-14T10:00:00.000Z"),
    ).toBe(true);
  });
});

describe("minutesWithinBusinessHours", () => {
  it("returns the number of business minutes between two timestamps", () => {
    const minutes = minutesWithinBusinessHours(
      SCHEDULE,
      "2026-04-14T08:00:00.000Z",
      "2026-04-14T11:00:00.000Z",
    );
    expect(minutes).toBe(120);
  });
});
