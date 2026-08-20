import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchSupportAgents,
  fetchSupportAutomationRules,
  fetchSupportBusinessHours,
  fetchSupportCannedResponses,
  fetchSupportConversations,
  fetchSupportInboxSettings,
  fetchSupportInboxes,
  fetchSupportLabels,
  fetchSupportMacros,
  fetchSupportNotificationPreferences,
  fetchSupportSavedViews,
  fetchSupportSignatures,
  fetchSupportSlaPolicies,
  fetchSupportTeams,
  supportMessagesCollection,
} from "../../../../packages/database/collections/support-hub";

const collectionsPath = fileURLToPath(
  new URL(
    "../../../../packages/database/collections/support-hub.ts",
    import.meta.url,
  ),
);
const schemaPath = fileURLToPath(
  new URL(
    "../../../../packages/database/collections/support-hub.schema.ts",
    import.meta.url,
  ),
);
const automationFormPath = fileURLToPath(
  new URL(
    "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationRuleForm.tsx",
    import.meta.url,
  ),
);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Support Hub route-backed collections", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps Give Hope seed out of the browser collection and schema", () => {
    const collectionsSource = readFileSync(collectionsPath, "utf8");
    const schemaSource = readFileSync(schemaPath, "utf8");

    expect(collectionsSource).not.toContain("tenant-give-hope");
    expect(schemaSource).not.toContain("tenant-give-hope");
    expect(collectionsSource).not.toContain("CONVERSATIONS_SEED");
    expect(collectionsSource).not.toContain("buildWriters");
  });

  it("does not hardcode Give Hope on automation rule preview", () => {
    const formSource = readFileSync(automationFormPath, "utf8");

    expect(formSource).not.toContain("tenant-give-hope");
  });

  it("fetches conversations from the tenant-scoped conversations route", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ conversations: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSupportConversations()).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/support/conversations", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
  });

  it("keeps the messages collection local-only instead of inventing a tenant-wide list", () => {
    const collectionsSource = readFileSync(collectionsPath, "utf8");
    const messagesStart = collectionsSource.indexOf(
      "export const supportMessagesCollection",
    );
    const labelsStart = collectionsSource.indexOf(
      "export const supportLabelsCollection",
    );
    const messagesBlock = collectionsSource
      .slice(messagesStart, labelsStart)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    expect(messagesStart).toBeGreaterThan(-1);
    expect(labelsStart).toBeGreaterThan(messagesStart);
    expect(messagesBlock).toContain("localOnlyCollectionOptions");
    expect(messagesBlock).toContain('id: "support_messages"');
    expect(messagesBlock).not.toContain("queryCollectionOptions");
    expect(messagesBlock).not.toContain("startSync");
    expect(messagesBlock).not.toContain("queryFn");
    expect(collectionsSource).toContain("startSync: false");
    expect(collectionsSource).not.toContain("fetchSupportMessages");
    expect(collectionsSource).not.toContain("/support/reports");
    expect(supportMessagesCollection.id).toBe("support_messages");
  });

  it("lists inbox settings with list=true and unwraps settings as an array", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ settings: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSupportInboxSettings()).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/support/inbox-settings?list=true",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("unwraps named keys for the remaining Support Hub lists", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/labels")) {
        return jsonResponse({ labels: [] });
      }
      if (url.endsWith("/macros")) {
        return jsonResponse({ macros: [] });
      }
      if (url.endsWith("/canned-responses")) {
        return jsonResponse({ cannedResponses: [] });
      }
      if (url.endsWith("/saved-views")) {
        return jsonResponse({ savedViews: [] });
      }
      if (url.endsWith("/inboxes")) {
        return jsonResponse({ inboxes: [] });
      }
      if (url.endsWith("/teams")) {
        return jsonResponse({ teams: [] });
      }
      if (url.endsWith("/agents")) {
        return jsonResponse({ agents: [] });
      }
      if (url.endsWith("/business-hours")) {
        return jsonResponse({ businessHours: [] });
      }
      if (url.endsWith("/sla-policies")) {
        return jsonResponse({ slaPolicies: [] });
      }
      if (url.endsWith("/signatures")) {
        return jsonResponse({ signatures: [] });
      }
      if (url.endsWith("/automation-rules")) {
        return jsonResponse({ automationRules: [] });
      }
      if (url.endsWith("/notification-preferences")) {
        return jsonResponse({ preferences: [] });
      }
      return jsonResponse({ error: `unexpected ${url}` }, 500);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSupportLabels()).resolves.toEqual([]);
    await expect(fetchSupportMacros()).resolves.toEqual([]);
    await expect(fetchSupportCannedResponses()).resolves.toEqual([]);
    await expect(fetchSupportSavedViews()).resolves.toEqual([]);
    await expect(fetchSupportInboxes()).resolves.toEqual([]);
    await expect(fetchSupportTeams()).resolves.toEqual([]);
    await expect(fetchSupportAgents()).resolves.toEqual([]);
    await expect(fetchSupportBusinessHours()).resolves.toEqual([]);
    await expect(fetchSupportSlaPolicies()).resolves.toEqual([]);
    await expect(fetchSupportSignatures()).resolves.toEqual([]);
    await expect(fetchSupportAutomationRules()).resolves.toEqual([]);
    await expect(fetchSupportNotificationPreferences()).resolves.toEqual([]);
  });

  it("throws the JSON error payload when a Support Hub request is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: "Inbox is unavailable" }, 503),
        ),
    );

    await expect(fetchSupportConversations()).rejects.toThrow(
      "Inbox is unavailable",
    );
  });

  it("throws when the named unwrap key is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({})));

    await expect(fetchSupportConversations()).rejects.toThrow(
      "Support Hub response was missing conversations",
    );
  });

  it("rejects a conversation row that is missing tenantId", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          conversations: [
            {
              id: "conv_missing_tenant",
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
            },
          ],
        }),
      ),
    );

    await expect(fetchSupportConversations()).rejects.toThrow();
  });

  it("rejects inbox settings with a negative auto-resolve window", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          settings: [
            {
              id: "settings_1",
              tenantId: "tenant_1",
              inboxId: "inbox_1",
              defaultSignatureId: null,
              defaultSlaPolicyId: null,
              defaultBusinessHoursId: null,
              roundRobinEnabled: false,
              autoResolveAfterDays: -1,
              showContactSidecar: true,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
      ),
    );

    await expect(fetchSupportInboxSettings()).rejects.toThrow();
  });

  it("rejects business hours whose clock is not a 24-hour HH:mm value", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          businessHours: [
            {
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
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        }),
      ),
    );

    await expect(fetchSupportBusinessHours()).rejects.toThrow();
  });
});
