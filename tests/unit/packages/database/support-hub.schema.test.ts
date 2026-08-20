import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  EMPTY_SUPPORT_CONTACT_REF,
  normalizeSupportClockTime,
  supportBusinessHoursSchema,
  supportClockTimeSchema,
  supportConversationSchema,
  supportInboxSchema,
} from "../../../../packages/database/collections/support-hub.schema";

const schemaPath = fileURLToPath(
  new URL(
    "../../../../packages/database/collections/support-hub.schema.ts",
    import.meta.url,
  ),
);

const ISO = "2026-01-01T00:00:00.000Z";

function conversationFixture(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "conv_1",
    tenantId: "tenant_1",
    inboxId: "inbox_1",
    subject: "Receipt question",
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactEmail: "donor@example.org",
    externalContactName: "Donor",
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: ISO,
    lastMessageAt: ISO,
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
    createdAt: ISO,
    updatedAt: ISO,
    ...overrides,
  };
}

describe("supportClockTimeSchema", () => {
  it("normalizes HTML time values to HH:mm", () => {
    expect(supportClockTimeSchema.parse("09:00")).toBe("09:00");
    expect(supportClockTimeSchema.parse("09:00:00")).toBe("09:00");
    expect(supportClockTimeSchema.parse("9:00")).toBe("09:00");
    expect(normalizeSupportClockTime("09:00:00")).toBe("09:00");
  });

  it("rejects invalid 24-hour clock values", () => {
    expect(supportClockTimeSchema.safeParse("99:99").success).toBe(false);
    expect(supportClockTimeSchema.safeParse("24:00").success).toBe(false);
    expect(normalizeSupportClockTime("99:99")).toBeNull();
  });
});

describe("supportConversationSchema adapter-legal rows", () => {
  it("normalizes an empty subject instead of rejecting the row", () => {
    const parsed = supportConversationSchema.parse(
      conversationFixture({ subject: "" }),
    );

    expect(parsed.subject).toBe("(no subject)");
  });

  it("accepts SQL-CHECK emails such as a@b", () => {
    const parsed = supportConversationSchema.parse(
      conversationFixture({ externalContactEmail: "a@b" }),
    );

    expect(parsed.externalContactEmail).toBe("a@b");
  });

  it("merges a partial contact onto EMPTY_SUPPORT_CONTACT_REF", () => {
    const parsed = supportConversationSchema.parse(
      conversationFixture({ contact: { donorId: "donor-1" } }),
    );

    expect(parsed.contact).toEqual({
      ...EMPTY_SUPPORT_CONTACT_REF,
      donorId: "donor-1",
    });
  });

  it("rejects a non-ISO timestamp that Date.parse would accept", () => {
    expect(
      supportConversationSchema.safeParse(
        conversationFixture({ createdAt: "March 3, 2026" }),
      ).success,
    ).toBe(false);
  });
});

describe("supportBusinessHoursSchema HTML clock values", () => {
  it("accepts 09:00:00 and 9:00 on weekly schedule rows", () => {
    const parsed = supportBusinessHoursSchema.parse({
      id: "hours_1",
      tenantId: "tenant_1",
      name: "Office",
      timezone: "UTC",
      weeklySchedule: [
        {
          day: "monday",
          enabled: true,
          openTime: "09:00:00",
          closeTime: "9:00",
        },
      ],
      holidays: [],
      isDefault: true,
      createdAt: ISO,
      updatedAt: ISO,
    });

    expect(parsed.weeklySchedule[0]?.openTime).toBe("09:00");
    expect(parsed.weeklySchedule[0]?.closeTime).toBe("09:00");
  });

  it("rejects 99:99", () => {
    expect(
      supportBusinessHoursSchema.safeParse({
        id: "hours_1",
        tenantId: "tenant_1",
        name: "Office",
        timezone: "UTC",
        weeklySchedule: [
          {
            day: "monday",
            enabled: true,
            openTime: "99:99",
            closeTime: "17:00",
          },
        ],
        holidays: [],
        isDefault: true,
        createdAt: ISO,
        updatedAt: ISO,
      }).success,
    ).toBe(false);
  });
});

describe("supportInboxSchema email fields", () => {
  it("accepts RFC emails on configured inbox addresses", () => {
    expect(
      supportInboxSchema.parse({
        id: "inbox_1",
        tenantId: "tenant_1",
        name: "Donor Care",
        channel: "email",
        inboundAddress: "care@example.org",
        fromAddress: "care@example.org",
        fromName: "Donor Care",
        replyToAddress: null,
        description: null,
        isDefault: true,
        createdAt: ISO,
        updatedAt: ISO,
      }).inboundAddress,
    ).toBe("care@example.org");
  });
});

describe("shared clock schema ownership", () => {
  it("exports a single named clock schema instead of copying the regex", () => {
    const schemaSource = readFileSync(schemaPath, "utf8");
    const apiSchemasPath = fileURLToPath(
      new URL(
        "../../../../packages/api/src/admin/support-hub/schemas.ts",
        import.meta.url,
      ),
    );
    const storePath = fileURLToPath(
      new URL(
        "../../../../apps/admin/features/support-hub/stores/support-store.ts",
        import.meta.url,
      ),
    );
    const apiSchemas = readFileSync(apiSchemasPath, "utf8");
    const storeSource = readFileSync(storePath, "utf8");

    expect(schemaSource).toContain("export const supportClockTimeSchema");
    expect(schemaSource).toContain("export function normalizeSupportClockTime");
    expect(apiSchemas).toContain("supportClockTimeSchema");
    expect(apiSchemas).not.toContain(
      "z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/)",
    );
    expect(storeSource).toContain("supportClockTimeSchema");
    expect(storeSource).not.toContain(
      "z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/)",
    );
  });
});
