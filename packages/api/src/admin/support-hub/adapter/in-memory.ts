import {
  SUPPORT_AGENTS_FIXTURE,
  SUPPORT_AUTOMATION_RULES_FIXTURE,
  SUPPORT_BUSINESS_HOURS_FIXTURE,
  SUPPORT_CANNED_RESPONSES_FIXTURE,
  SUPPORT_CONVERSATIONS_FIXTURE,
  SUPPORT_INBOX_SETTINGS_FIXTURE,
  SUPPORT_INBOXES_FIXTURE,
  SUPPORT_LABELS_FIXTURE,
  SUPPORT_MACROS_FIXTURE,
  SUPPORT_MESSAGES_FIXTURE,
  SUPPORT_NOTIFICATION_PREFERENCES_FIXTURE,
  SUPPORT_SAVED_VIEWS_FIXTURE,
  SUPPORT_SIGNATURES_FIXTURE,
  SUPPORT_SLA_POLICIES_FIXTURE,
  SUPPORT_TEAMS_FIXTURE,
  SUPPORT_HUB_DEMO_TENANT_ID,
} from "./fixtures";
import { getSupportHubRequestTenantId } from "../request-context";

import type {
  AddPrivateNoteInput,
  AssignConversationInput,
  SaveAutomationRuleInput,
  SaveBusinessHoursInput,
  SaveCannedResponseInput,
  SaveInboxSettingsInput,
  SaveLabelInput,
  SaveMacroInput,
  SaveNotificationPreferencesInput,
  SaveSavedViewInput,
  SaveSignatureInput,
  SaveSlaPolicyInput,
  SaveTeamInput,
  SendReplyInput,
  SetConversationPriorityInput,
  SetConversationStatusInput,
  SnoozeConversationInput,
  SupportConversationFilter,
  SupportHubAdapter,
  ToggleAutomationRuleInput,
  ToggleConversationLabelInput,
  UnsnoozeConversationInput,
} from "./types";
import type {
  SupportAssignee,
  SupportAutomationRule,
  SupportBusinessHours,
  SupportCannedResponse,
  SupportConversation,
  SupportInbox,
  SupportInboxSettings,
  SupportLabel,
  SupportMacro,
  SupportMessage,
  SupportNotificationPreferences,
  SupportParticipant,
  SupportSavedView,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
} from "@asym/database/hooks";

/**
 * In-memory implementation of {@link SupportHubAdapter}. Phase 7 ships this
 * as the only available implementation; Phase 8 will introduce a sibling
 * `./supabase.ts` module and flip the export in `./index.ts`.
 *
 * Design notes:
 * - The state is module-scoped so successive route-handler invocations see
 *   the same mutations within a process. That is intentional for local dev,
 *   demo deploys, and unit tests.
 * - Reads always return cloned arrays so callers can mutate the result
 *   without affecting the store.
 * - Mutations return the freshly-cloned row so callers can echo it back to
 *   the UI without an extra round trip.
 * - This module never imports `@tanstack/db`. It only consumes the typed
 *   seed re-exports from `@asym/database/hooks`.
 */

const SYSTEM_PARTICIPANT: SupportParticipant = {
  id: "system",
  role: "system",
  name: "Mission Control",
  email: null,
  avatarUrl: null,
};

const HOUR_MS = 60 * 60 * 1000;

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/**
 * When a Support Hub API request is active, new rows inherit that tenant.
 * Otherwise (unit tests, scripts) the demo seed tenant is used.
 */
function newRowTenantId(): string {
  return getSupportHubRequestTenantId() ?? SUPPORT_HUB_DEMO_TENANT_ID;
}

function tenantScopeForReads(): string {
  return getSupportHubRequestTenantId() ?? SUPPORT_HUB_DEMO_TENANT_ID;
}

/**
 * Phase 7 ships a single-tenant in-memory store. Reject cross-tenant writes so
 * the API cannot mutate another org's data once multi-tenant data exists.
 */
function assertWritableTenantScope(): void {
  const scope = getSupportHubRequestTenantId();
  if (scope === undefined) return;
  if (scope !== SUPPORT_HUB_DEMO_TENANT_ID) {
    throw new Error("SUPPORT_HUB_TENANT_MISMATCH");
  }
}

