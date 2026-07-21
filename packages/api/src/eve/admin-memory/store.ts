import { z } from "zod";

import { EVE_ADMIN_MEMORY_CATEGORIES } from "./types";

import type {
  EveAdminMemoryAdminView,
  EveAdminMemoryEntry,
  EveAdminMemoryHistoryRecord,
  EveAdminMemorySetting,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const entryRowSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  owner_profile_id: z.string().uuid(),
  scope_type: z.literal("admin_private"),
  category: z.enum(EVE_ADMIN_MEMORY_CATEGORIES),
  title: z.string(),
  content: z.string(),
  source: z.enum(["manual", "auto_save"]),
  version: z.number().int().positive(),
  is_deleted: z.boolean(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
const historyRowSchema = z.object({
  id: z.string().uuid(),
  entry_id: z.string().uuid(),
  version: z.number().int().positive(),
  action: z.enum(["created", "updated", "deleted"]),
  category: z.enum(EVE_ADMIN_MEMORY_CATEGORIES),
  title: z.string(),
  content: z.string(),
  source: z.enum(["manual", "auto_save"]),
  changed_by_profile_id: z.string().uuid(),
  changed_at: z.string(),
});
const settingRowSchema = z.object({
  category: z.enum(EVE_ADMIN_MEMORY_CATEGORIES),
  auto_save_enabled: z.boolean(),
  updated_at: z.string(),
});

function toEntry(value: unknown): EveAdminMemoryEntry {
  const row = entryRowSchema.parse(value);
  return {
    id: row.id,
    tenantId: row.tenant_id,
    ownerProfileId: row.owner_profile_id,
    scopeType: row.scope_type,
    category: row.category,
    title: row.title,
    content: row.content,
    source: row.source,
    version: row.version,
    isDeleted: row.is_deleted,
    deletedAt: row.deleted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toHistory(value: unknown): EveAdminMemoryHistoryRecord {
  const row = historyRowSchema.parse(value);
  return {
    id: row.id,
    entryId: row.entry_id,
    version: row.version,
    action: row.action,
    category: row.category,
    title: row.title,
    content: row.content,
    source: row.source,
    changedByProfileId: row.changed_by_profile_id,
    changedAt: row.changed_at,
  };
}

export async function loadEveAdminMemoryEntryById(input: {
  entryId: string;
  ownerProfileId: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveAdminMemoryEntry | null> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_admin_memory_entries")
    .select(
      "id, tenant_id, owner_profile_id, scope_type, category, title, content, source, version, is_deleted, deleted_at, created_at, updated_at",
    )
    .eq("id", input.entryId)
    .eq("tenant_id", input.tenantId)
    .eq("owner_profile_id", input.ownerProfileId)
    .eq("scope_type", "admin_private")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toEntry(data) : null;
}

export async function loadEveAdminMemoryAdminView(input: {
  includeDeleted?: boolean;
  ownerProfileId: string;
  query?: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveAdminMemoryAdminView> {
  let entriesQuery = input.supabaseAdmin
    .from("eve_admin_memory_entries")
    .select(
      "id, tenant_id, owner_profile_id, scope_type, category, title, content, source, version, is_deleted, deleted_at, created_at, updated_at",
    )
    .eq("tenant_id", input.tenantId)
    .eq("owner_profile_id", input.ownerProfileId)
    .eq("scope_type", "admin_private")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (input.includeDeleted === false)
    entriesQuery = entriesQuery.eq("is_deleted", false);
  if (input.query)
    entriesQuery = entriesQuery.textSearch("search_vector", input.query, {
      config: "simple",
      type: "websearch",
    });

  const [entriesResult, historyResult, settingsResult] = await Promise.all([
    entriesQuery,
    input.supabaseAdmin
      .from("eve_admin_memory_history")
      .select(
        "id, entry_id, version, action, category, title, content, source, changed_by_profile_id, changed_at",
      )
      .eq("tenant_id", input.tenantId)
      .eq("owner_profile_id", input.ownerProfileId)
      .order("changed_at", { ascending: false })
      .limit(100),
    input.supabaseAdmin
      .from("eve_admin_memory_settings")
      .select("category, auto_save_enabled, updated_at")
      .eq("tenant_id", input.tenantId)
      .eq("owner_profile_id", input.ownerProfileId),
  ]);
  for (const result of [entriesResult, historyResult, settingsResult]) {
    if (result.error) throw new Error(result.error.message);
  }
  const storedSettings = new Map(
    (settingsResult.data ?? []).map((value) => {
      const row = settingRowSchema.parse(value);
      return [
        row.category,
        {
          category: row.category,
          autoSaveEnabled: row.auto_save_enabled,
          updatedAt: row.updated_at,
        } satisfies EveAdminMemorySetting,
      ] as const;
    }),
  );
  return {
    entries: (entriesResult.data ?? []).map(toEntry),
    history: (historyResult.data ?? []).map(toHistory),
    settings: EVE_ADMIN_MEMORY_CATEGORIES.map(
      (category) =>
        storedSettings.get(category) ?? {
          category,
          autoSaveEnabled: true,
          updatedAt: "1970-01-01T00:00:00.000Z",
        },
    ),
  };
}
