import { createHash } from "node:crypto";

import { z } from "zod";

import { classifyEveAdminMemoryExclusions } from "../admin-memory";
import { EVE_NOTIFICATION_CHANNELS } from "./types";
import { EVE_ENGINEERING_MONITOR_TYPES } from "../engineering-monitors/types";

import type {
  EveNotificationChannel,
  EveNotificationEnvelope,
  EveNotificationRenderedMessage,
} from "./types";
import type {
  EveEngineeringFinding,
  EveEngineeringFindingSeverity,
} from "../engineering-monitors/types";

const SAFE_DETAIL_KEYS = new Set([
  "advisoryId",
  "advisorySeverity",
  "alertSource",
  "checkId",
  "conclusion",
  "deterministicStatus",
  "judgeStatus",
  "matchedRules",
  "pullRequestNumber",
  "remaining",
  "resetAt",
  "reviewState",
  "scope",
  "status",
  "suite",
  "thresholdSeconds",
  "total",
  "workflowName",
]);

const envelopeSchema = z
  .object({
    version: z.literal("eve-notification-v1"),
    eventId: z.string().uuid(),
    eventType: z.enum(EVE_ENGINEERING_MONITOR_TYPES),
    severity: z.enum(["low", "medium", "high", "critical"]),
    sourceKind: z.literal("engineering_monitor"),
    sourceId: z.string().trim().min(1).max(300),
    targetId: z.string().trim().min(1).max(300),
    occurredAt: z.string().datetime({ offset: true }),
    decisionSummary: z.string().trim().min(1).max(1_000),
    safeReference: z.string().url().optional(),
    allowedDetails: z.record(
      z.string(),
      z.union([
        z.string().trim().min(1).max(500),
        z.number().finite(),
        z.array(z.string().trim().min(1).max(200)).max(20),
      ]),
    ),
    policyVersion: z.number().int().positive(),
    redactionVersion: z.literal("eve-notification-redaction-v1"),
    expiresAt: z.string().datetime({ offset: true }),
  })
  .strict();

function sanitizeReference(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") {
    return undefined;
  }
  if (parsed.username || parsed.password) return undefined;
  return `${parsed.origin}${parsed.pathname}`;
}

function safeScalar(value: unknown): string | number | string[] | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 500) return undefined;
    if (classifyEveAdminMemoryExclusions(trimmed).length > 0) return undefined;
    if (
      /\b(?:raw[_ -]?log|replay|debug[_ -]?artifact|reasoning|prompt)\b/iu.test(
        trimmed,
      )
    ) {
      return undefined;
    }
    return trimmed;
  }
  if (Array.isArray(value)) {
    const normalized = value.flatMap((item) => {
      if (typeof item !== "string") return [];
      const trimmed = item.trim();
      return trimmed &&
        trimmed.length <= 200 &&
        classifyEveAdminMemoryExclusions(trimmed).length === 0
        ? [trimmed]
        : [];
    });
    return normalized.length > 0 ? normalized.slice(0, 20) : undefined;
  }
  return undefined;
}

function selectAllowedDetails(
  evidence: Record<string, unknown>,
): Record<string, string | number | string[]> {
  return Object.fromEntries(
    Object.entries(evidence).flatMap(([key, value]) => {
      if (!SAFE_DETAIL_KEYS.has(key)) return [];
      const selected = safeScalar(value);
      return selected === undefined ? [] : [[key, selected]];
    }),
  );
}

