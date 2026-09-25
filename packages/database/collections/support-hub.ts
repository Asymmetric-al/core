"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { type z } from "zod";

import { getQueryClient } from "../providers/query-client";
import {
  supportHubCollectionQueryKey,
  supportHubQueryKeys,
} from "../query-keys";
import {
  supportAssigneeSchema,
  supportAutomationRuleSchema,
  supportBusinessHoursSchema,
  supportCannedResponseSchema,
  supportConversationSchema,
  supportInboxSchema,
  supportInboxSettingsSchema,
  supportLabelSchema,
  supportMacroSchema,
  supportNotificationPreferencesSchema,
  supportSavedViewSchema,
  supportSignatureSchema,
  supportSlaPolicySchema,
  supportTeamSchema,
} from "./support-hub.schema";

export * from "./support-hub.schema";

const SUPPORT_HUB_REQUEST_TIMEOUT_MS = 15_000;

const SUPPORT_HUB_FETCH_INIT = {
  cache: "no-store",
  credentials: "same-origin",
  headers: { Accept: "application/json" },
} as const;

async function parseJsonResponse(
  response: Response,
): Promise<Record<string, unknown>> {
  const payload = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error || `Request failed with status ${response.status}`,
    );
  }

  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}

async function fetchSupportHubRows<T>(
  path: string,
  key: string,
  schema: z.ZodType<T>,
): Promise<T[]> {
  const response = await fetch(path, {
    ...SUPPORT_HUB_FETCH_INIT,
    signal: AbortSignal.timeout(SUPPORT_HUB_REQUEST_TIMEOUT_MS),
  });
  const payload = await parseJsonResponse(response);
  const rows = payload[key];

  if (!Array.isArray(rows)) {
    throw new Error(`Support Hub response was missing ${key}`);
  }

  const kept: T[] = [];
  for (const row of rows) {
    const parsed = schema.safeParse(row);
    if (parsed.success) {
      kept.push(parsed.data);
      continue;
    }
    console.warn("Support Hub dropped an invalid collection row", {
      path,
      key,
      issues: parsed.error.issues,
    });
  }
  return kept;
}

export async function fetchSupportConversations() {
  return fetchSupportHubRows(
    "/api/admin/support/conversations",
    "conversations",
    supportConversationSchema,
  );
}

export async function fetchSupportLabels() {
  return fetchSupportHubRows(
    "/api/admin/support/labels",
    "labels",
    supportLabelSchema,
  );
}

export async function fetchSupportMacros() {
  return fetchSupportHubRows(
    "/api/admin/support/macros",
    "macros",
    supportMacroSchema,
  );
}

export async function fetchSupportCannedResponses() {
  return fetchSupportHubRows(
    "/api/admin/support/canned-responses",
    "cannedResponses",
    supportCannedResponseSchema,
  );
}

export async function fetchSupportSavedViews() {
  return fetchSupportHubRows(
    "/api/admin/support/saved-views",
    "savedViews",
    supportSavedViewSchema,
  );
}

export async function fetchSupportInboxes() {
  return fetchSupportHubRows(
    "/api/admin/support/inboxes",
    "inboxes",
    supportInboxSchema,
  );
}

export async function fetchSupportInboxSettings() {
  return fetchSupportHubRows(
    "/api/admin/support/inbox-settings?list=true",
    "settings",
    supportInboxSettingsSchema,
  );
}

export async function fetchSupportTeams() {
  return fetchSupportHubRows(
    "/api/admin/support/teams",
    "teams",
    supportTeamSchema,
  );
}

export async function fetchSupportAgents() {
  return fetchSupportHubRows(
    "/api/admin/support/agents",
    "agents",
    supportAssigneeSchema,
  );
}

export async function fetchSupportBusinessHours() {
  return fetchSupportHubRows(
    "/api/admin/support/business-hours",
    "businessHours",
    supportBusinessHoursSchema,
  );
}

export async function fetchSupportSlaPolicies() {
  return fetchSupportHubRows(
    "/api/admin/support/sla-policies",
    "slaPolicies",
    supportSlaPolicySchema,
  );
}

export async function fetchSupportSignatures() {
  return fetchSupportHubRows(
    "/api/admin/support/signatures",
    "signatures",
    supportSignatureSchema,
  );
}

