"use client";

import {
  FAILURE_TEXT,
  NOT_PERMITTED_TEXT,
  OUTCOME_UNKNOWN_TEXT,
  SECURITY_LEVELS,
  inviteEnvelopeSchema,
  legalEntitiesEnvelopeSchema,
  revealEnvelopeSchema,
  workerEnvelopeSchema,
  workerListEnvelopeSchema,
  type RevealedIdentity,
  type SecurityLevel,
  type Worker,
  type WorkerInvitation,
  type WorkerLegalEntity,
} from "@asym/api/admin/workers/envelopes";
import { ownApiFetch } from "@asym/database/own-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { z } from "zod";

export {
  NOT_PERMITTED_TEXT,
  SECURITY_LEVELS,
  type RevealedIdentity,
  type SecurityLevel,
  type Worker,
  type WorkerInvitation,
  type WorkerLegalEntity,
};

export const LEVEL_LABELS: Record<SecurityLevel, string> = {
  standard: "Standard",
  sensitive: "Sensitive",
  restricted: "Restricted",
  high_risk: "High risk",
};

export const SAFETY_CAPABILITY = "safety.restrict_publication";
export const MEMBERS_CAPABILITY = "people.manage_members";

export const WORKERS_QUERY_KEY = ["admin", "workers"] as const;

export function workerQueryKey(assignmentId: string) {
  return [...WORKERS_QUERY_KEY, assignmentId] as const;
}

export class WorkerRequestError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(status: number, code: string | null, message: string) {
    super(message);
    this.name = "WorkerRequestError";
    this.status = status;
    this.code = code;
  }
}

const outcomeUnknown = () =>
  new WorkerRequestError(0, "OUTCOME_UNKNOWN", OUTCOME_UNKNOWN_TEXT);

async function readError(response: Response): Promise<WorkerRequestError> {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
    code?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code : null;
  const message =
    response.status === 403
      ? code === "NOT_PERMITTED" && typeof body?.error === "string"
        ? body.error
        : NOT_PERMITTED_TEXT
      : code && typeof body?.error === "string"
        ? body.error
        : FAILURE_TEXT;
  return new WorkerRequestError(response.status, code, message);
}

async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await ownApiFetch(path, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw await readError(response);
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success)
    throw new WorkerRequestError(response.status, null, FAILURE_TEXT);
  return parsed.data;
}

async function postJson<T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await ownApiFetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch(() => {
    throw outcomeUnknown();
  });
  if (!response.ok) throw await readError(response);
  const parsed = schema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw outcomeUnknown();
  return parsed.data;
}

const FRESH = {
  staleTime: 0,
  refetchOnWindowFocus: true,
  retry: false,
} as const;

export function useWorkers() {
  return useQuery({
    ...FRESH,
    queryKey: WORKERS_QUERY_KEY,
    queryFn: async () =>
      (await getJson("/api/admin/workers", workerListEnvelopeSchema)).workers,
  });
}

export function useWorker(assignmentId: string) {
  return useQuery({
    ...FRESH,
    queryKey: workerQueryKey(assignmentId),
    queryFn: async () =>
      (
        await getJson(
          `/api/admin/workers/${encodeURIComponent(assignmentId)}`,
          workerEnvelopeSchema,
        )
      ).worker,
  });
}

export type WorkerCommand =
  | {
      kind: "restrict";
      body: {
        level?: SecurityLevel;
        alias?: string;
        doNotPublish?: true;
        reason: string;
      };
    }
  | {
      kind: "lift";
      body: { level?: SecurityLevel; clearDoNotPublish?: true; reason: string };
    }
  | { kind: "confirm"; body: { level: SecurityLevel; reason: string } };

export function useWorkerCommand(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (command: WorkerCommand) =>
      (
        await postJson(
          `/api/admin/workers/${encodeURIComponent(assignmentId)}/${command.kind}`,
          command.body,
          workerEnvelopeSchema,
        )
      ).worker,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY }),
  });
}

export type CreateWorkerBody = {
  displayName: string;
  legalName: string;
  realCountry?: string;
  preciseLocation?: string;
  level?: SecurityLevel;
  alias?: string;
  legalEntityId?: string;
  reason: string;
};

export function useWorkerLegalEntities(enabled: boolean) {
  return useQuery({
    ...FRESH,
    queryKey: ["admin", "worker-legal-entities"] as const,
    enabled,
    queryFn: async () =>
      (
        await getJson(
          "/api/admin/workers/legal-entities",
          legalEntitiesEnvelopeSchema,
        )
      ).legalEntities,
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateWorkerBody) =>
      (await postJson("/api/admin/workers", body, workerEnvelopeSchema)).worker,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY }),
  });
}

export function useInviteWorker(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; reason: string }) =>
      postJson(
        `/api/admin/workers/${encodeURIComponent(assignmentId)}/invite`,
        body,
        inviteEnvelopeSchema,
      ),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY }),
  });
}

export async function revealWorkerIdentity(
  assignmentId: string,
  reason: string,
): Promise<RevealedIdentity> {
  return postJson(
    `/api/admin/workers/${encodeURIComponent(assignmentId)}/reveal`,
    { reason },
    revealEnvelopeSchema,
  );
}

export function isUnreviewed(worker: Pick<Worker, "securityLevelSource">) {
  return worker.securityLevelSource === "unreviewed_default";
}
