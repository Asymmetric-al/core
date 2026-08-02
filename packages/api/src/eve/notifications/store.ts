import { z } from "zod";

import {
  EVE_NOTIFICATION_CHANNELS,
  EVE_NOTIFICATION_STATUSES,
  type EveNotificationAdminView,
  type EveNotificationChannelConfig,
  type EveNotificationEnvelope,
  type EveNotificationRecipient,
  type EveNotificationRecord,
} from "./types";
import {
  EVE_ENGINEERING_FINDING_SEVERITIES,
  EVE_ENGINEERING_MONITOR_TYPES,
} from "../engineering-monitors/types";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const channelRowSchema = z.object({
  tenant_id: z.string().uuid(),
  channel: z.enum(EVE_NOTIFICATION_CHANNELS),
  enabled: z.boolean(),
  paused: z.boolean(),
  minimum_severity: z.enum(EVE_ENGINEERING_FINDING_SEVERITIES),
  rich_detail_enabled: z.boolean(),
  destination_key: z.string(),
  dedupe_window_seconds: z.number().int().positive(),
  max_attempts: z.number().int().positive(),
  retry_base_seconds: z.number().int().positive(),
  policy_version: z.number().int().positive(),
});

const envelopeSchema = z.object({
  version: z.literal("eve-notification-v1"),
  eventId: z.string().uuid(),
  eventType: z.enum(EVE_ENGINEERING_MONITOR_TYPES),
  severity: z.enum(EVE_ENGINEERING_FINDING_SEVERITIES),
  sourceKind: z.literal("engineering_monitor"),
  sourceId: z.string(),
  targetId: z.string(),
  occurredAt: z.string(),
  decisionSummary: z.string(),
  safeReference: z.string().optional(),
  allowedDetails: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.array(z.string())]),
  ),
  policyVersion: z.number().int().positive(),
  redactionVersion: z.literal("eve-notification-redaction-v1"),
  expiresAt: z.string(),
});

const recordRowSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  channel: z.enum(EVE_NOTIFICATION_CHANNELS),
  destination_class: z.string(),
  recipient_profile_id: z.string().uuid().nullable(),
  safe_envelope: envelopeSchema,
  dedupe_key: z.string(),
  idempotency_key: z.string(),
  status: z.enum(EVE_NOTIFICATION_STATUSES),
  attempt_count: z.number().int().nonnegative(),
  next_attempt_at: z.string(),
  delivery_expires_at: z.string(),
  provider_message_id: z.string().nullable(),
  provider_response_class: z.string().nullable(),
  last_error_code: z.string().nullable(),
  lease_token: z.string().uuid().nullable().optional(),
});

function toChannel(row: unknown): EveNotificationChannelConfig {
  const value = channelRowSchema.parse(row);
  return {
    tenantId: value.tenant_id,
    channel: value.channel,
    enabled: value.enabled,
    paused: value.paused,
    minimumSeverity: value.minimum_severity,
    richDetailEnabled: value.rich_detail_enabled,
    destinationKey: value.destination_key,
    dedupeWindowSeconds: value.dedupe_window_seconds,
    maxAttempts: value.max_attempts,
    retryBaseSeconds: value.retry_base_seconds,
    policyVersion: value.policy_version,
  };
}

function channelRow(config: EveNotificationChannelConfig) {
  return {
    tenant_id: config.tenantId,
    channel: config.channel,
    enabled: config.enabled,
    paused: config.paused,
    minimum_severity: config.minimumSeverity,
    rich_detail_enabled: config.richDetailEnabled,
    destination_key: config.destinationKey,
    dedupe_window_seconds: config.dedupeWindowSeconds,
    max_attempts: config.maxAttempts,
    retry_base_seconds: config.retryBaseSeconds,
    policy_version: config.policyVersion,
  };
}

