import { z } from "zod";

import {
  dashboardSchema,
  detailSchema,
  healthSchema,
  scrub,
  scrubDeep,
  type NodeTiming,
  type Run,
  type RunDetailView,
  type RunRow,
} from "../lib/contracts";
import { runIntervals } from "../lib/timing";

import type { Configuration } from "./security";

export class BackendError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

type Transport = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export async function readLimited(
  body: ReadableStream<Uint8Array> | null,
  maximum: number,
) {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new BackendError(
          "Response or request exceeds the Console byte limit",
          413,
        );
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

const NODE_EVENTS = new Set([
  "node_started",
  "node_completed",
  "node_failed",
  "node_skipped",
  "node_suspended",
  "node_skipped_prior_success",
]);

function textField(value: unknown, maximum = 120) {
  return typeof value === "string" && value.trim()
    ? scrub(value.slice(0, maximum))
    : null;
}

/** Lifecycle timing and the model the engine reports, per node. */
export function nodeTimings(
  events: z.infer<typeof detailSchema>["events"],
): Record<string, NodeTiming> {
  const timings: Record<string, NodeTiming> = {};
  const ordered = [...events].sort(
    (left, right) => Date.parse(left.created_at) - Date.parse(right.created_at),
  );
  for (const event of ordered) {
    if (!event.step_name || !NODE_EVENTS.has(event.event_type)) continue;
    const timing = (timings[event.step_name] ??= {
      node: event.step_name,
      startedAt: null,
      endedAt: null,
      lastEvent: null,
      attempts: 0,
      model: null,
      effort: null,
      provider: null,
      durationMs: null,
    });
    const data = event.data ?? {};
    if (event.event_type === "node_started") {
      // The latest attempt's start: a retried node reports its current attempt.
      timing.attempts += 1;
      timing.startedAt = event.created_at;
      timing.endedAt = null;
    } else if (event.event_type !== "node_suspended") {
      timing.endedAt = event.created_at;
    }
    timing.lastEvent = event.event_type;
    const usage =
      data.model_usage && typeof data.model_usage === "object"
        ? (data.model_usage as Record<string, unknown>)
        : null;
    timing.model =
      textField(usage?.resolved) ?? textField(data.model) ?? timing.model;
    timing.effort = textField(data.effort, 40) ?? timing.effort;
    timing.provider = textField(data.provider, 40) ?? timing.provider;
    if (typeof data.duration_ms === "number" && data.duration_ms >= 0)
      timing.durationMs = data.duration_ms;
  }
  return timings;
}

function publicRun(run: RunRow): Run {
  // Node states (and their unbounded error text) reach the browser only
  // through RunDetailView.nodes, which clips each error.
  const { attention, user_message, nodes, ...rest } = run;
  void nodes;
  return scrubDeep({
    ...rest,
    user_message: user_message.slice(0, 600),
    needs_attention: attention !== null && attention !== undefined,
  });
}

export class Archon {
  constructor(
    private config: Configuration,
    private transport: Transport = fetch,
  ) {}

  private async request(path: string, maximum = 2_000_000) {
    let response: Response;
    try {
      response = await this.transport(`${this.config.backend}${path}`, {
        method: "GET",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
        headers: { Accept: "application/json" },
      });
    } catch {
      throw new BackendError("Archon disconnected or timed out", 503);
    }
    if (!response.ok)
      throw new BackendError(
        `Archon refused the request (HTTP ${response.status})`,
        response.status === 404 ? 404 : 502,
      );
    return readLimited(response.body, maximum);
  }

  private async json<Output>(
    path: string,
    schema: z.ZodType<Output>,
    maximum?: number,
  ): Promise<Output> {
    try {
      return schema.parse(JSON.parse(await this.request(path, maximum)));
    } catch (error) {
      if (error instanceof BackendError) throw error;
      throw new BackendError(
        "Archon response schema unavailable or incompatible",
      );
    }
  }

  async health() {
    const health = await this.json("/api/health", healthSchema);
    if (health.storeId !== this.config.storeId || health.version !== "0.14.0")
      throw new BackendError(
        "Unexpected Archon instance or version. The owner must reconcile configuration.",
        503,
      );
    return health;
  }

  private id(value: string) {
    if (!/^[A-Za-z0-9_-]{1,160}$/.test(value))
      throw new BackendError("Invalid native identifier", 400);
  }

  /** One run with node states, node timing and lifecycle rows. */
  async detail(
    runId: string,
    { checked = false } = {},
  ): Promise<RunDetailView> {
    this.id(runId);
    if (!checked) await this.health();
    const detail = await this.json(
      `/api/workflows/runs/${runId}`,
      detailSchema,
      16_000_000,
    );
    if (detail.run.id !== runId)
      throw new BackendError("Archon returned another run", 502);
    if (detail.run.codebase_id !== this.config.codebaseId)
      throw new BackendError(
        "Run is outside the authorized project scope",
        403,
      );
    return {
      run: publicRun(detail.run),
      nodes: (detail.run.nodes ?? []).map((node) => ({
        node_id: node.node_id,
        state: node.state,
        ...(node.error ? { error: scrub(node.error.slice(0, 600)) } : {}),
      })),
      timings: nodeTimings(detail.events),
      intervals: runIntervals(detail.events, {
        status: detail.run.status,
        completedAt: detail.run.completed_at,
      }),
      events: detail.events.slice(-200).map((event) => ({
        id: event.id,
        event_type: event.event_type,
        step_name: event.step_name,
        created_at: event.created_at,
      })),
      observedAt: new Date().toISOString(),
    };
  }

  async runs(offset = 0, { checked = false } = {}) {
    if (!checked) await this.health();
    const query = new URLSearchParams({
      codebaseId: this.config.codebaseId,
      limit: "50",
      offset: String(offset),
    });
    const dashboard = await this.json(
      `/api/dashboard/runs?${query}`,
      dashboardSchema,
    );
    if (
      dashboard.runs.some((run) => run.codebase_id !== this.config.codebaseId)
    )
      throw new BackendError("Native run list violated project scope", 403);
    return {
      runs: dashboard.runs.map(publicRun),
      total: dashboard.total,
      counts: dashboard.counts,
    };
  }

  async artifacts(runId: string) {
    await this.detail(runId);
    const result = await this.json(
      `/api/runs/${runId}/artifacts`,
      z.object({
        files: z.array(
          z.object({
            path: z.string(),
            size: z.number(),
            modifiedAt: z.string(),
          }),
        ),
      }),
    );
    return {
      files: result.files
        .slice(0, 500)
        .map((file) => ({ ...file, path: scrub(file.path) })),
    };
  }
}