function findOrThrowTenantRow<T extends { id: string; tenantId: string }>(
  rows: T[],
  id: string,
  label: string,
): T {
  const scope = tenantScopeForReads();
  const row = rows.find((entry) => entry.id === id && entry.tenantId === scope);
  if (!row) throw new Error(`Unknown ${label}: ${id}`);
  return row;
}

function rowsForTenant<T extends { tenantId: string }>(rows: T[]): T[] {
  return rows.filter((row) => row.tenantId === tenantScopeForReads());
}

function patchTenantById<T extends { id: string; tenantId: string }>(
  rows: T[],
  id: string,
  patch: (row: T) => void,
): T {
  const row = findOrThrowTenantRow(rows, id, "row");
  patch(row);
  return row;
}

function agentParticipant(agent: SupportAssignee | null): SupportParticipant {
  if (!agent) return SYSTEM_PARTICIPANT;
  return {
    id: agent.id,
    role: "agent",
    name: agent.name,
    email: agent.email,
    avatarUrl: agent.avatarUrl,
  };
}

interface InMemoryStore {
  conversations: SupportConversation[];
  messages: SupportMessage[];
  labels: SupportLabel[];
  macros: SupportMacro[];
  cannedResponses: SupportCannedResponse[];
  savedViews: SupportSavedView[];
  inboxes: SupportInbox[];
  inboxSettings: SupportInboxSettings[];
  teams: SupportTeam[];
  agents: SupportAssignee[];
  businessHours: SupportBusinessHours[];
  slaPolicies: SupportSlaPolicy[];
  signatures: SupportSignature[];
  automationRules: SupportAutomationRule[];
  notificationPreferences: SupportNotificationPreferences[];
}

function buildInMemoryStore(): InMemoryStore {
  return {
    conversations: clone(SUPPORT_CONVERSATIONS_FIXTURE),
    messages: clone(SUPPORT_MESSAGES_FIXTURE),
    labels: clone(SUPPORT_LABELS_FIXTURE),
    macros: clone(SUPPORT_MACROS_FIXTURE),
    cannedResponses: clone(SUPPORT_CANNED_RESPONSES_FIXTURE),
    savedViews: clone(SUPPORT_SAVED_VIEWS_FIXTURE),
    inboxes: clone(SUPPORT_INBOXES_FIXTURE),
    inboxSettings: clone(SUPPORT_INBOX_SETTINGS_FIXTURE),
    teams: clone(SUPPORT_TEAMS_FIXTURE),
    agents: clone(SUPPORT_AGENTS_FIXTURE),
    businessHours: clone(SUPPORT_BUSINESS_HOURS_FIXTURE),
    slaPolicies: clone(SUPPORT_SLA_POLICIES_FIXTURE),
    signatures: clone(SUPPORT_SIGNATURES_FIXTURE),
    automationRules: clone(SUPPORT_AUTOMATION_RULES_FIXTURE),
    notificationPreferences: clone(SUPPORT_NOTIFICATION_PREFERENCES_FIXTURE),
  };
}

let store: InMemoryStore = buildInMemoryStore();

/** Test hook — wipes the in-memory state back to the donor-care seeds. */
export function __resetInMemorySupportHubStore(): void {
  store = buildInMemoryStore();
}

function findConversationInTenant(id: string): SupportConversation | undefined {
  const scope = tenantScopeForReads();
  return store.conversations.find(
    (entry) => entry.id === id && entry.tenantId === scope,
  );
}

function findOrThrow<T extends { id: string }>(
  rows: T[],
  id: string,
  label: string,
): T {
  const row = rows.find((entry) => entry.id === id);
  if (!row) throw new Error(`Unknown ${label}: ${id}`);
  return row;
}

function patchById<T extends { id: string }>(
  rows: T[],
  id: string,
  patch: (row: T) => void,
): T {
  const row = findOrThrow(rows, id, "row");
  patch(row);
  return row;
}

