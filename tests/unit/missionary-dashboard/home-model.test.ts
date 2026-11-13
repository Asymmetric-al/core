import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  buildNeedsYou,
  monthlyPartnerCount,
  recentGifts,
} from "../../../packages/missionary/components/home/home-model";

const NOW = new Date(2026, 10, 10, 12);

it("retains gift currency in home cards and thank-you prompts", () => {
  for (const [currency, expected] of [
    ["JPY", "¥1,000"],
    ["BHD", "BHD 1.000"],
    [null, "their gift"],
  ]) {
    const source = snapshot({
      recentGifts: [
        {
          id: "known",
          donorId: "taylor",
          amountCents: 1000,
          currency,
          type: "One-Time",
          date: "2026-11-05",
        },
      ],
    });
    expect(recentGifts(source)[0]?.currency).toBe(currency);
    const title = buildNeedsYou({
      snapshot: source,
      followRequestCount: 0,
      now: NOW,
    }).find((item) => item.kind === "thank")?.title;
    expect(title).toContain(expected);
    expect(title).not.toContain("$");
  }
});

const partner = (overrides: Record<string, unknown>) => ({
  id: "p",
  displayName: "Partner",
  email: null,
  phone: null,
  preferredContact: "email",
  avatarUrl: null,
  location: null,
  status: "active",
  totalGivenCents: 0,
  lastGiftAt: null,
  lastGiftAmountCents: 0,
  giftCount: 0,
  frequency: null,
  tags: [],
  hasActivePledge: false,
  ...overrides,
});

const snapshot = (overrides: Record<string, unknown> = {}) =>
  ({
    donorRelationships: [
      partner({
        id: "taylor",
        displayName: "Taylor Nguyen",
        lastGiftAt: "2026-11-05T09:00:00.000Z",
        lastGiftAmountCents: 5_000,
        hasActivePledge: true,
      }),
      partner({
        id: "grace",
        displayName: "Grace Community Church",
        status: "at_risk",
        hasActivePledge: true,
        lastGiftAt: "2026-08-01T09:00:00.000Z",
        lastGiftAmountCents: 10_000,
      }),
      partner({
        id: "recent",
        displayName: "Reese Carter",
        status: "at_risk",
        hasActivePledge: true,
        lastGiftAt: "2026-10-20T09:00:00.000Z",
      }),
      partner({
        id: "old",
        displayName: "Casey Brooks",
        lastGiftAt: "2026-06-01T09:00:00.000Z",
        lastGiftAmountCents: 2_500,
      }),
    ],
    recentGifts: [
      {
        id: "g3",
        donorId: null,
        amountCents: 2_000,
        currency: "USD",
        date: "2026-11-08T09:00:00.000Z",
        type: "One-Time",
      },
      {
        id: "g1",
        donorId: "taylor",
        amountCents: 5_000,
        currency: "USD",
        date: "2026-11-05T09:00:00.000Z",
        type: "One-Time",
      },
      {
        id: "g0",
        donorId: "taylor",
        amountCents: 5_000,
        currency: "USD",
        date: "2026-10-05T09:00:00.000Z",
        type: "Recurring",
      },
      {
        id: "g2",
        donorId: "grace",
        amountCents: 10_000,
        currency: "USD",
        date: "2026-08-01T09:00:00.000Z",
        type: "Recurring",
      },
    ],
    tasks: [
      {
        id: "t1",
        title: "Call Avery Lopez",
        status: "not_started",
        priority: "high",
        due_date: "2026-11-07",
      },
      {
        id: "t2",
        title: "Email Grace",
        status: "in_progress",
        priority: "low",
        due_date: "2026-11-09",
      },
      {
        id: "t3",
        title: "Later",
        status: "not_started",
        priority: "low",
        due_date: "2026-11-20",
      },
      {
        id: "t4",
        title: "Done",
        status: "completed",
        priority: "low",
        due_date: "2026-11-01",
      },
    ],
    ...overrides,
  }) as never;

