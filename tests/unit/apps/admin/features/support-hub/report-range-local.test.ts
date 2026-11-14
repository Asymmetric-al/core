import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  buildReportSeries,
  defaultReportRange,
  reportRangeBoundary,
  reportRangeInputValues,
} from "../../../../../../apps/admin/features/support-hub/lib/report-aggregations";

import type {
  SupportConversation,
  SupportReportRange,
} from "../../../../../../apps/admin/features/support-hub/types";

// Report dates are the viewer's calendar days, not UTC ones. Bangkok
// (UTC+7) is where a 01:45 capture showed yesterday as the default "To".
const ORIGINAL_TZ = process.env.TZ;

function setTimeZone(zone: string) {
  process.env.TZ = zone;
}

beforeAll(() => {
  setTimeZone("Asia/Bangkok");
});

afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

function conversation(id: string, createdAt: string): SupportConversation {
  return {
    id,
    tenantId: "tenant-1",
    inboxId: "inbox-1",
    subject: "Receipt question",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactName: "Anita Gonzalez",
    externalContactEmail: "anita@example.com",
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: createdAt,
    lastMessageAt: createdAt,
    lastCustomerMessageAt: createdAt,
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: null,
    createdAt,
    updatedAt: createdAt,
  };
}

describe("support report dates use the viewer's calendar", () => {
  // 01:45 on 10 November in Bangkok is still 9 November in UTC.
  const EARLY_MORNING = new Date("2026-11-09T18:45:00.000Z");

  it("defaults To to today and From to 30 days before, in local days", () => {
    const range = defaultReportRange(30, EARLY_MORNING);
    expect(reportRangeInputValues(range)).toEqual({
      from: "2026-10-11",
      to: "2026-11-10",
    });
    // Local midnights: the start of 11 October and the end of 10 November.
    expect(range).toEqual({
      from: "2026-10-10T17:00:00.000Z",
      to: "2026-11-10T17:00:00.000Z",
    });
  });

  it("treats a picked To date as the whole of that day", () => {
    expect(reportRangeBoundary("from", "2026-11-01")).toBe(
      "2026-10-31T17:00:00.000Z",
    );
    expect(reportRangeBoundary("to", "2026-11-10")).toBe(
      "2026-11-10T17:00:00.000Z",
    );
    const range: SupportReportRange = {
      from: reportRangeBoundary("from", "2026-11-01")!,
      to: reportRangeBoundary("to", "2026-11-10")!,
    };
    expect(reportRangeInputValues(range)).toEqual({
      from: "2026-11-01",
      to: "2026-11-10",
    });
    expect(reportRangeBoundary("to", "")).toBeNull();
    expect(reportRangeBoundary("to", "not-a-date")).toBeNull();
  });

  it("buckets activity by local day, so an early-morning conversation counts today", () => {
    const series = buildReportSeries(
      {
        slice: "volume",
        scope: { kind: "all" },
        range: defaultReportRange(30, EARLY_MORNING),
        groupBy: "day",
        businessHoursOnly: false,
      },
      {
        // 01:00 on 10 November in Bangkok.
        conversations: [conversation("a", "2026-11-09T18:00:00.000Z")],
        messages: [],
        labels: [],
        now: EARLY_MORNING,
      },
    );
    const keys = series.buckets.map((bucket) => bucket.key);
    expect(keys[0]).toBe("2026-10-11");
    expect(keys.at(-1)).toBe("2026-11-10");
    expect(keys).toHaveLength(31);
    expect(series.buckets.at(-1)).toMatchObject({
      key: "2026-11-10",
      value: 1,
    });
  });

  it("shows today in a zone behind UTC too, after UTC has moved on", () => {
    setTimeZone("America/New_York");
    try {
      // 20:00 on 9 November in New York is already 10 November in UTC.
      const range = defaultReportRange(
        30,
        new Date("2026-11-10T01:00:00.000Z"),
      );
      expect(reportRangeInputValues(range).to).toBe("2026-11-09");
    } finally {
      setTimeZone("Asia/Bangkok");
    }
  });
});
