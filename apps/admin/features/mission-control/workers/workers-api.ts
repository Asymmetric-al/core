"use client";

import { ownApiFetch } from "@asym/database/own-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const SECURITY_LEVELS = [
  "standard",
  "sensitive",
  "restricted",
  "high_risk",
] as const;

export type SecurityLevel = (typeof SECURITY_LEVELS)[number];

export const LEVEL_LABELS: Record<SecurityLevel, string> = {
  standard: "Standard",
  sensitive: "Sensitive",
  restricted: "Restricted",
  high_risk: "High risk",
};

export interface Worker {
  assignmentId: string;
  partyId: string;
  displayName: string;
  publicAlias: string | null;
  securityLevel: SecurityLevel;
  securityLevelSource: "manual" | "country_default" | "unreviewed_default";
  doNotPublish: boolean;
  hasLegalIdentity: boolean | null;
  hasLogin: boolean;
  createdAt: string;
}

export interface RevealedIdentity {
  legalName: string;
  realCountry: string | null;
  preciseLocation: string | null;
}

export const WORKERS_QUERY_KEY = ["admin", "workers"] as const;

export function workerQueryKey(assignmentId: string) {
  return [...WORKERS_QUERY_KEY, assignmentId] as const;
}

export const NOT_PERMITTED_TEXT =
  "Only staff with the Restrict publication permission can change these settings.";

const FAILURE_TEXT = "Something went wrong. Nothing was changed.";

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

async function readError(response: Response): Promise<WorkerRequestError> {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
    code?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code : null;
  const message =
    response.status === 403
      ? NOT_PERMITTED_TEXT
      : code && typeof body?.error === "string"
        ? body.error
        : FAILURE_TEXT;
  return new WorkerRequestError(response.status, code, message);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await ownApiFetch(path, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await ownApiFetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
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
      (await getJson<{ workers: Worker[] }>("/api/admin/workers")).workers,
  });
}

export function useWorker(assignmentId: string) {
  return useQuery({
    ...FRESH,
    queryKey: workerQueryKey(assignmentId),
    queryFn: async () =>
      (
        await getJson<{ worker: Worker }>(
          `/api/admin/workers/${encodeURIComponent(assignmentId)}`,
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
        await postJson<{ worker: Worker }>(
          `/api/admin/workers/${encodeURIComponent(assignmentId)}/${command.kind}`,
          command.body,
        )
      ).worker,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY }),
  });
}

export async function revealWorkerIdentity(
  assignmentId: string,
  reason: string,
): Promise<RevealedIdentity> {
  const body = await postJson<RevealedIdentity>(
    `/api/admin/workers/${encodeURIComponent(assignmentId)}/reveal`,
    { reason },
  );
  return {
    legalName: body.legalName,
    realCountry: body.realCountry,
    preciseLocation: body.preciseLocation,
  };
}

export function isUnreviewed(worker: Pick<Worker, "securityLevelSource">) {
  return worker.securityLevelSource === "unreviewed_default";
}
