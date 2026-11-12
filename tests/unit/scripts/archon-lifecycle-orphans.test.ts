import { describe, expect, it, vi } from "vitest";

import { systemdUnits } from "../../../scripts/archon-factory/installation/install-logic.mjs";
import {
  findOrphans,
  ownerGone,
  reapOrphans,
} from "../../../scripts/archon-factory/pack/.shared/orphans.mjs";

const ENGINE =
  "/srv/core-factory/archon/server/0.14.0/archon-server-linux-x64 --port 39190";

function run(
  id: string,
  extra: Record<string, unknown> = {},
  owner: unknown = { host: "core-dev", pid: 100, uid: 1000 },
) {
  return {
    id,
    workflow_name: "core-select",
    status: "running",
    metadata: { execution_owner: owner },
    ...extra,
  };
}

// pid 100 is the engine that died; pid 200 is the engine running now; pid 300
// was reused by an unrelated program.
const probes = {
  hosts: ["core-dev"],
  cmdline: (pid: number) =>
    pid === 200 ? ENGINE : pid === 300 ? "/usr/bin/python3 backup.py" : null,
};

describe("orphaned factory runs", () => {
  it("treats a run as orphaned only when its recorded engine process is provably gone", () => {
    expect(ownerGone({ host: "core-dev", pid: 100 }, probes)).toBe(true);
    expect(ownerGone({ host: "core-dev", pid: 300 }, probes)).toBe(true);
    expect(ownerGone({ host: "core-dev", pid: 200 }, probes)).toBe(false);
  });

  it("never guesses: an unknown owner, another host or an unreadable process is not gone", () => {
    expect(ownerGone(undefined, probes)).toBe(false);
    expect(ownerGone({ host: "core-dev" }, probes)).toBe(false);
    expect(ownerGone({ host: "core-dev", pid: 0 }, probes)).toBe(false);
    expect(ownerGone({ host: "elsewhere", pid: 100 }, probes)).toBe(false);
    expect(
      ownerGone(
        { host: "core-dev", pid: 100 },
        { hosts: ["core-dev"], cmdline: () => undefined },
      ),
    ).toBe(false);
  });

  it("selects running factory runs only", () => {
    const runs = [
      run("dead-select"),
      run("dead-deliver", { workflow_name: "core-deliver" }),
      run("live", {}, { host: "core-dev", pid: 200 }),
      run("paused", { status: "paused" }),
      run("failed", { status: "failed" }),
      run("stock", { workflow_name: "archon-deliver" }),
    ];
    expect(findOrphans(runs, probes).map((item) => item.id)).toEqual([
      "dead-select",
      "dead-deliver",
    ]);
  });

  it("abandons each orphan through the engine and reports what happened", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string, options?: RequestInit) => {
      calls.push(`${options?.method ?? "GET"} ${new URL(url).pathname}`);
      if (!options?.method)
        return new Response(
          JSON.stringify({
            runs: [
              run("dead-1"),
              run("dead-2", { workflow_name: "core-deliver" }),
              run("live", {}, { host: "core-dev", pid: 200 }),
            ],
          }),
        );
      return new Response("{}", {
        status: url.includes("dead-2") ? 409 : 200,
      });
    });
    const removeContainers = vi.fn(async ({ labels }: any) => {
      calls.push(`remove ${labels["core.archon.run"]}`);
      return { ok: true, found: [], remaining: [], removed: [] };
    });
    const result = await reapOrphans({
      port: 39190,
      fetchImpl,
      removeContainers,
      dockerExecutable: "/usr/bin/docker",
      ...probes,
    });
    // A dead run's check containers go first: one of them may still be
    // writing the issue's workspace, which the next round reuses.
    expect(calls).toEqual([
      "GET /api/workflows/runs",
      "remove dead-1",
      "POST /api/workflows/runs/dead-1/abandon",
      "remove dead-2",
      "POST /api/workflows/runs/dead-2/abandon",
    ]);
    expect(removeContainers).toHaveBeenCalledWith({
      dockerExecutable: "/usr/bin/docker",
      labels: { "core.archon.run": "dead-1" },
    });
    expect(result).toEqual({
      ok: true,
      orphans: [
        {
          id: "dead-1",
          workflow: "core-select",
          containers: "cleared",
          abandoned: true,
          status: 200,
        },
        {
          id: "dead-2",
          workflow: "core-deliver",
          containers: "cleared",
          abandoned: false,
          status: 409,
        },
      ],
    });
  });

  it.each([
    ["some remain", async () => ({ ok: false, remaining: ["c1"] })],
    [
      "they cannot be listed",
      async () => {
        throw new Error("docker unavailable");
      },
    ],
  ])(
    "leaves a dead run in place while its containers are not confirmed gone (%s)",
    async (_name, removeContainers) => {
      const calls: string[] = [];
      const fetchImpl = vi.fn(async (url: string, options?: RequestInit) => {
        calls.push(`${options?.method ?? "GET"} ${new URL(url).pathname}`);
        return new Response(
          JSON.stringify({
            runs: [run("dead-1", { workflow_name: "core-deliver" })],
          }),
        );
      });
      const result = await reapOrphans({
        port: 39190,
        fetchImpl,
        removeContainers,
        dockerExecutable: "/usr/bin/docker",
        ...probes,
      });
      expect(calls).toEqual(["GET /api/workflows/runs"]);
      expect(result.orphans).toEqual([
        {
          id: "dead-1",
          workflow: "core-deliver",
          containers: "unconfirmed",
          abandoned: false,
          status: null,
        },
      ]);
    },
  );

  it("changes nothing when the engine cannot list its runs", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("connection refused");
    });
    expect(
      await reapOrphans({
        port: 39190,
        fetchImpl,
        removeContainers: async () => ({ ok: true }),
        dockerExecutable: "/usr/bin/docker",
        ...probes,
      }),
    ).toEqual({
      ok: false,
      error: "connection refused",
      orphans: [],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("runs before every admission pass and cannot fail it", () => {
    const unit = systemdUnits({
      archon: "/opt/archon/archon",
      node: "/opt/node/bin/node",
      port: 39190,
      hostId: "core-dev",
      root: "/srv/core-factory",
      control: "/control",
      runtime: "/control/.shared",
      backupScript: "/control/.shared/backup.mjs",
      environment: ["A=1"],
    })["core-factory-intake.service"];
    const lines = unit.split("\n");
    const reap = lines.indexOf(
      "ExecStartPre=-/opt/node/bin/node /control/.shared/orphans.mjs reap",
    );
    const start = lines.findIndex((line) => line.startsWith("ExecStart="));
    expect(reap).toBeGreaterThan(-1);
    expect(reap).toBeLessThan(start);
  });
});
