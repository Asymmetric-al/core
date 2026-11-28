import { NextResponse } from "next/server";
import { z } from "zod";

import {
  FAILURE_TEXT,
  LEVEL_SOURCES,
  NOT_PERMITTED_TEXT,
  OUTCOME_UNKNOWN_TEXT,
  SECURITY_LEVELS,
  type Worker,
} from "./envelopes";
import { normalizesToNothing } from "./safety-text";
import {
  ApiHttpError,
  ensureJsonBody,
  reportOperationFailure,
} from "../../shared/http-errors";
import { READ_ALL_PAGE_SIZE, readAllPages } from "../../shared/read-all-pages";

import type { RequestSessionClient } from "../../shared/request-session-client";

export {
  FAILURE_TEXT,
  NOT_PERMITTED_TEXT,
  OUTCOME_UNKNOWN_TEXT,
  SECURITY_LEVELS,
  type SecurityLevel,
  type Worker,
} from "./envelopes";

export const WORKERS_CAPABILITY = "safety.restrict_publication";

export const REASON_MAX = 500;
export const ALIAS_MAX = 200;

export const workerRowSchema = z.strictObject({
  assignment_id: z.guid(),
  party_id: z.guid(),
  display_name: z.string(),
  public_alias: z.string().nullable(),
  security_level: z.enum(SECURITY_LEVELS),
  security_level_source: z.enum(LEVEL_SOURCES),
  do_not_publish: z.boolean(),
  has_legal_identity: z.boolean().nullable(),
  has_login: z.boolean(),
  created_at: z.string(),
});

export const workerRowsSchema = z.array(workerRowSchema);

export const commandResultSchema = z.strictObject({
  tenant_id: z.guid(),
  party_id: z.guid(),
  security_level: z.enum(SECURITY_LEVELS),
  security_level_source: z.enum(LEVEL_SOURCES),
  do_not_publish: z.boolean(),
});

export const revealResultSchema = z.strictObject({
  party_id: z.guid(),
  legal_name: z.string(),
  real_country: z.string().nullable(),
  precise_location: z.string().nullable(),
});

const reason = z.string().max(REASON_MAX);

export const restrictBodySchema = z.strictObject({
  level: z.enum(SECURITY_LEVELS).optional(),
  alias: z.string().max(ALIAS_MAX).optional(),
  doNotPublish: z.literal(true).optional(),
  reason,
});

export const liftBodySchema = z.strictObject({
  level: z.enum(SECURITY_LEVELS).optional(),
  clearDoNotPublish: z.literal(true).optional(),
  reason,
});

export const confirmBodySchema = z.strictObject({
  level: z.enum(SECURITY_LEVELS),
  reason,
});

export const revealBodySchema = z.strictObject({ reason });

export const createBodySchema = z.strictObject({
  displayName: z.string().max(ALIAS_MAX),
  legalName: z.string().max(ALIAS_MAX),
  realCountry: z.string().max(ALIAS_MAX).optional(),
  preciseLocation: z.string().max(REASON_MAX).optional(),
  level: z.enum(SECURITY_LEVELS).optional(),
  alias: z.string().max(ALIAS_MAX).optional(),
  legalEntityId: z.guid().optional(),
  reason,
});

export const inviteBodySchema = z.strictObject({
  email: z.string().trim().email().max(320),
  reason,
});

export const inviteResultSchema = z.strictObject({
  invitation_id: z.guid(),
  tenant_id: z.guid(),
  selector: z.string().min(1),
  verifier: z.string().min(1),
  expires_at: z.string(),
  role: z.literal("missionary"),
  staff_role: z.null(),
  is_tenant_admin: z.literal(false),
  party_id: z.guid(),
  assignment_id: z.guid(),
});

export const createResultSchema = z.strictObject({
  tenant_id: z.guid(),
  party_id: z.guid(),
  assignment_id: z.guid(),
  security_level: z.enum(SECURITY_LEVELS),
  security_level_source: z.enum(LEVEL_SOURCES),
});

export type WorkerRow = z.infer<typeof workerRowSchema>;

export function toWorker(row: WorkerRow): Worker {
  return {
    assignmentId: row.assignment_id,
    partyId: row.party_id,
    displayName: row.display_name,
    publicAlias: row.public_alias,
    securityLevel: row.security_level,
    securityLevelSource: row.security_level_source,
    doNotPublish: row.do_not_publish,
    hasLegalIdentity: row.has_legal_identity,
    hasLogin: row.has_login,
    createdAt: row.created_at,
  };
}

