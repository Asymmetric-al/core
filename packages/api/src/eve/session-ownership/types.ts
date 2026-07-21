import type { UserRole } from "@asym/database/types";

declare const verifiedEveSessionIdentity: unique symbol;

interface EveSessionIdentityBase {
  readonly [verifiedEveSessionIdentity]: true;
  actorId: string;
  identityMode: "admin" | "service";
  initiatorId: string;
  initiatorType: "admin" | "authenticated_admin" | "schedule" | "system";
  tenantId: string;
}

export interface EveAdminSessionIdentity extends EveSessionIdentityBase {
  actorProfileId: string;
  actorProfileRole: UserRole | null;
  actorRole: UserRole;
  identityMode: "admin";
  initiatorType: "authenticated_admin";
}

export interface EveServiceSessionIdentity extends EveSessionIdentityBase {
  actorProfileId?: never;
  actorRole?: never;
  identityMode: "service";
  initiatorType: "admin" | "schedule" | "system";
}

export type EveSessionIdentity =
  | EveAdminSessionIdentity
  | EveServiceSessionIdentity;

export type EveAdminIdentityResolution =
  | { ok: false; reason: "forbidden" | "unauthenticated" }
  | { ok: true; identity: EveAdminSessionIdentity };

export interface EveSessionAuthSnapshot {
  attributes: Readonly<Record<string, string | readonly string[]>>;
  authenticator: string;
  principalId: string;
  principalType: string;
}

export interface EveSessionOwnershipRecord {
  actorId: string;
  actorProfileId?: string;
  actorRole?: string;
  identityMode: "admin" | "service";
  initiatorId: string;
  initiatorType: string;
  sessionId: string;
  tenantId: string;
}
