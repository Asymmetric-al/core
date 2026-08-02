import { beforeAll, describe, expect, it } from "vitest";

const root = new URL("../../../../../../", import.meta.url);

type DerivedHelpers = {
  deriveSupportHubStats: (model: unknown, now?: string | Date) => unknown;
  deriveSupportQueueSummaries: (model: unknown, now?: string | Date) => unknown;
  filterSupportTickets: (
    tickets: readonly unknown[],
    filter: Record<string, unknown>,
    contacts?: readonly unknown[],
  ) => unknown[];
  formatSupportRelativeTime: (input: string, now?: string | Date) => string;
};

let deriveSupportHubStats: DerivedHelpers["deriveSupportHubStats"];
let deriveSupportQueueSummaries: DerivedHelpers["deriveSupportQueueSummaries"];
let filterSupportTickets: DerivedHelpers["filterSupportTickets"];
let formatSupportRelativeTime: DerivedHelpers["formatSupportRelativeTime"];

beforeAll(async () => {
  const mod = (await import(
    new URL("apps/admin/app/(app)/support/support-hub.derived.ts", root).href
  )) as DerivedHelpers;
  deriveSupportHubStats = mod.deriveSupportHubStats;
  deriveSupportQueueSummaries = mod.deriveSupportQueueSummaries;
  filterSupportTickets = mod.filterSupportTickets;
  formatSupportRelativeTime = mod.formatSupportRelativeTime;
});

const NOW = "2026-04-30T15:00:00.000Z";

const model = {
  generatedAt: NOW,
  queues: [
    { id: "donor_care", label: "Donor Care", description: "Giving support" },
    {
      id: "mobilization",
      label: "Mobilization / Interested in Joining",
      description: "Joining support",
    },
    {
      id: "missionary_support",
      label: "Existing Missionary Support",
      description: "Missionary support",
    },
  ],
  tickets: [
    {
      id: "ticket-1",
      subject: "Receipt missing for March donation",
      contactId: "contact-1",
      queueId: "donor_care",
      status: "open",
      priority: "urgent",
      channel: "email",
      followUpAt: "2026-04-30T14:45:00.000Z",
      updatedAt: "2026-04-30T13:30:00.000Z",
      summary: "Donor needs a receipt before a board report.",
      tags: ["receipt", "donation"],
      assignedTo: "Maya",
    },
    {
      id: "ticket-2",
      subject: "Missionary needs help updating profile",
      contactId: "contact-2",
      queueId: "missionary_support",
      status: "waiting",
      priority: "normal",
      channel: "chat",
      followUpAt: "2026-04-30T15:25:00.000Z",
      updatedAt: "2026-04-30T14:10:00.000Z",
      summary: "Profile update is blocked on image sizing.",
      tags: ["profile"],
      assignedTo: "Jon",
    },
    {
      id: "ticket-3",
      subject: "General platform question",
      contactId: "contact-3",
      queueId: "mobilization",
      status: "resolved",
      priority: "low",
      channel: "form",
      followUpAt: "2026-04-30T17:00:00.000Z",
      updatedAt: "2026-04-29T20:10:00.000Z",
      summary: "Question answered with a docs link.",
      tags: ["docs"],
    },
    {
      id: "ticket-4",
      subject: "Escalate pledge allocation",
      contactId: "contact-1",
      queueId: "donor_care",
      status: "escalated",
      priority: "high",
      channel: "email",
      followUpAt: "2026-04-30T15:08:00.000Z",
      updatedAt: "2026-04-30T14:35:00.000Z",
      summary: "Allocation needs finance lead review.",
      tags: ["pledge", "allocation"],
      assignedTo: "Priya",
    },
  ],
  contacts: [],
  macros: [],
  knowledge: [],
} as const;

describe("support hub derived model", () => {
  it("counts actionable support ticket states", () => {
    expect(deriveSupportHubStats(model, NOW)).toEqual({
      open: 1,
      urgent: 1,
      waiting: 1,
      resolved: 1,
      escalated: 1,
      needsFollowUp: 3,
    });
  });

  it("formats relative time from an injected clock", () => {
    expect(
      formatSupportRelativeTime(
        "2026-04-30T13:00:00.000Z",
        "2026-04-30T15:00:00.000Z",
      ),
    ).toBe("2h ago");
  });

  it("formats future follow-up times as upcoming", () => {
    expect(
      formatSupportRelativeTime(
        "2026-04-30T15:25:00.000Z",
        "2026-04-30T15:00:00.000Z",
      ),
    ).toBe("in 25m");
  });

  it("filters tickets by queue and status", () => {
    expect(
      filterSupportTickets(model.tickets, {
        queueId: "donor_care",
        status: "escalated",
      }).map((ticket) => ticket.id),
    ).toEqual(["ticket-4"]);
  });

  it("filters tickets by linked contact search text", () => {
    expect(
      filterSupportTickets(
        model.tickets,
        {
          search: "maria",
        },
        [
          {
            id: "contact-1",
            email: "maria@example.org",
            lastSeenAt: NOW,
            name: "Maria Chen",
            relationship: "Major donor",
          },
        ],
      ).map((ticket) => ticket.id),
    ).toEqual(["ticket-1", "ticket-4"]);
  });

  it("returns stable queue summaries for UI chips", () => {
    expect(deriveSupportQueueSummaries(model, NOW)).toEqual([
      {
        id: "donor_care",
        label: "Donor Care",
        description: "Giving support",
        total: 2,
        urgent: 1,
        needsFollowUp: 2,
      },
      {
        id: "mobilization",
        label: "Mobilization / Interested in Joining",
        description: "Joining support",
        total: 1,
        urgent: 0,
        needsFollowUp: 0,
      },
      {
        id: "missionary_support",
        label: "Existing Missionary Support",
        description: "Missionary support",
        total: 1,
        urgent: 0,
        needsFollowUp: 1,
      },
    ]);
  });
});