export const WORKER_ERRORS = {
  NOT_PERMITTED: { status: 403, text: NOT_PERMITTED_TEXT },
  NOT_FOUND: { status: 404, text: "Worker not found." },
  NO_IDENTITY: {
    status: 404,
    text: "No legal name is recorded for this worker.",
  },
  REASON_REQUIRED: { status: 400, text: "Give a reason." },
  NOTHING_TO_CHANGE: { status: 400, text: "Choose what to change." },
  LEVEL_CHANGED: {
    status: 409,
    text: "This worker's level has changed. Reload to see it.",
  },
  INVALID_CHANGE: { status: 400, text: "That change is not allowed here." },
  ALIAS_REQUIRED: {
    status: 400,
    text: "A restricted or high-risk worker needs a public alias.",
  },
  ALIAS_IS_LEGAL_NAME: {
    status: 400,
    text: "The public alias must differ from the worker's legal name.",
  },
  RETRY: { status: 503, text: "Mission Control is busy. Try again." },
  INVALID_INPUT: { status: 400, text: "Check the form and try again." },
  DISPLAY_NAME_REQUIRED: { status: 400, text: "Give a display name." },
  LEGAL_NAME_REQUIRED: { status: 400, text: "Give the worker's legal name." },
  LEGAL_ENTITY_REQUIRED: {
    status: 400,
    text: "Choose the legal entity this worker serves under.",
  },
  LEGAL_ENTITY_NOT_FOUND: {
    status: 404,
    text: "That legal entity is not this organization's.",
  },
  NO_LEGAL_ENTITY: {
    status: 400,
    text: "This organization has no legal entity yet.",
  },
  HAS_LOGIN: { status: 409, text: "This worker already has a login." },
  EMAIL_REQUIRED: { status: 400, text: "Give a valid e-mail address." },
} as const;

export type WorkerErrorCode = keyof typeof WORKER_ERRORS;

const NO_STORE = "no-store";

export function workerError(
  code: WorkerErrorCode,
  status: number = WORKER_ERRORS[code].status,
): NextResponse {
  return NextResponse.json(
    { error: WORKER_ERRORS[code].text, code },
    { status, headers: { "Cache-Control": NO_STORE } },
  );
}

export type WorkersOperation =
  | "list"
  | "count"
  | "record"
  | "restrict"
  | "lift"
  | "confirm"
  | "reveal"
  | "create"
  | "invite";

async function reportWorkersFailure(
  operation: WorkersOperation,
  code: string | null,
  requestId: string,
): Promise<void> {
  const failure = new Error();
  const reported = code === null ? failure : Object.assign(failure, { code });
  await reportOperationFailure(
    `admin.workers.${operation}`,
    reported,
    requestId,
    500,
  );
}

export async function workersFailure(
  operation: WorkersOperation,
  code: string | null,
  requestId: string,
): Promise<NextResponse> {
  await reportWorkersFailure(operation, code, requestId);
  return NextResponse.json(
    { error: FAILURE_TEXT },
    { status: 500, headers: { "Cache-Control": NO_STORE } },
  );
}

export async function workersOutcomeUnknown(
  operation: WorkersOperation,
  code: string | null,
  requestId: string,
): Promise<NextResponse> {
  await reportWorkersFailure(operation, code, requestId);
  return NextResponse.json(
    { error: OUTCOME_UNKNOWN_TEXT, code: "OUTCOME_UNKNOWN" },
    { status: 500, headers: { "Cache-Control": NO_STORE } },
  );
}

export interface RpcError {
  code?: unknown;
  message?: unknown;
}

function refusalOf(error: RpcError): WorkerErrorCode | null {
  const code = typeof error.code === "string" ? error.code : null;
  const message = typeof error.message === "string" ? error.message : "";
  if (code === "42501") return "NOT_PERMITTED";
  if (code === "P0002")
    return message === "No private identity for that worker"
      ? "NO_IDENTITY"
      : message === "No legal entity with that id in this organization"
        ? "LEGAL_ENTITY_NOT_FOUND"
        : "NOT_FOUND";
  if (code === "22023") {
    if (message === "A reason is required") return "REASON_REQUIRED";
    if (message === "A display name is required")
      return "DISPLAY_NAME_REQUIRED";
    if (message === "A legal name is required") return "LEGAL_NAME_REQUIRED";
    if (message === "Name the legal entity") return "LEGAL_ENTITY_REQUIRED";
    if (message === "This organization has no legal entity")
      return "NO_LEGAL_ENTITY";
    if (message === "A valid email address is required")
      return "EMAIL_REQUIRED";
    if (message === "Nothing to change") return "NOTHING_TO_CHANGE";
    if (
      message.startsWith("Lowering a level") ||
      message.startsWith("Raising a level") ||
      message === "The level changed since it was read"
    )
      return "LEVEL_CHANGED";
    if (
      message === "Unknown security level" ||
      message.startsWith("Clearing do-not-publish")
    )
      return "INVALID_CHANGE";
    return null;
  }
  if (code === "23514") {
    if (message.endsWith("needs a public alias")) return "ALIAS_REQUIRED";
    if (message.endsWith("must differ from the legal name"))
      return "ALIAS_IS_LEGAL_NAME";
    return null;
  }
  if (code === "55006") return "HAS_LOGIN";
  if (code === "55P03" || code === "40001" || code === "40P01") return "RETRY";
  return null;
}

