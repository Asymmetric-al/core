import { sendEmail } from "@asym/email";

import { decryptResendApiKey } from "../../email/crypto";
import {
  createEveAuditStore,
  createServiceEveAuditIdentity,
  traceEveAuditEvent,
} from "../audit";
import { loadEveGovernanceSnapshot } from "../governance";
import { evaluateEveNotificationGate } from "./control";
import {
  createEveNotificationDedupeKey,
  prepareEveNotificationEnvelope,
  renderEveDiscordNotification,
  renderEveEmailNotification,
} from "./envelope";
import { createEveNotificationChannelDefaults } from "./registry";
import {
  completeEveNotificationAttempt,
  createEveNotificationRecord,
  ensureEveNotificationChannelConfigs,
  listEveNotificationRecipients,
  loadEveNotificationChannels,
} from "./store";

import type {
  EveNotificationChannelConfig,
  EveNotificationRecipient,
  EveNotificationRecord,
  EveNotificationRequest,
} from "./types";
import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveVerifiedAuditIdentity } from "../audit/types";
import type { EveGovernanceSnapshot } from "../governance/types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

interface ProviderOutcome {
  success: boolean;
  retryable: boolean;
  responseClass: string;
  messageId?: string;
  errorCode?: string;
}

export function resolveEveNotificationAttemptState(input: {
  attemptCount: number;
  maxAttempts: number;
  now: Date;
  outcome: Pick<ProviderOutcome, "retryable" | "success">;
  retryBaseSeconds: number;
}): {
  nextAttemptAt?: string;
  retryable: boolean;
  status: "delivered" | "retryable_failed" | "terminal_failed";
} {
  const attemptsAfter = input.attemptCount + 1;
  const retryable =
    input.outcome.retryable && attemptsAfter < input.maxAttempts;
  const status = input.outcome.success
    ? "delivered"
    : retryable
      ? "retryable_failed"
      : "terminal_failed";
  if (!retryable) return { retryable, status };
  return {
    nextAttemptAt: new Date(
      input.now.getTime() +
        input.retryBaseSeconds * 2 ** input.attemptCount * 1_000,
    ).toISOString(),
    retryable,
    status,
  };
}

export interface EveNotificationDeliveryDependencies {
  sendEmail?: typeof sendEmail;
  fetchDiscord?: typeof fetch;
}

function notificationIdentity(input: {
  sourceTrigger: string;
  tenantId: string;
}): EveVerifiedAuditIdentity {
  return createServiceEveAuditIdentity({
    initiatorId: input.sourceTrigger,
    initiatorType: "schedule",
    serviceId: "eve-notification-delivery",
    tenantId: input.tenantId,
  });
}

async function auditNotification(input: {
  action: string;
  evidence: Record<string, unknown>;
  identity: EveVerifiedAuditIdentity;
  recordId: string;
  result: "blocked" | "failed" | "skipped" | "started" | "succeeded";
  supabaseAdmin: AdminSupabaseClient;
}) {
  await traceEveAuditEvent({
    store: createEveAuditStore(input.supabaseAdmin),
    event: {
      action: input.action,
      change: { notificationRecord: input.recordId },
      decision: {
        rationale: "App-owned Eve notification policy was evaluated.",
        risk: "External operator notification",
        reversalOrFollowUp:
          "Pause the notification channel in Mission Control.",
      },
      evidence: input.evidence,
      identity: input.identity,
      modelRole: "not_used",
      policy: {
        id: "eve-email-discord-notifications-v1",
        status: input.result,
      },
      result: input.result,
      runId: input.recordId,
      target: `notification:${input.recordId}`,
      toolName: "eve_notification_delivery",
    },
  });
}

function destinationClasses(input: {
  channel: EveNotificationChannelConfig;
  recipients: EveNotificationRecipient[];
}) {
  if (input.channel.channel === "discord") {
    return [
      {
        destinationClass: input.channel.destinationKey,
        recipientProfileId: undefined,
      },
    ];
  }
  return input.recipients
    .filter((recipient) => recipient.enabled && !recipient.optedOut)
    .map((recipient) => ({
      destinationClass: `platform-owner:${recipient.profileId}`,
      recipientProfileId: recipient.profileId,
    }));
}

