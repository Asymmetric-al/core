import { getAdminClient } from "@asym/database/supabase/admin";

import {
  getSupportHubRequestTenantId,
  runWithSupportHubTenant,
} from "../request-context";

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
  SupportEmailHeaders,
  SupportInbox,
  SupportInboxSettings,
  SupportLabel,
  SupportMacro,
  SupportMessage,
  SupportMessageAttachment,
  SupportNotificationPreferences,
  SupportParticipant,
  SupportSavedView,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
} from "@asym/database/hooks";

type JsonRecord = Record<string, unknown>;
type SupabaseRow = JsonRecord;
type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

interface TenantSnapshot {
  labels: Map<string, SupportLabel>;
  agents: Map<string, SupportAssignee>;
  teams: Map<string, SupportTeam>;
}

const SYSTEM_PARTICIPANT: SupportParticipant = {
  id: "system",
  role: "system",
  name: "Mission Control",
  email: null,
  avatarUrl: null,
};

function client(): AdminSupabaseClient {
  const { client: supabase, error } = getAdminClient();
  if (!supabase) {
    throw new Error(error ?? "Support Hub Supabase adapter unavailable.");
  }
  return supabase;
}

function tenantId(): string {
  const scopedTenantId = getSupportHubRequestTenantId();
  if (!scopedTenantId) {
    throw new Error("SUPPORT_HUB_TENANT_REQUIRED");
  }
  return scopedTenantId;
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

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asJsonRecord(value: unknown): JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function iso(value: unknown): string {
  if (typeof value === "string" && value.length > 0) {
    return new Date(value).toISOString();
  }
  return nowIso();
}

function nullableIso(value: unknown): string | null {
  return typeof value === "string" && value.length > 0
    ? new Date(value).toISOString()
    : null;
}

function assertDb(
  error: { message?: string; code?: string } | null | undefined,
  operation: string,
): void {
  if (!error) return;
  throw new Error(`${operation}: ${error.message ?? error.code ?? "failed"}`);
}

async function allRows(
  table: string,
  columns = "*",
  order?: { column: string; ascending?: boolean },
): Promise<SupabaseRow[]> {
  const scope = tenantId();
  let query = client().from(table).select(columns).eq("tenant_id", scope);
  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  }
  const { data, error } = await query;
  assertDb(error, `${table}.select`);
  return (data ?? []) as unknown as SupabaseRow[];
}

async function oneRow(
  table: string,
  id: string,
  columns = "*",
): Promise<SupabaseRow | null> {
  const { data, error } = await client()
    .from(table)
    .select(columns)
    .eq("tenant_id", tenantId())
    .eq("id", id)
    .maybeSingle();
  assertDb(error, `${table}.select`);
  return (data as SupabaseRow | null) ?? null;
}

async function upsertRow(
  table: string,
  payload: JsonRecord,
): Promise<SupabaseRow> {
  const { data, error } = await client()
    .from(table)
    .upsert(payload, { onConflict: "tenant_id,id" })
    .select()
    .single();
  assertDb(error, `${table}.upsert`);
  return data as SupabaseRow;
}

async function updateById(
  table: string,
  id: string,
  patch: JsonRecord,
): Promise<SupabaseRow> {
  const { data, error } = await client()
    .from(table)
    .update({ ...patch, updated_at: nowIso() })
    .eq("tenant_id", tenantId())
    .eq("id", id)
    .select()
    .single();
  assertDb(error, `${table}.update`);
  return data as SupabaseRow;
}

async function deleteById(table: string, id: string): Promise<void> {
  const { error } = await client()
    .from(table)
    .delete()
    .eq("tenant_id", tenantId())
    .eq("id", id);
  assertDb(error, `${table}.delete`);
}

function toLabel(row: SupabaseRow): SupportLabel {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    name: String(row.name),
    slug: String(row.slug),
    tone: String(row.tone) as SupportLabel["tone"],
    description: asString(row.description),
  };
}

function toAgent(row: SupabaseRow): SupportAssignee {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    avatarUrl: asString(row.avatar_url),
    title: asString(row.title),
  };
}

function toTeam(row: SupabaseRow): SupportTeam {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: asString(row.description),
    initials: String(row.initials),
  };
}

