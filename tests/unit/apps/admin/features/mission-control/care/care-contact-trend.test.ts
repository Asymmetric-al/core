import { describe, expect, it } from "vitest";

import { getWeeklyCareContacts } from "../../../../../../../apps/admin/features/mission-control/care/care-contact-trend";
import type { ActivityLogEntry } from "../../../../../../../apps/admin/features/mission-control/care/types";

const now = new Date(2026, 10, 11, 12);

function contact(
  daysAgo: number,
  overrides: Partial<ActivityLogEntry> = {},
): ActivityLogEntry {
  return {
    id: `contact-${daysAgo}`,
    personnelId: "member",
    kind: "activity",
    type: "Check-in",
    content: "We spoke about the next visit.",
    date: new Date(2026, 10, 11 - daysAgo, 9).toISOString(),
    authorId: "staff",
    authorName: "Staff",
    isPrivate: false,
    ...overrides,
  };
}

describe("Care contact trend", () => {
  it("counts four seven-day periods ending today, oldest first", () => {
    const buckets = getWeeklyCareContacts(
      [
        contact(27),
        contact(21),
        contact(20),
        contact(14),
        contact(13),
        contact(7),
        contact(6),
        contact(0),
      ],
      now,
    );
    expect(buckets.map((bucket) => bucket.contacts)).toEqual([2, 2, 2, 2]);
    expect(buckets[0]?.range).toBe("Oct 15–Oct 21");
    expect(buckets[3]?.range).toBe("Nov 5–Nov 11");
  });

  it("excludes thread posts, private entries, invalid dates and out-of-window contacts", () => {
    const buckets = getWeeklyCareContacts(
      [
        contact(28),
        contact(-1),
        contact(0, { kind: "thread" }),
        contact(0, { isPrivate: true }),
        contact(0, { date: "not a date" }),
        contact(0),
      ],
      now,
    );
    expect(buckets.map((bucket) => bucket.contacts)).toEqual([0, 0, 0, 1]);
  });

  it("keeps empty periods and counts contacts rather than unique members", () => {
    expect(
      getWeeklyCareContacts([], now).map((bucket) => bucket.contacts),
    ).toEqual([0, 0, 0, 0]);
    expect(
      getWeeklyCareContacts([contact(0), contact(1)], now)[3]?.contacts,
    ).toBe(2);
  });
});
