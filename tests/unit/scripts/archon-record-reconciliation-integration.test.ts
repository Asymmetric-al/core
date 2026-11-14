import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";

import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { runCheck } from "../../../scripts/archon-factory/pack/.shared/check-mcp.mjs";

import { nativeFaultRequiresHold } from "../../../scripts/archon-factory/pack/.shared/native-faults.mjs";
import {
  createAssignment,
  planClaim,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

import type * as cleanupReconciliation from "../../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs";

const state = vi.hoisted(() => ({
  round: null as Record<string, unknown> | null,
  spawn: vi.fn(),
  fire: vi.fn(),
  emit: vi.fn(),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: () => state.round,
  emit: (value: unknown) => state.emit(value),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/webhook.mjs", () => ({
  fireRound: (input: unknown) => state.fire(input),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs",
  async (importOriginal) => {
    const actual = await importOriginal<typeof cleanupReconciliation>();
    return {
      ...actual,
      createCleanupReconciler: (trusted: unknown) =>
        actual.createCleanupReconciler(trusted, { spawn: state.spawn }),
    };
  },
);

const runId = "run-record-12345678";
const assignment = "a12-0123456789ab";
const policyRevision = "c".repeat(64);
const now = "2026-11-12T02:00:00Z";
const labels = {
  "core.archon.executor": "candidate-check",
  "core.archon.attempt": "01234567-89ab-4cde-8fab-0123456789ab",
  "core.archon.run": runId,
  "core.archon.issue": "12",
};
const roots: string[] = [];

beforeEach(() => {
  vi.resetModules();
  state.fire.mockResolvedValue({
    ok: true,
    outcome: "accepted",
    deliveryId: "record-integration-delivery",
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-record-integration-")),
  );
  roots.push(root);
  const artifacts = path.join(root, "artifacts", runId);
  mkdirSync(path.join(artifacts, "round"), { recursive: true });
  const views = path.join(root, "views");
  const candidate = path.join(views, runId, "candidate.txt");
  mkdirSync(path.dirname(candidate), { recursive: true });
  writeFileSync(candidate, "mounted candidate");
  const outcomesFile = path.join(root, "outcomes.json");
  writeFileSync(
    outcomesFile,
    JSON.stringify({ run_id: runId, first_failed_node: null, nodes: [] }),
  );
  vi.stubEnv("NODE_OUTCOMES_FILE", outcomesFile);
  const value = createAssignment({
    issue: 12,
    assignmentId: assignment,
    owner: "operator",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision,
    endState: "PR_READY",
    reason: "Focused reconciliation integration",
    by: "selector:run-0",
    now,
  });
  const claimed = planClaim(
    {
      name: "core/issues/12",
      revision: 10,
      value: { ...value, status: "waiting", route: "oracle", round: 4 },
      lease: null,
    },
    { runId, assignmentId: assignment, policyRevision, now },
  );
  const document = {
    name: "core/issues/12",
    revision: 11,
    value: claimed.value,
    lease: { runId, live: true },
  };
  const raw = vi.fn(async (): Promise<{ code: number; json: unknown }> => ({
    code: 0,
    json: { id: runId, status: "running", metadata: {}, events: [] },
  }));
  const archon = {
    raw,
    get: vi.fn(async (name: string) =>
      name === document.name
        ? structuredClone(document)
        : {
            name,
            revision: 3,
            value: { v: 1, intake: "open", mode: "run", mergeHold: false },
            lease: null,
          },
    ),
    put: vi.fn(
      async (
        name: string,
        next: typeof claimed.value,
        options: { ifRevision: number; lease?: string },
      ) => {
        expect(name).toBe(document.name);
        expect(options.ifRevision).toBe(document.revision);
        document.revision += 1;
        document.value = structuredClone(next);
        if (options.lease === "release") document.lease.live = false;
        return structuredClone(document);
      },
    ),
  };
  const ledger: Record<string, unknown> = {
    claim: { proceed: true },
    "claim-lease": { taken: true },
    context: { ok: true },
  };
  state.round = {
    archon,
    issue: 12,
    assignment,
    runId,
    artifacts,
    runDir: root,
    paths: { views },
    config: { executor: { docker: path.join(root, "operator-docker") } },
    limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
    now: () => now,
    ledger: { all: () => ledger, write: vi.fn() },
  };
  return { root, artifacts, candidate, document, ledger, raw, outcomesFile };
}

function docker(
  steps: { operation: "ps" | "rm"; code?: number; stdout?: string }[],
) {
  state.spawn.mockImplementation((_executable: string, args: string[]) => {
    const child = Object.assign(new EventEmitter(), {
      stdout: new PassThrough(),
      stderr: new PassThrough(),
      kill: vi.fn(() => true),
    });
    queueMicrotask(() => {
      const step = steps.shift();
      if (!step || args[4] !== step.operation) {
        child.emit("error", new Error("Missing exact Docker command evidence"));
        return;
      }
      child.stdout.end(step.stdout ?? "");
      child.stderr.end();
      child.emit("close", step.code ?? 0, null);
    });
    return child;
  });
}

it.each(["inline", "reference"])(
  "settles %s cleanup through record, the real adapter and the real executor",
  async (source) => {
    const current = fixture();
    const receipt = {
      labels,
      stdout: "unchanged receipt",
      cleanupConfirmed: false,
    };
    const content = Buffer.from(JSON.stringify(receipt, null, 2) + "\n");
    const file = path.join(current.artifacts, "round", "cleanup-state.json");
    writeFileSync(file, content);
    const cleanup = {
      runId,
      assignment,
      issue: 12,
      step: "oracle",
      ...(source === "inline"
        ? { receipt }
        : {
            receiptReference: {
              path: file,
              bytes: content.byteLength,
              sha256: createHash("sha256").update(content).digest("hex"),
              labels,
            },
          }),
    };
    current.ledger["executor-cleanup"] = { cleanup };
    docker([{ operation: "ps" }]);

    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

    // The run's event record is read with the larger output bound.
    expect(current.raw).toHaveBeenCalledExactlyOnceWith(
      ["workflow", "get", runId, "--json", "--verbose", "--events"],
      undefined,
      { maxOutput: 64 * 1024 * 1024 },
    );
    expect(current.document).toMatchObject({
      value: {
        status: "waiting",
        cleanup,
        cleanupReconciliation: {
          confirmed: true,
          evidence: {
            ok: true,
            cleanupConfirmed: true,
            reusable: true,
            remaining: [],
            labels,
          },
        },
      },
      lease: { live: false },
    });
    expect(state.fire).toHaveBeenCalledOnce();
    expect(existsSync(current.candidate)).toBe(false);
    expect(readFileSync(file)).toEqual(content);
  },
);

it("keeps cleanup priority over native reconciliation when a removal command fails", async () => {
  const current = fixture();
  current.raw.mockResolvedValue({ code: 1, json: null });
  current.ledger["executor-cleanup"] = {
    cleanup: {
      runId,
      assignment,
      issue: 12,
      step: "oracle",
      receipt: { labels },
    },
  };
  docker([
    { operation: "ps", stdout: "a".repeat(64) + "\n" },
    { operation: "rm", code: 1 },
    { operation: "ps" },
  ]);

  await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

  expect(current.document).toMatchObject({
    value: {
      status: "active",
      blocker: { code: "cleanup-unconfirmed" },
      cleanupReconciliation: { confirmed: false },
    },
    lease: { live: true },
  });
  expect(state.fire).not.toHaveBeenCalled();
  expect(existsSync(current.candidate)).toBe(true);
});

it("confirms cleanup but retains native ownership and views when the reader is unavailable", async () => {
  const current = fixture();
  current.raw.mockResolvedValue({ code: 1, json: null });
  current.ledger["executor-cleanup"] = {
    cleanup: {
      runId,
      assignment,
      issue: 12,
      step: "oracle",
      receipt: { labels },
    },
  };
  docker([{ operation: "ps" }]);

  await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

  expect(current.document).toMatchObject({
    value: {
      status: "active",
      nativeFaults: { runId, action: "reconcile", automaticRetry: false },
      cleanupReconciliation: {
        confirmed: true,
        evidence: {
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          remaining: [],
          labels,
        },
      },
    },
    lease: { live: true },
  });
  expect(state.emit).toHaveBeenCalledWith(
    expect.objectContaining({ outcome: "reconcile" }),
  );
  expect(state.fire).not.toHaveBeenCalled();
  expect(existsSync(current.candidate)).toBe(true);
});

it.each([false, true])(
  "retains a persisted native hold after a fault-free read (compact: %s)",
  async (compact) => {
    const current = fixture();
    const nativeFaults = {
      schema: "core-native-faults/v1",
      runId,
      runStatus: "running",
      action: "reconcile",
      reason: "Previous native effects still require reconciliation",
      faults: [],
      wait: null,
      automaticRetry: false,
      preserveOwnership: true,
      ...(compact
        ? {
            artifact: {
              path: "round/native-fault-state.json",
              sha256: "e".repeat(64),
            },
          }
        : {}),
    };
    current.document.value.nativeFaults = nativeFaults;

    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

    expect(current.document).toMatchObject({
      value: { status: "active", nativeFaults },
      lease: { live: true },
    });
    expect(state.fire).not.toHaveBeenCalled();
    expect(state.spawn).not.toHaveBeenCalled();
    expect(existsSync(current.candidate)).toBe(true);
  },
);

it.each(["unavailable", "malformed", "wrong-run", "malformed-outcomes"])(
  "retains native ownership and views for %s real reader evidence",
  async (mode) => {
    const current = fixture();
    if (mode === "unavailable")
      current.raw.mockRejectedValue(new Error("offline transport"));
    if (mode === "malformed")
      current.raw.mockResolvedValue({ code: 0, json: {} });
    if (mode === "wrong-run")
      current.raw.mockResolvedValue({
        code: 0,
        json: {
          id: "different-run",
          status: "running",
          metadata: {},
          events: [],
        },
      });
    if (mode === "malformed-outcomes")
      writeFileSync(current.outcomesFile, "null");

    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

    expect(current.document).toMatchObject({
      value: {
        status: "active",
        nativeFaults: { runId, action: "reconcile", automaticRetry: false },
      },
      lease: { live: true },
    });
    expect(nativeFaultRequiresHold(current.document.value.nativeFaults)).toBe(
      true,
    );
    expect(state.fire).not.toHaveBeenCalled();
    expect(state.spawn).not.toHaveBeenCalled();
    expect(existsSync(current.candidate)).toBe(true);
  },
);

it.each([false, true])(
  "actual MCP attempts reach record and all require cleanup proof (%s)",
  async (confirmed) => {
    const current = fixture();
    const contextDirectory = path.join(current.root, "runs", runId);
    mkdirSync(contextDirectory, { recursive: true });
    writeFileSync(
      path.join(contextDirectory, "context.json"),
      JSON.stringify({
        v: 1,
        runId,
        issue: 12,
        assignment,
        artifacts: current.artifacts,
        nodes: {
          review: {
            role: "micaiah",
            check: {
              workspaceRoot: current.root,
              workspaceDirectory: path.dirname(current.candidate),
              workspaceTarget: "/candidate",
              mounts: [],
            },
          },
        },
      }),
    );
    const receipts: unknown[] = [];
    for (let index = 0; index < 2; index++) {
      await runCheck({
        config: {
          root: current.root,
          executor: { docker: "docker", image: "sha256:" + "a".repeat(64) },
          limits: { heavyCheckSlots: 2 },
        },
        args: { command: ["test"], reason: "fixture" },
        env: {
          WORKFLOW_ID: runId,
          ARCHON_NODE_EXECUTION: JSON.stringify({ runId, path: "review" }),
        },
        execute: async (input: any) => {
          const receipt = {
            status: "failed",
            cleanupConfirmed: false,
            reusable: false,
            labels: { ...labels, "core.archon.attempt": input.attempt },
            stdout: "complete MCP output",
            stderr: "original diagnostic",
          };
          receipts.push(receipt);
          return receipt;
        },
      });
    }
    for (const file of readdirSync(path.join(current.artifacts, "round")))
      current.ledger[file.slice(0, -5)] = JSON.parse(
        readFileSync(path.join(current.artifacts, "round", file), "utf8"),
      );
    docker(confirmed ? [{ operation: "ps" }, { operation: "ps" }] : []);
    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
    if (confirmed) {
      expect(state.fire).toHaveBeenCalledOnce();
      expect(current.document.lease.live).toBe(false);
      expect(existsSync(current.candidate)).toBe(false);
    } else {
      expect(state.fire).not.toHaveBeenCalled();
      expect(current.document.lease.live).toBe(true);
      expect(existsSync(current.candidate)).toBe(true);
      const cleanup = current.document.value.cleanup;
      expect([
        cleanup.receipt,
        ...cleanup.additionalCleanups.map((entry: any) => entry.receipt),
      ]).toEqual(expect.arrayContaining(receipts));
    }
  },
);

it.each([false, true])(
  "merges a new uncertain attempt into stored cleanup and proves every attempt (%s)",
  async (proveAll) => {
    const current = fixture();
    const attempt = (id: string) => ({
      step: "mcp:review",
      runId,
      assignment,
      issue: 12,
      error: { name: "CheckCleanupError", message: "uncertain" },
      receipt: {
        status: "failed",
        cleanupConfirmed: false,
        reusable: false,
        labels: { ...labels, "core.archon.attempt": id },
        stdout: `original ${id}`,
      },
    });
    const first = attempt(labels["core.archon.attempt"]);
    const second = attempt("11234567-89ab-4cde-8fab-0123456789ab");
    current.document.value.cleanup = first;
    current.document.value.blocker = {
      code: "cleanup-unconfirmed",
      route: "oracle",
    };
    current.ledger["mcp-cleanup-a"] = { cleanup: first };
    current.ledger["mcp-cleanup-b"] = { cleanup: second };
    docker(
      proveAll
        ? [{ operation: "ps" }, { operation: "ps" }]
        : [{ operation: "ps" }],
    );
    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
    if (proveAll) {
      expect(state.spawn).toHaveBeenCalledTimes(2);
      expect(state.fire).toHaveBeenCalledOnce();
      expect(current.document.lease.live).toBe(false);
      expect(existsSync(current.candidate)).toBe(false);
    } else {
      expect(state.fire).not.toHaveBeenCalled();
      expect(current.document.lease.live).toBe(true);
      expect(existsSync(current.candidate)).toBe(true);
      expect(current.document.value.cleanup.additionalCleanups).toEqual([
        second,
      ]);
    }
  },
);

it.each([null, false, 0, "", [], "invalid"])(
  "retains malformed nested cleanup evidence and ownership (%j)",
  async (malformed) => {
    const current = fixture();
    const attempt = (id: string) => ({
      step: "mcp:review",
      runId,
      assignment,
      issue: 12,
      error: { name: "CheckCleanupError", message: "uncertain" },
      receipt: {
        status: "failed",
        cleanupConfirmed: false,
        reusable: false,
        labels: { ...labels, "core.archon.attempt": id },
        stdout: `original ${id}`,
      },
    });
    const second = attempt("11234567-89ab-4cde-8fab-0123456789ab");
    const retained = {
      ...attempt(labels["core.archon.attempt"]),
      additionalCleanups: [second, malformed],
    };
    current.document.value.cleanup = structuredClone(retained);
    current.document.value.blocker = {
      code: "cleanup-unconfirmed",
      route: "oracle",
    };
    docker([{ operation: "ps" }, { operation: "ps" }]);
    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
    expect(state.fire).not.toHaveBeenCalled();
    expect(current.document.lease.live).toBe(true);
    expect(existsSync(current.candidate)).toBe(true);
    expect(JSON.stringify(current.document.value.cleanup)).toContain(
      JSON.stringify(retained),
    );
  },
);

it.each([
  ["incoming", "labels"],
  ["stored", "labels"],
  ["incoming", "path"],
  ["stored", "path"],
  ["incoming", "bytes"],
  ["stored", "bytes"],
])(
  "retains digest-matching but malformed archive evidence (%s/%s)",
  async (source, invalid) => {
    const current = fixture();
    const receipt = {
      labels,
      status: "failed",
      cleanupConfirmed: false,
      reusable: false,
      stdout: "complete original output",
    };
    const original = {
      step: "mcp:review",
      runId,
      assignment,
      issue: 12,
      receipt,
    };
    const content = Buffer.from(JSON.stringify(receipt, null, 2));
    const file = path.join(current.artifacts, "round", "cleanup-state.json");
    writeFileSync(file, content);
    const { receipt: _receipt, ...identity } = original;
    const reference = {
      ...identity,
      receiptReference: {
        path: invalid === "path" ? "untrusted-relative" : file,
        sha256: createHash("sha256").update(content).digest("hex"),
        bytes: content.byteLength + (invalid === "bytes" ? 1 : 0),
        labels:
          invalid === "labels"
            ? {
                ...labels,
                "core.archon.attempt": "11234567-89ab-4cde-8fab-0123456789ab",
              }
            : labels,
      },
    };
    current.document.value.cleanup =
      source === "stored"
        ? { ...original, additionalCleanups: [reference] }
        : original;
    current.document.value.blocker = {
      code: "cleanup-unconfirmed",
      route: "oracle",
    };
    if (source === "incoming") current.ledger.freeze = { cleanup: reference };
    docker([{ operation: "ps" }, { operation: "ps" }]);
    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
    expect(state.fire).not.toHaveBeenCalled();
    expect(current.document.lease.live).toBe(true);
    expect(existsSync(current.candidate)).toBe(true);
    expect(current.document.value.cleanup.additionalCleanups).toContainEqual(
      reference,
    );
  },
);

it("confirms both inline and valid archived evidence before advancing", async () => {
  const current = fixture();
  const receipt = {
    labels,
    status: "failed",
    cleanupConfirmed: false,
    reusable: false,
    stdout: "complete original output",
  };
  const original = {
    step: "mcp:review",
    runId,
    assignment,
    issue: 12,
    receipt,
  };
  const content = Buffer.from(JSON.stringify(receipt, null, 2));
  const file = path.join(current.artifacts, "round", "cleanup-state.json");
  writeFileSync(file, content);
  const { receipt: _receipt, ...identity } = original;
  const reference = {
    ...identity,
    receiptReference: {
      path: file,
      sha256: createHash("sha256").update(content).digest("hex"),
      bytes: content.byteLength,
      labels,
    },
  };
  current.document.value.cleanup = original;
  current.ledger.freeze = { cleanup: reference };
  docker([{ operation: "ps" }, { operation: "ps" }]);
  await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
  expect(state.spawn).toHaveBeenCalledTimes(2);
  expect(state.fire).toHaveBeenCalledOnce();
  expect(current.document.lease.live).toBe(false);
  expect(existsSync(current.candidate)).toBe(false);
});

it.each(["labels", "path", "bytes"])(
  "keeps an oversized cleanup held when its inline receipt conflicts with its own reference (%s)",
  async (invalid) => {
    const current = fixture();
    const receipt = {
      labels,
      status: "failed",
      cleanupConfirmed: false,
      reusable: false,
      stdout: "x".repeat(70_000),
    };
    const content = Buffer.from(JSON.stringify(receipt, null, 2));
    const conflicting = {
      path:
        invalid === "path"
          ? "untrusted-relative"
          : path.join(current.artifacts, "round", "cleanup-state.json"),
      sha256: createHash("sha256").update(content).digest("hex"),
      bytes: content.byteLength + (invalid === "bytes" ? 1 : 0),
      labels:
        invalid === "labels"
          ? {
              ...labels,
              "core.archon.attempt": "11234567-89ab-4cde-8fab-0123456789ab",
            }
          : labels,
    };
    current.ledger.freeze = {
      cleanup: {
        step: "freeze",
        runId,
        assignment,
        issue: 12,
        receipt,
        receiptReference: conflicting,
      },
    };
    // Only the inline attempt can be proven; nothing vouches for the reference.
    docker([{ operation: "ps" }, { operation: "ps" }]);

    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

    expect(state.fire).not.toHaveBeenCalled();
    expect(current.document.lease.live).toBe(true);
    expect(existsSync(current.candidate)).toBe(true);
    expect(current.document.value.cleanupReconciliation?.confirmed).not.toBe(
      true,
    );
    expect(JSON.stringify(current.document.value.cleanup)).toContain(
      JSON.stringify(conflicting),
    );
  },
);
