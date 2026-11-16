import { describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
import {
  DEFAULT_IN_APP_PREFERENCES,
  computeInAppAlerts,
} from "../../../../../../apps/admin/features/support-hub/lib/in-app-alerts";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
import type { SupportConversation } from "../../../../../../apps/admin/features/support-hub/types";

const NOW = "2026-04-15T12:00:00.000Z";
const ME = "agent-me";

function conversation(
  overrides: Partial<SupportConversation> & { id: string },
): SupportConversation {
  return {
    tenantId: "tenant-1",
    inboxId: "inbox-1",
    subject: "Receipt question",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: { id: ME, name: "Me", email: "me@example.org", avatarUrl: null },
    team: null,
    externalContactName: "Anita Gonzalez",
    externalContactEmail: "anita@example.com",
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: NOW,
    lastMessageAt: NOW,
    lastCustomerMessageAt: NOW,
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  } as SupportConversation;
}

const someoneElse = {
  id: "agent-other",
  name: "Other",
  email: "other@example.org",
  avatarUrl: null,
} as SupportConversation["assignee"];

const rows: SupportConversation[] = [
  // Mine, unread, open: counts as unread assigned.
  conversation({ id: "c-1", unreadCount: 2 }),
  // Mine, unread, pending: counts.
  conversation({ id: "c-2", status: "pending", unreadCount: 1 }),
  // Mine, unread but resolved: not active, does not count.
  conversation({ id: "c-3", status: "resolved", unreadCount: 1 }),
  // Someone else's unread: does not count.
  conversation({ id: "c-4", assignee: someoneElse, unreadCount: 3 }),
  // Mine, first reply overdue: SLA.
  conversation({ id: "c-5", firstResponseDueAt: "2026-04-15T11:00:00.000Z" }),
  // Mine, next reply due in 30 minutes: SLA.
  conversation({
    id: "c-6",
    firstRespondedAt: "2026-04-15T09:00:00.000Z",
    nextResponseDueAt: "2026-04-15T12:30:00.000Z",
  }),
  // Mine, due in three hours: on track.
  conversation({ id: "c-7", firstResponseDueAt: "2026-04-15T15:00:00.000Z" }),
  // Mine, overdue but snoozed: quiet.
  conversation({
    id: "c-8",
    status: "snoozed",
    firstResponseDueAt: "2026-04-15T11:00:00.000Z",
  }),
  // Someone else's overdue: not mine.
  conversation({
    id: "c-9",
    assignee: someoneElse,
    firstResponseDueAt: "2026-04-15T11:00:00.000Z",
  }),
];

describe("computeInAppAlerts", () => {
  it("counts my unread active conversations and my overdue or due-within-the-hour ones", () => {
    expect(
      computeInAppAlerts({
        conversations: rows,
        agentId: ME,
        preferences: DEFAULT_IN_APP_PREFERENCES,
        now: NOW,
      }),
    ).toEqual({ unreadAssigned: 2, slaAtRisk: 2 });
  });

  it("leaves out a channel the agent turned off", () => {
    expect(
      computeInAppAlerts({
        conversations: rows,
        agentId: ME,
        preferences: {
          inAppMentions: true,
          inAppAssignments: false,
          inAppSlaWarnings: true,
        },
        now: NOW,
      }),
    ).toEqual({ unreadAssigned: null, slaAtRisk: 2 });
    expect(
      computeInAppAlerts({
        conversations: rows,
        agentId: ME,
        preferences: {
          inAppMentions: true,
          inAppAssignments: true,
          inAppSlaWarnings: false,
        },
        now: NOW,
      }),
    ).toEqual({ unreadAssigned: 2, slaAtRisk: null });
  });

  it("says nothing when the viewer is not a Support Hub agent", () => {
    expect(
      computeInAppAlerts({
        conversations: rows,
        agentId: null,
        preferences: DEFAULT_IN_APP_PREFERENCES,
        now: NOW,
      }),
    ).toEqual({ unreadAssigned: null, slaAtRisk: null });
  });

  it("defaults every in-app channel on, like a new agent's preferences", () => {
    expect(DEFAULT_IN_APP_PREFERENCES).toEqual({
      inAppMentions: true,
      inAppAssignments: true,
      inAppSlaWarnings: true,
    });
  });
});
