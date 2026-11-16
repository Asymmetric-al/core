"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import { isRetryable } from "../lib/factory";

import type { RunDetailView } from "../lib/contracts";
import type {
  AnalysisReport,
  ChatDoc,
  ChatView,
  ControlAction,
  ControlReceipt,
  IssueDetailView,
} from "../lib/factory";
import type { LedgerPage, LedgerQuery } from "../lib/ledger";
import type { PerformanceView } from "../lib/performance";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number | null,
  ) {
    super(message);
  }
}

/** Same-origin BFF call. Network loss is reported with status null. */
export async function api<Value>(path: string, body?: unknown): Promise<Value> {
  let response: Response;
  try {
    response = await fetch(`/api/console/${path}`, {
      cache: "no-store",
      ...(body === undefined
        ? {}
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
  } catch {
    throw new ApiError("The Console could not reach its server.", null);
  }
  let result: unknown = null;
  try {
    result = await response.json();
  } catch {
    result = null;
  }
  if (!response.ok) {
    const message =
      result && typeof result === "object" && "error" in result
        ? String((result as { error: unknown }).error)
        : `Console request failed (HTTP ${response.status})`;
    throw new ApiError(message, response.status);
  }
  return result as Value;
}

export const STALE_AFTER_MS = 45_000;
export const keys = {
  snapshot: (scope: string, offset: number) =>
    [scope, "snapshot", offset] as const,
  issue: (scope: string, issue: number) => [scope, "issue", issue] as const,
  run: (scope: string, run: string) => [scope, "run", run] as const,
  artifacts: (scope: string, run: string) => [scope, "artifacts", run] as const,
  chat: (scope: string) => [scope, "chat"] as const,
  conversation: (scope: string, id: string) =>
    [scope, "conversation", id] as const,
  report: (scope: string, run: string) => [scope, "report", run] as const,
  ledger: (scope: string, query: LedgerQuery) =>
    [scope, "ledger", query] as const,
  performance: (scope: string) => [scope, "performance"] as const,
};

/** Why a read failed, in words an operator can act on. */
export function failureText(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403)
      return "Owner authentication is required for this read. Reload the page and sign in as the Console owner.";
    if (error.status === null)
      return "Disconnected: the Console could not reach its server. Nothing is retried for you except the next scheduled read.";
  }
  return error instanceof Error ? error.message : "The read failed.";
}

export function ledgerPath(query: LedgerQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== "") params.set(key, String(value));
  return `ledger?${params.toString()}`;
}

/** One server-side page of History & decisions or Checks & reviews. */
export function useLedger(
  scope: string,
  query: LedgerQuery,
  { paused, active }: { paused: boolean; active: boolean },
) {
  return useQuery({
    queryKey: keys.ledger(scope, query),
    queryFn: () => api<LedgerPage>(ledgerPath(query)),
    enabled: active,
    refetchInterval: paused || !active ? false : 30_000,
    refetchOnWindowFocus: !paused && active,
    refetchOnReconnect: !paused,
    // Keep the previous page on screen while the next one is read.
    placeholderData: (previous) => previous,
  });
}

/** Performance is re-read every minute; two missed reads make it stale. */
export const PERFORMANCE_REFRESH_MS = 60_000;

export function usePerformance(
  scope: string,
  { paused, active }: { paused: boolean; active: boolean },
) {
  return useQuery({
    queryKey: keys.performance(scope),
    queryFn: () =>
      api<PerformanceView & { malformed: { name: string; reason: string }[] }>(
        "performance",
      ),
    enabled: active,
    refetchInterval: paused || !active ? false : PERFORMANCE_REFRESH_MS,
    refetchOnWindowFocus: !paused && active,
    refetchOnReconnect: !paused,
  });
}

export function useIssue(scope: string, issue: number | null, paused: boolean) {
  return useQuery({
    queryKey: keys.issue(scope, issue ?? 0),
    queryFn: () => api<IssueDetailView>(`issues/${issue}`),
    enabled: issue !== null,
    // Controls in the sheet act on this read, so it is always re-read when the
    // sheet opens (cached data alone never authorizes an action).
    refetchOnMount: "always",
    refetchInterval: paused ? false : 15_000,
    refetchOnWindowFocus: !paused,
    refetchOnReconnect: !paused,
  });
}

export function useRun(scope: string, run: string | null, paused: boolean) {
  return useQuery({
    queryKey: keys.run(scope, run ?? ""),
    queryFn: () => api<RunDetailView>(`runs/${encodeURIComponent(run ?? "")}`),
    enabled: Boolean(run),
    refetchOnMount: "always",
    refetchInterval: paused ? false : 10_000,
    refetchOnWindowFocus: !paused,
    refetchOnReconnect: !paused,
  });
}