function matchesConversationFilter(
  conversation: SupportConversation,
  filter: SupportConversationFilter,
): boolean {
  if (conversation.tenantId !== tenantScopeForReads()) return false;
  if (filter.inboxId && conversation.inboxId !== filter.inboxId) return false;
  if (
    filter.status &&
    filter.status !== "all" &&
    conversation.status !== filter.status
  ) {
    return false;
  }
  if (filter.assigneeAgentId !== undefined) {
    if (filter.assigneeAgentId === null) {
      if (conversation.assignee !== null) return false;
    } else if (conversation.assignee?.id !== filter.assigneeAgentId) {
      return false;
    }
  }
  if (filter.q && filter.q.trim().length > 0) {
    const needle = filter.q.toLowerCase();
    const haystack = [
      conversation.subject,
      conversation.externalContactName ?? "",
      conversation.externalContactEmail,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (filter.labelSlugs && filter.labelSlugs.length > 0) {
    const slugs = new Set(conversation.labels.map((label) => label.slug));
    for (const required of filter.labelSlugs) {
      if (!slugs.has(required)) return false;
    }
  }
  return true;
}

function findConversationOrThrow(id: string): SupportConversation {
  const conversation = findConversationInTenant(id);
  if (!conversation) throw new Error(`Unknown conversation: ${id}`);
  return conversation;
}

export const inMemorySupportHubAdapter: SupportHubAdapter = {
  conversations: {
    async list(filter) {
      return clone(
        store.conversations.filter((conversation) =>
          matchesConversationFilter(conversation, filter),
        ),
      );
    },
    async get(id) {
      const row = findConversationInTenant(id);
      return row ? clone(row) : null;
    },
    async listMessages(conversationId) {
      if (!findConversationInTenant(conversationId)) return [];
      const scope = tenantScopeForReads();
      return clone(
        store.messages.filter(
          (message) =>
            message.conversationId === conversationId &&
            message.tenantId === scope,
        ),
      );
    },
    async assign(input: AssignConversationInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      const agent = input.assigneeAgentId
        ? (store.agents.find((row) => row.id === input.assigneeAgentId) ?? null)
        : null;
      conversation.assignee = agent;
      conversation.updatedAt = nowIso();
      return clone(conversation);
    },
    async setStatus(input: SetConversationStatusInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      const stamp = nowIso();
      conversation.status = input.status;
      conversation.updatedAt = stamp;
      if (input.status === "resolved") {
        conversation.resolvedAt = stamp;
        conversation.snoozedUntil = null;
      } else {
        conversation.resolvedAt = null;
      }
      if (input.status === "snoozed") {
        conversation.snoozedUntil =
          input.snoozedUntil ?? conversation.snoozedUntil;
      } else {
        conversation.snoozedUntil = null;
      }
      return clone(conversation);
    },
    async setPriority(input: SetConversationPriorityInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      conversation.priority = input.priority;
      conversation.updatedAt = nowIso();
      return clone(conversation);
    },
    async snooze(input: SnoozeConversationInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      conversation.status = "snoozed";
      conversation.snoozedUntil = input.snoozedUntil;
      conversation.updatedAt = nowIso();
      return clone(conversation);
    },
    async unsnooze(input: UnsnoozeConversationInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      if (conversation.status === "snoozed") conversation.status = "open";
      conversation.snoozedUntil = null;
      conversation.updatedAt = nowIso();
      return clone(conversation);
    },
    async toggleLabel(input: ToggleConversationLabelInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      const label = findOrThrowTenantRow(store.labels, input.labelId, "label");
      const has = conversation.labels.some(
        (existing) => existing.id === label.id,
      );
      const shouldHave =
        input.mode === "add" ? true : input.mode === "remove" ? false : !has;
      if (shouldHave === has) return clone(conversation);
      if (shouldHave) {
        conversation.labels = [...conversation.labels, clone(label)];
      } else {
        conversation.labels = conversation.labels.filter(
          (existing) => existing.id !== label.id,
        );
      }
      conversation.updatedAt = nowIso();
      return clone(conversation);
    },
  },
  messages: {
    async sendReply(input: SendReplyInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      const agent =
        store.agents.find((row) => row.id === input.authorAgentId) ?? null;
      const stamp = nowIso();
      const isDraft = input.mode === "draft";
      const message: SupportMessage = {
        id: genId("msg-reply"),
        tenantId: conversation.tenantId,
        conversationId: conversation.id,
        type: "email",
        direction: "outbound",
        isPrivate: false,
        deliveryState: isDraft ? "draft" : "queued",
        author: agentParticipant(agent),
        body: {
          json: input.payload.json ?? null,
          html: input.payload.html,
          text: input.payload.text,
        },
        attachments: (input.payload.attachments ?? []).map((attachment) => ({
          id: genId("att"),
          filename: attachment.filename,
          contentType: attachment.contentType,
          sizeBytes: attachment.sizeBytes,
          url: null,
        })),
        emailHeaders: null,
        outboundSendLogId: null,
        inboundEmailId: null,
        postedAt: stamp,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.messages.push(message);
      if (!isDraft) {
        conversation.lastMessageAt = stamp;
        conversation.lastMessageDirection = "outbound";
        conversation.firstRespondedAt = conversation.firstRespondedAt ?? stamp;
        conversation.messageCount += 1;
      }
      conversation.updatedAt = stamp;
      return clone(message);
    },
    async addPrivateNote(input: AddPrivateNoteInput) {
      assertWritableTenantScope();
      const conversation = findConversationOrThrow(input.conversationId);
      const agent =
        store.agents.find((row) => row.id === input.authorAgentId) ?? null;
      const stamp = nowIso();
      const message: SupportMessage = {
        id: genId("msg-note"),
        tenantId: conversation.tenantId,
        conversationId: conversation.id,
        type: "note",
        direction: "outbound",
        isPrivate: true,
        deliveryState: "delivered",
        author: agentParticipant(agent),
        body: {
          json: null,
          html: input.bodyHtml ?? `<p>${input.bodyText}</p>`,
          text: input.bodyText,
        },
        attachments: [],
        emailHeaders: null,
        outboundSendLogId: null,
        inboundEmailId: null,
        postedAt: stamp,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.messages.push(message);
      conversation.messageCount += 1;
      conversation.lastMessageAt = stamp;
      conversation.updatedAt = stamp;
      return clone(message);
    },
  },
  labels: {
    async list() {
      return clone(rowsForTenant(store.labels));
    },
    async save(input: SaveLabelInput) {
      assertWritableTenantScope();
      if (input.id) {
        const label = patchTenantById(store.labels, input.id, (row) => {
          row.name = input.name;
          row.slug = input.slug;
          row.tone = input.tone;
          row.description = input.description;
        });
        return clone(label);
      }
      const label: SupportLabel = {
        id: genId("label"),
        tenantId: newRowTenantId(),
        name: input.name,
        slug: input.slug,
        tone: input.tone,
        description: input.description,
      };
      store.labels.push(label);
      return clone(label);
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.labels = store.labels.filter(
        (label) => !(label.id === id && label.tenantId === scope),
      );
      // Strip the deleted label from every conversation that still carries it.
      for (const conversation of store.conversations) {
        if (conversation.tenantId !== scope) continue;
        if (!conversation.labels.some((label) => label.id === id)) continue;
        conversation.labels = conversation.labels.filter(
          (label) => label.id !== id,
        );
        conversation.updatedAt = nowIso();
      }
    },
  },
  macros: {
    async list() {
      return clone(rowsForTenant(store.macros));
    },
    async save(input: SaveMacroInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      if (input.id) {
        const macro = patchTenantById(store.macros, input.id, (row) => {
          row.name = input.name;
          row.description = input.description;
          row.ownerAgentId = input.ownerAgentId;
          row.actions = input.actions;
          row.updatedAt = stamp;
        });
        return clone(macro);
      }
      const macro: SupportMacro = {
        id: genId("macro"),
        tenantId: newRowTenantId(),
        ownerAgentId: input.ownerAgentId,
        name: input.name,
        description: input.description,
        actions: input.actions,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.macros.push(macro);
      return clone(macro);
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.macros = store.macros.filter(
        (macro) => !(macro.id === id && macro.tenantId === scope),
      );
    },
  },
  cannedResponses: {
    async list() {
      return clone(rowsForTenant(store.cannedResponses));
    },
    async save(input: SaveCannedResponseInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      if (input.id) {
        const row = patchTenantById(store.cannedResponses, input.id, (entry) => {
          entry.shortCode = input.shortCode;
          entry.title = input.title;
          entry.ownerAgentId = input.ownerAgentId;
          entry.bodyText = input.bodyText;
          entry.bodyHtml = input.bodyHtml ?? null;
          entry.updatedAt = stamp;
        });
        return clone(row);
      }
      const row: SupportCannedResponse = {
        id: genId("canned"),
        tenantId: newRowTenantId(),
        ownerAgentId: input.ownerAgentId,
        shortCode: input.shortCode,
        title: input.title,
        bodyText: input.bodyText,
        bodyHtml: input.bodyHtml ?? null,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.cannedResponses.push(row);
      return clone(row);
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.cannedResponses = store.cannedResponses.filter(
        (entry) => !(entry.id === id && entry.tenantId === scope),
      );
    },
  },
  savedViews: {
    async list() {
      return clone(rowsForTenant(store.savedViews));
    },
    async save(input: SaveSavedViewInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      if (input.id) {
        const row = patchTenantById(store.savedViews, input.id, (entry) => {
          entry.name = input.name;
          entry.slug = input.slug;
          entry.ownerAgentId = input.ownerAgentId;
          entry.scope = input.scope;
          entry.filter = input.filter;
          entry.updatedAt = stamp;
        });
        return clone(row);
      }
      const row: SupportSavedView = {
        id: genId("view"),
        tenantId: newRowTenantId(),
        ownerAgentId: input.ownerAgentId,
        name: input.name,
        slug: input.slug,
        scope: input.scope,
        filter: input.filter,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.savedViews.push(row);
      return clone(row);
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.savedViews = store.savedViews.filter(
        (view) => !(view.id === id && view.tenantId === scope),
      );
    },
  },
  inboxes: {
    async list() {
      return clone(rowsForTenant(store.inboxes));
    },
  },
  inboxSettings: {
    async list() {
      return clone(rowsForTenant(store.inboxSettings));
    },
    async get(inboxId) {
      const scoped = rowsForTenant(store.inboxSettings);
      const target = inboxId
        ? scoped.find((row) => row.inboxId === inboxId)
        : scoped[0];
      return target ? clone(target) : null;
    },
    async save(input: SaveInboxSettingsInput) {
      assertWritableTenantScope();
      const row = patchTenantById(store.inboxSettings, input.id, (entry) => {
        entry.inboxId = input.inboxId;
        entry.defaultSignatureId = input.defaultSignatureId;
        entry.defaultSlaPolicyId = input.defaultSlaPolicyId;
        entry.defaultBusinessHoursId = input.defaultBusinessHoursId;
        entry.roundRobinEnabled = input.roundRobinEnabled;
        entry.autoResolveAfterDays = input.autoResolveAfterDays;
        entry.showContactSidecar = input.showContactSidecar;
        entry.updatedAt = nowIso();
      });
      return clone(row);
    },
  },
  agents: {
    async list() {
      if (tenantScopeForReads() !== SUPPORT_HUB_DEMO_TENANT_ID) return [];
      return clone(store.agents);
    },
  },
  teams: {
    async list() {
      if (tenantScopeForReads() !== SUPPORT_HUB_DEMO_TENANT_ID) return [];
      return clone(store.teams);
    },
    async save(input: SaveTeamInput) {
      assertWritableTenantScope();
      if (input.id) {
        const row = patchById(store.teams, input.id, (entry) => {
          entry.name = input.name;
          entry.slug = input.slug;
          entry.description = input.description;
          entry.initials = input.initials;
        });
        return clone(row);
      }
      const row: SupportTeam = {
        id: genId("team"),
        name: input.name,
        slug: input.slug,
        description: input.description,
        initials: input.initials,
      };
      store.teams.push(row);
      return clone(row);
    },
    async delete(id) {
      assertWritableTenantScope();
      store.teams = store.teams.filter((team) => team.id !== id);
    },
  },
  businessHours: {
    async list() {
      return clone(rowsForTenant(store.businessHours));
    },
    async save(input: SaveBusinessHoursInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      if (input.id) {
        const row = patchTenantById(store.businessHours, input.id, (entry) => {
          entry.name = input.name;
          entry.timezone = input.timezone;
          entry.weeklySchedule = input.weeklySchedule;
          entry.holidays = input.holidays;
          entry.isDefault = input.isDefault;
          entry.updatedAt = stamp;
        });
        return clone(row);
      }
      const row: SupportBusinessHours = {
        id: genId("biz-hours"),
        tenantId: newRowTenantId(),
        name: input.name,
        timezone: input.timezone,
        weeklySchedule: input.weeklySchedule,
        holidays: input.holidays,
        isDefault: input.isDefault,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.businessHours.push(row);
      return clone(row);
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.businessHours = store.businessHours.filter(
        (row) => !(row.id === id && row.tenantId === scope),
      );
    },
  },
  slaPolicies: {
    async list() {
      return clone(rowsForTenant(store.slaPolicies));
    },
    async save(input: SaveSlaPolicyInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      let saved: SupportSlaPolicy;
      if (input.id) {
        saved = patchTenantById(store.slaPolicies, input.id, (entry) => {
          entry.name = input.name;
          entry.description = input.description;
          entry.firstResponseMinutes = input.firstResponseMinutes;
          entry.nextResponseMinutes = input.nextResponseMinutes;
          entry.resolutionMinutes = input.resolutionMinutes;
          entry.businessHoursId = input.businessHoursId;
          entry.isDefault = input.isDefault;
          entry.updatedAt = stamp;
        });
      } else {
        saved = {
          id: genId("sla"),
          tenantId: newRowTenantId(),
          name: input.name,
          description: input.description,
          firstResponseMinutes: input.firstResponseMinutes,
          nextResponseMinutes: input.nextResponseMinutes,
          resolutionMinutes: input.resolutionMinutes,
          businessHoursId: input.businessHoursId,
          isDefault: input.isDefault,
          createdAt: stamp,
          updatedAt: stamp,
        };
        store.slaPolicies.push(saved);
      }
      if (saved.isDefault) {
        const scope = tenantScopeForReads();
        for (const policy of store.slaPolicies) {
          if (policy.tenantId !== scope) continue;
          if (policy.id !== saved.id && policy.isDefault) {
            policy.isDefault = false;
            policy.updatedAt = stamp;
          }
        }
      }
      return clone(saved);
    },
    async setDefault(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      const stamp = nowIso();
      for (const policy of store.slaPolicies) {
        if (policy.tenantId !== scope) continue;
        const shouldBeDefault = policy.id === id;
        if (policy.isDefault !== shouldBeDefault) {
          policy.isDefault = shouldBeDefault;
          policy.updatedAt = stamp;
        }
      }
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.slaPolicies = store.slaPolicies.filter(
        (policy) => !(policy.id === id && policy.tenantId === scope),
      );
    },
  },
  signatures: {
    async list() {
      return clone(rowsForTenant(store.signatures));
    },
    async save(input: SaveSignatureInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      let saved: SupportSignature;
      if (input.id) {
        saved = patchTenantById(store.signatures, input.id, (entry) => {
          entry.ownerAgentId = input.ownerAgentId;
          entry.name = input.name;
          entry.bodyText = input.bodyText;
          entry.bodyHtml = input.bodyHtml ?? null;
          entry.isDefault = input.isDefault;
          entry.updatedAt = stamp;
        });
      } else {
        saved = {
          id: genId("sig"),
          tenantId: newRowTenantId(),
          ownerAgentId: input.ownerAgentId,
          name: input.name,
          bodyText: input.bodyText,
          bodyHtml: input.bodyHtml ?? null,
          isDefault: input.isDefault,
          createdAt: stamp,
          updatedAt: stamp,
        };
        store.signatures.push(saved);
      }
      if (saved.isDefault) {
        const scope = tenantScopeForReads();
        for (const signature of store.signatures) {
          if (signature.tenantId !== scope) continue;
          if (
            signature.id !== saved.id &&
            signature.ownerAgentId === saved.ownerAgentId &&
            signature.isDefault
          ) {
            signature.isDefault = false;
            signature.updatedAt = stamp;
          }
        }
      }
      return clone(saved);
    },
    async setDefault(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      const target = store.signatures.find(
        (signature) =>
          signature.id === id && signature.tenantId === scope,
      );
      if (!target) throw new Error(`Unknown signature: ${id}`);
      const stamp = nowIso();
      for (const signature of store.signatures) {
        if (signature.tenantId !== scope) continue;
        if (signature.ownerAgentId !== target.ownerAgentId) continue;
        const shouldBeDefault = signature.id === id;
        if (signature.isDefault !== shouldBeDefault) {
          signature.isDefault = shouldBeDefault;
          signature.updatedAt = stamp;
        }
      }
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.signatures = store.signatures.filter(
        (signature) =>
          !(signature.id === id && signature.tenantId === scope),
      );
    },
  },
  automationRules: {
    async list() {
      return clone(rowsForTenant(store.automationRules));
    },
    async save(input: SaveAutomationRuleInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      if (input.id) {
        const row = patchTenantById(store.automationRules, input.id, (entry) => {
          entry.name = input.name;
          entry.description = input.description;
          entry.enabled = input.enabled;
          entry.trigger = input.trigger;
          entry.conditions = input.conditions;
          entry.actions = input.actions;
          entry.updatedAt = stamp;
        });
        return clone(row);
      }
      const row: SupportAutomationRule = {
        id: genId("automation"),
        tenantId: newRowTenantId(),
        name: input.name,
        description: input.description,
        enabled: input.enabled,
        trigger: input.trigger,
        conditions: input.conditions,
        actions: input.actions,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.automationRules.push(row);
      return clone(row);
    },
    async toggle(input: ToggleAutomationRuleInput) {
      assertWritableTenantScope();
      const row = patchTenantById(store.automationRules, input.id, (entry) => {
        entry.enabled = input.enabled;
        entry.updatedAt = nowIso();
      });
      return clone(row);
    },
    async delete(id) {
      assertWritableTenantScope();
      const scope = tenantScopeForReads();
      store.automationRules = store.automationRules.filter(
        (rule) => !(rule.id === id && rule.tenantId === scope),
      );
    },
  },
  notificationPreferences: {
    async list() {
      return clone(rowsForTenant(store.notificationPreferences));
    },
    async get(agentId) {
      const scope = tenantScopeForReads();
      const row = store.notificationPreferences.find(
        (entry) =>
          entry.agentId === agentId && entry.tenantId === scope,
      );
      return row ? clone(row) : null;
    },
    async save(input: SaveNotificationPreferencesInput) {
      assertWritableTenantScope();
      const stamp = nowIso();
      const scope = tenantScopeForReads();
      const existing = store.notificationPreferences.find(
        (row) => row.agentId === input.agentId && row.tenantId === scope,
      );
      if (existing) {
        existing.emailMentions = input.emailMentions;
        existing.emailAssignments = input.emailAssignments;
        existing.emailDailyDigest = input.emailDailyDigest;
        existing.inAppMentions = input.inAppMentions;
        existing.inAppAssignments = input.inAppAssignments;
        existing.inAppSlaWarnings = input.inAppSlaWarnings;
        existing.updatedAt = stamp;
        return clone(existing);
      }
      const row: SupportNotificationPreferences = {
        id: genId("notif-pref"),
        tenantId: newRowTenantId(),
        agentId: input.agentId,
        emailMentions: input.emailMentions,
        emailAssignments: input.emailAssignments,
        emailDailyDigest: input.emailDailyDigest,
        inAppMentions: input.inAppMentions,
        inAppAssignments: input.inAppAssignments,
        inAppSlaWarnings: input.inAppSlaWarnings,
        createdAt: stamp,
        updatedAt: stamp,
      };
      store.notificationPreferences.push(row);
      return clone(row);
    },
  },
};

void HOUR_MS;
void clone;
