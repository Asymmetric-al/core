import { describe, expect, it } from "vitest";

import {
  applyMergeVariables,
  buildMergeVariableContext,
  SUPPORTED_MERGE_VARIABLES,
} from "../../../../../../apps/admin/features/support-hub/lib/merge-variables";
import type {
  SupportAssignee,
  SupportConversation,
} from "../../../../../../apps/admin/features/support-hub/types";

const SAMPLE_AGENT: SupportAssignee = {
  id: "agent-1",
  name: "Emily Thompson",
  email: "emily@example.org",
  title: "Director of Operations",
  avatarUrl: null,
};

function buildConversation(
  overrides: Partial<SupportConversation> = {},
): SupportConversation {
  return {
    id: "conv-1",
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
    ...overrides,
  };
}

describe("applyMergeVariables", () => {
  it("substitutes every documented token", () => {
    const conversation = buildConversation();
    const context = buildMergeVariableContext(conversation, SAMPLE_AGENT);
    const template = SUPPORTED_MERGE_VARIABLES.join(" | ");
    const out = applyMergeVariables(template, context);
    expect(out).toBe(
      "Anita Gonzalez | anita@example.com | Receipt question | Emily Thompson | Director of Operations",
    );
  });

  it("leaves unknown tokens intact so agents can spot the typo", () => {
    const out = applyMergeVariables(
      "Hi {{donor.first_name}} — see {{conversation.subject}}",
      buildMergeVariableContext(buildConversation(), SAMPLE_AGENT),
    );
    expect(out).toBe("Hi {{donor.first_name}} — see Receipt question");
  });

  it("renders null fields as empty strings without throwing", () => {
    const out = applyMergeVariables(
      "Hello {{donor.name}}, agent {{agent.title}}!",
      buildMergeVariableContext(
        buildConversation({ externalContactName: null }),
        { ...SAMPLE_AGENT, title: null },
      ),
    );
    expect(out).toBe("Hello , agent !");
  });

  it("is HTML-safe (does not double-escape ampersands or angle brackets)", () => {
    const out = applyMergeVariables(
      "<p>Hi {{donor.name}}</p>",
      buildMergeVariableContext(
        buildConversation({ externalContactName: "Smith & Co <Donor>" }),
        SAMPLE_AGENT,
      ),
    );
    // Subbed value is inserted verbatim — escaping is the caller's job.
    expect(out).toBe("<p>Hi Smith & Co <Donor></p>");
  });
});
