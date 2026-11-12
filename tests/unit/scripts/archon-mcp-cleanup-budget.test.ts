import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { runCheck } from "../../../scripts/archon-factory/pack/.shared/check-mcp.mjs";
import { hasUnconfirmedCleanup } from "../../../scripts/archon-factory/pack/.shared/cleanup-state.mjs";
import { writeRunContext } from "../../../scripts/archon-factory/pack/.shared/runctx.mjs";
import {
  createAssignment,
  planClaim,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import { settleRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";

const recordBoundary = vi.hoisted(() => ({
  openRound: vi.fn(),
  emit: vi.fn(),
  createReconciler: vi.fn(),
  fire: vi.fn(),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: recordBoundary.openRound,
  emit: recordBoundary.emit,
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs",
  () => ({ createCleanupReconciler: recordBoundary.createReconciler }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/webhook.mjs", () => ({
  fireRound: recordBoundary.fire,
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/native-faults.mjs",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    readNativeFaults: async ({ runId }: { runId: string }) => ({
      schema: "core-native-faults/v1",
      runId,
      runStatus: "completed",
      action: "none",
      reason: "Fixture nodes completed without native faults",
      faults: [],
      wait: null,
      preserveOwnership: false,
      automaticRetry: false,
    }),
  }),
);

const RUN_ID = "run-mcp-budget-12345678";
const ASSIGNMENT = "assignment-mcp-budget";
const ISSUE = "core/issues/12";
const NOW = "2026-11-12T03:00:00.000Z";
const STATE_LIMIT = 65_536;
const TEMP_PREFIX = "archon-mcp-budget-";
const roots: string[] = [];
const jsonBytes = (value: unknown) =>
  Buffer.byteLength(JSON.stringify(value), "utf8");
const digest = (content: Buffer) =>
  createHash("sha256").update(content).digest("hex");

type Receipt = {
  status: string;
  exitCode: null;
  cleanupConfirmed: boolean;
  reusable: boolean;
  labels: Record<string, string>;
  stdout: string;
  stderr: string;
};
type Cleanup = {
  step: string;
  runId: string;
  assignment: string;
  issue: number;
  receipt: Receipt;
};
type Ledger = Record<string, { cleanup?: Cleanup; [key: string]: unknown }>;
type Artifact = {
  run: string;
  path: string;
  bytes?: number;
  sha256?: string;
};
type HeldValue = {
  status: string;
  run: { id: string };
  cleanup: {
    additionalCleanups?: Cleanup[];
    additionalCleanupArtifact?: Artifact;
    receiptReference?: {
      path: string;
      bytes: number;
      sha256: string;
      labels: Record<string, string>;
    };
  };
  cleanupStateArtifact?: Artifact;
  cleanupReconciliation?: { confirmed: boolean };
  blocker: { code: string; recovery: string };
};
type Document = {
  revision: number;
  value: unknown;
  lease: { runId: string; live: boolean } | null;
};

function cleanupIdentity(
  cleanup: Omit<Cleanup, "receipt"> & {
    receipt?: Receipt;
    receiptReference?: { sha256: string };
  },
) {
  return {
    step: cleanup.step,
    runId: cleanup.runId,
    assignment: cleanup.assignment,
    issue: cleanup.issue,
    sha256: cleanup.receipt
      ? digest(Buffer.from(JSON.stringify(cleanup.receipt, null, 2), "utf8"))
      : cleanup.receiptReference?.sha256,
  };
}

beforeEach(() => {
  vi.resetModules();
  recordBoundary.openRound.mockReset();
  recordBoundary.emit.mockReset();
  recordBoundary.createReconciler.mockReset();
  recordBoundary.fire.mockReset().mockResolvedValue({ ok: true });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  for (const root of roots.splice(0)) {
    if (
      path.dirname(root) !== realpathSync(os.tmpdir()) ||
      !path.basename(root).startsWith(TEMP_PREFIX)
    )
      throw new Error("Refusing to remove an unowned fixture path");
    rmSync(root, { recursive: true, force: true });
  }
});

function fixture(slots = 3) {
  const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), TEMP_PREFIX)));
  roots.push(root);
  const artifactsDir = path.join(root, "artifacts");
  const roundDir = path.join(artifactsDir, "round");
  const runDir = path.join(root, "runs", RUN_ID);
  const views = path.join(root, "views");
  const view = path.join(views, RUN_ID, "micaiah");
  mkdirSync(view, { recursive: true });
  const candidate = path.join(view, "candidate.txt");
  writeFileSync(
    candidate,
    "Uncommitted mounted candidate; preserve exactly.\n",
  );
  const config = {
    root: root.replaceAll("\\", "/"),
    executor: { docker: path.join(root, "fake-docker"), image: "test-image" },
    limits: { heavyCheckSlots: slots, checkQueueMs: 0 },
  };
  writeRunContext(
    {
      v: 1,
      runId: RUN_ID,
      assignment: ASSIGNMENT,
      issue: 12,
      artifacts: artifactsDir,
      nodes: {
        review_micaiah: {
          role: "micaiah",
          check: { workspaceRoot: views, workspaceDirectory: view },
        },
      },
    },
    path.join(root, "runs"),
  );
  return { root, artifactsDir, roundDir, runDir, views, candidate, config };
}