export function prepareEveNotificationEnvelope(input: {
  finding: EveEngineeringFinding;
  now: string;
  ttlSeconds?: number;
}): EveNotificationEnvelope {
  const now = z.string().datetime({ offset: true }).parse(input.now);
  const ttlSeconds = z
    .number()
    .int()
    .min(300)
    .max(86_400)
    .parse(input.ttlSeconds ?? 21_600);
  const decisionSummary = input.finding.decisionSummary.trim();
  if (classifyEveAdminMemoryExclusions(decisionSummary).length > 0) {
    throw new Error("Eve notification summary crossed a data boundary.");
  }
  const envelope = {
    version: "eve-notification-v1",
    eventId: input.finding.id,
    eventType: input.finding.signalType,
    severity: input.finding.severity,
    sourceKind: "engineering_monitor",
    sourceId: input.finding.monitorId,
    targetId: input.finding.targetId,
    occurredAt: input.finding.lastObservedAt,
    decisionSummary,
    safeReference: sanitizeReference(input.finding.safeEvidence.safeUrl),
    allowedDetails: selectAllowedDetails(input.finding.safeEvidence),
    policyVersion: input.finding.policyVersion,
    redactionVersion: "eve-notification-redaction-v1",
    expiresAt: new Date(Date.parse(now) + ttlSeconds * 1_000).toISOString(),
  } as const;
  return envelopeSchema.parse(envelope);
}

function severityBand(severity: EveEngineeringFindingSeverity): string {
  return severity === "critical"
    ? "critical"
    : severity === "high"
      ? "high"
      : "standard";
}

export function createEveNotificationDedupeKey(input: {
  channel: EveNotificationChannel;
  dedupeWindowSeconds: number;
  destinationClass: string;
  envelope: EveNotificationEnvelope;
}): string {
  z.enum(EVE_NOTIFICATION_CHANNELS).parse(input.channel);
  const window = z
    .number()
    .int()
    .min(60)
    .max(2_592_000)
    .parse(input.dedupeWindowSeconds);
  const bucket = Math.floor(
    Date.parse(input.envelope.occurredAt) / (window * 1_000),
  );
  return createHash("sha256")
    .update(
      JSON.stringify({
        eventType: input.envelope.eventType,
        targetId: input.envelope.targetId,
        severityBand: severityBand(input.envelope.severity),
        channel: input.channel,
        destinationClass: input.destinationClass,
        bucket,
      }),
    )
    .digest("hex");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeDiscordText(value: string): string {
  return value.replaceAll("@", "@\u200b").replaceAll("`", "ˋ");
}

export function renderEveEmailNotification(
  envelope: EveNotificationEnvelope,
): EveNotificationRenderedMessage {
  const reference = envelope.safeReference
    ? `\nEvidence: ${envelope.safeReference}`
    : "";
  const text = `${envelope.severity.toUpperCase()} — ${envelope.eventType}\n\n${envelope.decisionSummary}\n\nObserved: ${envelope.occurredAt}${reference}\n\nReview in Eve Mission Control.`;
  return {
    subject: `[Eve ${envelope.severity}] ${envelope.eventType}`,
    text,
    html: `<h1>${escapeHtml(envelope.severity.toUpperCase())} — ${escapeHtml(envelope.eventType)}</h1><p>${escapeHtml(envelope.decisionSummary)}</p><p>Observed: ${escapeHtml(envelope.occurredAt)}</p>${envelope.safeReference ? `<p><a href="${escapeHtml(envelope.safeReference)}">Open safe evidence</a></p>` : ""}<p>Review in Eve Mission Control.</p>`,
  };
}

export function renderEveDiscordNotification(input: {
  envelope: EveNotificationEnvelope;
  richDetailEnabled: boolean;
}): EveNotificationRenderedMessage {
  const lines = [
    `**Eve ${input.envelope.severity.toUpperCase()}** — ${safeDiscordText(input.envelope.eventType)}`,
    safeDiscordText(input.envelope.decisionSummary),
    `Observed: ${input.envelope.occurredAt}`,
  ];
  if (input.envelope.safeReference) lines.push(input.envelope.safeReference);
  if (input.richDetailEnabled) {
    for (const [key, value] of Object.entries(input.envelope.allowedDetails)) {
      const rendered = Array.isArray(value) ? value.join(", ") : String(value);
      lines.push(`• ${safeDiscordText(key)}: ${safeDiscordText(rendered)}`);
    }
  }
  return { text: lines.join("\n").slice(0, 2_000) };
}
