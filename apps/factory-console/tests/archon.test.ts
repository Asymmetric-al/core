import { describe, expect, it } from "vitest";

import { Archon, BackendError, nodeTimings } from "../src/server/archon";
import { configuration } from "../src/server/security";

const config = configuration({
  CONSOLE_ORIGIN: "http://127.0.0.1:3092",
  CONSOLE_OWNER: "owner",
  CONSOLE_PASSWORD: "fixture-password-not-a-real-secret",
  ARCHON_URL: "http://127.0.0.1:39190",
  ARCHON_CODEBASE_ID: "core",
  ARCHON_STORE_ID: "store",
});
const health = {
  status: "ok",
  version: "0.14.0",
  storeId: "store",
  concurrency: { active: 0, queuedTotal: 0, maxConcurrent: 2 },
  runningWorkflows: 0,
};
const run = {
  id: "run-1",
  workflow_name: "core-deliver",
  codebase_id: "core",
  status: "running",
  started_at: "2026-11-10T00:00:00Z",
  completed_at: null,
  last_activity_at: null,
  user_message: "Issue request",
  parent_run_id: null,
  metadata: {},
};

describe("pinned Archon adapter", () => {
  it("refuses an unexpected store and malformed native response", async () => {
    const wrongStore = new Archon(config, async () =>
      Response.json({ ...health, storeId: "other" }),
    );
    await expect(wrongStore.health()).rejects.toThrow("instance");
    const malformed = new Archon(config, async () =>
      Response.json({ status: "ok" }),
    );
    await expect(malformed.health()).rejects.toBeInstanceOf(BackendError);
  });

  it("authorizes detail against the configured project before exposing events", async () => {
    const engine = new Archon(config, async (input) =>
      String(input).endsWith("/health")
        ? Response.json(health)
        : Response.json({
            run: { ...run, codebase_id: "other", nodes: [] },
            events: [],
          }),
    );
    await expect(engine.detail("run-1")).rejects.toThrow("scope");
  });

  it("only issues GET requests: mutations go through control.mjs", async () => {
    const methods: string[] = [];
    const engine = new Archon(config, async (input, init) => {
      methods.push(init?.method ?? "GET");
      return String(input).endsWith("/health")
        ? Response.json(health)
        : Response.json({ run: { ...run, nodes: [] }, events: [] });
    });
    await engine.detail("run-1");
    expect(new Set(methods)).toEqual(new Set(["GET"]));
  });

  it("derives node timing and the reported model from lifecycle events only", () => {
    const timings = nodeTimings([
      {
        id: "1",
        workflow_run_id: "r",
        event_type: "node_started",
        step_name: "build",
        created_at: "2026-11-10T00:00:00Z",
        data: { model: "opus", effort: "high", node_output: "x" },
      },
      {
        id: "2",
        workflow_run_id: "r",
        event_type: "node_failed",
        step_name: "build",
        created_at: "2026-11-10T00:01:00Z",
        data: {},
      },
      {
        id: "3",
        workflow_run_id: "r",
        event_type: "node_started",
        step_name: "build",
        created_at: "2026-11-10T00:02:00Z",
        data: { model_usage: { resolved: "claude-opus-x" } },
      },
      {
        id: "4",
        workflow_run_id: "r",
        event_type: "tool_called",
        step_name: "build",
        created_at: "2026-11-10T00:03:00Z",
        data: {},
      },
    ]);
    expect(timings.build).toEqual({
      node: "build",
      startedAt: "2026-11-10T00:02:00Z",
      endedAt: null,
      lastEvent: "node_started",
      attempts: 2,
      model: "claude-opus-x",
      effort: "high",
      provider: null,
      durationMs: null,
    });
    expect(JSON.stringify(timings)).not.toContain("node_output");
  });
});
