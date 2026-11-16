import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  round: null as Record<string, unknown> | null,
  create: vi.fn(),
  reconcile: vi.fn(),
  readNativeFaults: vi.fn(),
  settle: vi.fn(),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: () => state.round,
  emit: vi.fn(),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs",
  () => ({
    createCleanupReconciler: (trusted: unknown) => state.create(trusted),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/native-faults.mjs",
  () => ({
    readNativeFaults: (input: unknown) => state.readNativeFaults(input),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs",
  () => ({ settleRound: (input: unknown) => state.settle(input) }),
);

const roots: string[] = [];
beforeEach(() => {
  vi.resetModules();
  const root = mkdtempSync(
    path.join(os.tmpdir(), "archon-record-reconciliation-"),
  );
  roots.push(root);
  state.round = {
    runId: "run-record-12345678",
    assignment: "assignment-12",
    issue: 12,
    artifacts: path.join(root, "engine-artifacts"),
    runDir: root,
    paths: { views: path.join(root, "views") },
    config: { executor: { docker: path.join(root, "operator-docker") } },
    limits: {},
    now: () => "2026-11-12T00:00:00Z",
    ledger: { all: () => ({}), write: vi.fn() },
    archon: { get: vi.fn() },
  };
  const outcomesFile = path.join(root, "outcomes.json");
  writeFileSync(outcomesFile, JSON.stringify({ nodes: [] }));
  vi.stubEnv("NODE_OUTCOMES_FILE", outcomesFile);
  state.create.mockReturnValue(state.reconcile);
  state.readNativeFaults.mockResolvedValue({ action: "none" });
  state.settle.mockResolvedValue({
    outcome: "cleanup-unconfirmed",
    cleanupPending: true,
  });
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

it("binds record reconciliation to trusted executor, round identity and engine artifacts", async () => {
  await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

  expect(state.create).toHaveBeenCalledExactlyOnceWith({
    dockerExecutable: path.join(roots[0]!, "operator-docker"),
    artifactsDir: state.round!.artifacts,
    runId: "run-record-12345678",
    assignment: "assignment-12",
    issue: 12,
  });
  expect(state.settle).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      artifactsDir: state.round!.artifacts,
      reconcileCleanup: state.reconcile,
    }),
  );
});

it.each(["unavailable", "malformed"])(
  "forwards %s native evidence unchanged without fabricating code failure",
  async (reason) => {
    const outcomes = {
      run_id: "run-record-12345678",
      nodes: [{ node_id: "build", state: "failed" }],
    };
    writeFileSync(process.env.NODE_OUTCOMES_FILE!, JSON.stringify(outcomes));
    const nativeFaults = {
      schema: "core-native-faults/v1",
      runId: "run-record-12345678",
      action: "reconcile",
      reason,
      preserveOwnership: true,
      automaticRetry: false,
    };
    state.readNativeFaults.mockResolvedValue(nativeFaults);

    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

    expect(state.readNativeFaults).toHaveBeenCalledExactlyOnceWith({
      archon: state.round!.archon,
      runId: "run-record-12345678",
      outcomes,
    });
    expect(state.settle.mock.calls[0]![0].nativeFaults).toBe(nativeFaults);
  },
);

it("awaits native evidence before settling while retaining cleanup reconciliation", async () => {
  let complete!: (value: unknown) => void;
  const pendingFaults = new Promise((resolve) => {
    complete = resolve;
  });
  state.readNativeFaults.mockReturnValue(pendingFaults);
  const recording =
    import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
  await vi.waitFor(() => expect(state.readNativeFaults).toHaveBeenCalledOnce());
  expect(state.settle).not.toHaveBeenCalled();

  const nativeFaults = { action: "owner-action", reason: "quota-exhausted" };
  complete(nativeFaults);
  await recording;

  expect(state.settle.mock.calls[0]![0]).toEqual(
    expect.objectContaining({
      nativeFaults,
      reconcileCleanup: state.reconcile,
    }),
  );
});

it("retains mounted views during a native hold even when cleanup is not pending", async () => {
  const view = path.join(roots[0]!, "views", "run-record-12345678");
  mkdirSync(view, { recursive: true });
  const candidate = path.join(view, "candidate.txt");
  writeFileSync(candidate, "mounted candidate");
  const getItem = vi.fn(async () => ({ value: {} }));
  state.round!.archon = { get: getItem };
  state.settle.mockResolvedValue({
    outcome: "reconcile",
    cleanupPending: false,
    nativePending: true,
  });

  await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

  expect(existsSync(candidate)).toBe(true);
  expect(getItem).not.toHaveBeenCalled();
});

it.each([null, [], { nodes: null }, { nodes: {} }, { nodes: "invalid" }])(
  "keeps malformed outcomes available for native reconciliation: %j",
  async (outcomes) => {
    writeFileSync(process.env.NODE_OUTCOMES_FILE!, JSON.stringify(outcomes));
    const nativeFaults = {
      schema: "core-native-faults/v1",
      runId: "run-record-12345678",
      action: "reconcile",
      reason: "malformed-outcomes",
      preserveOwnership: true,
      automaticRetry: false,
    };
    state.readNativeFaults.mockResolvedValue(nativeFaults);

    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");

    expect(state.readNativeFaults).toHaveBeenCalledExactlyOnceWith({
      archon: state.round!.archon,
      runId: "run-record-12345678",
      outcomes,
    });
    expect(state.settle.mock.calls[0]![0]).toEqual(
      expect.objectContaining({ nativeFaults, nodes: [] }),
    );
  },
);