export async function refusal(
  operation: WorkersOperation,
  error: RpcError,
  requestId: string,
): Promise<NextResponse> {
  const known = refusalOf(error);
  if (known) return workerError(known);
  return workersFailure(
    operation,
    typeof error.code === "string" ? error.code : null,
    requestId,
  );
}

export function isBlank(value: string): boolean {
  return normalizesToNothing(value);
}

export async function readBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await ensureJsonBody(request);
  } catch (error) {
    const status = error instanceof ApiHttpError ? error.status : 400;
    return { ok: false, response: workerError("INVALID_INPUT", status) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return { ok: false, response: workerError("INVALID_INPUT") };
  return { ok: true, data: parsed.data };
}

export const assignmentIdSchema = z.guid();

export async function assignmentIdOf(context?: {
  params?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<string | null> {
  const params = context?.params ? await context.params : undefined;
  const parsed = assignmentIdSchema.safeParse(params?.assignmentId);
  return parsed.success ? parsed.data : null;
}

async function jsonBody(
  response: Response,
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await response.clone().json();
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function withWorkersWrite<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    const response = await handler(...args);
    if (response.status === 403) {
      const body = await jsonBody(response);
      if (body?.code !== "NOT_PERMITTED")
        return NextResponse.json(
          {
            error: WORKER_ERRORS.NOT_PERMITTED.text,
            code: "NOT_PERMITTED",
            ...(typeof body?.requestId === "string"
              ? { requestId: body.requestId }
              : {}),
          },
          { status: 403, headers: { "Cache-Control": NO_STORE } },
        );
    }
    response.headers.set("Cache-Control", NO_STORE);
    return response;
  };
}

export interface WorkersRpcResult {
  data: unknown;
  error: RpcError | null;
  count?: number | null;
}

export interface WorkersRpcQuery extends PromiseLike<WorkersRpcResult> {
  order(column: string): WorkersRpcQuery;
  range(from: number, to: number): WorkersRpcQuery;
}

export interface WorkersRpcClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
    options?: { count?: "exact"; head?: boolean },
  ): WorkersRpcQuery;
}

export function rpcClient(client: RequestSessionClient): WorkersRpcClient {
  return {
    rpc: (fn, args, options) =>
      (options === undefined
        ? client.rpc(fn as never, args as never)
        : client.rpc(
            fn as never,
            args as never,
            options,
          )) as unknown as WorkersRpcQuery,
  };
}

type WorkerRowsRead =
  { ok: true; rows: WorkerRow[] } | { ok: false; error: RpcError | null };

async function readDirectory(
  client: WorkersRpcClient,
  pageSize: number,
): Promise<WorkerRowsRead> {
  const failed: { error: RpcError | null } = { error: null };
  let data: unknown[];
  try {
    data = await readAllPages<unknown>(async (from, to) => {
      const page = await client
        .rpc("worker_records", {})
        .order("display_name")
        .order("assignment_id")
        .range(from, to);
      if (page.error || !Array.isArray(page.data)) {
        failed.error = page.error;
        return { data: null, error: { message: "worker_records page" } };
      }
      return { data: page.data as unknown[], error: null };
    }, pageSize);
  } catch {
    return { ok: false, error: failed.error };
  }
  const parsed = workerRowsSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: null };
  const ids = new Set(parsed.data.map((row) => row.assignment_id));
  if (ids.size !== parsed.data.length) return { ok: false, error: null };
  return { ok: true, rows: parsed.data };
}

export async function readWorkerRows(
  client: WorkersRpcClient,
  assignmentId: string | null,
  pageSize = READ_ALL_PAGE_SIZE,
): Promise<WorkerRowsRead> {
  if (assignmentId === null) return readDirectory(client, pageSize);
  const { data, error } = await client.rpc("worker_records", {
    p_assignment_id: assignmentId,
  });
  if (error) return { ok: false, error };
  const parsed = workerRowsSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: null };
  return { ok: true, rows: parsed.data };
}

export function sameId(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}
