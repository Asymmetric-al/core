import { ApiHttpError } from "../../shared/api-http-error";

import type { EveSessionIdentity, EveSessionOwnershipRecord } from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const OWNERSHIP_DENIED_MESSAGE = "Eve session ownership could not be verified.";

function ownershipFields(identity: EveSessionIdentity) {
  return {
    tenant_id: identity.tenantId,
    owner_actor_id: identity.actorId,
    owner_profile_id:
      identity.identityMode === "admin" ? identity.actorProfileId : null,
    identity_mode: identity.identityMode,
    actor_role: identity.identityMode === "admin" ? identity.actorRole : null,
    initiator_type: identity.initiatorType,
    initiator_id: identity.initiatorId,
  };
}

function recordMatchesIdentity(
  record: EveSessionOwnershipRecord,
  identity: EveSessionIdentity,
): boolean {
  return (
    record.tenantId === identity.tenantId &&
    record.actorId === identity.actorId &&
    record.actorProfileId ===
      (identity.identityMode === "admin"
        ? identity.actorProfileId
        : undefined) &&
    record.identityMode === identity.identityMode &&
    record.initiatorType === identity.initiatorType &&
    record.initiatorId === identity.initiatorId
  );
}

function toRecord(row: {
  actor_role: string | null;
  identity_mode: "admin" | "service";
  initiator_id: string;
  initiator_type: string;
  owner_actor_id: string;
  owner_profile_id: string | null;
  session_id: string;
  tenant_id: string;
}): EveSessionOwnershipRecord {
  return {
    actorId: row.owner_actor_id,
    actorProfileId: row.owner_profile_id ?? undefined,
    actorRole: row.actor_role ?? undefined,
    identityMode: row.identity_mode,
    initiatorId: row.initiator_id,
    initiatorType: row.initiator_type,
    sessionId: row.session_id,
    tenantId: row.tenant_id,
  };
}

export async function loadEveSessionOwnership(input: {
  sessionId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveSessionOwnershipRecord | null> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_session_ownership")
    .select(
      "session_id, tenant_id, owner_actor_id, owner_profile_id, identity_mode, actor_role, initiator_type, initiator_id",
    )
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toRecord(data as Parameters<typeof toRecord>[0]) : null;
}

export async function claimEveSessionOwnership(input: {
  identity: EveSessionIdentity;
  sessionId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const sessionId = input.sessionId.trim();
  if (!sessionId || sessionId.length > 200) {
    throw new ApiHttpError(400, "Invalid Eve session identifier.");
  }

  const { error } = await input.supabaseAdmin
    .from("eve_session_ownership")
    .insert({
      session_id: sessionId,
      ...ownershipFields(input.identity),
    });

  if (!error) {
    return;
  }

  if (error.code !== "23505") {
    throw new Error(error.message);
  }

  const existing = await loadEveSessionOwnership({
    sessionId,
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!existing || !recordMatchesIdentity(existing, input.identity)) {
    throw new ApiHttpError(403, OWNERSHIP_DENIED_MESSAGE);
  }
}

export async function assertEveSessionOwnership(input: {
  identity: EveSessionIdentity;
  sessionId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const existing = await loadEveSessionOwnership({
    sessionId: input.sessionId,
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!existing || !recordMatchesIdentity(existing, input.identity)) {
    throw new ApiHttpError(403, OWNERSHIP_DENIED_MESSAGE);
  }
}
