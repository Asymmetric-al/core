import type {
  EveEngineeringFinding,
  EveEngineeringFindingSeverity,
  EveEngineeringMonitorType,
} from "../engineering-monitors/types";

export const EVE_NOTIFICATION_CHANNELS = ["email", "discord"] as const;
export type EveNotificationChannel = (typeof EVE_NOTIFICATION_CHANNELS)[number];

export const EVE_NOTIFICATION_STATUSES = [
  "pending",
  "suppressed",
  "sending",
  "delivered",
  "retryable_failed",
  "terminal_failed",
  "cancelled",
] as const;
export type EveNotificationStatus = (typeof EVE_NOTIFICATION_STATUSES)[number];

export interface EveNotificationEnvelope {
  version: "eve-notification-v1";
  eventId: string;
  eventType: EveEngineeringMonitorType;
  severity: EveEngineeringFindingSeverity;
  sourceKind: "engineering_monitor";
  sourceId: string;
  targetId: string;
  occurredAt: string;
  decisionSummary: string;
  safeReference?: string;
  allowedDetails: Record<string, string | number | string[]>;
  policyVersion: number;
  redactionVersion: "eve-notification-redaction-v1";
  expiresAt: string;
}

export interface EveNotificationChannelConfig {
  tenantId: string;
  channel: EveNotificationChannel;
  enabled: boolean;
  paused: boolean;
  minimumSeverity: EveEngineeringFindingSeverity;
  richDetailEnabled: boolean;
  destinationKey: string;
  dedupeWindowSeconds: number;
  maxAttempts: number;
  retryBaseSeconds: number;
  policyVersion: number;
}

export interface EveNotificationRecipient {
  tenantId: string;
  profileId: string;
  email: string;
  displayName?: string;
  role: "super_admin";
  enabled: boolean;
  optedOut: boolean;
}

export interface EveNotificationRecord {
  id: string;
  tenantId: string;
  channel: EveNotificationChannel;
  destinationClass: string;
  recipientProfileId?: string;
  envelope: EveNotificationEnvelope;
  dedupeKey: string;
  idempotencyKey: string;
  status: EveNotificationStatus;
  attemptCount: number;
  nextAttemptAt: string;
  deliveryExpiresAt: string;
  providerMessageId?: string;
  providerResponseClass?: string;
  lastErrorCode?: string;
  leaseToken?: string;
}

export interface EveNotificationAdminView {
  channels: EveNotificationChannelConfig[];
  recipients: EveNotificationRecipient[];
  recentNotifications: EveNotificationRecord[];
}

export interface EveNotificationRequest {
  finding: EveEngineeringFinding;
  sourceTrigger: string;
}

export interface EveNotificationRenderedMessage {
  subject?: string;
  text: string;
  html?: string;
}
