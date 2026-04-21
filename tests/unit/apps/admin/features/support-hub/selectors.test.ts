import { describe, expect, it } from "vitest";

import {
  computeAverageFirstResponseMinutes,
  computeInboxStats,
  countResolvedSince,
  selectByView,
  selectConversations,
  selectEscalated,
  selectMine,
  selectPastDue,
  selectUnassigned,
  selectWaitingOnAgent,
  selectWaitingOnDonor,
} from "../../../../../../apps/admin/features/support-hub/lib/selectors";
import type {
  SupportConversation,
  SupportConversationStatus,
} from "../../../../../../apps/admin/features/support-hub/types";

const NOW = new Date("2026-04-16T12:00:00.000Z");

const AGENT_ID = "agent-emily-thompson";

function makeConversation(
  overrides: Partial<SupportConversation> & { id: string },
): SupportConversation {
  const base: SupportConversation = {
    id: overrides.id,
    tenantId: "tenant-give-hope",
    inboxId: "support-inbox-default",
    subject: "Sample subject",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactEmail: "donor@example.com",
    externalContactName: "Donor Example",
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: "2026-04-15T08:00:00.000Z",
    lastMessageAt: "2026-04-15T08:00:00.000Z",
    lastCustomerMessageAt: "2026-04-15T08:00:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: null,
    createdAt: "2026-04-15T08:00:00.000Z",
    updatedAt: "2026-04-15T08:00:00.000Z",
  };
  return { ...base, ...overrides };
}

