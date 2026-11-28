import { hasContextCapability } from "@asym/auth/context";
import { NextResponse } from "next/server";

import {
  INVITE_CAPABILITIES,
  WORKERS_CAPABILITY,
  assignmentIdOf,
  commandResultSchema,
  confirmBodySchema,
  createBodySchema,
  createResultSchema,
  inviteBodySchema,
  inviteNotPermitted,
  inviteResultSchema,
  isBlank,
  liftBodySchema,
  readBody,
  readWorkerRows,
  refusal,
  restrictBodySchema,
  revealBodySchema,
  revealResultSchema,
  rpcClient,
  sameId,
  toWorker,
  withWorkersWrite,
  workerError,
  workersFailure,
  workersOutcomeUnknown,
  type RpcError,
  type WorkerRow,
  type WorkersOperation,
  type WorkersRpcClient,
} from "./contract";
import { normalizesToNothing } from "./safety-text";
import { withOperation } from "../../shared/with-operation";

import type { RequestSessionClient } from "../../shared/request-session-client";
import type { z } from "zod";

const WRITE = { capability: WORKERS_CAPABILITY } as const;

const INVITATION_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
} as const;

const codeOf = (error: RpcError | null) =>
  error && typeof error.code === "string" ? error.code : null;

type Prepared<T> =
  | {
      ok: true;
      client: WorkersRpcClient;
      assignmentId: string;
      row: WorkerRow;
      body: T;
    }
  | { ok: false; response: NextResponse };

async function prepare<T extends { reason: string }>(
  operation: WorkersOperation,
  input: {
    request: Request;
    sessionClient: RequestSessionClient;
    requestId: string;
    context?: {
      params?: Promise<Record<string, string | string[] | undefined>>;
    };
  },
  schema: z.ZodType<T>,
): Promise<Prepared<T>> {
  const assignmentId = await assignmentIdOf(input.context);
  if (!assignmentId) return { ok: false, response: workerError("NOT_FOUND") };
  const body = await readBody(input.request, schema);
  if (!body.ok) return body;
  if (isBlank(body.data.reason))
    return { ok: false, response: workerError("REASON_REQUIRED") };
  const client = rpcClient(input.sessionClient);
  const read = await readWorkerRows(client, assignmentId);
  if (!read.ok)
    return {
      ok: false,
      response: await workersFailure(
        operation,
        codeOf(read.error),
        input.requestId,
      ),
    };
  const [row] = read.rows;
  if (!row || read.rows.length !== 1)
    return { ok: false, response: workerError("NOT_FOUND") };
  return { ok: true, client, assignmentId, row, body: body.data };
}

async function answerAfterCommand(
  operation: WorkersOperation,
  prepared: Extract<Prepared<unknown>, { ok: true }>,
  tenantId: string,
  requestId: string,
  result: { data: unknown; error: RpcError | null },
): Promise<NextResponse> {
  if (result.error) return refusal(operation, result.error, requestId);
  const parsed = commandResultSchema.safeParse(result.data);
  if (
    !parsed.success ||
    !sameId(parsed.data.tenant_id, tenantId) ||
    !sameId(parsed.data.party_id, prepared.row.party_id)
  )
    return workersOutcomeUnknown(operation, null, requestId);
  const reread = await readWorkerRows(prepared.client, prepared.assignmentId);
  if (!reread.ok)
    return workersOutcomeUnknown(operation, codeOf(reread.error), requestId);
  const [row] = reread.rows;
  if (!row || reread.rows.length !== 1)
    return workersOutcomeUnknown(operation, null, requestId);
  return NextResponse.json({ worker: toWorker(row) });
}

export const POST_RESTRICT = withWorkersWrite(
  withOperation(
    async ({ auth, request, sessionClient, requestId }, context) => {
      const prepared = await prepare(
        "restrict",
        { request, sessionClient, requestId, context },
        restrictBodySchema,
      );
      if (!prepared.ok) return prepared.response;
      const { alias, level, doNotPublish, reason } = prepared.body;
      const result = await prepared.client.rpc("restrict_worker_publication", {
        p_tenant_id: auth.tenantId,
        p_party_id: prepared.row.party_id,
        p_security_level: level ?? null,
        p_public_alias:
          alias !== undefined && !normalizesToNothing(alias) ? alias : null,
        p_do_not_publish: doNotPublish ?? null,
        p_reason: reason,
      });
      return answerAfterCommand(
        "restrict",
        prepared,
        auth.tenantId,
        requestId,
        result,
      );
    },
    WRITE,
  ),
);

export const POST_LIFT = withWorkersWrite(
  withOperation(
    async ({ auth, request, sessionClient, requestId }, context) => {
      const prepared = await prepare(
        "lift",
        { request, sessionClient, requestId, context },
        liftBodySchema,
      );
      if (!prepared.ok) return prepared.response;
      const { level, clearDoNotPublish, reason } = prepared.body;
      const result = await prepared.client.rpc("lift_worker_restriction", {
        p_tenant_id: auth.tenantId,
        p_party_id: prepared.row.party_id,
        p_security_level: level ?? null,
        p_clear_do_not_publish: clearDoNotPublish === true,
        p_reason: reason,
      });
      return answerAfterCommand(
        "lift",
        prepared,
        auth.tenantId,
        requestId,
        result,
      );
    },
    WRITE,
  ),
);

