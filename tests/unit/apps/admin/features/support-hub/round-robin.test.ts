import { describe, expect, it } from "vitest";

import { selectNextRoundRobinAgent } from "../../../../../../apps/admin/features/support-hub/lib/round-robin";
import type {
  SupportAssignee,
  SupportConversation,
} from "../../../../../../apps/admin/features/support-hub/types";

function makeAgent(id: string, name: string): SupportAssignee {
  return {
    id,
    name,
    email: `${id}@example.org`,
    avatarUrl: null,
    title: null,
  };
}

function makeConversation(
  id: string,
  assigneeId: string | null,
  status: SupportConversation["status"] = "open",
  inboxId: string = "inbox-main",
): SupportConversation {
  return {
    id,
    tenantId: "tenant-1",
    inboxId,
    subject: id,
    status,
    priority: "normal",
    channel: "email",
    assignee: assigneeId ? makeAgent(assigneeId, assigneeId) : null,
    team: null,
    externalContactName: null,
    externalContactEmail: "donor@example.com",
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 0,
    firstMessageAt: "2026-01-01T00:00:00.000Z",
    lastMessageAt: "2026-01-01T00:00:00.000Z",
    lastCustomerMessageAt: null,
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
}

describe("selectNextRoundRobinAgent", () => {
  it("returns null when no agents are eligible", () => {
    const next = selectNextRoundRobinAgent({
      conversations: [],
      agents: [],
    });
    expect(next).toBeNull();
  });

  it("picks the agent with the lowest active load", () => {
    const agents = [
      makeAgent("agent-a", "Agent A"),
      makeAgent("agent-b", "Agent B"),
    ];
    const conversations = [
      makeConversation("c1", "agent-a"),
      makeConversation("c2", "agent-a"),
      makeConversation("c3", "agent-b"),
    ];
    const next = selectNextRoundRobinAgent({
      conversations,
      agents,
    });
    expect(next?.id).toBe("agent-b");
  });

  it("breaks ties by agent id alphabetically", () => {
    const agents = [
      makeAgent("agent-bea", "Bea"),
      makeAgent("agent-amy", "Amy"),
    ];
    const next = selectNextRoundRobinAgent({
      conversations: [],
      agents,
    });
    expect(next?.id).toBe("agent-amy");
  });

  it("excludes the supplied agent ids on reroll", () => {
    const agents = [
      makeAgent("agent-a", "Agent A"),
      makeAgent("agent-b", "Agent B"),
      makeAgent("agent-c", "Agent C"),
    ];
    const next = selectNextRoundRobinAgent({
      conversations: [makeConversation("c1", "agent-a")],
      agents,
      excludeAgentIds: ["agent-b"],
    });
    expect(next?.id).toBe("agent-c");
  });
});