describe("support-hub selectors", () => {
  it("selectByView dispatches every named slice", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "open-mine",
        assignee: makeAssignee(),
        status: "open",
      }),
      makeConversation({
        id: "open-unassigned",
        assignee: null,
        status: "open",
      }),
      makeConversation({
        id: "past-due-open",
        status: "open",
        firstResponseDueAt: "2026-04-15T00:00:00.000Z",
        firstRespondedAt: null,
      }),
      makeConversation({
        id: "escalated-open",
        status: "open",
        escalatedAt: "2026-04-15T08:00:00.000Z",
      }),
      makeConversation({
        id: "resolved",
        status: "resolved",
        resolvedAt: "2026-04-16T08:00:00.000Z",
      }),
    ];

    expect(selectByView(rows, "all", AGENT_ID, NOW)).toHaveLength(rows.length);
    expect(selectMine(rows, AGENT_ID).map((row) => row.id)).toEqual([
      "open-mine",
    ]);
    expect(selectUnassigned(rows).map((row) => row.id)).toEqual(
      expect.arrayContaining([
        "open-unassigned",
        "past-due-open",
        "escalated-open",
      ]),
    );
    expect(selectPastDue(rows, NOW).map((row) => row.id)).toEqual([
      "past-due-open",
    ]);
    expect(selectEscalated(rows).map((row) => row.id)).toEqual([
      "escalated-open",
    ]);
  });

  it("waiting selectors split inbound vs outbound conversations", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "waiting-on-agent",
        status: "open",
        lastMessageDirection: "inbound",
      }),
      makeConversation({
        id: "waiting-on-donor",
        status: "pending",
        lastMessageDirection: "outbound",
      }),
      makeConversation({
        id: "resolved-skipped",
        status: "resolved",
        lastMessageDirection: "inbound",
      }),
    ];

    expect(selectWaitingOnAgent(rows).map((row) => row.id)).toEqual([
      "waiting-on-agent",
    ]);
    expect(selectWaitingOnDonor(rows).map((row) => row.id)).toEqual([
      "waiting-on-donor",
    ]);
  });

  it("selectConversations chains view + status + label + assignee + search", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "match",
        status: "open",
        assignee: makeAssignee(),
        externalContactName: "John Anderson",
        labels: [
          {
            id: "label-finance",
            tenantId: "tenant-give-hope",
            name: "Finance",
            slug: "finance",
            tone: "amber",
            description: null,
          },
        ],
      }),
      makeConversation({
        id: "different-status",
        status: "resolved",
        assignee: makeAssignee(),
      }),
      makeConversation({
        id: "different-label",
        status: "open",
        assignee: makeAssignee(),
      }),
    ];

    const result = selectConversations(rows, {
      view: "mine",
      status: "open",
      q: "anderson",
      labelSlugs: ["finance"],
      assignee: "me",
      agentId: AGENT_ID,
      now: NOW,
    });

    expect(result.map((row) => row.id)).toEqual(["match"]);
  });

  it("computeAverageFirstResponseMinutes averages responded conversations", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "responded-fast",
        firstMessageAt: "2026-04-15T08:00:00.000Z",
        firstRespondedAt: "2026-04-15T08:30:00.000Z",
      }),
      makeConversation({
        id: "responded-slow",
        firstMessageAt: "2026-04-15T08:00:00.000Z",
        firstRespondedAt: "2026-04-15T10:00:00.000Z",
      }),
      makeConversation({
        id: "still-waiting",
        firstRespondedAt: null,
      }),
    ];
    expect(computeAverageFirstResponseMinutes(rows)).toBe(
      Math.round((30 + 120) / 2),
    );
    expect(
      computeAverageFirstResponseMinutes(
        rows.filter((row) => row.firstRespondedAt === null),
      ),
    ).toBe(0);
  });

  it("countResolvedSince counts resolutions on or after the cutoff", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "resolved-today",
        status: "resolved",
        resolvedAt: "2026-04-16T09:00:00.000Z",
      }),
      makeConversation({
        id: "resolved-yesterday",
        status: "resolved",
        resolvedAt: "2026-04-15T22:00:00.000Z",
      }),
      makeConversation({
        id: "still-open",
        status: "open",
        resolvedAt: null,
      }),
    ];
    expect(countResolvedSince(rows, "2026-04-16T00:00:00.000Z")).toBe(1);
    expect(countResolvedSince(rows, "2026-04-15T00:00:00.000Z")).toBe(2);
  });

  it("computeInboxStats separates unassignedCount from waitingOnAgentCount", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "assigned-inbound",
        status: "open",
        assignee: makeAssignee(),
        lastMessageDirection: "inbound",
      }),
      makeConversation({
        id: "unassigned-outbound",
        status: "open",
        assignee: null,
        lastMessageDirection: "outbound",
      }),
    ];
    const stats = computeInboxStats(rows, NOW);
    expect(stats.waitingOnAgentCount).toBe(1);
    expect(stats.unassignedCount).toBe(1);
  });

  it("computeInboxStats surfaces bucket counts plus the new metrics", () => {
    const rows: SupportConversation[] = [
      makeConversation({
        id: "open-1",
        status: "open",
        firstResponseDueAt: "2026-04-15T00:00:00.000Z",
        firstRespondedAt: null,
      }),
      makeConversation({
        id: "open-2",
        status: "open",
        assignee: makeAssignee(),
        firstMessageAt: "2026-04-15T08:00:00.000Z",
        firstRespondedAt: "2026-04-15T08:45:00.000Z",
      }),
      makeConversation({
        id: "resolved-today",
        status: "resolved",
        resolvedAt: "2026-04-16T09:00:00.000Z",
        firstMessageAt: "2026-04-15T08:00:00.000Z",
        firstRespondedAt: "2026-04-15T09:00:00.000Z",
      }),
    ];
    const stats = computeInboxStats(rows, NOW);
    const bucketByStatus = (status: SupportConversationStatus) =>
      stats.buckets.find((bucket) => bucket.status === status)?.count ?? 0;

    expect(stats.total).toBe(3);
    expect(bucketByStatus("open")).toBe(2);
    expect(bucketByStatus("resolved")).toBe(1);
    expect(stats.pastDueCount).toBe(1);
    expect(stats.resolvedTodayCount).toBe(1);
    expect(stats.averageFirstResponseMinutes).toBeGreaterThan(0);
    expect(stats.unassignedCount).toBe(1);
  });
});

function makeAssignee() {
  return {
    id: AGENT_ID,
    name: "Emily Thompson",
    email: "admin@givehope.org",
    avatarUrl: null,
    title: "Director of Operations",
  };
}
