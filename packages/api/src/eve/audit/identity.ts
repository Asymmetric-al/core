import type { EveVerifiedAuditIdentity } from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";

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
  initiatorId: string;
  initiatorType: "github_sender" | "schedule" | "system" | "webhook";
  tenantId?: string;
}): EveVerifiedAuditIdentity {
  return {
    actorId: input.botId,
    identityMode: "github_bot",
    initiatorId: input.initiatorId,
    initiatorType: input.initiatorType,
    tenantId: input.tenantId,
  } as EveVerifiedAuditIdentity;
}
