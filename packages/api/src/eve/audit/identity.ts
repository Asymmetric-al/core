import type { EveVerifiedAuditIdentity } from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { UserRole } from "@asym/database/types";

export function createAdminEveAuditIdentity(
  auth: AuthenticatedContext,
  options?: { tenantId?: string },
): EveVerifiedAuditIdentity {
  return {
    actorId: auth.userId,
    actorProfileId: auth.profileId,
    actorRole: auth.role,
    identityMode: "admin",
    initiatorId: auth.userId,
    initiatorType: "authenticated_admin",
    tenantId: auth.role === "super_admin" ? options?.tenantId : auth.tenantId,
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

export interface EveAuditIdentityRpcParams {
  p_actor_id: string;
  p_actor_profile_id: string | null;
  p_actor_role: UserRole | null;
  p_tenant_id: string | null;
  p_initiator_type: string;
  p_initiator_id: string;
}

/**
 * The persistence-boundary view of a verified identity: the `p_*` actor
 * parameters shared by every eve security-definer RPC. Accepting only the
 * branded identity keeps prompt/model/tool data out of the RPC contract.
 */
export function toEveAuditIdentityRpcParams(
  identity: EveVerifiedAuditIdentity,
): EveAuditIdentityRpcParams {
  return {
    p_actor_id: identity.actorId,
    p_actor_profile_id: identity.actorProfileId ?? null,
    p_actor_role: identity.actorRole ?? null,
    p_tenant_id: identity.tenantId ?? null,
    p_initiator_type: identity.initiatorType,
    p_initiator_id: identity.initiatorId,
  };
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
