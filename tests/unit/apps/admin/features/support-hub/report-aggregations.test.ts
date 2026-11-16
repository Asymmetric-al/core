import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  buildReportSeries,
  filterConversationsByScope,
  isIsoWithinRange,
} from "../../../../../../apps/admin/features/support-hub/lib/report-aggregations";
import type {
  SupportConversation,
  SupportMessage,
  SupportReportRequest,
} from "../../../../../../apps/admin/features/support-hub/types";

const NOW = "2026-04-15T12:00:00.000Z";

it("includes the first-response sample count", () => {
  const series = buildReportSeries(buildRequest({ slice: "first-response" }), {
    conversations: [
      buildConversation({ firstRespondedAt: "2026-04-15T12:05:00.000Z" }),
    ],
    messages: [],
    labels: [],
  });
  expect(
    series.buckets.find((bucket) => bucket.key === "responded")?.value,
  ).toBe(1);
});
it("counts everyone waiting now, not only conversations started in the range", () => {
  const series = buildReportSeries(
    buildRequest({ slice: "customer-waiting" }),
    {
      conversations: [
        buildConversation({ createdAt: "2026-01-01T00:00:00.000Z" }),
      ],
      messages: [],
      labels: [],
      businessHours: null,
      now: NOW,
    },
  );
  expect(
    series.buckets.find((bucket) => bucket.key === "conversations-waiting")
      ?.value,
  ).toBe(1);
});

// Report days are the viewer's local days; these fixtures are written for a
// viewer on UTC (report-range-local.test.ts covers other zones).
const ORIGINAL_TZ = process.env.TZ;
beforeAll(() => {
  process.env.TZ = "UTC";
});
afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

function buildConversation(
  overrides: Partial<SupportConversation> = {},
): SupportConversation {
  return {
    id: overrides.id ?? "conv-1",
    tenantId: "tenant-1",
    inboxId: "inbox-1",
    subject: overrides.subject ?? "Receipt question",
    status: overrides.status ?? "open",
    priority: "normal",
    channel: "email",
    assignee: overrides.assignee ?? null,
    team: overrides.team ?? null,
    externalContactName: "Anita Gonzalez",
    externalContactEmail: "anita@example.com",
    contact: null,
    labels: overrides.labels ?? [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: overrides.firstMessageAt ?? NOW,
    lastMessageAt: overrides.lastMessageAt ?? NOW,
    lastCustomerMessageAt: overrides.lastCustomerMessageAt ?? NOW,
    lastMessageDirection: overrides.lastMessageDirection ?? "inbound",
    firstRespondedAt: overrides.firstRespondedAt ?? null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    resolvedAt: overrides.resolvedAt ?? null,
    snoozedUntil: overrides.snoozedUntil ?? null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: null,
    createdAt: overrides.createdAt ?? NOW,
    updatedAt: NOW,
  };
}

function buildMessage(overrides: Partial<SupportMessage> = {}): SupportMessage {
  return {
    id: overrides.id ?? "msg-1",
    tenantId: "tenant-1",
    conversationId: overrides.conversationId ?? "conv-1",
    type: "email",
    direction: overrides.direction ?? "inbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: {
      id: "donor-1",
      role: "donor",
      name: "Anita",
      email: "anita@example.com",
      avatarUrl: null,
    },
    body: { json: null, html: "", text: "" },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: overrides.postedAt ?? NOW,
    createdAt: overrides.postedAt ?? NOW,
    updatedAt: overrides.postedAt ?? NOW,
  };
}

const RANGE = {
  from: "2026-04-01T00:00:00.000Z",
  to: "2026-05-01T00:00:00.000Z",
};

function buildRequest(
  overrides: Partial<SupportReportRequest> = {},
): SupportReportRequest {
  return {
    slice: "volume",
    scope: { kind: "all" },
    range: RANGE,
    groupBy: "day",
    businessHoursOnly: false,
    ...overrides,
  };
}

describe("filterConversationsByScope", () => {
  it("returns rows unchanged when scope is 'all'", () => {
    const conversations = [
      buildConversation({ id: "a" }),
      buildConversation({ id: "b" }),
    ];
    expect(
      filterConversationsByScope(conversations, { kind: "all" }),
    ).toHaveLength(2);
  });

  it("filters by inbox id when scope.kind === inbox", () => {
    const conversations = [
      buildConversation({ id: "a" }),
      buildConversation({ id: "b" }),
    ];
    expect(
      filterConversationsByScope(conversations, {
        kind: "inbox",
        id: "other-inbox",
      }),
    ).toHaveLength(0);
  });
});

