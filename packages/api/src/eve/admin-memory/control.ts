import { classifyEveAdminMemoryExclusions } from "./exclusions";
import { loadEveAdminMemoryEntryById } from "./store";
import { ApiHttpError } from "../../shared/api-http-error";
import { createAdminEveAuditIdentity } from "../audit/identity";
import { traceEveAuditEvent } from "../audit/record";
import { createEveAuditStore } from "../audit/store";

import type {
  EveAdminMemoryCategory,
  EveAdminMemoryWriteResult,
} from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

function createMemoryAuditIdentity(auth: AuthenticatedContext) {
  return createAdminEveAuditIdentity(auth, {
    tenantId: auth.tenantId,
  });
}

function identityParams(auth: AuthenticatedContext) {
  const identity = createMemoryAuditIdentity(auth);
  return {
    p_actor_id: identity.actorId,
    p_actor_profile_id: identity.actorProfileId,
    p_actor_role: identity.actorRole,
    p_tenant_id: identity.tenantId,
    p_initiator_type: identity.initiatorType,
    p_initiator_id: identity.initiatorId,
  };
}

function mapMemoryError(error: { message: string } | null): never {
  const message = error?.message ?? "eve_admin_memory_mutation_failed";
  if (message.includes("owner_tenant_mismatch"))
    throw new ApiHttpError(
      403,
      "Private memory ownership could not be verified.",
    );
  if (message.includes("missing_eve_admin_memory"))
    throw new ApiHttpError(404, "Memory entry was not found.");
  if (message.includes("stale_eve_admin_memory"))
    throw new ApiHttpError(
      409,
      "Memory changed. Refresh and retry deliberately.",
    );
  if (message.includes("deleted_eve_admin_memory"))
    throw new ApiHttpError(409, "Deleted memory cannot be edited again.");
  if (message.includes("tenant_operational_memory_disabled"))
    throw new ApiHttpError(
      409,
      "Tenant operational memory is schema-ready but disabled.",
    );
  if (message.includes("auto_save_governance_blocked"))
    throw new ApiHttpError(
      409,
      "Automatic memory remains blocked by Eve governance.",
    );
  if (message.includes("auto_save_disabled"))
    throw new ApiHttpError(
      409,
      "Automatic saves are disabled for this category.",
    );
  if (
    message.includes("excluded") ||
    message.includes("invalid_eve_admin_memory")
  )
    throw new ApiHttpError(
      400,
      "That value cannot be stored in Eve private memory.",
    );
  throw new Error(message);
}

async function rejectExcluded(input: {
  auth: AuthenticatedContext;
  candidate: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveAdminMemoryWriteResult | null> {
  const exclusions = classifyEveAdminMemoryExclusions(input.candidate);
  if (exclusions.length === 0) return null;
  await traceEveAuditEvent({
    store: createEveAuditStore(input.supabaseAdmin),
    event: {
      identity: createMemoryAuditIdentity(input.auth),
      policy: { id: "eve-admin-memory", status: "advisory_only" },
      action: "memory.excluded",
      target: "admin_memory:blocked",
      result: "blocked",
      modelRole: "not_used",
      evidence: { exclusionCategories: exclusions, candidateIncluded: false },
      change: { stored: false },
      decision: {
        rationale:
          "The write-time exclusion boundary rejected sensitive data before persistence.",
        risk: "The rejected value is never copied into audit evidence.",
        reversalOrFollowUp:
          "Remove sensitive data and retry with advisory context only.",
      },
      debug: {
        source: "eve_admin_memory_control",
        exclusionCategories: exclusions,
      },
    },
  });
  return { stored: false, exclusions };
}

export async function createEveAdminMemory(input: {
  auth: AuthenticatedContext;
  category: EveAdminMemoryCategory;
  content: string;
  source: "manual" | "auto_save";
  supabaseAdmin: AdminSupabaseClient;
  title: string;
}): Promise<EveAdminMemoryWriteResult> {
  const rejected = await rejectExcluded({
    ...input,
    candidate: `${input.title}\n${input.content}`,
  });
  if (rejected) return rejected;
  const { data, error } = await input.supabaseAdmin.rpc(
    "create_eve_admin_memory",
    {
      p_scope_type: "admin_private",
      p_category: input.category,
      p_title: input.title,
      p_content: input.content,
      p_source: input.source,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  if (error || typeof data !== "string") return mapMemoryError(error);
  const entry = await loadEveAdminMemoryEntryById({
    entryId: data,
    tenantId: input.auth.tenantId,
    ownerProfileId: input.auth.profileId,
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!entry) throw new Error("created_eve_admin_memory_missing");
  return { stored: true, entry };
}

export async function updateEveAdminMemory(input: {
  auth: AuthenticatedContext;
  category: EveAdminMemoryCategory;
  content: string;
  entryId: string;
  expectedVersion: number;
  supabaseAdmin: AdminSupabaseClient;
  title: string;
}): Promise<EveAdminMemoryWriteResult> {
  const rejected = await rejectExcluded({
    ...input,
    candidate: `${input.title}\n${input.content}`,
  });
  if (rejected) return rejected;
  const { error } = await input.supabaseAdmin.rpc("update_eve_admin_memory", {
    p_entry_id: input.entryId,
    p_expected_version: input.expectedVersion,
    p_category: input.category,
    p_title: input.title,
    p_content: input.content,
    p_audit_id: crypto.randomUUID(),
    ...identityParams(input.auth),
  });
  if (error) mapMemoryError(error);
  const entry = await loadEveAdminMemoryEntryById({
    entryId: input.entryId,
    tenantId: input.auth.tenantId,
    ownerProfileId: input.auth.profileId,
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!entry) throw new Error("updated_eve_admin_memory_missing");
  return { stored: true, entry };
}

export async function deleteEveAdminMemory(input: {
  auth: AuthenticatedContext;
  entryId: string;
  expectedVersion: number;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { error } = await input.supabaseAdmin.rpc("delete_eve_admin_memory", {
    p_entry_id: input.entryId,
    p_expected_version: input.expectedVersion,
    p_audit_id: crypto.randomUUID(),
    ...identityParams(input.auth),
  });
  if (error) mapMemoryError(error);
}

export async function setEveAdminMemoryAutoSave(input: {
  auth: AuthenticatedContext;
  category: EveAdminMemoryCategory;
  enabled: boolean;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const { error } = await input.supabaseAdmin.rpc(
    "set_eve_admin_memory_auto_save",
    {
      p_category: input.category,
      p_enabled: input.enabled,
      p_audit_id: crypto.randomUUID(),
      ...identityParams(input.auth),
    },
  );
  if (error) mapMemoryError(error);
}
