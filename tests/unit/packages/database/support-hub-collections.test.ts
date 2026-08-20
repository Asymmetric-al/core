import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  supportHubCollectionQueryKey,
  supportHubQueryKeys,
} from "../../../../packages/database/query-keys";
import { EMPTY_SUPPORT_CONTACT_REF } from "../../../../packages/database/collections/support-hub.schema";
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
const apiSchemasPath = fileURLToPath(
  new URL(
    "../../../../packages/api/src/admin/support-hub/schemas.ts",
    import.meta.url,
  ),
);
const automationFormPath = fileURLToPath(
  new URL(
    "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationRuleForm.tsx",
    import.meta.url,
  ),
);

const ISO = "2026-01-01T00:00:00.000Z";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function conversationRow(
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

  it("isolates collection query keys from live Support Hub hook keys", () => {
    const collectionsSource = readFileSync(collectionsPath, "utf8");
    const collectionKey = supportHubCollectionQueryKey(
      supportHubQueryKeys.conversations,
    );

    expect(collectionKey).toEqual([
      ...supportHubQueryKeys.conversations,
      "collection",
    ]);
    expect(collectionKey).not.toEqual(supportHubQueryKeys.conversations);
    expect(collectionKey).not.toEqual([...supportHubQueryKeys.conversations]);
    expect(collectionsSource).toContain(
      "queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.conversations)",
    );
    expect(collectionsSource).not.toContain(
      "queryKey: [...supportHubQueryKeys.conversations]",
    );
  });

  it("does not register a hollow support_messages collection or fetch helper", () => {
    const collectionsSource = readFileSync(collectionsPath, "utf8");

    expect(collectionsSource).not.toContain(
      "export const supportMessagesCollection",
    );
    expect(collectionsSource).not.toContain('id: "support_messages"');
    expect(collectionsSource).not.toContain("localOnlyCollectionOptions");
    expect(collectionsSource).not.toContain("fetchSupportMessages");
    expect(collectionsSource).not.toContain("/api/admin/support/messages");
    expect(collectionsSource).not.toContain("/support/reports");
  });

  it("keeps API Support Hub schemas off the client hooks barrel", () => {
    const apiSchemas = readFileSync(apiSchemasPath, "utf8");

    expect(apiSchemas).not.toContain("@asym/database/hooks");
    expect(apiSchemas).toContain(
      "@asym/database/collections/support-hub.schema",
    );
  });

  it("fetches conversations from the tenant-scoped conversations route", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ conversations: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchSupportConversations()).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/support/conversations",
      expect.objectContaining({
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("times out Support Hub collection fetches after 15 seconds", () => {
    const collectionsSource = readFileSync(collectionsPath, "utf8");

    expect(collectionsSource).toContain(
      "AbortSignal.timeout(SUPPORT_HUB_REQUEST_TIMEOUT_MS)",
    );
    expect(collectionsSource).toContain(
      "const SUPPORT_HUB_REQUEST_TIMEOUT_MS = 15_000",
    );
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

  it("keeps valid tenant-scoped conversations and drops invalid mixed rows", async () => {
    const valid = conversationRow();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          conversations: [
            valid,
            conversationRow({ id: "conv_missing_tenant", tenantId: "" }),
            conversationRow({
              id: "conv_partial_contact",
              contact: { donorId: "donor-1" },
            }),
            conversationRow({
              id: "conv_adapter_shaped",
              subject: "",
              externalContactEmail: "a@b",
              contact: { ...EMPTY_SUPPORT_CONTACT_REF, donorId: "donor-1" },
            }),
          ],
        }),
      ),
    );

    await expect(fetchSupportConversations()).resolves.toEqual([
      valid,
      expect.objectContaining({
        id: "conv_adapter_shaped",
        subject: "(no subject)",
        externalContactEmail: "a@b",
        contact: expect.objectContaining({
          donorId: "donor-1",
          contactId: null,
        }),
      }),
    ]);
    expect(warn).toHaveBeenCalled();
  });

  it("returns an empty list when every row fails schema validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          conversations: [conversationRow({ tenantId: "" })],
        }),
      ),
    );

    await expect(fetchSupportConversations()).resolves.toEqual([]);
  });

  it("drops inbox settings with a negative auto-resolve window instead of blanking the list", async () => {
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
              createdAt: ISO,
              updatedAt: ISO,
            },
          ],
        }),
      ),
    );

    await expect(fetchSupportInboxSettings()).resolves.toEqual([]);
  });

  it("normalizes HTML time values in business hours and skips invalid clocks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          businessHours: [
            {
              id: "hours_html",
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
            },
            {
              id: "hours_invalid",
              tenantId: "tenant_1",
              name: "Broken",
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
              isDefault: false,
              createdAt: ISO,
              updatedAt: ISO,
            },
          ],
        }),
      ),
    );

    await expect(fetchSupportBusinessHours()).resolves.toEqual([
      expect.objectContaining({
        id: "hours_html",
        weeklySchedule: [
          expect.objectContaining({
            openTime: "09:00",
            closeTime: "09:00",
          }),
        ],
      }),
    ]);
  });
});