function readLedger(roundDir: string): Ledger {
  return Object.fromEntries(
    readdirSync(roundDir)
      .filter((file) => file.endsWith(".json"))
      .filter((file) => !file.startsWith("cleanup-"))
      .sort()
      .map((file) => [
        file.slice(0, -5),
        JSON.parse(readFileSync(path.join(roundDir, file), "utf8")),
      ]),
  );
}

async function runAttempts(
  current: ReturnType<typeof fixture>,
  { payload = "x".repeat(36_000), thrown = false, count = 3 } = {},
) {
  const receipts = new Map<string, Receipt>();
  const originals = new Map<string, Buffer>();
  const execute = vi.fn(async ({ attempt }: { attempt: string }) => {
    const file = path.join(current.roundDir, `mcp-cleanup-${attempt}.json`);
    const pending = JSON.parse(readFileSync(file, "utf8"));
    expect(pending.cleanup.receipt).toMatchObject({
      cleanupConfirmed: false,
      reusable: false,
      labels: { "core.archon.attempt": attempt },
    });
    const receipt: Receipt = {
      status: "failed",
      exitCode: null,
      cleanupConfirmed: false,
      reusable: false,
      labels: {
        "core.archon.executor": "candidate-check",
        "core.archon.attempt": attempt,
        "core.archon.run": RUN_ID,
        "core.archon.issue": "12",
      },
      stdout: `BEGIN:${attempt}\n${payload}\nEND:${attempt}`,
      stderr: `Exact diagnostic for ${attempt}`,
    };
    receipts.set(file, structuredClone(receipt));
    if (thrown)
      throw Object.assign(new Error("Executor interrupted"), { receipt });
    return receipt;
  });
  const reconcile = vi.fn(async () => ({
    ok: false,
    remaining: ["owned-container"],
  }));
  for (let index = 0; index < count; index += 1) {
    const result = await runCheck({
      args: { command: ["bun", "run", "check"], reason: "budget fixture" },
      env: {
        WORKFLOW_ID: RUN_ID,
        ARCHON_NODE_EXECUTION: JSON.stringify({
          runId: RUN_ID,
          path: "review_micaiah",
        }),
      },
      config: current.config,
      execute,
      reconcile,
    });
    expect(result.isError).toBe(false);
    expect(result.text).toContain("container cleanup unconfirmed");
    expect(Buffer.byteLength(result.text, "utf8")).toBeLessThan(24_000);
    for (const [file, receipt] of receipts) {
      const content = readFileSync(file);
      expect(JSON.parse(content.toString("utf8"))).toMatchObject({
        cleanup: {
          step: "mcp:review_micaiah",
          runId: RUN_ID,
          assignment: ASSIGNMENT,
          issue: 12,
          receipt,
        },
        blocked: { code: "cleanup-unconfirmed" },
      });
      if (originals.has(file)) expect(content).toEqual(originals.get(file));
      else originals.set(file, content);
    }
  }
  expect(execute).toHaveBeenCalledTimes(count);
  expect(receipts.size).toBe(count);
  expect(
    readdirSync(current.roundDir).filter((file) =>
      /^mcp-cleanup-[a-f0-9-]{36}\.json$/.test(file),
    ),
  ).toHaveLength(count);
  return { ledger: readLedger(current.roundDir), receipts, originals };
}