function toRecord(row: unknown): EveNotificationRecord {
  const value = recordRowSchema.parse(row);
  return {
    id: value.id,
    tenantId: value.tenant_id,
    channel: value.channel,
    destinationClass: value.destination_class,
    recipientProfileId: value.recipient_profile_id ?? undefined,
    envelope: value.safe_envelope as EveNotificationEnvelope,
    dedupeKey: value.dedupe_key,
    idempotencyKey: value.idempotency_key,
    status: value.status,
    attemptCount: value.attempt_count,
    nextAttemptAt: value.next_attempt_at,
    deliveryExpiresAt: value.delivery_expires_at,
    providerMessageId: value.provider_message_id ?? undefined,
    providerResponseClass: value.provider_response_class ?? undefined,
    lastErrorCode: value.last_error_code ?? undefined,
    leaseToken: value.lease_token ?? undefined,
  };
}

export async function ensureEveNotificationChannelConfigs(input: {
  configs: EveNotificationChannelConfig[];
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { error } = await input.supabaseAdmin
    .from("eve_notification_channel_configs")
    .upsert(input.configs.map(channelRow), {
      ignoreDuplicates: true,
      onConflict: "tenant_id,channel",
    });
  if (error) throw new Error(error.message);
}

export async function loadEveNotificationChannels(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveNotificationChannelConfig[]> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_notification_channel_configs")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .order("channel");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toChannel);
}

export async function listEveNotificationRecipients(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveNotificationRecipient[]> {
  const [profiles, preferences] = await Promise.all([
    input.supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, full_name, role")
      .eq("tenant_id", input.tenantId)
      .eq("role", "super_admin")
      .not("email", "is", null),
    input.supabaseAdmin
      .from("eve_notification_recipient_configs")
      .select("profile_id, enabled, opted_out")
      .eq("tenant_id", input.tenantId),
  ]);
  const error = profiles.error ?? preferences.error;
  if (error) throw new Error(error.message);
  const preferenceMap = new Map(
    z
      .array(
        z.object({
          profile_id: z.string().uuid(),
          enabled: z.boolean(),
          opted_out: z.boolean(),
        }),
      )
      .parse(preferences.data ?? [])
      .map((value) => [value.profile_id, value]),
  );
  return z
    .array(
      z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        display_name: z.string().nullable(),
        full_name: z.string().nullable(),
        role: z.literal("super_admin"),
      }),
    )
    .parse(profiles.data ?? [])
    .map((profile) => {
      const preference = preferenceMap.get(profile.id);
      return {
        tenantId: input.tenantId,
        profileId: profile.id,
        email: profile.email,
        displayName: profile.display_name ?? profile.full_name ?? undefined,
        role: profile.role,
        enabled: preference?.enabled ?? false,
        optedOut: preference?.opted_out ?? true,
      };
    });
}

