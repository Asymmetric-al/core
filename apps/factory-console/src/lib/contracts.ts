// Archon 0.14.0 HTTP contract (packages/server/src/routes/schemas in the
// pinned source). Only the fields the Console consumes are selected; zod
// strips the rest. Node events are reduced to lifecycle timing and the model
// the engine reports, never node outputs, structured outputs (which would
// include unsealed review findings), session ids or provider payloads.
import { z } from "zod";

import type { RunIntervals } from "./timing";

export const statuses = [
  "pending",
  "running",
  "paused",
  "completed",
  "failed",
  "cancelled",
] as const;
export const nodeStates = [
  "pending",
  "running",
  "completed",
  "failed",
  "skipped",
] as const;

const stamp = z.string().max(64);

export const runSchema = z.object({
  id: z.string().max(200),
  workflow_name: z.string().max(200),
  codebase_id: z.string().nullable(),
  status: z.enum(statuses),
  started_at: stamp,
  completed_at: stamp.nullable(),
  last_activity_at: stamp.nullable(),
  user_message: z.string(),
  parent_run_id: z.string().nullable(),
  adopted_from_run_id: z.string().nullable().optional(),
  active_nodes: z.array(z.string()).optional(),
  owner_observation: z
    .enum(["reachable", "unreachable", "unknown"])
    .nullable()
    .optional(),
  attention: z.unknown().optional(),
  nodes: z
    .array(
      z.object({
        node_id: z.string(),
        state: z.enum(nodeStates),
        error: z.string().optional(),
      }),
    )
    .optional(),
});

export const eventSchema = z.object({
  id: z.string(),
  workflow_run_id: z.string(),
  event_type: z.string(),
  step_name: z.string().nullable(),
  created_at: stamp,
  data: z.record(z.string(), z.unknown()).optional(),
});

export const detailSchema = z.object({
  run: runSchema,
  events: z.array(eventSchema),
});

export const dashboardSchema = z.object({
  runs: z.array(runSchema),
  total: z.number().nonnegative(),
  counts: z.object({
    all: z.number(),
    running: z.number(),
    completed: z.number(),
    failed: z.number(),
    cancelled: z.number(),
    pending: z.number(),
    paused: z.number(),
  }),
});

export const healthSchema = z.object({
  status: z.string(),
  version: z.string(),
  storeId: z.string(),
  runningWorkflows: z.number(),
  concurrency: z.object({
    active: z.number(),
    maxConcurrent: z.number(),
    queuedTotal: z.number(),
  }),
});

export type RunRow = z.infer<typeof runSchema>;
/** A run as sent to the browser: no request text beyond a bounded preview. */
export type Run = Omit<RunRow, "attention" | "user_message" | "nodes"> & {
  user_message: string;
  needs_attention: boolean;
};
export type Health = z.infer<typeof healthSchema>;

export type NodeTiming = {
  node: string;
  startedAt: string | null;
  endedAt: string | null;
  lastEvent: string | null;
  attempts: number;
  model: string | null;
  effort: string | null;
  provider: string | null;
  durationMs: number | null;
};

export type RunDetailView = {
  run: Run;
  nodes: {
    node_id: string;
    state: (typeof nodeStates)[number];
    error?: string;
  }[];
  timings: Record<string, NodeTiming>;
  events: {
    id: string;
    event_type: string;
    step_name: string | null;
    created_at: string;
  }[];
  /** Every node attempt, wait and uncertain gap, rebuilt from all events. */
  intervals: RunIntervals;
  observedAt: string;
};

export type EngineState = {
  health: Health;
  runs: Run[];
  total: number;
  offset: number;
  counts: z.infer<typeof dashboardSchema>["counts"];
  details: Record<string, RunDetailView>;
  detailErrors: Record<string, string>;
};

export function consoleScope(identity: {
  instance: string;
  operator: string;
  codebase: string;
}) {
  return JSON.stringify([
    identity.instance,
    identity.operator,
    identity.codebase,
  ]);
}

export function elapsed(
  start: string | null | undefined,
  end: string | null | undefined,
  now: number,
) {
  if (!start) return null;
  const startMs = Date.parse(start);
  const endMs = end ? Date.parse(end) : now;
  return Number.isFinite(startMs) && Number.isFinite(endMs) && endMs >= startMs
    ? endMs - startMs
    : null;
}

export function duration(milliseconds: number | null) {
  if (milliseconds === null) return "Unavailable";
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

const PRIVATE_PATH =
  /(?:[A-Za-z]:\\|\/(?:home|root|Users|srv|opt|etc|var|tmp|run|proc|mnt|usr\/local)\/)[^\s"'<>`)\]]*/g;

/** Defense-in-depth redaction of credentials and private host paths. */
export function scrub(text: string): string {
  return text
    .replace(
      /\b(?:sk-ant-|sk-|ghp_|gho_|ghs_|ghu_|github_pat_|re_|whsec_)[A-Za-z0-9_+/=-]{8,}/g,
      "[redacted]",
    )
    .replace(PRIVATE_PATH, "[private path]")
    .replace(
      /\b(?:password|api[_-]?key|access[_-]?token|secret|authorization)\s*[:=]\s*[^\s,;]+/gi,
      "[redacted credential]",
    );
}

/** Recursively scrub every string in a JSON-compatible value. */
export function scrubDeep<Value>(value: Value): Value {
  if (typeof value === "string") return scrub(value) as Value;
  if (Array.isArray(value))
    return value.map((item) => scrubDeep(item)) as Value;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, scrubDeep(item)]),
    ) as Value;
  return value;
}

/** Only https links to an allowed host become anchors; everything else is text. */
export function safeHref(
  value: string | null | undefined,
  hosts: readonly string[] = ["github.com"],
) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (!hosts.includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}
