import type { UserRole } from "@asym/database/types";

export type CrmAction =
  | "crm.gateway.read"
  | "crm.metadata.read"
  | "crm.metadata.write"
  | "crm.record.read"
  | "crm.record.create"
  | "crm.record.update"
  | "crm.record.delete"
  | "crm.note.read"
  | "crm.note.create"
  | "crm.relationship.read"
  | "crm.projection.read"
  | "crm.person.create"
  | "crm.person.update"
  | "crm.sync.replay"
  | "crm.sync.reconcile";

export type CrmResourceType =
  | "crm_gateway"
  | "metadata"
  | "record"
  | "person"
  | "company"
  | "opportunity"
  | "task"
  | "note"
  | "relationship"
  | "projection"
  | "sync";

export type CrmCommandStatus =
  | "queued"
  | "attempted"
  | "succeeded"
  | "failed"
  | "skipped";

export interface ActorContext {
  userId: string;
  profileId: string | null;
  tenantId: string;
  authTenantId: string;
  role: UserRole;
  isSuperAdmin: boolean;
  action: CrmAction;
}

export interface CrmGatewayStatus {
  service: "twenty";
  configured: boolean;
  enabled: boolean;
  mode: "not_configured" | "ready" | "probe_succeeded" | "probe_failed";
  requestId?: string;
  actor: {
    userId: string;
    profileId: string | null;
    tenantId: string;
    role: UserRole;
    isSuperAdmin: boolean;
  };
  missing?: string[];
  apiBaseUrl?: string;
  workspaceId?: string;
  rateLimitRpm: number;
  hasWebhookSecret?: boolean;
  probe?: {
    ok: boolean;
    status?: number;
    error?: string;
  };
}