function stateStore() {
  const assignment = createAssignment({
    issue: 12,
    assignmentId: ASSIGNMENT,
    owner: "test-owner",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: "c".repeat(64),
    endState: "MERGED",
    reason: "Cleanup budget test",
    by: "selector:budget",
    now: NOW,
  });
  const claimed = planClaim(
    {
      name: ISSUE,
      revision: 1,
      value: { ...assignment, status: "waiting", route: "review", round: 1 },
      lease: null,
    },
    {
      runId: RUN_ID,
      assignmentId: ASSIGNMENT,
      policyRevision: "c".repeat(64),
      now: NOW,
    },
  );
  const documents = new Map<string, Document>([
    [
      ISSUE,
      {
        revision: 2,
        value: claimed.value,
        lease: { runId: RUN_ID, live: true },
      },
    ],
    [
      "core/reservations",
      {
        revision: 4,
        value: { v: 1, areas: { lockfile: 12, shared_ui: 12, other: 99 } },
        lease: null,
      },
    ],
    [
      "core/factory",
      {
        revision: 3,
        value: { v: 1, intake: "open", mode: "run", mergeHold: false },
        lease: null,
      },
    ],
  ]);
  const writtenBytes: number[] = [];
  const archon = {
    get: vi.fn(async (name: string) => ({
      name,
      ...structuredClone(
        documents.get(name) ?? { revision: 0, value: null, lease: null },
      ),
    })),
    put: vi.fn(
      async (
        name: string,
        value: unknown,
        options: { ifRevision: number; lease?: string },
      ) => {
        const current = documents.get(name)!;
        if (current.revision !== options.ifRevision)
          throw new StateConflict("test CAS conflict", null);
        const bytes = jsonBytes(value);
        if (bytes > STATE_LIMIT)
          throw new Error(`StateDocumentTooLarge: ${bytes}`);
        writtenBytes.push(bytes);
        documents.set(name, {
          revision: current.revision + 1,
          value: structuredClone(value),
          lease:
            options.lease === "release" && current.lease
              ? { ...current.lease, live: false }
              : current.lease,
        });
        return { name, revision: current.revision + 1, value };
      },
    ),
  };
  return { archon, documents, writtenBytes };
}

function settlement(current: ReturnType<typeof fixture>) {
  const state = stateStore();
  const reservations = structuredClone(
    state.documents.get("core/reservations"),
  );
  const candidate = readFileSync(current.candidate);
  const fire = vi.fn(async () => ({ ok: true }));
  const reconcileCleanup = vi.fn(
    async ({
      cleanup,
      labels,
    }: {
      cleanup: { receiptReference?: { sha256?: string } };
      labels: Record<string, string>;
    }) => ({
      ok: true,
      cleanupConfirmed: true,
      reusable: true,
      remaining: [],
      labels,
      ...(cleanup.receiptReference
        ? { receiptSha256: cleanup.receiptReference.sha256 }
        : {}),
    }),
  );
  const run = (
    ledger: Ledger,
    artifactsDir: string | null = current.artifactsDir,
  ) =>
    settleRound({
      archon: state.archon,
      issue: 12,
      runId: RUN_ID,
      assignment: ASSIGNMENT,
      ledger,
      now: NOW,
      limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
      artifactsDir,
      reconcileCleanup,
      fire,
    });
  return { ...state, reservations, candidate, fire, reconcileCleanup, run };
}