export const POST_CONFIRM = withWorkersWrite(
  withOperation(
    async ({ auth, request, sessionClient, requestId }, context) => {
      const prepared = await prepare(
        "confirm",
        { request, sessionClient, requestId, context },
        confirmBodySchema,
      );
      if (!prepared.ok) return prepared.response;
      const { level, reason } = prepared.body;
      if (
        prepared.row.security_level_source !== "unreviewed_default" ||
        prepared.row.security_level !== level
      )
        return workerError("LEVEL_CHANGED");
      const result = await prepared.client.rpc(
        "confirm_worker_security_level",
        {
          p_tenant_id: auth.tenantId,
          p_party_id: prepared.row.party_id,
          p_expected_level: level,
          p_expected_source: prepared.row.security_level_source,
          p_reason: reason,
        },
      );
      return answerAfterCommand(
        "confirm",
        prepared,
        auth.tenantId,
        requestId,
        result,
      );
    },
    WRITE,
  ),
);

export const POST_REVEAL = withWorkersWrite(
  withOperation(
    async ({ auth, request, sessionClient, requestId }, context) => {
      const prepared = await prepare(
        "reveal",
        { request, sessionClient, requestId, context },
        revealBodySchema,
      );
      if (!prepared.ok) return prepared.response;
      const { data, error } = await prepared.client.rpc(
        "reveal_worker_identity",
        {
          p_tenant_id: auth.tenantId,
          p_party_id: prepared.row.party_id,
          p_reason: prepared.body.reason,
        },
      );
      if (error) return refusal("reveal", error, requestId);
      const parsed = revealResultSchema.safeParse(data);
      if (
        !parsed.success ||
        !sameId(parsed.data.party_id, prepared.row.party_id)
      )
        return workersOutcomeUnknown("reveal", null, requestId);
      return NextResponse.json({
        legalName: parsed.data.legal_name,
        realCountry: parsed.data.real_country,
        preciseLocation: parsed.data.precise_location,
      });
    },
    WRITE,
  ),
);

export const POST_CREATE = withWorkersWrite(
  withOperation(async ({ auth, request, sessionClient, requestId }) => {
    const body = await readBody(request, createBodySchema);
    if (!body.ok) return body.response;
    const {
      displayName,
      legalName,
      realCountry,
      preciseLocation,
      level,
      alias,
      legalEntityId,
      reason,
    } = body.data;
    if (isBlank(reason)) return workerError("REASON_REQUIRED");
    const client = rpcClient(sessionClient);
    const result = await client.rpc("create_worker", {
      p_tenant_id: auth.tenantId,
      p_display_name: displayName,
      p_legal_name: legalName,
      p_real_country: realCountry ?? null,
      p_precise_location: preciseLocation ?? null,
      p_security_level: level ?? null,
      p_public_alias:
        alias === undefined || normalizesToNothing(alias) ? null : alias,
      p_legal_entity_id: legalEntityId ?? null,
      p_reason: reason,
    });
    if (result.error) return refusal("create", result.error, requestId);
    const parsed = createResultSchema.safeParse(result.data);
    if (!parsed.success || !sameId(parsed.data.tenant_id, auth.tenantId))
      return workersOutcomeUnknown("create", null, requestId);
    const reread = await readWorkerRows(client, parsed.data.assignment_id);
    if (!reread.ok)
      return workersOutcomeUnknown("create", codeOf(reread.error), requestId);
    const [row] = reread.rows;
    if (!row || reread.rows.length !== 1)
      return workersOutcomeUnknown("create", null, requestId);
    return NextResponse.json({ worker: toWorker(row) }, { status: 201 });
  }, WRITE),
);

export const POST_INVITE = withWorkersWrite(
  withOperation(
    async ({ auth, request, sessionClient, requestId }, context) => {
      const missing = INVITE_CAPABILITIES.filter(
        (capability) => !hasContextCapability(auth, capability),
      );
      if (missing.length > 0) return inviteNotPermitted(missing);
      const prepared = await prepare(
        "invite",
        { request, sessionClient, requestId, context },
        inviteBodySchema,
      );
      if (!prepared.ok) return prepared.response;
      if (prepared.row.has_login) return workerError("HAS_LOGIN");
      const { email, reason } = prepared.body;
      const { data, error } = await prepared.client.rpc("invite_worker", {
        p_tenant_id: auth.tenantId,
        p_email: email,
        p_party_id: prepared.row.party_id,
        p_display_name: null,
        p_legal_name: null,
        p_real_country: null,
        p_precise_location: null,
        p_legal_entity_id: null,
        p_reason: reason,
      });
      if (codeOf(error) === "42501") return inviteNotPermitted([]);
      if (error) return refusal("invite", error, requestId);
      const parsed = inviteResultSchema.safeParse(data);
      if (
        !parsed.success ||
        !sameId(parsed.data.tenant_id, auth.tenantId) ||
        !sameId(parsed.data.party_id, prepared.row.party_id)
      )
        return workersOutcomeUnknown("invite", null, requestId);
      return NextResponse.json(
        {
          invitation: {
            invitationId: parsed.data.invitation_id,
            email,
            expiresAt: parsed.data.expires_at,
          },
          invitePath: `/invite/${parsed.data.selector}#${parsed.data.verifier}`,
        },
        { status: 201, headers: INVITATION_HEADERS },
      );
    },
  ),
);
