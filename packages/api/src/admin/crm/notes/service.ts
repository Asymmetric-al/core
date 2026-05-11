import {
  buildQueuedCrmNoteRow,
  filterCrmNotesForTenant,
  normalizeTwentyNotesResponse,
  sortCrmNotes,
} from "./model";
import { encodeCrmNoteCursor, type AdminCrmNotesParams } from "./query";
import {
  loadTwentyClientConfig,
  resolveTwentyRuntimeConfig,
} from "../../../crm/client/config";
import { TwentyCoreClient } from "../../../crm/client/core";
import { logCrmCommand } from "../../../crm/commands/log";
import { resolveCrmSyncRuntimeConfig } from "../../../crm/sync/config";
import {
  buildCrmOutboundIdempotencyKey,
  enqueueCrmOutboundJob,
} from "../../../crm/sync/outbound";

import type { TwentyEnvInput } from "../../../crm/client/config";
import type { LogCrmCommandResult } from "../../../crm/commands/log";
import type { CrmSyncStore } from "../../../crm/sync/store";
import type { CrmSyncRuntimeConfig } from "../../../crm/sync/types";
import type { ActorContext } from "../../../crm/types";
import type {
  AdminCrmNoteCreateResponse,
  AdminCrmNotesListResponse,
} from "@asym/database/types";

type CommandLogClient = Parameters<typeof logCrmCommand>[0];

export interface ListMissionControlCrmNotesOptions {
  actor: ActorContext;
  params: AdminCrmNotesParams;
  env?: TwentyEnvInput;
  fetchImpl?: typeof fetch;
  coreClient?: Pick<TwentyCoreClient, "listRecords">;
}

export interface CreateMissionControlCrmNoteInput {
  title: string;
  body: string;
}

export interface CreateMissionControlCrmNoteOptions {
  actor: ActorContext;
  commandClient: unknown;
  input: CreateMissionControlCrmNoteInput;
  requestId?: string;
  store: CrmSyncStore;
  syncConfig?: CrmSyncRuntimeConfig;
  now?: Date;
  logCommand?: typeof logCrmCommand;
}

const ROLLBACK_CONTRACT = {
  existingCrmPath: "/crm",
  disableWritesByPausingDomain: "notes",
} as const;

function buildTwentyListQuery(params: AdminCrmNotesParams, tenantId: string) {
  return {
    limit: 100,
    ...(params.search ? { search: params.search } : {}),
    orderBy: `${params.sort.field}:${params.sort.direction}`,
    filter: JSON.stringify({
      asymTenantId: {
        eq: tenantId,
      },
    }),
  };
}

export async function listMissionControlCrmNotes(
  options: ListMissionControlCrmNotesOptions,
): Promise<AdminCrmNotesListResponse> {
  const env = options.env ?? {};
  const config = resolveTwentyRuntimeConfig(env);

  const baseResponse = {
    filters: {
      search: options.params.search,
    },
    limit: options.params.limit,
    rollback: ROLLBACK_CONTRACT,
    sort: options.params.sort,
  };

  if (!config.configured) {
    return {
      ...baseResponse,
      configured: false,
      hasMore: false,
      missing: config.missing,
      mode: "not_configured",
      nextCursor: null,
      rows: [],
    };
  }

  const clientConfig = loadTwentyClientConfig(env);
  const core =
    options.coreClient ??
    (clientConfig
      ? new TwentyCoreClient({
          apiBaseUrl: clientConfig.apiBaseUrl,
          apiKey: clientConfig.apiKey,
          fetchImpl: options.fetchImpl,
          rateLimitRpm: clientConfig.rateLimitRpm,
        })
      : null);
  if (!core) {
    return {
      ...baseResponse,
      configured: false,
      hasMore: false,
      missing: ["TWENTY_API_URL", "TWENTY_API_KEY"],
      mode: "not_configured",
      nextCursor: null,
      rows: [],
    };
  }

  const rawResponse = await core.listRecords(
    "notes",
    buildTwentyListQuery(options.params, options.actor.tenantId),
  );
  const filtered = filterCrmNotesForTenant(
    normalizeTwentyNotesResponse(rawResponse),
    options.actor.tenantId,
    options.params.search,
  );
  const sorted = sortCrmNotes(filtered, options.params.sort);
  const offset = options.params.cursor?.offset ?? 0;
  const pageRows = sorted.slice(offset, offset + options.params.limit);
  const nextOffset = offset + pageRows.length;
  const hasMore = nextOffset < sorted.length;

  return {
    ...baseResponse,
    configured: true,
    hasMore,
    missing: [],
    mode: "twenty",
    nextCursor: hasMore ? encodeCrmNoteCursor({ offset: nextOffset }) : null,
    rows: pageRows,
  };
}

export async function createMissionControlCrmNote(
  options: CreateMissionControlCrmNoteOptions,
): Promise<AdminCrmNoteCreateResponse> {
  const title = options.input.title.trim();
  const body = options.input.body.trim();
  const outboundInput = {
    domain: "notes" as const,
    jobType: "create" as const,
    maxAttempts: 5,
    payload: {
      asymCreatedByProfileId: options.actor.profileId,
      asymCreatedByUserId: options.actor.userId,
      asymTenantId: options.actor.tenantId,
      body,
      source: "mission_control",
      title,
    },
    sourceEntityId: options.actor.profileId,
    sourceEntityType: "asym_profile" as const,
    tenantId: options.actor.tenantId,
    twentyObjectName: "notes",
  };
  const idempotencyKey = buildCrmOutboundIdempotencyKey(outboundInput);
  const logCommand = options.logCommand ?? logCrmCommand;

  const commandLog: LogCrmCommandResult = await logCommand(
    options.commandClient as CommandLogClient,
    {
      action: "crm.note.create",
      actor: options.actor,
      commandPayload: outboundInput.payload,
      idempotencyKey,
      requestId: options.requestId,
      resourceType: "note",
      status: "queued",
    },
  );

  if (!commandLog.ok) {
    throw new Error(commandLog.error);
  }

  const job = await enqueueCrmOutboundJob(
    options.store,
    options.syncConfig ?? resolveCrmSyncRuntimeConfig({}),
    {
      ...outboundInput,
      idempotencyKey,
    },
  );

  await options.store.appendSyncLog({
    tenantId: options.actor.tenantId,
    direction: "outbound",
    domain: "notes",
    status: job.status,
    sourceTable: "crm_outbound_jobs",
    sourceId: job.id,
    message: "Mission Control CRM note create queued for Twenty sync.",
    details: {
      commandLogId: commandLog.id,
      idempotencyKey,
    },
  });

  return {
    commandLogId: commandLog.id,
    note: buildQueuedCrmNoteRow({
      body,
      now: options.now,
      outboundJobId: job.id,
      tenantId: options.actor.tenantId,
      title,
    }),
    outboundJobId: job.id,
    outboundStatus: job.status,
    replay: {
      outboundJobId: job.id,
    },
    rollback: ROLLBACK_CONTRACT,
  };
}
