// TEST-ONLY synthetic Archon 0.14.0 HTTP surface: health, dashboard runs,
// run detail (node states + lifecycle events) and cancellation. Usable as a
// fetch transport in unit tests and behind the loopback e2e fixture server.
import { RUN } from "./factory-fixture";

type NodeState = "pending" | "running" | "completed" | "failed" | "skipped";
type EngineEvent = {
  id: string;
  workflow_run_id: string;
  event_type: string;
  step_index: number | null;
  step_name: string | null;
  data: Record<string, unknown>;
  created_at: string;
};
type EngineRun = {
  id: string;
  workflow_name: string;
  codebase_id: string;
  status:
    "pending" | "running" | "paused" | "completed" | "failed" | "cancelled";
  started_at: string;
  completed_at: string | null;
  last_activity_at: string | null;
  user_message: string;
  parent_run_id: string | null;
  metadata: Record<string, unknown>;
  attention: null;
  owner_observation: "reachable" | null;
  nodes: { node_id: string; state: NodeState; error?: string }[];
  events: EngineEvent[];
};

export type EngineFixture = ReturnType<typeof createEngine>;

export function createEngine({
  base = Date.now(),
  codebase = "fixture-core",
  store = "fixture-store",
} = {}) {
  const at = (minutes: number) =>
    new Date(base - minutes * 60_000).toISOString();
  const runs = new Map<string, EngineRun>();
  let sequence = 0;
  const event = (
    run: string,
    type: string,
    step: string | null,
    minutes: number,
    data: Record<string, unknown> = {},
  ): EngineEvent => ({
    id: `event-${(sequence += 1)}`,
    workflow_run_id: run,
    event_type: type,
    step_index: null,
    step_name: step,
    data,
    created_at: at(minutes),
  });
  const add = (
    run: Omit<
      EngineRun,
      | "codebase_id"
      | "metadata"
      | "attention"
      | "parent_run_id"
      | "owner_observation"
    > & { owner_observation?: EngineRun["owner_observation"] },
  ) => {
    runs.set(run.id, {
      codebase_id: codebase,
      metadata: {},
      attention: null,
      parent_run_id: null,
      owner_observation: run.status === "running" ? "reachable" : null,
      ...run,
    });
  };
  const completedNode = (
    run: string,
    node: string,
    start: number,
    end: number,
    data: Record<string, unknown> = {},
  ) => [
    event(run, "node_started", node, start, data),
    event(run, "node_completed", node, end, {
      ...data,
      duration_ms: (start - end) * 60_000,
      node_output: "SECRET-NODE-OUTPUT must never reach the browser",
    }),
  ];
  const model = {
    provider: "claude",
    model: "opus",
    model_usage: { requested: "opus", resolved: "claude-opus-fixture" },
  };

  add({
    id: RUN.repair,
    workflow_name: "core-deliver",
    status: "running",
    started_at: at(12),
    completed_at: null,
    last_activity_at: at(1),
    user_message: "Synthetic delivery round for #101 (repair)",
    nodes: [
      { node_id: "claim", state: "completed" },
      { node_id: "cooldown", state: "skipped" },
      { node_id: "context", state: "completed" },
      { node_id: "scope", state: "skipped" },
      { node_id: "after-scope", state: "completed" },
      { node_id: "define", state: "skipped" },
      { node_id: "after-define", state: "completed" },
      { node_id: "build", state: "running" },
    ],
    events: [
      event(RUN.repair, "workflow_started", null, 12),
      ...completedNode(RUN.repair, "claim", 12, 11),
      event(RUN.repair, "node_skipped", "cooldown", 11),
      ...completedNode(RUN.repair, "context", 11, 10),
      event(RUN.repair, "node_skipped", "scope", 10),
      ...completedNode(RUN.repair, "after-scope", 10, 10),
      event(RUN.repair, "node_skipped", "define", 10),
      ...completedNode(RUN.repair, "after-define", 10, 9),
      event(RUN.repair, "node_started", "build", 9, {
        ...model,
        effort: "medium",
        structured_output: { secret: "SECRET-STRUCTURED-OUTPUT" },
      }),
    ],
  });
  add({
    id: RUN.review,
    workflow_name: "core-deliver",
    status: "running",
    started_at: at(40),
    completed_at: null,
    last_activity_at: at(2),
    user_message: "Synthetic delivery round for #102 (initial)",
    nodes: [
      { node_id: "claim", state: "completed" },
      { node_id: "cooldown", state: "skipped" },
      { node_id: "context", state: "completed" },
      { node_id: "scope", state: "completed" },
      { node_id: "after-scope", state: "completed" },
      { node_id: "define", state: "completed" },
      { node_id: "after-define", state: "completed" },
      { node_id: "build", state: "completed" },
      { node_id: "freeze", state: "completed" },
      { node_id: "micaiah", state: "running" },
      { node_id: "luke", state: "completed" },
    ],
    events: [
      event(RUN.review, "workflow_started", null, 40),
      ...completedNode(RUN.review, "claim", 40, 39),
      event(RUN.review, "node_skipped", "cooldown", 39),
      ...completedNode(RUN.review, "context", 39, 38),
      ...completedNode(RUN.review, "scope", 38, 33, {
        ...model,
        effort: "high",
      }),
      ...completedNode(RUN.review, "after-scope", 33, 33),
      ...completedNode(RUN.review, "define", 33, 26, {
        ...model,
        effort: "high",
      }),
      ...completedNode(RUN.review, "after-define", 26, 26),
      ...completedNode(RUN.review, "build", 26, 14, {
        ...model,
        effort: "medium",
      }),
      ...completedNode(RUN.review, "freeze", 14, 11),
      event(RUN.review, "node_started", "micaiah", 11, {
        ...model,
        effort: "high",
      }),
      ...completedNode(RUN.review, "luke", 11, 4, { ...model, effort: "high" }),
    ],
  });
  for (const [id, minutes] of [
    [RUN.history101, 30],
    [RUN.published103, 90],
    [RUN.blocked104, 95],
    [RUN.merged105, 160],
  ] as const)
    add({
      id,
      workflow_name: "core-deliver",
      status: "completed",
      started_at: at(minutes),
      completed_at: at(minutes - 5),
      last_activity_at: at(minutes - 5),
      user_message: "Synthetic finished delivery round",
      nodes: [
        { node_id: "claim", state: "completed" },
        { node_id: "record", state: "completed" },
      ],
      events: [
        ...completedNode(id, "claim", minutes, minutes - 1),
        ...completedNode(id, "record", minutes - 4, minutes - 5),
      ],
    });
  add({
    id: RUN.select,
    workflow_name: "core-select",
    status: "completed",
    started_at: at(46),
    completed_at: at(45),
    last_activity_at: at(45),
    user_message: "Synthetic admission pass",
    nodes: [
      { node_id: "facts", state: "completed" },
      { node_id: "rank", state: "completed" },
      { node_id: "admit", state: "completed" },
    ],
    events: [],
  });
  add({
    id: RUN.analysis,
    workflow_name: "core-analyze",
    status: "completed",
    started_at: at(27),
    completed_at: at(25),
    last_activity_at: at(25),
    user_message: "Synthetic analysis",
    nodes: [{ node_id: "record", state: "completed" }],
    events: [],
  });

  const json = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const row = (run: EngineRun) => {
    const { events, ...rest } = run;
    void events;
    return {
      ...rest,
      active_nodes: run.nodes
        .filter((node) => node.state === "running")
        .map((node) => node.node_id),
    };
  };

  let healthy = true;

  return {
    runs,
    setHealthy(value: boolean) {
      healthy = value;
    },
    /** Start a synthetic run (used when the fake control fires a workflow). */
    start(id: string, workflow: string, message: string) {
      add({
        id,
        workflow_name: workflow,
        status: "running",
        started_at: new Date().toISOString(),
        completed_at: null,
        last_activity_at: new Date().toISOString(),
        user_message: message,
        nodes: [{ node_id: "facts", state: "running" }],
        events: [],
      });
    },
    finish(id: string, status: EngineRun["status"] = "completed") {
      const run = runs.get(id);
      if (!run) return;
      run.status = status;
      run.completed_at = new Date().toISOString();
      run.nodes = run.nodes.map((node) => ({
        ...node,
        state:
          node.state === "running"
            ? status === "completed"
              ? "completed"
              : "failed"
            : node.state,
      }));
    },
    cancel(id: string) {
      const run = runs.get(id);
      if (!run) return { status: 404, observed: null, detail: "Run not found" };
      if (run.status !== "running" && run.status !== "paused")
        return {
          status: 409,
          observed: run.status,
          detail: `Run is ${run.status}`,
        };
      run.status = "cancelled";
      run.completed_at = new Date().toISOString();
      run.nodes = run.nodes.map((node) =>
        node.state === "running"
          ? { ...node, state: "failed", error: "Cancelled by operator" }
          : node,
      );
      return {
        status: 200,
        observed: "cancelled",
        detail: JSON.stringify({
          success: true,
          message: "Synthetic cancellation",
        }),
      };
    },
    async handle(method: string, url: string): Promise<Response> {
      const parsed = new URL(url, "http://127.0.0.1");
      const path = parsed.pathname;
      if (!healthy) return json({ error: "Synthetic engine outage" }, 503);
      if (path === "/api/health")
        return json({
          status: "ok",
          version: "0.14.0",
          storeId: store,
          runningWorkflows: [...runs.values()].filter(
            (run) => run.status === "running",
          ).length,
          concurrency: {
            active: [...runs.values()].filter((run) => run.status === "running")
              .length,
            maxConcurrent: 4,
            queuedTotal: 0,
          },
        });
      if (path === "/api/dashboard/runs") {
        const all = [...runs.values()].sort((left, right) =>
          right.started_at.localeCompare(left.started_at),
        );
        const offset = Number(parsed.searchParams.get("offset") ?? 0);
        const count = (status: string) =>
          all.filter((run) => run.status === status).length;
        return json({
          runs: all.slice(offset, offset + 50).map(row),
          total: all.length,
          counts: {
            all: all.length,
            running: count("running"),
            completed: count("completed"),
            failed: count("failed"),
            cancelled: count("cancelled"),
            pending: count("pending"),
            paused: count("paused"),
          },
        });
      }
      const cancel = /^\/api\/workflows\/runs\/([^/]+)\/cancel$/.exec(path);
      if (cancel && method === "POST") {
        const result = this.cancel(cancel[1]);
        return new Response(result.detail, { status: result.status });
      }
      const detail = /^\/api\/workflows\/runs\/([^/]+)$/.exec(path);
      if (detail) {
        const run = runs.get(detail[1]);
        if (!run) return json({ error: "Run not found" }, 404);
        return json({
          run: {
            ...row(run),
            conversation_platform_id: null,
            terminal_record: null,
          },
          events: run.events,
        });
      }
      const artifacts = /^\/api\/runs\/([^/]+)\/artifacts$/.exec(path);
      if (artifacts)
        return json({
          files: [
            {
              path: "/srv/core-factory/runs/x/select/facts.json",
              size: 1200,
              modifiedAt: new Date(base).toISOString(),
            },
          ],
        });
      return json({ error: "No synthetic engine endpoint" }, 404);
    },
  };
}
