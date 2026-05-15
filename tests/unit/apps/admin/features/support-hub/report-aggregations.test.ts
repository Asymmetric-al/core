import { describe, expect, it } from "vitest";

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
