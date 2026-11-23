import {
  canActorReadRestrictedNotes,
  filterCrmNotesForTenant,
  mapCrmNoteRow,
  sortCrmNotes,
} from "./model";
import { encodeCrmNoteCursor, type AdminCrmNotesParams } from "./query";
import { assertCrmTenantAccess } from "../../../crm/auth/access";
import { ApiHttpError } from "../../../shared/api-http-error";

import type { ActorContext } from "../../../crm/types";
import type {
  AdminCrmNoteCreateResponse,
  AdminCrmNotesListResponse,
} from "@asym/database/types";

type JsonRecord = Record<string, unknown>;

export type NotesClient = {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (field: string, value: unknown) => NotesFilter;
    };
  };
};

type NotesFilter = {
  eq: (field: string, value: unknown) => NotesFilter;
  then: (
    resolve: (value: {
      data: JsonRecord[] | null;
      error: { message?: string; code?: string } | null;
    }) => unknown,
  ) => unknown;
};

export type NoteCommandClient = {
  rpc: (
    fn: "create_crm_note",
    args: CreateCrmNoteCommandArgs,
  ) => PromiseLike<{
    data: unknown;
    error: { message?: string; code?: string } | null;
  }>;
};

export type CreateCrmNoteCommandArgs = {
  p_tenant_id: string;
  p_idempotency_key: string;
  p_title: string;
  p_body: string;
  p_visibility: "standard" | "restricted";
  p_linked_record_id: string | null;
  p_linked_record_type:
    "donor_profile" | "missionary_profile" | "organization" | null;
  p_linked_record_label: string | null;
  p_request_id: string | null;
};

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
    "donor_profile" | "missionary_profile" | "organization" | null;
  linkedRecordLabel?: string | null;
  visibility?: "standard" | "restricted";
}

export interface CreateMissionControlCrmNoteOptions {
  actor: ActorContext;
  supabase: NoteCommandClient;
  input: CreateMissionControlCrmNoteInput;
  idempotencyKey: string;
  requestId?: string | null;
}

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
} as const;

const COMMAND_REFUSALS: Record<string, [number, string]> = {
  "22023": [400, "The CRM note is not valid."],
  "23505": [409, "This submission key was already used for another CRM note."],
};

function commandRefusal(error: { message?: string; code?: string }): Error {
  if (error.code === "42501") {
    return new ApiHttpError(
      403,
      /tenant-administrator flag/i.test(error.message ?? "")
        ? "Restricted CRM notes require the tenant-administrator flag."
        : "Forbidden: this assignment cannot create CRM notes.",
    );
  }
  const refusal = error.code ? COMMAND_REFUSALS[error.code] : undefined;
  if (refusal) {
    return new ApiHttpError(refusal[0], refusal[1]);
  }
  return new Error(error.message ?? "Failed to save CRM note.");
}

function readCommandResult(data: unknown): {
  note: JsonRecord;
  commandLogId: string;
  duplicate: boolean;
} | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const result = data as JsonRecord;
  if (
    !result.note ||
    typeof result.note !== "object" ||
    typeof result.commandLogId !== "string"
  ) {
    return null;
  }
  return {
    commandLogId: result.commandLogId,
    duplicate: result.duplicate === true,
    note: result.note as JsonRecord,
  };
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
      includeRestricted: canActorReadRestrictedNotes(options.actor),
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

  const { data, error } = await options.supabase.rpc("create_crm_note", {
    p_body: body,
    p_idempotency_key: options.idempotencyKey,
    p_linked_record_id: linkedRecordId,
    p_linked_record_label: linkedRecordLabel,
    p_linked_record_type: linkedRecordType,
    p_request_id: options.requestId ?? null,
    p_tenant_id: options.actor.tenantId,
    p_title: title,
    p_visibility: visibility,
  });

  if (error) {
    throw commandRefusal(error);
  }

  const result = readCommandResult(data);
  const note = result ? mapCrmNoteRow(result.note) : null;
  if (!result || !note) {
    throw new Error("Failed to save CRM note.");
  }

  return {
    commandLogId: result.commandLogId,
    duplicate: result.duplicate,
    note,
    rollback: ROLLBACK_CONTRACT,
  };
}
