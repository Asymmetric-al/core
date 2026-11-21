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
