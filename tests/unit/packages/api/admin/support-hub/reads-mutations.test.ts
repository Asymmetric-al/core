import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { __resetInMemorySupportHubStore } from "../../../../../../packages/api/src/admin/support-hub/adapter";
import {
  addSupportPrivateNote,
  assignSupportConversation,
  listSupportConversationMessages,
  listSupportConversations,
  saveSupportLabel,
  saveSupportMacro,
  setSupportConversationStatus,
  toggleSupportConversationLabel,
} from "../../../../../../packages/api/src/admin/support-hub";

beforeEach(() => {
  __resetInMemorySupportHubStore();
});

afterEach(() => {
  __resetInMemorySupportHubStore();
});

describe("support-hub adapter — reads", () => {
  it("returns the seeded conversation list", async () => {
    const conversations = await listSupportConversations({});
    expect(conversations.length).toBeGreaterThan(0);
  });

  it("filters conversations by status", async () => {
    const all = await listSupportConversations({});
    const open = await listSupportConversations({ status: "open" });
    expect(open.every((conversation) => conversation.status === "open")).toBe(
      true,
    );
    expect(open.length).toBeLessThanOrEqual(all.length);
  });

  it("returns messages scoped to a conversation", async () => {
    const conversations = await listSupportConversations({});
    const target = conversations[0];
    expect(target).toBeDefined();
    if (!target) return;
    const messages = await listSupportConversationMessages(target.id);
    expect(messages.every((m) => m.conversationId === target.id)).toBe(true);
  });
});

describe("support-hub adapter — mutations", () => {
  it("assigns and unassigns a conversation", async () => {
    const [conversation] = await listSupportConversations({});
    if (!conversation) throw new Error("seed missing");
    const assigned = await assignSupportConversation({
      conversationId: conversation.id,
      assigneeAgentId: "agent-emily-thompson",
    });
    expect(assigned.assignee?.id).toBe("agent-emily-thompson");
    const unassigned = await assignSupportConversation({
      conversationId: conversation.id,
      assigneeAgentId: null,
    });
    expect(unassigned.assignee).toBeNull();
  });

  it("flips status to resolved + clears snooze", async () => {
    const [conversation] = await listSupportConversations({});
    if (!conversation) throw new Error("seed missing");
    const resolved = await setSupportConversationStatus({
      conversationId: conversation.id,
      status: "resolved",
    });
    expect(resolved.status).toBe("resolved");
    expect(resolved.snoozedUntil).toBeNull();
    expect(resolved.resolvedAt).not.toBeNull();
  });

  it("toggles a label on the conversation", async () => {
    const [conversation] = await listSupportConversations({});
    if (!conversation) throw new Error("seed missing");
    const target = await toggleSupportConversationLabel({
      conversationId: conversation.id,
      labelId: "label-finance",
      mode: "add",
    });
    expect(target.labels.some((label) => label.id === "label-finance")).toBe(
      true,
    );
    const removed = await toggleSupportConversationLabel({
      conversationId: conversation.id,
      labelId: "label-finance",
      mode: "remove",
    });
    expect(removed.labels.some((label) => label.id === "label-finance")).toBe(
      false,
    );
  });

  it("posts a private note", async () => {
    const [conversation] = await listSupportConversations({});
    if (!conversation) throw new Error("seed missing");
    const message = await addSupportPrivateNote({
      conversationId: conversation.id,
      authorAgentId: "agent-emily-thompson",
      bodyText: "Looping in finance.",
    });
    expect(message.type).toBe("note");
    expect(message.isPrivate).toBe(true);
  });

  it("creates a label and assigns an id", async () => {
    const label = await saveSupportLabel({
      name: "Phase 7 test",
      slug: "phase-7-test",
      tone: "blue",
      description: null,
    });
    expect(label.id).toMatch(/^label-/);
  });

  it("creates a macro with action sequence", async () => {
    const macro = await saveSupportMacro({
      name: "Resolve + label",
      description: null,
      ownerAgentId: null,
      actions: [
        { kind: "set_status", status: "resolved" },
        { kind: "add_label", labelId: "label-finance" },
      ],
    });
    expect(macro.actions).toHaveLength(2);
  });
});