export async function fetchSupportAutomationRules() {
  return fetchSupportHubRows(
    "/api/admin/support/automation-rules",
    "automationRules",
    supportAutomationRuleSchema,
  );
}

export async function fetchSupportNotificationPreferences() {
  return fetchSupportHubRows(
    "/api/admin/support/notification-preferences",
    "preferences",
    supportNotificationPreferencesSchema,
  );
}

export const supportConversationsCollection = createCollection(
  queryCollectionOptions({
    id: "support_conversations",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.conversations),
    queryClient: getQueryClient(),
    schema: supportConversationSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportConversations,
    startSync: false,
  }),
);

export const supportLabelsCollection = createCollection(
  queryCollectionOptions({
    id: "support_labels",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.labels),
    queryClient: getQueryClient(),
    schema: supportLabelSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportLabels,
    startSync: false,
  }),
);

export const supportMacrosCollection = createCollection(
  queryCollectionOptions({
    id: "support_macros",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.macros),
    queryClient: getQueryClient(),
    schema: supportMacroSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportMacros,
    startSync: false,
  }),
);

export const supportCannedResponsesCollection = createCollection(
  queryCollectionOptions({
    id: "support_canned_responses",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.cannedResponses),
    queryClient: getQueryClient(),
    schema: supportCannedResponseSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportCannedResponses,
    startSync: false,
  }),
);

export const supportSavedViewsCollection = createCollection(
  queryCollectionOptions({
    id: "support_saved_views",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.savedViews),
    queryClient: getQueryClient(),
    schema: supportSavedViewSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportSavedViews,
    startSync: false,
  }),
);

export const supportInboxesCollection = createCollection(
  queryCollectionOptions({
    id: "support_inboxes",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.inboxes),
    queryClient: getQueryClient(),
    schema: supportInboxSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportInboxes,
    startSync: false,
  }),
);

export const supportInboxSettingsCollection = createCollection(
  queryCollectionOptions({
    id: "support_inbox_settings",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.inboxSettings),
    queryClient: getQueryClient(),
    schema: supportInboxSettingsSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportInboxSettings,
    startSync: false,
  }),
);

export const supportTeamsCollection = createCollection(
  queryCollectionOptions({
    id: "support_teams",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.teams),
    queryClient: getQueryClient(),
    schema: supportTeamSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportTeams,
    startSync: false,
  }),
);

export const supportAgentsCollection = createCollection(
  queryCollectionOptions({
    id: "support_agents",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.agents),
    queryClient: getQueryClient(),
    schema: supportAssigneeSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportAgents,
    startSync: false,
  }),
);

export const supportBusinessHoursCollection = createCollection(
  queryCollectionOptions({
    id: "support_business_hours",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.businessHours),
    queryClient: getQueryClient(),
    schema: supportBusinessHoursSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportBusinessHours,
    startSync: false,
  }),
);

export const supportSlaPoliciesCollection = createCollection(
  queryCollectionOptions({
    id: "support_sla_policies",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.slaPolicies),
    queryClient: getQueryClient(),
    schema: supportSlaPolicySchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportSlaPolicies,
    startSync: false,
  }),
);

export const supportSignaturesCollection = createCollection(
  queryCollectionOptions({
    id: "support_signatures",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.signatures),
    queryClient: getQueryClient(),
    schema: supportSignatureSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportSignatures,
    startSync: false,
  }),
);

export const supportAutomationRulesCollection = createCollection(
  queryCollectionOptions({
    id: "support_automation_rules",
    queryKey: supportHubCollectionQueryKey(supportHubQueryKeys.automationRules),
    queryClient: getQueryClient(),
    schema: supportAutomationRuleSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportAutomationRules,
    startSync: false,
  }),
);

export const supportNotificationPreferencesCollection = createCollection(
  queryCollectionOptions({
    id: "support_notification_preferences",
    queryKey: supportHubCollectionQueryKey(
      supportHubQueryKeys.notificationPreferences,
    ),
    queryClient: getQueryClient(),
    schema: supportNotificationPreferencesSchema,
    getKey: (item) => item.id,
    queryFn: fetchSupportNotificationPreferences,
    startSync: false,
  }),
);