describe("isIsoWithinRange", () => {
  it("returns true for an ISO inside the range", () => {
    expect(
      isIsoWithinRange("2026-04-15T08:00:00.000Z", {
        from: "2026-04-01T00:00:00.000Z",
        to: "2026-05-01T00:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("returns false outside the range", () => {
    expect(
      isIsoWithinRange("2026-06-15T08:00:00.000Z", {
        from: "2026-04-01T00:00:00.000Z",
        to: "2026-05-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});

describe("buildReportSeries", () => {
  it("groups team mix by team within the selected range and scope, keeping No team", () => {
    const team = {
      id: "team-care",
      name: "Care",
      slug: "care",
      initials: "CA",
      description: null,
    };
    const otherTeam = { ...team, id: "team-finance", name: "Finance" };
    const series = buildReportSeries(
      buildRequest({
        slice: "team-mix",
        scope: { kind: "label", id: "finance" },
      }),
      {
        conversations: [
          buildConversation({ id: "care-1", team }),
          buildConversation({ id: "care-2", team }),
          buildConversation({ id: "finance", team: otherTeam }),
          buildConversation({ id: "none" }),
          buildConversation({
            id: "old",
            team,
            createdAt: "2026-03-01T00:00:00.000Z",
          }),
        ].map((conversation) => ({
          ...conversation,
          labels: [
            {
              id: "finance",
              tenantId: "tenant-1",
              name: "Finance",
              slug: "finance",
              tone: "zinc" as const,
              description: null,
            },
          ],
        })),
        messages: [],
        labels: [],
        now: NOW,
      },
    );
    expect(series.slice).toBe("team-mix");
    expect(series.total).toBe(4);
    expect(series.buckets).toEqual([
      { key: "team-care", label: "Care", value: 2, secondaryValue: null },
      { key: "team-finance", label: "Finance", value: 1, secondaryValue: null },
      { key: "none", label: "No team", value: 1, secondaryValue: null },
    ]);
  });

  it("returns empty series for the server's empty range instead of throwing", () => {
    // The report route renders on the server before the viewer's calendar
    // is known; its range is then { from: "", to: "" } (round 9r crash).
    const slices: SupportReportRequest["slice"][] = [
      "volume",
      "messages-received",
      "messages-sent",
      "customer-waiting",
      "resolution-count",
      "open-count",
      "snoozed-count",
      "first-response",
      "resolution",
      "label-mix",
      "agent-mix",
    ];
    for (const slice of slices) {
      const series = buildReportSeries(
        buildRequest({ slice, range: { from: "", to: "" } }),
        {
          conversations: [buildConversation()],
          messages: [buildMessage()],
          labels: [],
          now: NOW,
        },
      );
      // Open and snoozed counts describe the inbox now, not the range.
      if (
        slice === "open-count" ||
        slice === "snoozed-count" ||
        slice === "customer-waiting"
      )
        continue;
      // Nothing falls inside an empty range; fixed wait-time bands may
      // still be listed, each empty.
      expect(series.total, slice).toBe(0);
      expect(
        series.buckets.every((bucket) => bucket.value === 0),
        slice,
      ).toBe(true);
    }
  });

  it("counts messages-received by direction", () => {
    const series = buildReportSeries(
      buildRequest({ slice: "messages-received" }),
      {
        conversations: [buildConversation()],
        messages: [
          buildMessage({ direction: "inbound", postedAt: NOW }),
          buildMessage({ direction: "outbound", postedAt: NOW, id: "msg-2" }),
        ],
        labels: [],
        now: NOW,
      },
    );
    expect(series.total).toBe(1);
    expect(series.unit).toBe("count");
  });

  it("buckets volume by day", () => {
    const series = buildReportSeries(buildRequest({ slice: "volume" }), {
      conversations: [
        buildConversation({ id: "a", createdAt: "2026-04-14T10:00:00.000Z" }),
        buildConversation({ id: "b", createdAt: "2026-04-14T15:00:00.000Z" }),
        buildConversation({ id: "c", createdAt: "2026-04-15T10:00:00.000Z" }),
      ],
      messages: [],
      labels: [],
      now: NOW,
    });
    expect(series.total).toBe(3);
    const day14 = series.buckets.find((b) => b.key === "2026-04-14");
    expect(day14?.value).toBe(2);
  });

  it("charts every day of the selected range, quiet ones at zero", () => {
    const series = buildReportSeries(
      buildRequest({
        slice: "volume",
        range: {
          from: "2026-04-10T00:00:00.000Z",
          to: "2026-04-17T00:00:00.000Z",
        },
      }),
      {
        conversations: [
          buildConversation({ id: "a", createdAt: "2026-04-12T10:00:00.000Z" }),
          buildConversation({ id: "b", createdAt: "2026-04-15T10:00:00.000Z" }),
        ],
        messages: [],
        labels: [],
        now: NOW,
      },
    );
    expect(series.buckets.map((b) => [b.key, b.value])).toEqual([
      ["2026-04-10", 0],
      ["2026-04-11", 0],
      ["2026-04-12", 1],
      ["2026-04-13", 0],
      ["2026-04-14", 0],
      ["2026-04-15", 1],
      ["2026-04-16", 0],
    ]);
  });

  it("charts quiet weeks at zero too", () => {
    const weeks = buildReportSeries(
      buildRequest({ slice: "volume", groupBy: "week" }),
      {
        conversations: [
          buildConversation({ id: "a", createdAt: "2026-04-01T10:00:00.000Z" }),
          buildConversation({ id: "b", createdAt: "2026-04-20T10:00:00.000Z" }),
        ],
        messages: [],
        labels: [],
        now: NOW,
      },
    );
    // Weeks of Mar 30 (holds Apr 1) through Apr 27 (holds Apr 30).
    expect(weeks.buckets.map((b) => [b.key, b.value])).toEqual([
      ["2026-03-30", 1],
      ["2026-04-06", 0],
      ["2026-04-13", 0],
      ["2026-04-20", 1],
      ["2026-04-27", 0],
    ]);
  });

  it("never drops activity from a long range: the chart and table match the total", () => {
    // Over 600 days by day: too many periods to fill, so every day with
    // activity is kept rather than the axis stopping part-way.
    const series = buildReportSeries(
      buildRequest({
        slice: "volume",
        range: {
          from: "2025-01-01T00:00:00.000Z",
          to: "2026-11-02T00:00:00.000Z",
        },
      }),
      {
        conversations: [
          buildConversation({ id: "a", createdAt: "2025-01-01T10:00:00.000Z" }),
          buildConversation({ id: "b", createdAt: "2026-11-01T10:00:00.000Z" }),
        ],
        messages: [],
        labels: [],
        now: NOW,
      },
    );
    expect(series.total).toBe(2);
    const counted = series.buckets.reduce((sum, b) => sum + b.value, 0);
    expect(counted).toBe(2);
    expect(series.buckets.map((b) => b.key)).toContain("2026-11-01");
  });

  it("excludes volume conversations outside the requested range", () => {
    const series = buildReportSeries(buildRequest({ slice: "volume" }), {
      conversations: [
        buildConversation({
          id: "in-range",
          createdAt: "2026-04-14T10:00:00.000Z",
        }),
        buildConversation({
          id: "before-range",
          createdAt: "2026-03-31T23:00:00.000Z",
        }),
        buildConversation({
          id: "after-range",
          createdAt: "2026-05-01T00:00:00.000Z",
        }),
      ],
      messages: [],
      labels: [],
      now: NOW,
    });

    expect(series.total).toBe(1);
    const keys = series.buckets.map((bucket) => bucket.key);
    // The axis is the requested range: April, quiet days at zero.
    expect(keys[0]).toBe("2026-04-01");
    expect(keys.at(-1)).toBe("2026-04-30");
    expect(keys).not.toContain("2026-03-31");
    expect(keys).not.toContain("2026-05-01");
    expect(series.buckets.filter((bucket) => bucket.value > 0)).toEqual([
      expect.objectContaining({ key: "2026-04-14", value: 1 }),
    ]);
  });

  it("returns 0 when no resolved conversations are in range", () => {
    const series = buildReportSeries(
      buildRequest({ slice: "resolution-count" }),
      {
        conversations: [buildConversation()],
        messages: [],
        labels: [],
        now: NOW,
      },
    );
    expect(series.total).toBe(0);
  });

  it("computes open + pending counts", () => {
    const series = buildReportSeries(buildRequest({ slice: "open-count" }), {
      conversations: [
        buildConversation({ id: "a", status: "open" }),
        buildConversation({ id: "b", status: "pending" }),
        buildConversation({ id: "c", status: "resolved" }),
      ],
      messages: [],
      labels: [],
      now: NOW,
    });
    expect(series.total).toBe(2);
    expect(series.buckets.find((b) => b.key === "open")?.value).toBe(1);
    expect(series.buckets.find((b) => b.key === "pending")?.value).toBe(1);
  });

  it("groups customer-waiting conversations and includes a longest-wait bucket", () => {
    const series = buildReportSeries(
      buildRequest({ slice: "customer-waiting" }),
      {
        conversations: [
          buildConversation({
            id: "a",
            status: "open",
            lastMessageDirection: "inbound",
            lastCustomerMessageAt: "2026-04-15T11:00:00.000Z",
          }),
        ],
        messages: [],
        labels: [],
        now: NOW,
      },
    );
    expect(
      series.buckets.find((b) => b.key === "conversations-waiting")?.value,
    ).toBe(1);
    expect(series.unit).toBe("minutes");
  });
});