export function useArtifacts(
  scope: string,
  run: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: keys.artifacts(scope, run ?? ""),
    queryFn: () =>
      api<{ files: { path: string; size: number; modifiedAt: string }[] }>(
        `runs/${encodeURIComponent(run ?? "")}/artifacts`,
      ),
    enabled: Boolean(run) && enabled,
  });
}

/**
 * Conversations. `fast` is evaluated against the latest data, so fast polling
 * stops as soon as the awaited reply is listed; `idle` (a hidden tab with
 * nothing pending) stops polling altogether.
 */
export function useChat(
  scope: string,
  paused: boolean,
  idle: boolean,
  fast: (view: ChatView | undefined) => boolean,
) {
  return useQuery({
    queryKey: keys.chat(scope),
    queryFn: () => api<ChatView>("chat"),
    refetchInterval: (query) =>
      paused || idle ? false : fast(query.state.data) ? 4_000 : 20_000,
    refetchOnWindowFocus: !paused && !idle,
    refetchOnReconnect: !paused,
  });
}

export function useConversation(
  scope: string,
  id: string | null,
  poll: boolean,
) {
  return useQuery({
    queryKey: keys.conversation(scope, id ?? ""),
    queryFn: () =>
      api<{ observedAt: string; doc: ChatDoc | null }>(
        `chat/${encodeURIComponent(id ?? "")}`,
      ),
    enabled: Boolean(id) && poll,
    refetchInterval: poll ? 3_000 : false,
  });
}

export function useReport(scope: string, run: string | null) {
  return useQuery({
    queryKey: keys.report(scope, run ?? ""),
    queryFn: () =>
      api<AnalysisReport>(`analysis/${encodeURIComponent(run ?? "")}`),
    enabled: Boolean(run),
  });
}

export type ControlState =
  | { phase: "idle" }
  | { phase: "running"; requestId: string | null; startedAt: string }
  | { phase: "done"; receipt: ControlReceipt }
  | {
      phase: "error";
      requestId: string | null;
      message: string;
      transport: boolean;
    };

/**
 * One operator control attempt. Each click mints a new request id on the
 * server; Retry resends the same action with the same id, which control.mjs
 * treats as idempotent. Nothing here is a record of state: the result shown is
 * the server's receipt, and the durable state is re-read afterwards.
 */
export function useControl(scope: string) {
  const client = useQueryClient();
  const [state, setState] = useState<ControlState>({ phase: "idle" });
  const last = useRef<{
    action: ControlAction;
    confirmed: boolean;
    requestId: string | null;
  } | null>(null);
  const busy = useRef(false);

  const send = useCallback(
    async (action: ControlAction, confirmed: boolean, reuse: string | null) => {
      if (busy.current) return;
      busy.current = true;
      let requestId = reuse;
      setState({
        phase: "running",
        requestId,
        startedAt: new Date().toISOString(),
      });
      try {
        if (!requestId) {
          requestId = (await api<{ requestId: string }>("request-ids", {}))
            .requestId;
          last.current = { action, confirmed, requestId };
          setState({
            phase: "running",
            requestId,
            startedAt: new Date().toISOString(),
          });
        }
        const receipt = await api<ControlReceipt>("controls", {
          requestId,
          action,
          confirmed,
        });
        setState({ phase: "done", receipt });
      } catch (error) {
        setState({
          phase: "error",
          requestId,
          message:
            error instanceof Error ? error.message : "The control failed.",
          transport:
            error instanceof ApiError &&
            (error.status === null || error.status >= 500),
        });
      } finally {
        busy.current = false;
        void client.invalidateQueries({ queryKey: [scope] });
      }
    },
    [client, scope],
  );

  return {
    state,
    run(action: ControlAction, { confirmed = false } = {}) {
      // A click while an attempt is in flight is dropped before it can
      // overwrite the retry record of that attempt.
      if (busy.current) return Promise.resolve();
      last.current = { action, confirmed, requestId: null };
      return send(action, confirmed, null);
    },
    retry() {
      const previous = last.current;
      if (!previous) return Promise.resolve();
      return send(previous.action, previous.confirmed, previous.requestId);
    },
    canRetry:
      (state.phase === "error" && state.transport) ||
      (state.phase === "done" && isRetryable(state.receipt.outcome)),
    reset() {
      last.current = null;
      setState({ phase: "idle" });
    },
  };
}
export type Control = ReturnType<typeof useControl>;
