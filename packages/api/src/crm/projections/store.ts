import type {
  CrmProjectionState,
  CrmProjectionSyncStatus,
  CrmProjectionTargetSurface,
} from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

interface SupabaseError {
  code?: string;
  message?: string;
}

interface SupabaseResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

interface SupabaseFilterBuilder<T = JsonRecord> extends PromiseLike<
  SupabaseResult<T[]>
> {
  select: (columns?: string) => SupabaseFilterBuilder<T>;
  eq: (column: string, value: unknown) => SupabaseFilterBuilder<T>;
  order: (
    column: string,
    options?: { ascending?: boolean },
  ) => SupabaseFilterBuilder<T>;
  single: <TRow extends JsonRecord = JsonRecord>() => Promise<
    SupabaseResult<TRow>
  >;
  maybeSingle: <TRow extends JsonRecord = JsonRecord>() => Promise<
    SupabaseResult<TRow>
  >;
}

interface SupabaseTableBuilder {
  insert: (row: JsonRecord) => SupabaseFilterBuilder;
  select: (columns?: string) => SupabaseFilterBuilder;
  update: (row: JsonRecord) => SupabaseFilterBuilder;
  upsert: (
    row: JsonRecord,
    options?: { onConflict?: string },
  ) => SupabaseFilterBuilder;
}

export interface SupabaseCrmProjectionClient {
  from: (table: string) => SupabaseTableBuilder;
}

export interface UpsertCrmProjectionStateInput {
  tenantId: string;
  projectionName: string;
  sourceSystem?: string;
  sourceEntityType: string;
  sourceEntityId: string;
  targetSurface: CrmProjectionTargetSurface;
  crmRecordLinkId?: string | null;
  twentyObjectName?: string | null;
  twentyRecordId?: string | null;
  syncStatus: CrmProjectionSyncStatus;
  sourceHash?: string | null;
  projectedHash?: string | null;
  lastProjectedAt?: Date | string | null;
  lastError?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CrmProjectionStore {
  listProjectionStates(input: {
    tenantId: string;
  }): Promise<CrmProjectionState[]>;
  upsertProjectionState(
    input: UpsertCrmProjectionStateInput,
  ): Promise<CrmProjectionState>;
  markProjectionStateForReplay(input: {
    id: string;
    requestedAt?: Date;
  }): Promise<void>;
}

function requireNoError(error: SupabaseError | null, fallback: string): void {
  if (error) {
    throw new Error(error.message ?? fallback);
  }
}

function rowString(row: JsonRecord, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function rowNullableString(row: JsonRecord, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : null;
}

function rowRecord(row: JsonRecord, key: string): Record<string, unknown> {
  const value = row[key];
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function toProjectionState(row: JsonRecord): CrmProjectionState {
  return {
    crmRecordLinkId: rowNullableString(row, "crm_record_link_id"),
    id: rowString(row, "id"),
    lastError: rowNullableString(row, "last_error"),
    lastProjectedAt: rowNullableString(row, "last_projected_at"),
    metadata: rowRecord(row, "metadata"),
    projectedHash: rowNullableString(row, "projected_hash"),
    projectionName: rowString(row, "projection_name"),
    sourceEntityId: rowString(row, "source_entity_id"),
    sourceEntityType: rowString(row, "source_entity_type"),
    sourceHash: rowNullableString(row, "source_hash"),
    sourceSystem: rowString(row, "source_system") || "asym",
    syncStatus: rowString(row, "sync_status") as CrmProjectionSyncStatus,
    targetSurface: rowString(
      row,
      "target_surface",
    ) as CrmProjectionTargetSurface,
    tenantId: rowString(row, "tenant_id"),
    twentyObjectName: rowNullableString(row, "twenty_object_name"),
    twentyRecordId: rowNullableString(row, "twenty_record_id"),
    updatedAt: rowString(row, "updated_at"),
  };
}

export function createSupabaseCrmProjectionStore(
  clientInput: unknown,
): CrmProjectionStore {
  const client = clientInput as SupabaseCrmProjectionClient;

  return {
    async listProjectionStates(input) {
      const { data, error } = await client
        .from("crm_projection_state")
        .select("*")
        .eq("tenant_id", input.tenantId)
        .order("updated_at", { ascending: false });

      requireNoError(error, "Failed to read CRM projection state.");
      return (data ?? []).map(toProjectionState);
    },

    async upsertProjectionState(input) {
      const row = {
        tenant_id: input.tenantId,
        projection_name: input.projectionName,
        source_system: input.sourceSystem ?? "asym",
        source_entity_type: input.sourceEntityType,
        source_entity_id: input.sourceEntityId,
        target_surface: input.targetSurface,
        crm_record_link_id: input.crmRecordLinkId ?? null,
        crm_provider: "twenty",
        twenty_object_name: input.twentyObjectName ?? null,
        twenty_record_id: input.twentyRecordId ?? null,
        sync_status: input.syncStatus,
        source_hash: input.sourceHash ?? null,
        projected_hash: input.projectedHash ?? null,
        last_projected_at: toIsoString(input.lastProjectedAt),
        last_error: input.lastError ?? null,
        metadata: input.metadata ?? {},
        updated_at: new Date().toISOString(),
      };
      const inserted = await client
        .from("crm_projection_state")
        .upsert(row, {
          onConflict:
            "tenant_id,projection_name,target_surface,source_entity_type,source_entity_id",
        })
        .select("*")
        .single();

      requireNoError(inserted.error, "Failed to store CRM projection state.");
      return toProjectionState(inserted.data ?? {});
    },

    async markProjectionStateForReplay(input) {
      const requestedAt = input.requestedAt ?? new Date();
      const existing = await client
        .from("crm_projection_state")
        .select("metadata")
        .eq("id", input.id)
        .maybeSingle();

      requireNoError(
        existing.error,
        "Failed to read CRM projection state for replay.",
      );

      const { error } = await client
        .from("crm_projection_state")
        .update({
          sync_status: "stale",
          metadata: {
            ...rowRecord(existing.data ?? {}, "metadata"),
            replayRequestedAt: requestedAt.toISOString(),
            replaySource: "phase_06_shadow_mode",
          },
          updated_at: requestedAt.toISOString(),
        })
        .eq("id", input.id);

      requireNoError(error, "Failed to mark CRM projection state for replay.");
    },
  };
}
