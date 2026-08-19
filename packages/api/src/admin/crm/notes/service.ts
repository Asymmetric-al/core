import {
  canActorReadRestrictedNotes,
  filterCrmNotesForTenant,
  mapCrmNoteRow,
  sortCrmNotes,
} from "./model";
import { encodeCrmNoteCursor, type AdminCrmNotesParams } from "./query";
import { assertCrmTenantAccess } from "../../../crm/auth/access";
import { logCrmCommand } from "../../../crm/commands/log";
import { ApiHttpError } from "../../../shared/api-http-error";

import type { LogCrmCommandResult } from "../../../crm/commands/log";
import type { ActorContext } from "../../../crm/types";
import type {
  AdminCrmNoteCreateResponse,
  AdminCrmNotesListResponse,
  CrmNoteRow,
} from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

export type NotesClient = {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (field: string, value: unknown) => NotesFilter;
    };
    insert: (row: JsonRecord) => {
      select: (columns?: string) => {
        single: () => PromiseLike<{
          data: JsonRecord | null;
          error: { message?: string; code?: string } | null;
        }>;
      };
    };
  };
};

type NotesFilter = {
  eq: (field: string, value: unknown) => NotesFilter;
  maybeSingle: () => PromiseLike<{
    data: JsonRecord | null;
    error: { message?: string; code?: string } | null;
  }>;
  then: (
    resolve: (value: {
      data: JsonRecord[] | null;
      error: { message?: string; code?: string } | null;
    }) => unknown,
  ) => unknown;
};

type CommandLogClient = Parameters<typeof logCrmCommand>[0];

export interface ListMissionControlCrmNotesOptions {
  actor: ActorContext;
  params: AdminCrmNotesParams;
  supabase: NotesClient;
}

export interface CreateMissionControlCrmNoteInput {
  title: string;
  body: string;
  linkedRecordId?: string | null;
  linkedRecordType?:
    | "donor_profile"
    | "missionary_profile"
    | "organization"
    | null;
  linkedRecordLabel?: string | null;
  visibility?: "standard" | "restricted";
}

export interface CreateMissionControlCrmNoteOptions {
  actor: ActorContext;
  supabase: NotesClient;
  input: CreateMissionControlCrmNoteInput;
  requestId?: string;
  now?: Date;
  authorName?: string;
  logCommand?: typeof logCrmCommand;
  createId?: () => string;
}

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
} as const;

function canCreateRestrictedNotes(actor: ActorContext) {
  return actor.role === "admin" || actor.role === "super_admin";
}

async function loadTenantNotes(
  supabase: NotesClient,
  tenantId: string,
): Promise<JsonRecord[]> {
  const { data, error } = await supabase
    .from("crm_notes")
    .select("*")
    .eq("tenant_id", tenantId);

  if (error) {
    throw new Error(error.message ?? "Failed to load CRM notes.");
  }

  return data ?? [];
}

async function findNoteByIdempotencyKey(
  supabase: NotesClient,
  tenantId: string,
  idempotencyKey: string,
): Promise<CrmNoteRow | null> {
  const { data, error } = await supabase
    .from("crm_notes")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message ?? "Failed to load CRM note.");
  }

  return data ? mapCrmNoteRow(data) : null;
}

export async function listMissionControlCrmNotes(
  options: ListMissionControlCrmNotesOptions,
): Promise<AdminCrmNotesListResponse> {
  assertCrmTenantAccess(options.actor);

  const records = await loadTenantNotes(
    options.supabase,
    options.actor.tenantId,
  );
  const mapped = records.flatMap((record) => {
    const row = mapCrmNoteRow(record);
    return row ? [row] : [];
  });
  const filtered = filterCrmNotesForTenant(
    mapped,
    options.actor.tenantId,
    options.params.search,
    {
      includeRestricted: canActorReadRestrictedNotes(options.actor.role),
    },
  );
  const sorted = sortCrmNotes(filtered, options.params.sort);
  const offset = options.params.cursor?.offset ?? 0;
  const pageRows = sorted.slice(offset, offset + options.params.limit);
  const nextOffset = offset + pageRows.length;
  const hasMore = nextOffset < sorted.length;

  return {
    configured: true,
    filters: {
      search: options.params.search,
    },
    hasMore,
    limit: options.params.limit,
    missing: [],
    mode: "local",
    nextCursor: hasMore ? encodeCrmNoteCursor({ offset: nextOffset }) : null,
    rollback: ROLLBACK_CONTRACT,
    rows: pageRows,
    sort: options.params.sort,
  };
}