function expectOwnershipHeld(
  current: ReturnType<typeof fixture>,
  state: ReturnType<typeof settlement>,
  originals: Map<string, Buffer>,
) {
  const document = state.documents.get(ISSUE)!;
  const value = document.value as HeldValue;
  expect(document.lease).toEqual({ runId: RUN_ID, live: true });
  expect(value).toMatchObject({
    status: "active",
    run: { id: RUN_ID },
    blocker: { code: "cleanup-unconfirmed" },
    cleanupReconciliation: { confirmed: false },
  });
  expect(hasUnconfirmedCleanup(value)).toBe(true);
  expect(state.writtenBytes.length).toBeGreaterThanOrEqual(2);
  for (const bytes of state.writtenBytes)
    expect(bytes).toBeLessThanOrEqual(STATE_LIMIT);
  for (const [name, , options] of state.archon.put.mock.calls) {
    expect(name).toBe(ISSUE);
    expect(options.lease).not.toBe("release");
  }
  expect(state.documents.get("core/reservations")).toEqual(state.reservations);
  expect(readFileSync(current.candidate)).toEqual(state.candidate);
  expect(state.reconcileCleanup).not.toHaveBeenCalled();
  expect(state.fire).not.toHaveBeenCalled();
  for (const [file, original] of originals)
    expect(readFileSync(file)).toEqual(original);
  for (let index = 0; index < originals.size; index += 1) {
    const owner = JSON.parse(
      readFileSync(
        path.join(current.root, "locks", `check-slot-${index}`, "owner"),
        "utf8",
      ),
    );
    expect(owner).toMatchObject({ runId: RUN_ID, state: "unconfirmed" });
    expect(
      originals.has(
        path.join(current.roundDir, `mcp-cleanup-${owner.attempt}.json`),
      ),
    ).toBe(true);
  }
  return value;
}