describe("buildNeedsYou", () => {
  it("lists what needs action today, most urgent first, each with a way to act", () => {
    const items = buildNeedsYou({
      snapshot: snapshot(),
      followRequestCount: 2,
      now: NOW,
    });
    expect(items.map((item) => item.id)).toEqual([
      "overdue-tasks",
      "behind-grace",
      "thank-taylor",
      "follow-requests",
    ]);
    // Partner items open that partner, not the whole list.
    expect(items.find((item) => item.id === "behind-grace")?.href).toBe(
      "/donors?partner=grace",
    );
    expect(items.find((item) => item.id === "thank-taylor")?.href).toBe(
      "/donors?partner=taylor",
    );
    expect(items[0]).toEqual({
      id: "overdue-tasks",
      kind: "overdue-tasks",
      tone: "urgent",
      title: "2 overdue tasks",
      detail: "Oldest: Call Avery Lopez",
      href: "/tasks",
      action: "Open tasks",
    });
    expect(items[1]).toMatchObject({
      tone: "urgent",
      title: "Grace Community Church’s recurring gift hasn’t arrived",
      action: "View partner",
    });
    expect(items[2]).toMatchObject({
      tone: "info",
      title: "Thank Taylor Nguyen for $50.00",
      detail: "Gave on Nov 5",
      action: "View partner",
    });
    expect(items[3]).toMatchObject({
      title: "2 people want to follow your updates",
      href: "/feed",
      action: "Review",
    });
  });

  it("thanks one-time gifts and first monthly gifts, not routine monthly charges", () => {
    const items = buildNeedsYou({
      snapshot: snapshot({
        recentGifts: [
          // Taylor's routine monthly gift: an earlier monthly gift exists.
          {
            id: "t2",
            donorId: "taylor",
            amountCents: 5_000,
            currency: "USD",
            date: "2026-11-05T09:00:00.000Z",
            type: "Recurring",
          },
          {
            id: "t1",
            donorId: "taylor",
            amountCents: 5_000,
            currency: "USD",
            date: "2026-10-05T09:00:00.000Z",
            type: "Recurring",
          },
          // Casey's first monthly gift.
          {
            id: "c1",
            donorId: "old",
            amountCents: 2_500,
            currency: "USD",
            date: "2026-11-08T09:00:00.000Z",
            type: "Recurring",
          },
        ],
      }),
      followRequestCount: 0,
      now: NOW,
    });
    const thanks = items.filter((item) => item.kind === "thank");
    expect(thanks.map((item) => item.title)).toEqual([
      "Thank Casey Brooks for their first monthly gift of $25.00",
    ]);
  });

  it("doesn’t call a recurring gift late when one arrived this cycle", () => {
    const items = buildNeedsYou({
      snapshot: snapshot(),
      followRequestCount: 0,
      now: NOW,
    });
    expect(items.some((item) => item.id === "behind-recent")).toBe(false);
  });

  it("says one task, one person, and nothing at all when nothing needs doing", () => {
    const one = buildNeedsYou({
      snapshot: snapshot({
        tasks: [
          {
            id: "t1",
            title: "Call Avery Lopez",
            status: "not_started",
            priority: "high",
            due_date: "2026-11-07",
          },
        ],
        donorRelationships: [],
      }),
      followRequestCount: 1,
      now: NOW,
    });
    expect(one.map((item) => item.title)).toEqual([
      "1 overdue task",
      "1 person wants to follow your updates",
    ]);
    expect(
      buildNeedsYou({
        snapshot: snapshot({ tasks: [], donorRelationships: [] }),
        followRequestCount: 0,
        now: NOW,
      }),
    ).toEqual([]);
  });
});

describe("buildNeedsYou when follow requests couldn’t be checked", () => {
  it("says so instead of hiding them", () => {
    const items = buildNeedsYou({
      snapshot: snapshot({ tasks: [], donorRelationships: [] }),
      followRequestCount: null,
      now: NOW,
    });
    expect(items).toEqual([
      expect.objectContaining({
        kind: "follow-requests",
        title: "Couldn’t check follow requests",
        href: "/feed",
      }),
    ]);
  });
});

describe("recentGifts", () => {
  it("lists the latest gifts newest first, keeping anonymous givers anonymous", () => {
    expect(recentGifts(snapshot(), 2)).toEqual([
      {
        id: "g3",
        partnerId: null,
        name: "Anonymous partner",
        amountCents: 2_000,
        currency: "USD",
        date: "2026-11-08T09:00:00.000Z",
        avatarUrl: null,
        recurring: false,
      },
      {
        id: "g1",
        partnerId: "taylor",
        name: "Taylor Nguyen",
        amountCents: 5_000,
        currency: "USD",
        date: "2026-11-05T09:00:00.000Z",
        avatarUrl: null,
        recurring: false,
      },
    ]);
  });
});

describe("monthlyPartnerCount", () => {
  it("counts partners with an active recurring gift", () => {
    expect(monthlyPartnerCount(snapshot())).toBe(3);
  });
});

describe("date-only gift dates west of UTC", () => {
  const originalTz = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = "America/Los_Angeles";
  });
  afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it("reads a date-only last gift as that calendar day for the late check", () => {
    const now = new Date(2026, 10, 10, 20);
    const items = buildNeedsYou({
      snapshot: snapshot({
        donorRelationships: [
          partner({
            id: "lee",
            displayName: "Lee Park",
            status: "at_risk",
            hasActivePledge: true,
            lastGiftAt: "2026-10-07",
          }),
        ],
        recentGifts: [],
      }),
      followRequestCount: 0,
      now,
    });
    expect(items.filter((item) => item.kind === "behind")).toEqual([]);
  });

  it("thanks a date-only gift on the first day of the window", () => {
    const now = new Date(2026, 10, 10, 20);
    const items = buildNeedsYou({
      snapshot: snapshot({
        donorRelationships: [
          partner({ id: "taylor", displayName: "Taylor Nguyen" }),
        ],
        recentGifts: [
          {
            id: "g",
            donorId: "taylor",
            amountCents: 1000,
            currency: "USD",
            type: "One-Time",
            date: "2026-10-28",
          },
        ],
      }),
      followRequestCount: 0,
      now,
    });
    expect(items.some((item) => item.kind === "thank")).toBe(true);
  });
});