export async function setEveNotificationRecipient(input: {
  enabled: boolean;
  optedOut: boolean;
  profileId: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<void> {
  const { data: profile, error: profileError } = await input.supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", input.profileId)
    .eq("tenant_id", input.tenantId)
    .eq("role", "super_admin")
    .not("email", "is", null)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile)
    throw new Error("Notification recipient is not a platform owner.");
  const { error } = await input.supabaseAdmin
    .from("eve_notification_recipient_configs")
    .upsert(
      {
        tenant_id: input.tenantId,
        profile_id: input.profileId,
        enabled: input.enabled,
        opted_out: input.optedOut,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,profile_id" },
    );
  if (error) throw new Error(error.message);
}

export async function updateEveNotificationChannel(input: {
  channel: EveNotificationChannelConfig["channel"];
  enabled?: boolean;
  minimumSeverity?: EveNotificationChannelConfig["minimumSeverity"];
  paused?: boolean;
  policyVersion: number;
  richDetailEnabled?: boolean;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<void> {
  const changes = {
    ...(input.enabled === undefined ? {} : { enabled: input.enabled }),
    ...(input.paused === undefined ? {} : { paused: input.paused }),
    ...(input.minimumSeverity === undefined
      ? {}
      : { minimum_severity: input.minimumSeverity }),
    ...(input.richDetailEnabled === undefined
      ? {}
      : { rich_detail_enabled: input.richDetailEnabled }),
    updated_at: new Date().toISOString(),
    policy_version: input.policyVersion,
  };
  const { error } = await input.supabaseAdmin
    .from("eve_notification_channel_configs")
    .update(changes)
    .eq("tenant_id", input.tenantId)
    .eq("channel", input.channel);
  if (error) throw new Error(error.message);
}

export async function createEveNotificationRecord(input: {
  channel: EveNotificationChannelConfig["channel"];
  dedupeKey: string;
  destinationClass: string;
  envelope: EveNotificationEnvelope;
  idempotencyKey: string;
  recipientProfileId?: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<{ created: boolean; record: EveNotificationRecord }> {
  const id = crypto.randomUUID();
  const { data, error } = await input.supabaseAdmin
    .from("eve_notification_records")
    .upsert(
      {
        id,
        tenant_id: input.tenantId,
        channel: input.channel,
        destination_class: input.destinationClass,
        recipient_profile_id: input.recipientProfileId ?? null,
        safe_envelope: input.envelope,
        dedupe_key: input.dedupeKey,
        idempotency_key: input.idempotencyKey,
        status: "pending",
        attempt_count: 0,
        next_attempt_at: new Date().toISOString(),
        delivery_expires_at: input.envelope.expiresAt,
        retention_category: "notification_record",
        retention_expires_at: new Date(
          Date.now() + 180 * 86_400_000,
        ).toISOString(),
      },
      { ignoreDuplicates: true, onConflict: "tenant_id,dedupe_key" },
    )
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return { created: true, record: toRecord(data) };
  const { data: existing, error: existingError } = await input.supabaseAdmin
    .from("eve_notification_records")
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("dedupe_key", input.dedupeKey)
    .single();
  if (existingError || !existing) {
    throw new Error(existingError?.message ?? "Notification dedupe failed.");
  }
  return { created: false, record: toRecord(existing) };
}

export async function claimDueEveNotificationRecords(input: {
  limit: number;
  now: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveNotificationRecord[]> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "claim_due_eve_notification_records",
    {
      p_tenant_id: input.tenantId,
      p_now: input.now,
      p_limit: input.limit,
      p_lease_seconds: 120,
    },
  );
  if (error) throw new Error(error.message);
  return z
    .array(recordRowSchema)
    .parse(data ?? [])
    .map(toRecord);
}

export async function completeEveNotificationAttempt(input: {
  errorCode?: string;
  nextAttemptAt?: string;
  providerMessageId?: string;
  providerResponseClass: string;
  record: EveNotificationRecord;
  status: Extract<
    EveNotificationRecord["status"],
    | "cancelled"
    | "delivered"
    | "retryable_failed"
    | "suppressed"
    | "terminal_failed"
  >;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  if (!input.record.leaseToken)
    throw new Error("Notification lease is missing.");
  const { error } = await input.supabaseAdmin.rpc(
    "complete_eve_notification_attempt",
    {
      p_tenant_id: input.record.tenantId,
      p_notification_id: input.record.id,
      p_lease_token: input.record.leaseToken,
      p_status: input.status,
      p_provider_message_id: input.providerMessageId ?? null,
      p_provider_response_class: input.providerResponseClass,
      p_error_code: input.errorCode ?? null,
      p_next_attempt_at: input.nextAttemptAt ?? null,
    },
  );
  if (error) throw new Error(error.message);
}

export async function loadEveNotificationAdminView(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveNotificationAdminView> {
  const [channels, recipients, records] = await Promise.all([
    loadEveNotificationChannels(input),
    listEveNotificationRecipients(input),
    input.supabaseAdmin
      .from("eve_notification_records")
      .select("*")
      .eq("tenant_id", input.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (records.error) throw new Error(records.error.message);
  return {
    channels,
    recipients,
    recentNotifications: (records.data ?? []).map(toRecord),
  };
}