describe("MCP cleanup receipt and state byte budgets", () => {
  it.each([false, true])(
    "keeps unique full receipts beyond 65536 bytes when execution throws=%s",
    async (thrown) => {
      const current = fixture();
      const { receipts, originals } = await runAttempts(current, {
        payload: "x".repeat(70_000),
        thrown,
      });
      for (const [file, receipt] of receipts) {
        expect(jsonBytes(receipt)).toBeGreaterThan(STATE_LIMIT);
        expect(readFileSync(file)).toEqual(originals.get(file));
      }
    },
  );

  it.each([
    { name: "individually bounded receipts", payload: "x".repeat(36_000) },
    {
      name: "multibyte receipts below the character limit",
      payload: "界".repeat(24_000),
    },
  ])(
    "archives every oversized batch with $name before retaining a compact hold",
    async ({ name, payload }) => {
      const current = fixture();
      const attempts = await runAttempts(current, { payload });
      const originalLedger = JSON.stringify(attempts.ledger);
      expect(jsonBytes(attempts.ledger)).toBeGreaterThan(STATE_LIMIT);
      for (const receipt of attempts.receipts.values()) {
        if (name === "individually bounded receipts")
          expect(jsonBytes(receipt)).toBeLessThan(STATE_LIMIT);
        else {
          expect(receipt.stdout.length).toBeLessThan(STATE_LIMIT);
          expect(jsonBytes(receipt)).toBeGreaterThan(STATE_LIMIT);
        }
      }
      const state = settlement(current);
      await expect(state.run(attempts.ledger)).resolves.toMatchObject({
        outcome: "cleanup-unconfirmed",
        cleanupPending: true,
        reservations: "kept",
        next: "",
      });
      const held = expectOwnershipHeld(current, state, attempts.originals);
      expect(held.cleanup.additionalCleanups).toBeUndefined();
      const artifact = held.cleanup.additionalCleanupArtifact!;
      expect(artifact).toEqual(held.cleanupStateArtifact);
      expect(artifact.run).toBe(RUN_ID);
      const snapshot = readFileSync(
        path.join(current.artifactsDir, artifact.path),
      );
      expect(artifact.bytes).toBe(snapshot.byteLength);
      expect(artifact.sha256).toBe(digest(snapshot));
      const archived = JSON.parse(snapshot.toString("utf8"));
      expect(archived).toMatchObject({
        v: 1,
        run: RUN_ID,
      });
      expect(digest(Buffer.from(JSON.stringify(archived.ledger), "utf8"))).toBe(
        digest(Buffer.from(originalLedger, "utf8")),
      );
      const archivedIdentities = [
        archived.workItem.cleanup,
        ...archived.workItem.cleanup.additionalCleanups,
      ].map(cleanupIdentity);
      const expectedIdentities = Object.values(attempts.ledger).map((entry) =>
        cleanupIdentity(entry.cleanup!),
      );
      expect(
        new Set(archivedIdentities.map((identity) => JSON.stringify(identity))),
      ).toEqual(
        new Set(expectedIdentities.map((identity) => JSON.stringify(identity))),
      );
      const reference = held.cleanup.receiptReference!;
      const primaryReceipt = readFileSync(reference.path);
      expect(reference.bytes).toBe(primaryReceipt.byteLength);
      expect(reference.sha256).toBe(digest(primaryReceipt));
      expect(digest(primaryReceipt)).toBe(
        cleanupIdentity(Object.values(attempts.ledger)[0]!.cleanup!).sha256,
      );
      expect(JSON.stringify(attempts.ledger)).toBe(originalLedger);
      expect(held.blocker.recovery).toContain(
        "compact batch evidence cannot authorize reuse",
      );
    },
  );

  it("keeps the compact-batch residual fail-closed on a later settlement without its ledger", async () => {
    const current = fixture();
    const attempts = await runAttempts(current);
    const state = settlement(current);
    await state.run(attempts.ledger);
    const initial = expectOwnershipHeld(current, state, attempts.originals);
    const artifact = initial.cleanup.additionalCleanupArtifact!;
    const snapshot = readFileSync(
      path.join(current.artifactsDir, artifact.path),
    );
    const compact = structuredClone(initial.cleanup);
    await expect(state.run({})).resolves.toMatchObject({
      outcome: "cleanup-unconfirmed",
      cleanupPending: true,
      reservations: "kept",
    });
    const retried = expectOwnershipHeld(current, state, attempts.originals);
    expect(retried.cleanup).toEqual(compact);
    expect(
      readFileSync(path.join(current.artifactsDir, artifact.path)),
    ).toEqual(snapshot);
  });

  it.each([
    "snapshot-blocked",
    "receipt-and-snapshot-blocked",
    "artifacts-unavailable",
  ])(
    "retains original attempt files and all ownership after %s",
    async (fault) => {
      const current = fixture();
      const attempts = await runAttempts(current);
      if (fault !== "artifacts-unavailable")
        mkdirSync(path.join(current.roundDir, "cleanup-item-state.json"));
      if (fault === "receipt-and-snapshot-blocked")
        mkdirSync(path.join(current.roundDir, "cleanup-state.json"));
      const state = settlement(current);
      await expect(
        state.run(
          attempts.ledger,
          fault === "artifacts-unavailable" ? null : current.artifactsDir,
        ),
      ).resolves.toMatchObject({
        outcome: "cleanup-unconfirmed",
        cleanupPending: true,
        reservations: "kept",
      });
      const held = expectOwnershipHeld(current, state, attempts.originals);
      expect(held.cleanup.additionalCleanups).toBeUndefined();
      expect(held.cleanup.additionalCleanupArtifact).toEqual(
        held.cleanupStateArtifact,
      );
      expect(held.cleanup.additionalCleanupArtifact).toMatchObject({
        run: RUN_ID,
      });
      expect(held.cleanup.additionalCleanupArtifact!.sha256).toBeUndefined();
      expect(held.cleanup.additionalCleanupArtifact!.bytes).toBeUndefined();
      if (fault !== "artifacts-unavailable")
        expect(held.blocker.recovery).toContain("State archival failed");
      if (fault !== "snapshot-blocked")
        expect(held.blocker.recovery).toContain("Receipt archival failed");
    },
  );
});

