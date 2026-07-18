import type { EveVerifiedAuditIdentity } from "./types";
import type { EveSessionIdentity } from "../session-ownership/types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { UserRole } from "@asym/database/types";

export function createAdminEveAuditIdentity(
  auth: AuthenticatedContext,
): EveVerifiedAuditIdentity {
  return {
    actorId: auth.userId,
    actorProfileId: auth.profileId,
    actorRole: auth.role,
    identityMode: "admin",
    initiatorId: auth.userId,
    initiatorType: "authenticated_admin",
    tenantId: auth.tenantId,
  } as EveVerifiedAuditIdentity;
}

export function createServiceEveAuditIdentity(input: {
  serviceId: string;
  initiatorId: string;
  initiatorType: "admin" | "schedule" | "system";
  tenantId?: string;
}): EveVerifiedAuditIdentity {
  return {
    actorId: input.serviceId,
    identityMode: "service",
    initiatorId: input.initiatorId,
    initiatorType: input.initiatorType,
    tenantId: input.tenantId,
  } as EveVerifiedAuditIdentity;
}

export function createGithubBotEveAuditIdentity(input: {
  botId: string;
  actorProfileId?: string;
  actorRole?: UserRole;
  initiatorId: string;
  initiatorType: "github_sender" | "schedule" | "system" | "webhook";
  tenantId?: string;
}): EveVerifiedAuditIdentity {
  return {
    actorId: input.botId,
    actorProfileId: input.actorProfileId,
    actorRole: input.actorRole,
    identityMode: "github_bot",
    initiatorId: input.initiatorId,
    initiatorType: input.initiatorType,
    tenantId: input.tenantId,
  } as EveVerifiedAuditIdentity;
}

/**
 * Converts an already verified, branded Eve session identity into the audit
 * tracer's branded identity. No prompt or tool input participates in this
 * conversion; tenant and actor scope remain those established by #426.
 */
export function createSessionEveAuditIdentity(
  identity: EveSessionIdentity,
): EveVerifiedAuditIdentity {
  return {
    actorId: identity.actorId,
    actorProfileId:
      identity.identityMode === "admin" ? identity.actorProfileId : undefined,
    actorRole:
      identity.identityMode === "admin" ? identity.actorRole : undefined,
    identityMode: identity.identityMode,
    initiatorId: identity.initiatorId,
    initiatorType: identity.initiatorType,
    tenantId: identity.tenantId,
  } as EveVerifiedAuditIdentity;
}
