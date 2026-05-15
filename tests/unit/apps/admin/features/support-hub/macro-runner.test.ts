import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  runSupportMacro,
  type MacroLookup,
  type MacroMutationBag,
} from "../../../../../../apps/admin/features/support-hub/lib/macro-runner";
import type {
  SupportAssignee,
  SupportCannedResponse,
  SupportConversation,
  SupportLabel,
  SupportMacro,
} from "../../../../../../apps/admin/features/support-hub/types";

const AGENT: SupportAssignee = {
  id: "agent-1",
  name: "Emily",
  email: "emily@example.org",
  avatarUrl: null,
  title: "Director",
};

const CONVERSATION: SupportConversation = {
  id: "conv-1",
  tenantId: "tenant-1",
  inboxId: "inbox-1",
  subject: "Test conversation",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactName: "Donor Name",
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

const LABEL: SupportLabel = {
  id: "label-1",
  tenantId: "tenant-1",
  name: "Refund",
  slug: "refund",
  tone: "amber",
  description: null,
};

const CANNED: SupportCannedResponse = {
  id: "canned-1",
  tenantId: "tenant-1",
  shortCode: "thx",
  title: "Thanks template",
  ownerAgentId: null,
  bodyText: "Thank you, {{donor.name}}.",
  bodyHtml: "<p>Thank you, {{donor.name}}.</p>",
};

function buildMacro(actions: SupportMacro["actions"]): SupportMacro {
  return {
    id: "macro-1",
    tenantId: "tenant-1",
    name: "Test macro",
    description: null,
    ownerAgentId: null,
    actions,
  };
}

function buildLookup(): MacroLookup {
  return {
    findLabel: (id) => (id === LABEL.id ? LABEL : null),
    findCannedResponse: (id) => (id === CANNED.id ? CANNED : null),
    findAgent: (id) => (id === AGENT.id ? AGENT : null),
  };
}

function buildMockMutations(): MacroMutationBag & {
  spies: {
    setStatus: ReturnType<typeof vi.fn>;
    setPriority: ReturnType<typeof vi.fn>;
    assign: ReturnType<typeof vi.fn>;
    toggleLabel: ReturnType<typeof vi.fn>;
    snooze: ReturnType<typeof vi.fn>;
    addPrivateNote: ReturnType<typeof vi.fn>;
  };
} {
  const setStatus = vi.fn(async () => "ok");
  const setPriority = vi.fn(async () => "ok");
  const assign = vi.fn(async () => "ok");
  const toggleLabel = vi.fn(async () => "ok");
  const snooze = vi.fn(async () => "ok");
  const addPrivateNote = vi.fn(async () => "ok");
  return {
    setStatus,
    setPriority,
    assign,
    toggleLabel,
    snooze,
    addPrivateNote,
    spies: {
      setStatus,
      setPriority,
      assign,
      toggleLabel,
      snooze,
      addPrivateNote,
    },
  };
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      return new Response(JSON.stringify({ message: { id: "msg-activity" } }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("runSupportMacro", () => {
  it("dispatches actions in order and reports outcomes", async () => {
    const mutations = buildMockMutations();
    const macro = buildMacro([
      { kind: "set_status", status: "pending" },
      { kind: "add_label", labelId: LABEL.id },
      { kind: "snooze", hours: 24 },
    ]);
    const result = await runSupportMacro({
      macro,
      conversation: CONVERSATION,
      actorAgent: AGENT,
      mutations,
      lookup: buildLookup(),
    });
    expect(result.outcomes.map((o) => o.action.kind)).toEqual([
      "set_status",
      "add_label",
      "snooze",
    ]);
    expect(mutations.spies.setStatus).toHaveBeenCalledWith({
      conversationId: CONVERSATION.id,
      status: "pending",
    });
    expect(mutations.spies.toggleLabel).toHaveBeenCalledWith({
      conversationId: CONVERSATION.id,
      labelId: LABEL.id,
      mode: "add",
    });
    expect(mutations.spies.snooze).toHaveBeenCalledTimes(1);
  });

  it("logs an activity row per action", async () => {
    const fetchSpy = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const mutations = buildMockMutations();
    const macro = buildMacro([
      { kind: "set_status", status: "resolved" },
      { kind: "set_priority", priority: "high" },
    ]);
    await runSupportMacro({
      macro,
      conversation: CONVERSATION,
      actorAgent: AGENT,
      mutations,
      lookup: buildLookup(),
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/admin/support/conversations/conv-1/notes",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("skips unknown labels gracefully", async () => {
    const mutations = buildMockMutations();
    const macro = buildMacro([{ kind: "add_label", labelId: "unknown-label" }]);
    const result = await runSupportMacro({
      macro,
      conversation: CONVERSATION,
      actorAgent: AGENT,
      mutations,
      lookup: buildLookup(),
    });
    expect(result.outcomes[0]?.status).toBe("skipped");
    expect(mutations.spies.toggleLabel).not.toHaveBeenCalled();
  });

  it("computes a snoozedUntil ~ N hours from now for snooze actions", async () => {
    const mutations = buildMockMutations();
    const before = Date.now();
    const macro = buildMacro([{ kind: "snooze", hours: 12 }]);
    await runSupportMacro({
      macro,
      conversation: CONVERSATION,
      actorAgent: AGENT,
      mutations,
      lookup: buildLookup(),
    });
    const after = Date.now();
    const args = mutations.spies.snooze.mock.calls[0]?.[0] as {
      snoozedUntil: string;
    };
    const target = new Date(args.snoozedUntil).getTime();
    const minTarget = before + 12 * 60 * 60 * 1000;
    const maxTarget = after + 12 * 60 * 60 * 1000;
    expect(target).toBeGreaterThanOrEqual(minTarget);
    expect(target).toBeLessThanOrEqual(maxTarget);
  });

  it("hands a rendered canned response to onCannedResponseInsert", async () => {
    const mutations = buildMockMutations();
    const macro = buildMacro([
      { kind: "send_canned_response", cannedResponseId: CANNED.id },
    ]);
    const onInsert = vi.fn();
    await runSupportMacro({
      macro,
      conversation: CONVERSATION,
      actorAgent: AGENT,
      mutations,
      lookup: buildLookup(),
      onCannedResponseInsert: onInsert,
    });
    const call = onInsert.mock.calls[0]?.[0] as {
      text: string;
      html: string;
    };
    expect(call.text).toContain("Thank you, Donor Name");
    expect(call.html).toContain("Thank you, Donor Name");
  });

  it("fails canned-response actions when no composer insert slot is provided", async () => {
    const mutations = buildMockMutations();
    const macro = buildMacro([
      { kind: "send_canned_response", cannedResponseId: CANNED.id },
    ]);
    const result = await runSupportMacro({
      macro,
      conversation: CONVERSATION,
      actorAgent: AGENT,
      mutations,
      lookup: buildLookup(),
    });
    expect(result.ok).toBe(false);
    expect(result.outcomes[0]).toMatchObject({
      status: "failed",
      message: expect.stringContaining("requires an open composer"),
    });
  });
});