export async function enqueueEveEngineeringFindingNotifications(input: {
  request: EveNotificationRequest;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<{ created: number; deduplicated: number; suppressed: number }> {
  const governance = await loadEveGovernanceSnapshot({
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!governance) throw new Error("Eve governance state is unavailable.");
  await ensureEveNotificationChannelConfigs({
    configs: createEveNotificationChannelDefaults({
      policyVersion: governance.stateVersion,
      tenantId: input.request.finding.tenantId,
    }),
    supabaseAdmin: input.supabaseAdmin,
  });
  const [channels, recipients] = await Promise.all([
    loadEveNotificationChannels({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.request.finding.tenantId,
    }),
    listEveNotificationRecipients({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.request.finding.tenantId,
    }),
  ]);
  const envelope = prepareEveNotificationEnvelope({
    finding: input.request.finding,
    now: new Date().toISOString(),
  });
  const identity = notificationIdentity({
    sourceTrigger: input.request.sourceTrigger,
    tenantId: input.request.finding.tenantId,
  });
  const result = { created: 0, deduplicated: 0, suppressed: 0 };
  for (const channel of channels) {
    const gate = evaluateEveNotificationGate({
      config: channel,
      expiresAt: envelope.expiresAt,
      governance,
      now: new Date().toISOString(),
      severity: envelope.severity,
      sourcePolicyVersion: envelope.policyVersion,
    });
    if (!gate.allowed) {
      result.suppressed += 1;
      await auditNotification({
        action: "notification.enqueue_suppressed",
        evidence: { channel: channel.channel, reason: gate.reason },
        identity,
        recordId: envelope.eventId,
        result: "skipped",
        supabaseAdmin: input.supabaseAdmin,
      });
      continue;
    }
    const destinations = destinationClasses({ channel, recipients });
    if (destinations.length === 0) {
      result.suppressed += 1;
      await auditNotification({
        action: "notification.enqueue_suppressed",
        evidence: {
          channel: channel.channel,
          reason: "no_eligible_destination",
        },
        identity,
        recordId: envelope.eventId,
        result: "skipped",
        supabaseAdmin: input.supabaseAdmin,
      });
      continue;
    }
    for (const destination of destinations) {
      const dedupeKey = createEveNotificationDedupeKey({
        channel: channel.channel,
        dedupeWindowSeconds: channel.dedupeWindowSeconds,
        destinationClass: destination.destinationClass,
        envelope,
      });
      const saved = await createEveNotificationRecord({
        channel: channel.channel,
        dedupeKey,
        destinationClass: destination.destinationClass,
        envelope,
        idempotencyKey: `eve-notification/${dedupeKey}`,
        recipientProfileId: destination.recipientProfileId,
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.request.finding.tenantId,
      });
      if (saved.created) result.created += 1;
      else result.deduplicated += 1;
      await auditNotification({
        action: saved.created
          ? "notification.enqueued"
          : "notification.deduplicated",
        evidence: {
          channel: channel.channel,
          destinationClass: destination.destinationClass,
          redactionVersion: envelope.redactionVersion,
        },
        identity,
        recordId: saved.record.id,
        result: saved.created ? "succeeded" : "skipped",
        supabaseAdmin: input.supabaseAdmin,
      });
    }
  }
  return result;
}

function validDiscordWebhook(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return undefined;
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "discord.com" ||
    !/^\/api\/webhooks\/\d+\/[A-Za-z0-9._-]+$/u.test(parsed.pathname)
  ) {
    return undefined;
  }
  parsed.search = "?wait=true";
  parsed.hash = "";
  return parsed.toString();
}

async function sendDiscordProvider(input: {
  config: EveNotificationChannelConfig;
  fetchDiscord: typeof fetch;
  record: EveNotificationRecord;
}): Promise<ProviderOutcome> {
  const webhook = validDiscordWebhook(process.env.EVE_DISCORD_WEBHOOK_URL);
  if (!webhook) {
    return {
      success: false,
      retryable: false,
      responseClass: "configuration_error",
      errorCode: "discord_webhook_unavailable",
    };
  }
  const rendered = renderEveDiscordNotification({
    envelope: input.record.envelope,
    richDetailEnabled: input.config.richDetailEnabled,
  });
  const response = await input.fetchDiscord(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      content: rendered.text,
      allowed_mentions: { parse: [] },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (response.ok) {
    const body = (await response.json().catch(() => null)) as {
      id?: string;
    } | null;
    return {
      success: true,
      retryable: false,
      responseClass: "accepted",
      messageId: body?.id,
    };
  }
  const retryable = response.status === 429 || response.status >= 500;
  return {
    success: false,
    retryable,
    responseClass: retryable ? "transient_provider_error" : "provider_rejected",
    errorCode: `discord_http_${response.status}`,
  };
}

async function sendEmailProvider(input: {
  record: EveNotificationRecord;
  recipient: EveNotificationRecipient;
  send: typeof sendEmail;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<ProviderOutcome> {
  const { data: settings, error } = await input.supabaseAdmin
    .from("tenant_email_settings")
    .select(
      "is_connected, default_from_email, default_from_name, reply_to_email, resend_api_key_encrypted",
    )
    .eq("tenant_id", input.record.tenantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (
    !settings?.is_connected ||
    !settings.default_from_email ||
    !settings.resend_api_key_encrypted
  ) {
    return {
      success: false,
      retryable: false,
      responseClass: "configuration_error",
      errorCode: "resend_unavailable",
    };
  }
  const rendered = renderEveEmailNotification(input.record.envelope);
  const result = await input.send(
    decryptResendApiKey(settings.resend_api_key_encrypted),
    {
      to: {
        email: input.recipient.email,
        name: input.recipient.displayName,
      },
      from: {
        email: settings.default_from_email,
        name: settings.default_from_name ?? "Asymmetric",
      },
      replyTo: settings.reply_to_email
        ? { email: settings.reply_to_email }
        : undefined,
      subject: rendered.subject ?? "Eve operator notification",
      html: rendered.html ?? `<p>${rendered.text}</p>`,
      text: rendered.text,
      idempotencyKey: input.record.idempotencyKey,
      customArgs: {
        source: "eve_operator_notification",
        notificationId: input.record.id,
      },
    },
  );
  const errorCode = result.errors?.[0]?.code;
  const retryable = result.rateLimited || errorCode === "server_error";
  return result.success
    ? {
        success: true,
        retryable: false,
        responseClass: "accepted",
        messageId: result.messageId,
      }
    : {
        success: false,
        retryable: Boolean(retryable),
        responseClass: retryable
          ? "transient_provider_error"
          : "provider_rejected",
        errorCode: errorCode ?? "resend_send_failed",
      };
}

export async function deliverEveNotificationRecord(input: {
  config: EveNotificationChannelConfig;
  consultPolicy: (targetKey: string) => Promise<EvePolicyConsultResult>;
  governance: EveGovernanceSnapshot;
  identity: EveVerifiedAuditIdentity;
  now: Date;
  record: EveNotificationRecord;
  supabaseAdmin: AdminSupabaseClient;
  dependencies?: EveNotificationDeliveryDependencies;
}): Promise<void> {
  const gate = evaluateEveNotificationGate({
    config: input.config,
    expiresAt: input.record.deliveryExpiresAt,
    governance: input.governance,
    now: input.now.toISOString(),
    severity: input.record.envelope.severity,
    sourcePolicyVersion: input.record.envelope.policyVersion,
  });
  if (!gate.allowed) {
    await completeEveNotificationAttempt({
      providerResponseClass: "policy_suppressed",
      record: input.record,
      status:
        gate.reason === "notification_expired" ? "cancelled" : "suppressed",
      supabaseAdmin: input.supabaseAdmin,
    });
    await auditNotification({
      action: "notification.delivery_suppressed",
      evidence: { channel: input.record.channel, reason: gate.reason },
      identity: input.identity,
      recordId: input.record.id,
      result: "skipped",
      supabaseAdmin: input.supabaseAdmin,
    });
    return;
  }
  let recipient: EveNotificationRecipient | undefined;
  if (input.record.channel === "email") {
    recipient = (
      await listEveNotificationRecipients({
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.record.tenantId,
      })
    ).find(
      (value) =>
        value.profileId === input.record.recipientProfileId &&
        value.enabled &&
        !value.optedOut,
    );
    if (!recipient) {
      await completeEveNotificationAttempt({
        providerResponseClass: "recipient_ineligible",
        record: input.record,
        status: "cancelled",
        supabaseAdmin: input.supabaseAdmin,
      });
      return;
    }
  }
  const policy = await input.consultPolicy(
    `eve_notification:${input.record.id}:${input.record.attemptCount + 1}`,
  );
  if (policy.decision !== "allow") {
    await completeEveNotificationAttempt({
      errorCode: policy.reason,
      providerResponseClass: "policy_denied",
      record: input.record,
      status: "suppressed",
      supabaseAdmin: input.supabaseAdmin,
    });
    return;
  }
  await auditNotification({
    action: "notification.delivery_started",
    evidence: {
      attempt: input.record.attemptCount + 1,
      channel: input.record.channel,
      destinationClass: input.record.destinationClass,
    },
    identity: input.identity,
    recordId: input.record.id,
    result: "started",
    supabaseAdmin: input.supabaseAdmin,
  });
  let outcome: ProviderOutcome;
  try {
    outcome =
      input.record.channel === "discord"
        ? await sendDiscordProvider({
            config: input.config,
            fetchDiscord: input.dependencies?.fetchDiscord ?? fetch,
            record: input.record,
          })
        : await sendEmailProvider({
            record: input.record,
            recipient: recipient!,
            send: input.dependencies?.sendEmail ?? sendEmail,
            supabaseAdmin: input.supabaseAdmin,
          });
  } catch {
    outcome = {
      success: false,
      retryable: true,
      responseClass: "network_error",
      errorCode: "provider_network_error",
    };
  }
  const attemptsAfter = input.record.attemptCount + 1;
  const attempt = resolveEveNotificationAttemptState({
    attemptCount: input.record.attemptCount,
    maxAttempts: input.config.maxAttempts,
    now: input.now,
    outcome,
    retryBaseSeconds: input.config.retryBaseSeconds,
  });
  await completeEveNotificationAttempt({
    errorCode: outcome.errorCode,
    nextAttemptAt: attempt.nextAttemptAt,
    providerMessageId: outcome.messageId,
    providerResponseClass: outcome.responseClass,
    record: input.record,
    status: attempt.status,
    supabaseAdmin: input.supabaseAdmin,
  });
  await auditNotification({
    action: outcome.success
      ? "notification.delivery_succeeded"
      : "notification.delivery_failed",
    evidence: {
      attempt: attemptsAfter,
      channel: input.record.channel,
      providerResponseClass: outcome.responseClass,
      retryable: attempt.retryable,
    },
    identity: input.identity,
    recordId: input.record.id,
    result: outcome.success ? "succeeded" : "failed",
    supabaseAdmin: input.supabaseAdmin,
  });
}