function toInbox(row: SupabaseRow): SupportInbox {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    name: String(row.name),
    channel: "email",
    inboundAddress: String(row.inbound_address),
    fromAddress: String(row.from_address),
    fromName: String(row.from_name),
    replyToAddress: asString(row.reply_to_address),
    description: asString(row.description),
    isDefault: asBoolean(row.is_default),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toBusinessHours(row: SupabaseRow): SupportBusinessHours {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    name: String(row.name),
    timezone: String(row.timezone),
    weeklySchedule: asJsonArray<SupportBusinessHours["weeklySchedule"][number]>(
      row.weekly_schedule,
    ),
    holidays: asJsonArray<SupportBusinessHours["holidays"][number]>(
      row.holidays,
    ),
    isDefault: asBoolean(row.is_default),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toSlaPolicy(row: SupabaseRow): SupportSlaPolicy {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    name: String(row.name),
    description: asString(row.description),
    firstResponseMinutes: asNumber(row.first_response_minutes),
    nextResponseMinutes: asNumber(row.next_response_minutes),
    resolutionMinutes: asNumber(row.resolution_minutes),
    businessHoursId: asString(row.business_hours_id),
    isDefault: asBoolean(row.is_default),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toSignature(row: SupabaseRow): SupportSignature {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    ownerAgentId: asString(row.owner_agent_id),
    name: String(row.name),
    bodyText: String(row.body_text),
    bodyHtml: asString(row.body_html),
    isDefault: asBoolean(row.is_default),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toInboxSettings(row: SupabaseRow): SupportInboxSettings {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    inboxId: String(row.inbox_id),
    defaultSignatureId: asString(row.default_signature_id),
    defaultSlaPolicyId: asString(row.default_sla_policy_id),
    defaultBusinessHoursId: asString(row.default_business_hours_id),
    roundRobinEnabled: asBoolean(row.round_robin_enabled),
    autoResolveAfterDays:
      typeof row.auto_resolve_after_days === "number"
        ? row.auto_resolve_after_days
        : null,
    showContactSidecar: row.show_contact_sidecar !== false,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toMacro(row: SupabaseRow): SupportMacro {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    ownerAgentId: asString(row.owner_agent_id),
    name: String(row.name),
    description: asString(row.description),
    actions: asJsonArray<SupportMacro["actions"][number]>(row.actions),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toCannedResponse(row: SupabaseRow): SupportCannedResponse {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    ownerAgentId: asString(row.owner_agent_id),
    shortCode: String(row.short_code),
    title: String(row.title),
    bodyText: String(row.body_text),
    bodyHtml: asString(row.body_html),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toSavedView(row: SupabaseRow): SupportSavedView {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    ownerAgentId: asString(row.owner_agent_id),
    name: String(row.name),
    slug: String(row.slug),
    scope: String(row.scope) as SupportSavedView["scope"],
    filter: asJsonRecord(row.filter) as SupportSavedView["filter"],
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toAutomationRule(row: SupabaseRow): SupportAutomationRule {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    name: String(row.name),
    description: asString(row.description),
    enabled: asBoolean(row.enabled),
    trigger: String(row.trigger) as SupportAutomationRule["trigger"],
    conditions: asJsonArray<SupportAutomationRule["conditions"][number]>(
      row.conditions,
    ),
    actions: asJsonArray<SupportAutomationRule["actions"][number]>(row.actions),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toNotificationPreferences(
  row: SupabaseRow,
): SupportNotificationPreferences {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    agentId: String(row.agent_id),
    emailMentions: asBoolean(row.email_mentions),
    emailAssignments: asBoolean(row.email_assignments),
    emailDailyDigest: asBoolean(row.email_daily_digest),
    inAppMentions: asBoolean(row.in_app_mentions),
    inAppAssignments: asBoolean(row.in_app_assignments),
    inAppSlaWarnings: asBoolean(row.in_app_sla_warnings),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

async function tenantSnapshot(): Promise<TenantSnapshot> {
  const [labelRows, agentRows, teamRows] = await Promise.all([
    allRows("support_labels"),
    allRows("support_agents"),
    allRows("support_teams"),
  ]);
  return {
    labels: new Map(labelRows.map((row) => [String(row.id), toLabel(row)])),
    agents: new Map(agentRows.map((row) => [String(row.id), toAgent(row)])),
    teams: new Map(teamRows.map((row) => [String(row.id), toTeam(row)])),
  };
}

async function conversationLabelsById(): Promise<Map<string, SupportLabel[]>> {
  const [joins, labels] = await Promise.all([
    allRows("support_conversation_labels"),
    allRows("support_labels"),
  ]);
  const labelMap = new Map(labels.map((row) => [String(row.id), toLabel(row)]));
  const byConversation = new Map<string, SupportLabel[]>();
  for (const join of joins) {
    const conversationId = String(join.conversation_id);
    const label = labelMap.get(String(join.label_id));
    if (!label) continue;
    const current = byConversation.get(conversationId) ?? [];
    current.push(label);
    byConversation.set(conversationId, current);
  }
  return byConversation;
}

function toConversation(
  row: SupabaseRow,
  snapshot: TenantSnapshot,
  labels: SupportLabel[],
): SupportConversation {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    inboxId: String(row.inbox_id),
    subject: String(row.subject),
    status: String(row.status) as SupportConversation["status"],
    priority: String(row.priority) as SupportConversation["priority"],
    channel: "email",
    assignee: row.assignee_agent_id
      ? (snapshot.agents.get(String(row.assignee_agent_id)) ?? null)
      : null,
    team: row.team_id
      ? (snapshot.teams.get(String(row.team_id)) ?? null)
      : null,
    externalContactEmail: String(row.external_contact_email),
    externalContactName: asString(row.external_contact_name),
    contact:
      row.contact_ref === null || row.contact_ref === undefined
        ? null
        : (asJsonRecord(row.contact_ref) as SupportConversation["contact"]),
    labels,
    unreadCount: asNumber(row.unread_count),
    messageCount: asNumber(row.message_count),
    firstMessageAt: iso(row.first_message_at),
    lastMessageAt: iso(row.last_message_at),
    lastCustomerMessageAt: nullableIso(row.last_customer_message_at),
    lastMessageDirection: String(
      row.last_message_direction,
    ) as SupportConversation["lastMessageDirection"],
    firstRespondedAt: nullableIso(row.first_responded_at),
    firstResponseDueAt: nullableIso(row.first_response_due_at),
    nextResponseDueAt: nullableIso(row.next_response_due_at),
    resolvedAt: nullableIso(row.resolved_at),
    snoozedUntil: nullableIso(row.snoozed_until),
    escalatedAt: nullableIso(row.escalated_at),
    boardOrder: asNumber(row.board_order),
    slaPolicyId: asString(row.sla_policy_id),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

async function hydrateConversation(
  row: SupabaseRow | null,
): Promise<SupportConversation | null> {
  if (!row) return null;
  const [snapshot, labelsById] = await Promise.all([
    tenantSnapshot(),
    conversationLabelsById(),
  ]);
  return toConversation(row, snapshot, labelsById.get(String(row.id)) ?? []);
}

async function getConversationOrThrow(
  id: string,
): Promise<SupportConversation> {
  const conversation = await supabaseSupportHubAdapter.conversations.get(id);
  if (!conversation) throw new Error(`Unknown conversation: ${id}`);
  return conversation;
}

function participantForAgent(
  agent: SupportAssignee | null,
): SupportParticipant {
  if (!agent) return SYSTEM_PARTICIPANT;
  return {
    id: agent.id,
    role: "agent",
    name: agent.name,
    email: agent.email,
    avatarUrl: agent.avatarUrl,
  };
}

function donorParticipant(
  email: string,
  name: string | null,
): SupportParticipant {
  return {
    id: `donor:${email.toLowerCase()}`,
    role: "donor",
    name: name ?? email,
    email,
    avatarUrl: null,
  };
}

function toMessage(
  row: SupabaseRow,
  attachments: SupportMessageAttachment[],
): SupportMessage {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    conversationId: String(row.conversation_id),
    type: String(row.type) as SupportMessage["type"],
    direction: String(row.direction) as SupportMessage["direction"],
    isPrivate: asBoolean(row.is_private),
    deliveryState: String(
      row.delivery_state,
    ) as SupportMessage["deliveryState"],
    author: asJsonRecord(row.author) as SupportParticipant,
    body: asJsonRecord(row.body) as SupportMessage["body"],
    attachments,
    emailHeaders:
      row.email_headers === null || row.email_headers === undefined
        ? null
        : (asJsonRecord(row.email_headers) as SupportEmailHeaders),
    outboundSendLogId: asString(row.outbound_send_log_id),
    inboundEmailId: asString(row.inbound_email_id),
    postedAt: iso(row.posted_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function toAttachment(row: SupabaseRow): SupportMessageAttachment {
  return {
    id: String(row.id),
    filename: String(row.filename),
    contentType: String(row.content_type),
    sizeBytes: asNumber(row.size_bytes),
    url: asString(row.url),
  };
}

async function insertMessage(input: {
  id: string;
  conversation: SupportConversation;
  type: SupportMessage["type"];
  direction: SupportMessage["direction"];
  isPrivate: boolean;
  deliveryState: SupportMessage["deliveryState"];
  author: SupportParticipant;
  body: SupportMessage["body"];
  emailHeaders: SupportEmailHeaders | null;
  inboundEmailId?: string | null;
  outboundSendLogId?: string | null;
  attachments?: Array<{
    filename: string;
    contentType: string;
    sizeBytes: number;
    url?: string | null;
  }>;
  postedAt?: string;
}): Promise<SupportMessage> {
  const scope = tenantId();
  const stamp = input.postedAt ?? nowIso();
  const { data, error } = await client()
    .from("support_messages")
    .insert({
      tenant_id: scope,
      id: input.id,
      conversation_id: input.conversation.id,
      type: input.type,
      direction: input.direction,
      is_private: input.isPrivate,
      delivery_state: input.deliveryState,
      author: input.author,
      body: input.body,
      email_headers: input.emailHeaders,
      inbound_email_id: input.inboundEmailId ?? null,
      outbound_send_log_id: input.outboundSendLogId ?? null,
      posted_at: stamp,
    })
    .select()
    .single();
  assertDb(error, "support_messages.insert");

  const attachmentRows = (input.attachments ?? []).map((attachment) => ({
    tenant_id: scope,
    id: genId("att"),
    message_id: input.id,
    filename: attachment.filename,
    content_type: attachment.contentType,
    size_bytes: attachment.sizeBytes,
    url: attachment.url ?? null,
  }));

  if (attachmentRows.length > 0) {
    const { error: attachmentError } = await client()
      .from("support_message_attachments")
      .insert(attachmentRows);
    assertDb(attachmentError, "support_message_attachments.insert");
  }

  return toMessage(
    data as SupabaseRow,
    attachmentRows.map((row) => toAttachment(row)),
  );
}

async function bumpConversationAfterMessage(
  conversation: SupportConversation,
  message: SupportMessage,
): Promise<void> {
  const isInbound = message.direction === "inbound";
  const patch: JsonRecord = {
    message_count: conversation.messageCount + 1,
    last_message_at: message.postedAt,
    updated_at: nowIso(),
  };

  if (isInbound) {
    patch.last_customer_message_at = message.postedAt;
    patch.last_message_direction = "inbound";
    patch.unread_count = conversation.unreadCount + 1;
    if (conversation.status === "resolved") {
      patch.status = "open";
      patch.resolved_at = null;
    }
  } else if (message.type === "email" && message.deliveryState !== "draft") {
    patch.last_message_direction = "outbound";
    patch.first_responded_at =
      conversation.firstRespondedAt ?? message.postedAt;
    patch.snoozed_until = null;
    if (conversation.status === "snoozed") {
      patch.status = "open";
    }
  }

  const { error } = await client()
    .from("support_conversations")
    .update(patch)
    .eq("tenant_id", tenantId())
    .eq("id", conversation.id);
  assertDb(error, "support_conversations.message_bump");
}

export const supabaseSupportHubAdapter: SupportHubAdapter = {
  conversations: {
    async list(filter: SupportConversationFilter) {
      let query = client()
        .from("support_conversations")
        .select("*")
        .eq("tenant_id", tenantId())
        .order("updated_at", { ascending: false });
      if (filter.inboxId) {
        query = query.eq("inbox_id", filter.inboxId);
      }
      if (filter.status && filter.status !== "all") {
        query = query.eq("status", filter.status);
      }
      if (filter.assigneeAgentId !== undefined) {
        query =
          filter.assigneeAgentId === null
            ? query.is("assignee_agent_id", null)
            : query.eq("assignee_agent_id", filter.assigneeAgentId);
      }
      const { data, error } = await query;
      assertDb(error, "support_conversations.select");
      const rows = (data ?? []) as unknown as SupabaseRow[];

      const [snapshot, labelsById] = await Promise.all([
        tenantSnapshot(),
        conversationLabelsById(),
      ]);
      const conversations = rows.map((row) =>
        toConversation(row, snapshot, labelsById.get(String(row.id)) ?? []),
      );

      return conversations.filter((conversation) => {
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
          return filter.labelSlugs.every((slug) => slugs.has(slug));
        }
        return true;
      });
    },
    async get(id) {
      return hydrateConversation(await oneRow("support_conversations", id));
    },
    async listMessages(conversationId) {
      const { data, error } = await client()
        .from("support_messages")
        .select("*")
        .eq("tenant_id", tenantId())
        .eq("conversation_id", conversationId)
        .order("posted_at", { ascending: true });
      assertDb(error, "support_messages.select");
      const messages = (data ?? []) as unknown as SupabaseRow[];

      if (messages.length === 0) return [];

      const messageIds = messages.map((row) => String(row.id));
      const attachmentRows: SupabaseRow[] = [];
      for (let i = 0; i < messageIds.length; i += 100) {
        const chunk = messageIds.slice(i, i + 100);
        const { data: chunkData, error: chunkError } = await client()
          .from("support_message_attachments")
          .select("*")
          .eq("tenant_id", tenantId())
          .in("message_id", chunk);
        assertDb(chunkError, "support_message_attachments.select");
        attachmentRows.push(...((chunkData ?? []) as unknown as SupabaseRow[]));
      }

      const attachmentsByMessage = new Map<
        string,
        SupportMessageAttachment[]
      >();
      for (const attachmentRow of attachmentRows) {
        const messageId = String(attachmentRow.message_id);
        const current = attachmentsByMessage.get(messageId) ?? [];
        current.push(toAttachment(attachmentRow));
        attachmentsByMessage.set(messageId, current);
      }

      return messages.map((row) =>
        toMessage(row, attachmentsByMessage.get(String(row.id)) ?? []),
      );
    },
    async assign(input: AssignConversationInput) {
      const patch: JsonRecord = {
        assignee_agent_id: input.assigneeAgentId,
      };
      if (input.teamId !== undefined) {
        patch.team_id = input.teamId;
      }
      await updateById("support_conversations", input.conversationId, patch);

      const { error } = await client()
        .from("support_assignments")
        .insert({
          tenant_id: tenantId(),
          conversation_id: input.conversationId,
          assignee_agent_id: input.assigneeAgentId,
          team_id: input.teamId ?? null,
          reason: input.reason ?? "manual",
        });
      assertDb(error, "support_assignments.insert");

      return getConversationOrThrow(input.conversationId);
    },
    async setStatus(input: SetConversationStatusInput) {
      const stamp = nowIso();
      const patch: JsonRecord = {
        status: input.status,
        snoozed_until:
          input.status === "snoozed" ? (input.snoozedUntil ?? null) : null,
        resolved_at: input.status === "resolved" ? stamp : null,
      };
      await updateById("support_conversations", input.conversationId, patch);
      return getConversationOrThrow(input.conversationId);
    },
    async setPriority(input: SetConversationPriorityInput) {
      await updateById("support_conversations", input.conversationId, {
        priority: input.priority,
      });
      return getConversationOrThrow(input.conversationId);
    },
    async snooze(input: SnoozeConversationInput) {
      await updateById("support_conversations", input.conversationId, {
        status: "snoozed",
        snoozed_until: input.snoozedUntil,
      });
      return getConversationOrThrow(input.conversationId);
    },
    async unsnooze(input: UnsnoozeConversationInput) {
      const conversation = await getConversationOrThrow(input.conversationId);
      await updateById("support_conversations", input.conversationId, {
        status:
          conversation.status === "snoozed" ? "open" : conversation.status,
        snoozed_until: null,
      });
      return getConversationOrThrow(input.conversationId);
    },
    async toggleLabel(input: ToggleConversationLabelInput) {
      const conversation = await getConversationOrThrow(input.conversationId);
      const has = conversation.labels.some(
        (label) => label.id === input.labelId,
      );
      const shouldHave =
        input.mode === "add" ? true : input.mode === "remove" ? false : !has;

      if (shouldHave && !has) {
        const { error } = await client()
          .from("support_conversation_labels")
          .insert({
            tenant_id: tenantId(),
            conversation_id: input.conversationId,
            label_id: input.labelId,
          });
        assertDb(error, "support_conversation_labels.insert");
      }

      if (!shouldHave && has) {
        const { error } = await client()
          .from("support_conversation_labels")
          .delete()
          .eq("tenant_id", tenantId())
          .eq("conversation_id", input.conversationId)
          .eq("label_id", input.labelId);
        assertDb(error, "support_conversation_labels.delete");
      }

      await updateById("support_conversations", input.conversationId, {});
      return getConversationOrThrow(input.conversationId);
    },
  },
  messages: {
    async sendReply(input: SendReplyInput) {
      const conversation = await getConversationOrThrow(input.conversationId);
      const agentRows = await allRows("support_agents");
      const agent =
        agentRows.map(toAgent).find((row) => row.id === input.authorAgentId) ??
        null;
      const isDraft = input.mode === "draft";
      const message = await insertMessage({
        id: genId("msg-reply"),
        conversation,
        type: "email",
        direction: "outbound",
        isPrivate: false,
        deliveryState: isDraft ? "draft" : "queued",
        author: participantForAgent(agent),
        body: {
          json: input.payload.json ?? null,
          html: input.payload.html,
          text: input.payload.text,
        },
        emailHeaders: {
          messageId: `<${genId("support-reply")}@support.asymmetric.al>`,
          inReplyTo: null,
          references: [],
          subject: `Re: ${conversation.subject}`,
          from: agent?.email ?? "support@asymmetric.al",
          to: [conversation.externalContactEmail],
          cc: [],
          bcc: [],
        },
        attachments: input.payload.attachments,
      });
      if (!isDraft) {
        await bumpConversationAfterMessage(conversation, message);
      }
      return message;
    },
    async addPrivateNote(input: AddPrivateNoteInput) {
      const conversation = await getConversationOrThrow(input.conversationId);
      const agentRows = await allRows("support_agents");
      const agent =
        agentRows.map(toAgent).find((row) => row.id === input.authorAgentId) ??
        null;
      const message = await insertMessage({
        id: genId("msg-note"),
        conversation,
        type: "note",
        direction: "outbound",
        isPrivate: true,
        deliveryState: "delivered",
        author: participantForAgent(agent),
        body: {
          json: null,
          html: input.bodyHtml ?? `<p>${input.bodyText}</p>`,
          text: input.bodyText,
        },
        emailHeaders: null,
      });
      await bumpConversationAfterMessage(conversation, message);
      return message;
    },
  },
  labels: {
    async list() {
      return (await allRows("support_labels")).map(toLabel);
    },
    async save(input: SaveLabelInput) {
      return toLabel(
        await upsertRow("support_labels", {
          tenant_id: tenantId(),
          id: input.id ?? genId("label"),
          name: input.name,
          slug: input.slug,
          tone: input.tone,
          description: input.description,
          updated_at: nowIso(),
        }),
      );
    },
    async delete(id) {
      await deleteById("support_labels", id);
    },
  },
  macros: {
    async list() {
      return (await allRows("support_macros")).map(toMacro);
    },
    async save(input: SaveMacroInput) {
      return toMacro(
        await upsertRow("support_macros", {
          tenant_id: tenantId(),
          id: input.id ?? genId("macro"),
          owner_agent_id: input.ownerAgentId,
          name: input.name,
          description: input.description,
          actions: input.actions,
          updated_at: nowIso(),
        }),
      );
    },
    async delete(id) {
      await deleteById("support_macros", id);
    },
  },
  cannedResponses: {
    async list() {
      return (await allRows("support_canned_responses")).map(toCannedResponse);
    },
    async save(input: SaveCannedResponseInput) {
      return toCannedResponse(
        await upsertRow("support_canned_responses", {
          tenant_id: tenantId(),
          id: input.id ?? genId("canned"),
          owner_agent_id: input.ownerAgentId,
          short_code: input.shortCode,
          title: input.title,
          body_text: input.bodyText,
          body_html: input.bodyHtml ?? null,
          updated_at: nowIso(),
        }),
      );
    },
    async delete(id) {
      await deleteById("support_canned_responses", id);
    },
  },
  savedViews: {
    async list() {
      return (await allRows("support_saved_views")).map(toSavedView);
    },
    async save(input: SaveSavedViewInput) {
      return toSavedView(
        await upsertRow("support_saved_views", {
          tenant_id: tenantId(),
          id: input.id ?? genId("view"),
          owner_agent_id: input.ownerAgentId,
          name: input.name,
          slug: input.slug,
          scope: input.scope,
          filter: input.filter,
          updated_at: nowIso(),
        }),
      );
    },
    async delete(id) {
      await deleteById("support_saved_views", id);
    },
  },
  inboxes: {
    async list() {
      return (await allRows("support_inboxes")).map(toInbox);
    },
  },
  inboxSettings: {
    async list() {
      return (await allRows("support_inbox_settings")).map(toInboxSettings);
    },
    async get(inboxId?: string | null) {
      const rows = (await allRows("support_inbox_settings")).map(
        toInboxSettings,
      );
      if (inboxId) {
        return rows.find((row) => row.inboxId === inboxId) ?? null;
      }
      return rows[0] ?? null;
    },
    async save(input: SaveInboxSettingsInput) {
      return toInboxSettings(
        await upsertRow("support_inbox_settings", {
          tenant_id: tenantId(),
          id: input.id,
          inbox_id: input.inboxId,
          default_signature_id: input.defaultSignatureId,
          default_sla_policy_id: input.defaultSlaPolicyId,
          default_business_hours_id: input.defaultBusinessHoursId,
          round_robin_enabled: input.roundRobinEnabled,
          auto_resolve_after_days: input.autoResolveAfterDays,
          show_contact_sidecar: input.showContactSidecar,
          updated_at: nowIso(),
        }),
      );
    },
  },
  agents: {
    async list() {
      return (await allRows("support_agents")).map(toAgent);
    },
  },
  teams: {
    async list() {
      return (await allRows("support_teams")).map(toTeam);
    },
    async save(input: SaveTeamInput) {
      return toTeam(
        await upsertRow("support_teams", {
          tenant_id: tenantId(),
          id: input.id ?? genId("team"),
          name: input.name,
          slug: input.slug,
          description: input.description,
          initials: input.initials,
          updated_at: nowIso(),
        }),
      );
    },
    async delete(id) {
      await deleteById("support_teams", id);
    },
  },
  businessHours: {
    async list() {
      return (await allRows("support_business_hours")).map(toBusinessHours);
    },
    async save(input: SaveBusinessHoursInput) {
      if (input.isDefault) {
        await client()
          .from("support_business_hours")
          .update({ is_default: false })
          .eq("tenant_id", tenantId());
      }
      return toBusinessHours(
        await upsertRow("support_business_hours", {
          tenant_id: tenantId(),
          id: input.id ?? genId("biz-hours"),
          name: input.name,
          timezone: input.timezone,
          weekly_schedule: input.weeklySchedule,
          holidays: input.holidays,
          is_default: input.isDefault,
          updated_at: nowIso(),
        }),
      );
    },
    async delete(id) {
      await deleteById("support_business_hours", id);
    },
  },
  slaPolicies: {
    async list() {
      return (await allRows("support_sla_policies")).map(toSlaPolicy);
    },
    async save(input: SaveSlaPolicyInput) {
      if (input.isDefault) {
        await client()
          .from("support_sla_policies")
          .update({ is_default: false })
          .eq("tenant_id", tenantId());
      }
      return toSlaPolicy(
        await upsertRow("support_sla_policies", {
          tenant_id: tenantId(),
          id: input.id ?? genId("sla"),
          name: input.name,
          description: input.description,
          first_response_minutes: input.firstResponseMinutes,
          next_response_minutes: input.nextResponseMinutes,
          resolution_minutes: input.resolutionMinutes,
          business_hours_id: input.businessHoursId,
          is_default: input.isDefault,
          updated_at: nowIso(),
        }),
      );
    },
    async setDefault(id) {
      await client()
        .from("support_sla_policies")
        .update({ is_default: false })
        .eq("tenant_id", tenantId());
      await updateById("support_sla_policies", id, { is_default: true });
    },
    async delete(id) {
      await deleteById("support_sla_policies", id);
    },
  },
  signatures: {
    async list() {
      return (await allRows("support_signatures")).map(toSignature);
    },
    async save(input: SaveSignatureInput) {
      if (input.isDefault) {
        let query = client()
          .from("support_signatures")
          .update({ is_default: false })
          .eq("tenant_id", tenantId());
        query = input.ownerAgentId
          ? query.eq("owner_agent_id", input.ownerAgentId)
          : query.is("owner_agent_id", null);
        await query;
      }
      return toSignature(
        await upsertRow("support_signatures", {
          tenant_id: tenantId(),
          id: input.id ?? genId("sig"),
          owner_agent_id: input.ownerAgentId,
          name: input.name,
          body_text: input.bodyText,
          body_html: input.bodyHtml ?? null,
          is_default: input.isDefault,
          updated_at: nowIso(),
        }),
      );
    },
    async setDefault(id) {
      const target = toSignature(
        (await oneRow("support_signatures", id)) ??
          (() => {
            throw new Error(`Unknown signature: ${id}`);
          })(),
      );
      let query = client()
        .from("support_signatures")
        .update({ is_default: false })
        .eq("tenant_id", tenantId());
      query = target.ownerAgentId
        ? query.eq("owner_agent_id", target.ownerAgentId)
        : query.is("owner_agent_id", null);
      await query;
      await updateById("support_signatures", id, { is_default: true });
    },
    async delete(id) {
      await deleteById("support_signatures", id);
    },
  },
  automationRules: {
    async list() {
      return (await allRows("support_automation_rules")).map(toAutomationRule);
    },
    async save(input: SaveAutomationRuleInput) {
      return toAutomationRule(
        await upsertRow("support_automation_rules", {
          tenant_id: tenantId(),
          id: input.id ?? genId("automation"),
          name: input.name,
          description: input.description,
          enabled: input.enabled,
          trigger: input.trigger,
          conditions: input.conditions,
          actions: input.actions,
          updated_at: nowIso(),
        }),
      );
    },
    async toggle(input: ToggleAutomationRuleInput) {
      return toAutomationRule(
        await updateById("support_automation_rules", input.id, {
          enabled: input.enabled,
        }),
      );
    },
    async delete(id) {
      await deleteById("support_automation_rules", id);
    },
  },
  notificationPreferences: {
    async list() {
      return (await allRows("support_notification_preferences")).map(
        toNotificationPreferences,
      );
    },
    async get(agentId: string) {
      return (
        (await supabaseSupportHubAdapter.notificationPreferences.list()).find(
          (row) => row.agentId === agentId,
        ) ?? null
      );
    },
    async save(input: SaveNotificationPreferencesInput) {
      const existing =
        await supabaseSupportHubAdapter.notificationPreferences.get(
          input.agentId,
        );
      return toNotificationPreferences(
        await upsertRow("support_notification_preferences", {
          tenant_id: tenantId(),
          id: existing?.id ?? genId("notif-pref"),
          agent_id: input.agentId,
          email_mentions: input.emailMentions,
          email_assignments: input.emailAssignments,
          email_daily_digest: input.emailDailyDigest,
          in_app_mentions: input.inAppMentions,
          in_app_assignments: input.inAppAssignments,
          in_app_sla_warnings: input.inAppSlaWarnings,
          updated_at: nowIso(),
        }),
      );
    },
  },
};

export async function routeInboundEmailToSupabaseSupportHub(input: {
  tenantId: string;
  resendEmailId: string;
  inboxId: string;
  fromAddress: string;
  fromName: string | null;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  subject: string | null;
  inReplyToHeader: string | null;
  referencesHeaders: string[];
  bodyText: string;
  bodyHtml: string | null;
  receivedAt: string;
  inboundEmailRowId?: string | null;
  messageIdHeader?: string | null;
}): Promise<{ conversationId: string; messageId: string; created: boolean }> {
  return runWithTenant(input.tenantId, async () => {
    const inbox = (await supabaseSupportHubAdapter.inboxes.list()).find(
      (row) => row.id === input.inboxId,
    );
    if (!inbox) {
      throw new Error(`Unknown support inbox: ${input.inboxId}`);
    }

    const existing = await findThreadedConversation(input);
    const created = !existing;
    const conversation =
      existing ??
      (await createInboundConversation({
        inbox,
        fromAddress: input.fromAddress,
        fromName: input.fromName,
        subject: input.subject ?? "(no subject)",
        receivedAt: input.receivedAt,
      }));

    const message = await insertMessage({
      id: genId("msg-inbound"),
      conversation,
      type: "email",
      direction: "inbound",
      isPrivate: false,
      deliveryState: "delivered",
      author: donorParticipant(input.fromAddress, input.fromName),
      body: {
        json: null,
        html: input.bodyHtml ?? `<p>${input.bodyText}</p>`,
        text: input.bodyText,
      },
      emailHeaders: {
        messageId: input.messageIdHeader ?? null,
        inReplyTo: input.inReplyToHeader,
        references: input.referencesHeaders,
        subject: input.subject,
        from: input.fromAddress,
        to: input.toAddresses,
        cc: input.ccAddresses,
        bcc: input.bccAddresses,
      },
      inboundEmailId: input.inboundEmailRowId ?? null,
      postedAt: input.receivedAt,
    });
    await bumpConversationAfterMessage(conversation, message);

    return {
      conversationId: conversation.id,
      messageId: message.id,
      created,
    };
  });
}

async function runWithTenant<T>(scopedTenantId: string, fn: () => Promise<T>) {
  return runWithSupportHubTenant(scopedTenantId, fn);
}

async function findThreadedConversation(input: {
  inReplyToHeader: string | null;
  referencesHeaders: string[];
  fromAddress: string;
  subject: string | null;
}): Promise<SupportConversation | null> {
  const headerCandidates = [
    input.inReplyToHeader,
    ...input.referencesHeaders,
  ].filter((value): value is string => Boolean(value));

  if (headerCandidates.length > 0) {
    const { data, error } = await client()
      .from("support_messages")
      .select("conversation_id, email_headers")
      .eq("tenant_id", tenantId())
      .in("email_headers->>messageId", headerCandidates)
      .limit(1);
    assertDb(error, "support_messages.thread_lookup");
    const conversationId = asString(
      (data?.[0] as SupabaseRow | undefined)?.conversation_id,
    );
    if (conversationId) {
      return supabaseSupportHubAdapter.conversations.get(conversationId);
    }
  }

  const normalizedSubject = normalizeSubject(input.subject);
  const conversations = await supabaseSupportHubAdapter.conversations.list({
    q: input.fromAddress,
  });
  return (
    conversations.find(
      (conversation) =>
        conversation.externalContactEmail.toLowerCase() ===
          input.fromAddress.toLowerCase() &&
        normalizeSubject(conversation.subject) === normalizedSubject &&
        conversation.status !== "resolved",
    ) ?? null
  );
}

async function createInboundConversation(input: {
  inbox: SupportInbox;
  fromAddress: string;
  fromName: string | null;
  subject: string;
  receivedAt: string;
}): Promise<SupportConversation> {
  const id = genId("conv");
  const { error } = await client().from("support_conversations").insert({
    tenant_id: tenantId(),
    id,
    inbox_id: input.inbox.id,
    subject: input.subject,
    status: "open",
    priority: "normal",
    channel: "email",
    external_contact_email: input.fromAddress,
    external_contact_name: input.fromName,
    contact_ref: null,
    unread_count: 0,
    message_count: 0,
    first_message_at: input.receivedAt,
    last_message_at: input.receivedAt,
    last_customer_message_at: input.receivedAt,
    last_message_direction: "inbound",
    board_order: 0,
    created_at: input.receivedAt,
    updated_at: input.receivedAt,
  });
  assertDb(error, "support_conversations.insert");
  return getConversationOrThrow(id);
}

function normalizeSubject(subject: string | null): string {
  return (subject ?? "")
    .replace(/^\s*(re|fw|fwd):\s*/i, "")
    .trim()
    .toLowerCase();
}