async function record(
  current: ReturnType<typeof fixture>,
  state: ReturnType<typeof settlement>,
) {
  const outcomes = path.join(current.root, "outcomes.json");
  writeFileSync(outcomes, JSON.stringify({ nodes: [] }));
  vi.stubEnv("NODE_OUTCOMES_FILE", outcomes);
  recordBoundary.createReconciler.mockReturnValue(state.reconcileCleanup);
  recordBoundary.openRound.mockReturnValue({
    runId: RUN_ID,
    assignment: ASSIGNMENT,
    issue: 12,
    artifacts: current.artifactsDir,
    runDir: current.runDir,
    paths: { views: current.views.replaceAll("\\", "/") },
    config: current.config,
    limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
    archon: state.archon,
    now: () => NOW,
    ledger: {
      all: () => readLedger(current.roundDir),
      write: (name: string, value: unknown) =>
        writeFileSync(
          path.join(current.roundDir, `${name}.json`),
          JSON.stringify(value),
        ),
    },
  });
  await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
}

describe("record view cleanup with real settlement", () => {
  it.each([false, true])(
    "does not prune mounted views or fire when the oversized snapshot fails=%s",
    async (archiveFails) => {
      const current = fixture();
      const attempts = await runAttempts(current);
      if (archiveFails)
        mkdirSync(path.join(current.roundDir, "cleanup-item-state.json"));
      const state = settlement(current);
      await record(current, state);
      expectOwnershipHeld(current, state, attempts.originals);
      expect(recordBoundary.fire).not.toHaveBeenCalled();
      expect(recordBoundary.emit).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ outcome: "cleanup-unconfirmed" }),
      );
      expect(
        JSON.parse(
          readFileSync(path.join(current.roundDir, "record.json"), "utf8"),
        ),
      ).toMatchObject({ outcome: "cleanup-unconfirmed", reservations: "kept" });
      expect(existsSync(path.join(current.views, RUN_ID))).toBe(true);
    },
  );

  it("releases the lease and prunes views for a small batch only after every attempt is independently confirmed", async () => {
    const current = fixture(2);
    const attempts = await runAttempts(current, {
      payload: "small diagnostic",
      count: 2,
    });
    expect(jsonBytes(attempts.ledger)).toBeLessThan(STATE_LIMIT);
    const state = settlement(current);
    await record(current, state);
    expect(state.reconcileCleanup).toHaveBeenCalledTimes(2);
    const expectedAttempts = [...attempts.receipts.values()]
      .map((receipt) => receipt.labels["core.archon.attempt"])
      .sort();
    expect(
      state.reconcileCleanup.mock.calls
        .map(([input]) => input.labels["core.archon.attempt"])
        .sort(),
    ).toEqual(expectedAttempts);
    expect(state.documents.get(ISSUE)).toMatchObject({
      value: { status: "waiting", cleanupReconciliation: { confirmed: true } },
      lease: { runId: RUN_ID, live: false },
    });
    expect(recordBoundary.fire).toHaveBeenCalledOnce();
    expect(recordBoundary.emit).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ outcome: "continue" }),
    );
    expect(existsSync(path.join(current.views, RUN_ID))).toBe(false);
    for (const [file, original] of attempts.originals)
      expect(readFileSync(file)).toEqual(original);
  });
});
