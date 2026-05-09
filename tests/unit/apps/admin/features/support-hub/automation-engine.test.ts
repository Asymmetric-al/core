import { describe, expect, it } from "vitest";

import { evaluateSupportAutomationRule } from "../../../../../../apps/admin/features/support-hub/lib/automation-engine";
import type {
  SupportAutomationRule,
  SupportConversation,
  SupportLabel,
  SupportMessage,
} from "../../../../../../apps/admin/features/support-hub/types";

const BASE_CONVERSATION: SupportConversation = {
  id: "conv-1",
  tenantId: "tenant-1",
  inboxId: "inbox-main",
  subject: "Receipt question",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactName: "Anita Gonzalez",
  externalContactEmail: "anita@foundations.org",
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: "2026-01-01T00:00:00.000Z",
  lastMessageAt: "2026-01-01T00:00:00.000Z",
  lastCustomerMessageAt: "2026-01-01T00:00:00.000Z",
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 0,
  slaPolicyId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const LABEL: SupportLabel = {
  id: "label-finance",
  tenantId: "tenant-1",
  name: "Finance",
  slug: "finance",
  tone: "amber",
  description: null,
};

const MESSAGE: SupportMessage = {
  id: "msg-1",
  tenantId: "tenant-1",
  conversationId: "conv-1",
  type: "email",
  direction: "inbound",
  isPrivate: false,
  deliveryState: "delivered",
  author: {
    id: "donor-1",
    role: "donor",
    name: "Anita Gonzalez",
    email: "anita@foundations.org",
    avatarUrl: null,
  },
  body: {
    json: null,
    html: "<p>urgent gift refund please</p>",
    text: "urgent gift refund please",
  },
  attachments: [],
  emailHeaders: null,
  outboundSendLogId: null,
  inboundEmailId: null,
  postedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function buildRule(
  overrides: Partial<SupportAutomationRule> = {},
): SupportAutomationRule {
  return {
    id: "rule-1",
    tenantId: "tenant-1",
    name: "Test rule",
    description: null,
    enabled: true,
    trigger: "conversation_created",
    conditions: [],
    actions: [{ kind: "add_label", labelId: LABEL.id }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("evaluateSupportAutomationRule", () => {
  it("short-circuits disabled rules", () => {
    const result = evaluateSupportAutomationRule(
      buildRule({ enabled: false }),
      { conversation: BASE_CONVERSATION },
    );
    expect(result.matches).toBe(false);
    expect(result.plannedActions).toEqual([]);
  });

  it("ANDs conditions and reports per-condition reasons", () => {
    const result = evaluateSupportAutomationRule(
      buildRule({
        conditions: [
          { kind: "from_domain_equals", domain: "foundations.org" },
          { kind: "subject_contains", value: "Receipt" },
        ],
      }),
      { conversation: BASE_CONVERSATION },
    );
    expect(result.matches).toBe(true);
    expect(result.reasons).toHaveLength(2);
    expect(result.reasons.every((reason) => reason.length > 0)).toBe(true);
  });

  it("fails when any condition does not match", () => {
    const result = evaluateSupportAutomationRule(
      buildRule({
        conditions: [{ kind: "from_domain_equals", domain: "other.org" }],
      }),
      { conversation: BASE_CONVERSATION },
    );
    expect(result.matches).toBe(false);
    expect(result.plannedActions).toEqual([]);
  });

  it("passes message-based conditions when a message is supplied", () => {
    const result = evaluateSupportAutomationRule(
      buildRule({
        trigger: "message_received",
        conditions: [{ kind: "body_contains", value: "urgent" }],
      }),
      { conversation: BASE_CONVERSATION, message: MESSAGE },
    );
    expect(result.matches).toBe(true);
  });

  it("maps automation actions onto the SupportMacroAction shape", () => {
    const result = evaluateSupportAutomationRule(
      buildRule({
        actions: [
          { kind: "assign_agent", agentId: "agent-1" },
          { kind: "set_priority", priority: "high" },
          { kind: "snooze", hours: 12 },
          { kind: "mark_escalated" },
        ],
      }),
      { conversation: BASE_CONVERSATION },
    );
    expect(result.plannedActions.map((action) => action.kind)).toEqual([
      "assign_agent",
      "set_priority",
      "snooze",
    ]);
    expect(result.unsupportedActions.map((action) => action.kind)).toEqual([
      "mark_escalated",
    ]);
  });
});
