import type {
  ActorContext,
  CrmAction,
  CrmCommandStatus,
  CrmResourceType,
} from "../types";

type JsonRecord = Record<string, unknown>;

type CrmCommandLogClient = {
  from: (table: "crm_command_logs") => {
    insert: (row: JsonRecord) => {
      select: (columns: "id") => {
        single: () => Promise<{
          data: { id?: string } | null;
          error: { message?: string } | null;
        }>;
      };
    };
  };
};

export interface LogCrmCommandInput {
  actor: ActorContext;
  action: CrmAction;
  resourceType: CrmResourceType;
  resourceId?: string | null;
  idempotencyKey?: string | null;
  status: CrmCommandStatus;
  requestId?: string | null;
  commandPayload?: JsonRecord;
  resultSummary?: JsonRecord;
  errorMessage?: string | null;
}

export type LogCrmCommandResult =
  | {
      ok: true;
      id: string | null;
    }
  | {
      ok: false;
      error: string;
    };

const REDACTED = "[redacted]";
const SENSITIVE_KEY_PATTERN =
  /authorization|bearer|credential|password|secret|token|api.?key/i;

function redactSensitiveValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveValues);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, childValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED
        : redactSensitiveValues(childValue),
    ]),
  );
}

export async function logCrmCommand(
  supabaseAdmin: CrmCommandLogClient,
  input: LogCrmCommandInput,
): Promise<LogCrmCommandResult> {
  const row = {
    tenant_id: input.actor.tenantId,
    actor_user_id: input.actor.userId,
    actor_profile_id: input.actor.profileId,
    request_id: input.requestId ?? null,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId ?? null,
    idempotency_key: input.idempotencyKey ?? null,
    status: input.status,
    command_payload: redactSensitiveValues(input.commandPayload ?? {}),
    result_summary: redactSensitiveValues(input.resultSummary ?? {}),
    error_message: input.errorMessage ?? null,
  };

  const { data, error } = await supabaseAdmin
    .from("crm_command_logs")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message ?? "Failed to write CRM command log.",
    };
  }

  return {
    ok: true,
    id: data?.id ?? null,
  };
}