export async function createMissionControlCrmNote(
  options: CreateMissionControlCrmNoteOptions,
): Promise<AdminCrmNoteCreateResponse> {
  assertCrmTenantAccess(options.actor);

  const title = options.input.title.trim();
  const body = options.input.body.trim();
  const visibility = options.input.visibility ?? "standard";
  const linkedRecordId = options.input.linkedRecordId?.trim() || null;
  const linkedRecordType = options.input.linkedRecordType ?? null;
  const linkedRecordLabel = options.input.linkedRecordLabel?.trim() || null;

  if (!title || !body) {
    throw new ApiHttpError(400, "Note title and body are required.");
  }

  if (visibility === "restricted" && !canCreateRestrictedNotes(options.actor)) {
    throw new ApiHttpError(403, "Restricted CRM notes require an admin role.");
  }

  const idempotencyKey = options.requestId?.trim() || null;
  if (idempotencyKey) {
    const existing = await findNoteByIdempotencyKey(
      options.supabase,
      options.actor.tenantId,
      idempotencyKey,
    );
    if (existing) {
      return {
        commandLogId: "",
        duplicate: true,
        note: existing,
        rollback: ROLLBACK_CONTRACT,
      };
    }
  }

  const timestamp = (options.now ?? new Date()).toISOString();
  const insertRow = {
    author_name: options.authorName?.trim() || "Mission Control",
    author_profile_id: options.actor.profileId,
    body,
    created_at: timestamp,
    id: options.createId?.() ?? crypto.randomUUID(),
    idempotency_key: idempotencyKey,
    linked_record_id: linkedRecordId,
    linked_record_label: linkedRecordLabel,
    linked_record_type: linkedRecordType,
    tenant_id: options.actor.tenantId,
    title,
    updated_at: timestamp,
    visibility,
  };

  const inserted = await options.supabase
    .from("crm_notes")
    .insert(insertRow)
    .select()
    .single();

  const persisted = inserted.data;
  if (inserted.error?.code === "23505" && idempotencyKey) {
    const existing = await findNoteByIdempotencyKey(
      options.supabase,
      options.actor.tenantId,
      idempotencyKey,
    );
    if (existing) {
      return {
        commandLogId: "",
        duplicate: true,
        note: existing,
        rollback: ROLLBACK_CONTRACT,
      };
    }
  }

  if (inserted.error || !persisted) {
    throw new Error(inserted.error?.message ?? "Failed to save CRM note.");
  }

  const note = mapCrmNoteRow(persisted);
  if (!note) {
    throw new Error("Failed to save CRM note.");
  }

  const logCommand = options.logCommand ?? logCrmCommand;
  const commandLog: LogCrmCommandResult = await logCommand(
    options.supabase as unknown as CommandLogClient,
    {
      action: "crm.note.create",
      actor: options.actor,
      commandPayload: {
        body,
        linkedRecordId,
        linkedRecordType,
        title,
        visibility,
      },
      idempotencyKey,
      requestId: options.requestId,
      resourceId: note.id,
      resourceType: "note",
      status: "succeeded",
    },
  );

  if (!commandLog.ok) {
    throw new Error(commandLog.error);
  }

  return {
    commandLogId: commandLog.id ?? "",
    note,
    rollback: ROLLBACK_CONTRACT,
  };
}
