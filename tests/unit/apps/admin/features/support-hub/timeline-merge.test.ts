import { describe, expect, it } from "vitest";

import {
  classifyMessage,
  mergeTimeline,
} from "../../../../../../apps/admin/features/support-hub/components/detail/timeline/merge-timeline";
import type {
  SupportMessage,
  SupportParticipant,
} from "../../../../../../apps/admin/features/support-hub/types";

const TENANT = "tenant-give-hope";
const CONVO = "conv-test";

const AGENT: SupportParticipant = {
  id: "agent-1",
  role: "agent",
  name: "Emily Thompson",
  email: "admin@givehope.org",
  avatarUrl: null,
};

const SYSTEM: SupportParticipant = {
  id: "system",
  role: "system",
  name: "Mission Control",
  email: null,
  avatarUrl: null,
};

const DONOR: SupportParticipant = {
  id: "donor:donor-001",
  role: "donor",
  name: "John Anderson",
  email: "john.anderson@email.com",
  avatarUrl: null,
};

function makeMessage(
  overrides: Partial<SupportMessage> & { id: string; postedAt: string },
): SupportMessage {
  const base: SupportMessage = {
    id: overrides.id,
    tenantId: TENANT,
    conversationId: CONVO,
    type: "email",
    direction: "inbound",
    isPrivate: false,
    deliveryState: "delivered",
    author: DONOR,
    body: { json: null, html: "<p>hi</p>", text: "hi" },
    attachments: [],
    emailHeaders: null,
    outboundSendLogId: null,
    inboundEmailId: null,
    postedAt: overrides.postedAt,
    createdAt: overrides.postedAt,
    updatedAt: overrides.postedAt,
  };
  return { ...base, ...overrides };
}

describe("classifyMessage", () => {
  it("flags system messages as activity entries", () => {
    expect(
      classifyMessage(
        makeMessage({
          id: "m1",
          postedAt: "2026-04-15T10:00:00.000Z",
          type: "system",
          author: SYSTEM,
        }),
      ),
    ).toBe("activity");
  });

  it("flags note messages even when authored by an agent", () => {
    expect(
      classifyMessage(
        makeMessage({
          id: "m2",
          postedAt: "2026-04-15T10:00:00.000Z",
          type: "note",
          isPrivate: true,
          author: AGENT,
          direction: "outbound",
        }),
      ),
    ).toBe("note");
  });

  it("flags outbound emails with deliveryState=draft as draft", () => {
    expect(
      classifyMessage(
        makeMessage({
          id: "m3",
          postedAt: "2026-04-15T10:00:00.000Z",
          type: "email",
          direction: "outbound",
          deliveryState: "draft",
          author: AGENT,
        }),
      ),
    ).toBe("draft");
  });

  it("treats other emails as the default email kind", () => {
    expect(
      classifyMessage(
        makeMessage({
          id: "m4",
          postedAt: "2026-04-15T10:00:00.000Z",
          deliveryState: "delivered",
        }),
      ),
    ).toBe("email");
  });
});

describe("mergeTimeline", () => {
  it("sorts messages ascending by postedAt and stamps the first-of-day flag", () => {
    const rows = [
      makeMessage({ id: "b", postedAt: "2026-04-15T10:00:00.000Z" }),
      makeMessage({ id: "a", postedAt: "2026-04-14T09:00:00.000Z" }),
      makeMessage({ id: "c", postedAt: "2026-04-15T11:00:00.000Z" }),
    ];

    const entries = mergeTimeline(rows, {
      nowIso: "2026-04-15T12:00:00.000Z",
    });

    expect(entries.map((entry) => entry.id)).toEqual(["a", "b", "c"]);
    expect(entries[0]?.isFirstOfDay).toBe(true);
    expect(entries[1]?.isFirstOfDay).toBe(true);
    expect(entries[2]?.isFirstOfDay).toBe(false);
    expect(entries[1]?.dayLabel).toBe("Today");
    expect(entries[0]?.dayLabel).toBe("Yesterday");
  });

  it("keeps activity, note, draft, and email kinds in the same merged stream", () => {
    const rows = [
      makeMessage({
        id: "inbound",
        postedAt: "2026-04-15T08:00:00.000Z",
      }),
      makeMessage({
        id: "note",
        postedAt: "2026-04-15T08:30:00.000Z",
        type: "note",
        isPrivate: true,
        author: AGENT,
        direction: "outbound",
      }),
      makeMessage({
        id: "draft",
        postedAt: "2026-04-15T09:00:00.000Z",
        type: "email",
        deliveryState: "draft",
        direction: "outbound",
        author: AGENT,
      }),
      makeMessage({
        id: "system",
        postedAt: "2026-04-15T09:30:00.000Z",
        type: "system",
        author: SYSTEM,
      }),
    ];

    const entries = mergeTimeline(rows, {
      nowIso: "2026-04-15T12:00:00.000Z",
    });
    expect(entries.map((entry) => entry.kind)).toEqual([
      "email",
      "note",
      "draft",
      "activity",
    ]);
  });
});
