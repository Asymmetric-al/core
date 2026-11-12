import { createHash } from "node:crypto";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { settleRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import {
  createAssignment,
  planClaim,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// record's writes: the refusal marker of an unclaimed round (I6), the finish
// write with its successor keyed on the revision it produced, and the release
// of the issue's shared-area reservations on every terminal outcome (I3, I4).

type Doc = {
  revision: number;
  value: any;
  lease: { runId: string; live: boolean } | null;
};

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const POLICY = "c".repeat(64);
const RUNNING = { v: 1, intake: "open", mode: "run", mergeHold: false };

function assign(endState = "PR_READY") {
  return createAssignment({
    issue: 12,
    assignmentId: ASSIGNMENT,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
    endState,
    reason: "Only eligible issue",
    by: "selector:run-0",
    now: T0,
  });
}

// An in-memory Archon state store with revisions, conflicts and leases.
function store(seed: Record<string, Doc>) {
  const docs = new Map(Object.entries(structuredClone(seed)));
  const archon = {
    get: vi.fn(async (name: string) => {
      const doc = docs.get(name);
      return doc
        ? { name, ...structuredClone(doc) }
        : { name, revision: 0, value: null, lease: null };
    }),
    put: vi.fn(
      async (
        name: string,
        value: unknown,
        options: { ifRevision: number; lease?: string },
      ) => {
        const doc = docs.get(name) ?? { revision: 0, value: null, lease: null };
        if (doc.revision !== options.ifRevision)
          throw new StateConflict("conflict", null);
        const bytes = Buffer.byteLength(JSON.stringify(value), "utf8");
        if (bytes > 65_536)
          throw new Error(`StateDocumentTooLarge: ${bytes} > 65536`);
        const lease =
          options.lease === "release" && doc.lease
            ? { ...doc.lease, live: false }
            : doc.lease;
        docs.set(name, {
          revision: doc.revision + 1,
          value: structuredClone(value),
          lease,
        });
        return { name, revision: doc.revision + 1, value };
      },
    ),
  };
  return { archon, doc: (name: string) => docs.get(name) };
}

// #12 waiting on `route` at revision 10, then claimed by run-5 at revision 11.
function activeItem(
  route = "feedback",
  endState = "PR_READY",
  runId = "run-5",
): Doc {
  const waiting = { ...assign(endState), status: "waiting", route, round: 4 };
  const plan = planClaim(
    {
      name: "core/issues/12",
      revision: 10,
      value: waiting,
      lease: null,
    } as any,
    { runId, assignmentId: ASSIGNMENT, policyRevision: POLICY, now: T1 },
  );
  return { revision: 11, value: plan.value, lease: { runId, live: true } };
}

const claimed = {
  claim: { proceed: true },
  "claim-lease": { taken: true },
  context: { ok: true },
};

const nativeFault = (action: string) => ({
  schema: "core-native-faults/v1",
  runId: "run-5",
  runStatus: action === "none" ? "completed" : "failed",
  action,
  reason: "Native execution cannot safely continue",
  faults:
    action === "code-failure"
      ? [
          {
            nodeId: "build",
            eventId: "event-build-failed",
            failureKind: "exec_failed",
            providerClass: null,
            resetAt: null,
            retryAfterMs: null,
          },
        ]
      : [],
  wait: null,
  preserveOwnership: !["none", "code-failure"].includes(action),
  automaticRetry: false,
});

function settle(
  seed: Record<string, Doc>,
  ledger: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) {
  const state = store({
    "core/factory": { revision: 3, value: RUNNING, lease: null },
    ...seed,
  });
  const fire = vi.fn(
    async ({ value, revision }: { value: any; revision: number }) => ({
      ok: true,
      outcome: "accepted",
      deliveryId: `${value.assignment.id}:r${value.round + 1}:v${revision}`,
    }),
  );
  const result = settleRound({
    archon: state.archon,
    issue: 12,
    runId: "run-5",
    assignment: ASSIGNMENT,
    ledger,
    nodes: [],
    now: T1,
    limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
    fire,
    ...extra,
  });
  return { state, fire, result };
}

const reservations = (areas: Record<string, number>): Doc => ({
  revision: 4,
  value: { v: 1, areas },
  lease: null,
});

describe("executor capacity and native faults", () => {
  it.each(["check-capacity", "check-cancelled"])(
    "blocks %s on the run route instead of repairing claim failures",
    async (code) => {
      const blocked = {
        code,
        detail: "No executor heavy slot was acquired",
        recovery: "Restore capacity and retry",
      };
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("oracle"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          claim: { proceed: false },
          "executor-capacity": { blocked },
        },
        {
          nodes: [{ node_id: "claim", state: "failed" }],
          nativeFaults: nativeFault("none"),
        },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "BLOCKED",
        reservations: "released",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          status: "BLOCKED",
          run: null,
          blocker: { ...blocked, route: "oracle" },
        },
        lease: { live: false },
      });
      expect(state.doc("core/issues/12")!.value.brief?.repair).toBeUndefined();
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each(["check-capacity", "check-cancelled"])(
    "retains a native ownership hold despite %s",
    async (code) => {
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("oracle"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          "executor-capacity": { blocked: { code, detail: "No slot" } },
        },
        { nativeFaults: nativeFault("owner-action") },
      );
      await expect(result).resolves.toMatchObject({
        outcome: "owner-action",
        nativePending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          run: { id: "run-5" },
          nativeFaults: { action: "owner-action" },
        },
        lease: { live: true },
      });
      expect(state.doc("core/reservations")!.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each([
    "native-wait",
    "native-recovery",
    "owner-action",
    "configuration-action",
    "reconcile",
    "cancelled",
  ])(
    "retains native %s ownership before failed-node, claim and repair routing",
    async (action) => {
      const nativeFaults = nativeFault(action);
      const active = activeItem("oracle");
      const { state, result, fire } = settle(
        {
          "core/issues/12": active,
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          claim: { proceed: false },
          freeze: { repair: { implementation: ["Not a code defect"] } },
        },
        {
          nativeFaults,
          nodes: [{ node_id: "claim", state: "failed", error: "Native fault" }],
        },
      );

      await expect(result).resolves.toMatchObject({
        outcome: action,
        nativePending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          status: "active",
          run: active.value.run,
          assignment: active.value.assignment,
          nativeFaults,
          blocker: { code: action, route: "oracle" },
        },
        lease: active.lease,
      });
      expect(state.doc("core/issues/12")!.value.brief?.repair).toBeUndefined();
      expect(state.doc("core/reservations")?.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each(["none", "code-failure"])(
    "keeps ordinary repair routing for native classification %s",
    async (action) => {
      const { result, fire } = settle(
        { "core/issues/12": activeItem("repair") },
        {
          ...claimed,
          freeze: {
            repair: { implementation: ["Fix the real implementation defect"] },
          },
        },
        { nativeFaults: nativeFault(action) },
      );

      await expect(result).resolves.toMatchObject({ outcome: "continue" });
      expect(fire).toHaveBeenCalledOnce();
    },
  );

  it.each([
    { fault: "wrong run", patch: { runId: "run-9" } },
    { fault: "wrong schema", patch: { schema: "other-schema/v1" } },
    { fault: "automatic retry", patch: { automaticRetry: true } },
  ])(
    "does not accept a $fault classifier result as permission to dispatch",
    async ({ patch }) => {
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("repair"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          freeze: {
            repair: {
              implementation: ["Do not trust unrelated native evidence"],
            },
          },
        },
        { nativeFaults: { ...nativeFault("none"), ...patch } },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "configuration-action",
        nativePending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: { nativeFaults: { action: "configuration-action" } },
        lease: { live: true },
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it("does not clear a stored native hold merely because a later classifier reports no fault", async () => {
    const active = activeItem("repair");
    active.value.nativeFaults = nativeFault("native-recovery");
    const { state, result, fire } = settle(
      {
        "core/issues/12": active,
        "core/reservations": reservations({ lockfile: 12 }),
      },
      { ...claimed },
      { nativeFaults: nativeFault("none") },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "native-recovery",
      nativePending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: { nativeFaults: active.value.nativeFaults, run: active.value.run },
      lease: active.lease,
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "ownership-preserving none",
      report: { ...nativeFault("none"), preserveOwnership: true },
    },
    {
      name: "failed none",
      report: { ...nativeFault("none"), runStatus: "failed" },
    },
    {
      name: "waiting none",
      report: { ...nativeFault("none"), wait: { kind: "attention" } },
    },
    { name: "empty reason", report: { ...nativeFault("none"), reason: "" } },
    {
      name: "empty code failure",
      report: { ...nativeFault("code-failure"), faults: [] },
    },
    {
      name: "provider code failure",
      report: {
        ...nativeFault("code-failure"),
        faults: [
          { ...nativeFault("code-failure").faults[0], providerClass: "auth" },
        ],
      },
    },
    { name: "null report", report: null },
  ])(
    "holds malformed safe-looking $name evidence before ordinary repair",
    async ({ report }) => {
      const active = activeItem("repair");
      const { state, result, fire } = settle(
        {
          "core/issues/12": active,
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          freeze: {
            repair: { implementation: ["Do not retry uncertain native work"] },
          },
        },
        { nativeFaults: report },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "configuration-action",
        nativePending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          status: "active",
          run: active.value.run,
          nativeFaults: {
            action: "configuration-action",
            runId: "run-5",
            automaticRetry: false,
            preserveOwnership: true,
            faults: [{ evidence: report }],
          },
        },
        lease: active.lease,
      });
      expect(state.doc("core/reservations")?.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each([
    {
      name: "malformed none",
      report: { ...nativeFault("none"), preserveOwnership: true },
    },
    {
      name: "malformed code failure",
      report: { ...nativeFault("code-failure"), faults: [] },
    },
    {
      name: "mismatched run",
      report: { ...nativeFault("native-recovery"), runId: "run-other" },
    },
    {
      name: "normal report for another run",
      report: { ...nativeFault("none"), runId: "run-other" },
    },
    { name: "null", report: null },
    { name: "undefined", report: undefined },
  ])(
    "does not clear stored $name native evidence with a later normal report",
    async ({ report }) => {
      const active = activeItem("repair");
      active.value.nativeFaults = report;
      const { state, result, fire } = settle(
        {
          "core/issues/12": active,
          "core/reservations": reservations({ lockfile: 12 }),
        },
        { ...claimed },
        { nativeFaults: nativeFault("none") },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "configuration-action",
        nativePending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          run: active.value.run,
          nativeFaults: { action: "configuration-action", runId: "run-5" },
        },
        lease: active.lease,
      });
      expect(state.doc("core/reservations")?.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each(["publish", "readiness"])(
    "does not retry native exec_failed at %s without external effects readback",
    async (nodeId) => {
      const active = activeItem("review");
      const nativeFaults = {
        ...nativeFault("code-failure"),
        faults: [{ ...nativeFault("code-failure").faults[0], nodeId }],
      };
      const { state, result, fire } = settle(
        {
          "core/issues/12": active,
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          publish: { published: true, pr: 24 },
          readiness: { verdict: "PR_READY" },
        },
        {
          nativeFaults,
          nodes: [
            {
              node_id: nodeId,
              state: "failed",
              error: "Command exited after sending remote mutation",
            },
          ],
        },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "reconcile",
        nativePending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          status: "active",
          nativeFaults: {
            action: "reconcile",
            runId: "run-5",
            faults: nativeFaults.faults,
            preserveOwnership: true,
            automaticRetry: false,
          },
          blocker: {
            code: "reconcile",
            recovery: expect.stringMatching(/external.*readback/i),
          },
        },
        lease: active.lease,
      });
      expect(state.doc("core/reservations")?.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it.each(["snapshot", "snapshot-failure", "missing-directory"])(
    "retains a bounded oversized native hold with %s",
    async (fault) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-native-budget-"),
      );
      const nativeFaults = {
        ...nativeFault("native-recovery"),
        faults: [{ transcript: "\u754c".repeat(24_000) }],
      };
      if (fault === "snapshot-failure")
        mkdirSync(path.join(artifactsDir, "round", "native-fault-state.json"), {
          recursive: true,
        });
      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": activeItem("repair"),
            "core/reservations": reservations({ lockfile: 12 }),
          },
          { ...claimed },
          {
            nativeFaults,
            artifactsDir: fault === "missing-directory" ? null : artifactsDir,
          },
        );

        await expect(result).resolves.toMatchObject({
          outcome: "native-recovery",
          nativePending: true,
          reservations: "kept",
        });
        const document = state.doc("core/issues/12")!;
        expect(document.lease?.live).toBe(true);
        expect(
          Buffer.byteLength(JSON.stringify(document.value), "utf8"),
        ).toBeLessThanOrEqual(65_536);
        expect(document.value.nativeFaults).toMatchObject({
          schema: "core-native-faults/v1",
          runId: "run-5",
          action: "native-recovery",
          automaticRetry: false,
          preserveOwnership: true,
        });
        if (fault === "snapshot") {
          const artifact = document.value.nativeFaults.artifact;
          const archived = readFileSync(path.join(artifactsDir, artifact.path));
          expect(artifact.bytes).toBe(archived.byteLength);
          expect(artifact.sha256).toBe(
            createHash("sha256").update(archived).digest("hex"),
          );
          expect(
            JSON.parse(archived.toString("utf8")).workItem.nativeFaults,
          ).toEqual(nativeFaults);
        } else
          expect(document.value.blocker.recovery).toContain("archival failed");
        expect(state.doc("core/reservations")?.value.areas).toEqual({
          lockfile: 12,
        });
        expect(fire).not.toHaveBeenCalled();
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );
});

function cleanupEvidence() {
  return {
    step: "hooks-commit",
    runId: "run-5",
    assignment: ASSIGNMENT,
    issue: 12,
    error: {
      name: "CheckCleanupError",
      message: "Executor cleanup could not be confirmed",
    },
    receipt: {
      status: "error",
      exitCode: null,
      containerId: "check-container-id",
      containerName: "candidate-check-12",
      labels: {
        "core.archon.executor": "candidate-check",
        "core.archon.attempt": "85c85ad7-d482-4ad4-a187-586ddc2cbf99",
        "core.archon.run": "run-5",
        "core.archon.issue": "12",
      },
      image: `sha256:${"a".repeat(64)}`,
      workspaceDirectory: "/issue/12",
      workspaceTarget: "/workspace",
      network: "none",
      mounts: [],
      command: ["bun", "run", "check"],
      limits: { cpus: 2 },
      stdout: "Original stdout",
      stderr: "Original stderr",
      cleanupConfirmed: false,
      reusable: false,
    },
  };
}

describe("freeze cleanup settlement", () => {
  it.each([false, true])(
    "bounds oversized reconciliation evidence without losing proof (confirmed=%s)",
    async (confirmed) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-reconciliation-budget-"),
      );
      const cleanup = cleanupEvidence();
      const evidence = {
        ok: confirmed,
        cleanupConfirmed: confirmed,
        reusable: confirmed,
        labels: cleanup.receipt.labels,
        remaining: confirmed ? [] : ["owned-container"],
        transcript: "\u754c".repeat(30_000),
      };
      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": activeItem("repair"),
            "core/reservations": reservations({ lockfile: 12 }),
          },
          { ...claimed, freeze: { cleanup, prepared: false } },
          { artifactsDir, reconcileCleanup: async () => evidence },
        );

        await expect(result).resolves.toMatchObject({
          outcome: confirmed ? "continue" : "cleanup-unconfirmed",
          cleanupPending: !confirmed,
          reservations: "kept",
        });
        const document = state.doc("core/issues/12")!;
        expect(document.value.cleanup).toEqual(cleanup);
        expect(document.value.cleanupReconciliation.confirmed).toBe(confirmed);
        expect(document.lease?.live).toBe(!confirmed);
        expect(
          Buffer.byteLength(JSON.stringify(document.value), "utf8"),
        ).toBeLessThanOrEqual(65_536);
        expect(document.value.cleanupStateArtifact.path).toBe(
          "round/cleanup-reconciliation-state.json",
        );
        const archived = readFileSync(
          path.join(artifactsDir, document.value.cleanupStateArtifact.path),
        );
        expect(document.value.cleanupStateArtifact.bytes).toBe(
          archived.byteLength,
        );
        expect(document.value.cleanupStateArtifact.sha256).toBe(
          createHash("sha256").update(archived).digest("hex"),
        );
        expect(
          JSON.parse(archived.toString("utf8")).workItem.cleanupReconciliation
            .evidence,
        ).toEqual(evidence);
        expect(fire).toHaveBeenCalledTimes(confirmed ? 1 : 0);
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );

  it("retains a bounded cleanup hold if oversized reconciliation evidence cannot be archived", async () => {
    const artifactsDir = mkdtempSync(
      path.join(os.tmpdir(), "archon-reconciliation-archive-failure-"),
    );
    const cleanup = cleanupEvidence();
    mkdirSync(
      path.join(artifactsDir, "round", "cleanup-reconciliation-state.json"),
      { recursive: true },
    );
    try {
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("repair"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        { ...claimed, freeze: { cleanup, prepared: false } },
        {
          artifactsDir,
          reconcileCleanup: async () => ({
            ok: true,
            cleanupConfirmed: true,
            reusable: true,
            labels: cleanup.receipt.labels,
            remaining: [],
            transcript: "x".repeat(70_000),
          }),
        },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "cleanup-unconfirmed",
        cleanupPending: true,
        reservations: "kept",
      });
      const document = state.doc("core/issues/12")!;
      expect(document.value.cleanup).toEqual(cleanup);
      expect(document.value.cleanupReconciliation.confirmed).toBe(false);
      expect(document.value.blocker.recovery).toContain("archival failed");
      expect(document.lease?.live).toBe(true);
      expect(
        Buffer.byteLength(JSON.stringify(document.value), "utf8"),
      ).toBeLessThanOrEqual(65_536);
      expect(fire).not.toHaveBeenCalled();
    } finally {
      rmSync(artifactsDir, { recursive: true, force: true });
    }
  });

  it("retains a native hold after independently confirming executor cleanup", async () => {
    const cleanup = cleanupEvidence();
    const nativeFaults = nativeFault("native-recovery");
    const { state, result, fire } = settle(
      {
        "core/issues/12": activeItem("repair"),
        "core/reservations": reservations({ lockfile: 12 }),
      },
      { ...claimed, freeze: { cleanup, prepared: false } },
      {
        nativeFaults,
        reconcileCleanup: async () => ({
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          labels: cleanup.receipt.labels,
          remaining: [],
        }),
      },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "native-recovery",
      cleanupPending: false,
      nativePending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        status: "active",
        cleanup,
        cleanupReconciliation: { confirmed: true },
        nativeFaults,
      },
      lease: { live: true },
    });
    expect(state.doc("core/reservations")?.value.areas).toEqual({
      lockfile: 12,
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("blocks executor capacity after cleanup confirmation rather than dispatching", async () => {
    const cleanup = cleanupEvidence();
    const blocked = {
      code: "check-capacity",
      detail: "Capacity wait timed out",
      recovery: "Restore capacity and retry",
    };
    const { state, result, fire } = settle(
      {
        "core/issues/12": activeItem("oracle"),
        "core/reservations": reservations({ lockfile: 12 }),
      },
      {
        ...claimed,
        freeze: { cleanup, prepared: false },
        "executor-capacity": { blocked },
      },
      {
        reconcileCleanup: async () => ({
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          labels: cleanup.receipt.labels,
          remaining: [],
        }),
      },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "BLOCKED",
      cleanupPending: false,
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        status: "BLOCKED",
        cleanupReconciliation: { confirmed: true },
        blocker: { ...blocked, route: "oracle" },
      },
      lease: { live: false },
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("retains native ownership over capacity after independent cleanup confirmation", async () => {
    const cleanup = cleanupEvidence();
    const { state, result, fire } = settle(
      {
        "core/issues/12": activeItem("oracle"),
        "core/reservations": reservations({ lockfile: 12 }),
      },
      {
        ...claimed,
        freeze: { cleanup, prepared: false },
        "executor-capacity": {
          blocked: { code: "check-capacity", detail: "No slot" },
        },
      },
      {
        nativeFaults: nativeFault("owner-action"),
        reconcileCleanup: async () => ({
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          labels: cleanup.receipt.labels,
          remaining: [],
        }),
      },
    );
    await expect(result).resolves.toMatchObject({
      outcome: "owner-action",
      nativePending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        cleanupReconciliation: { confirmed: true },
        nativeFaults: { action: "owner-action" },
      },
      lease: { live: true },
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "requires independent cleanup for every MCP attempt (all confirmed: %s)",
    async (allConfirmed) => {
      const first = cleanupEvidence();
      const second = structuredClone(first);
      second.step = "mcp:review";
      second.receipt.labels["core.archon.attempt"] = "second-attempt";
      const reconcileCleanup = vi.fn(async ({ cleanup }: any) => ({
        ok:
          allConfirmed ||
          cleanup.receipt.labels["core.archon.attempt"] !== "second-attempt",
        cleanupConfirmed: true,
        reusable: true,
        labels: cleanup.receipt.labels,
        remaining: [],
      }));
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("oracle"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          "mcp-cleanup-first": { cleanup: first },
          "mcp-cleanup-second": { cleanup: second },
        },
        { reconcileCleanup },
      );
      const outcome = await result;
      expect(reconcileCleanup).toHaveBeenCalledTimes(2);
      if (allConfirmed) expect(outcome.cleanupPending).toBe(false);
      else {
        expect(outcome).toMatchObject({
          cleanupPending: true,
          reservations: "kept",
        });
        expect(state.doc("core/issues/12")).toMatchObject({
          value: { cleanup: { additionalCleanups: [second] } },
          lease: { live: true },
        });
        expect(fire).not.toHaveBeenCalled();
      }
    },
  );

  it.each(["claim", "readiness", "prepush"])(
    "holds central %s cleanup before claim, capacity and failed-node routing",
    async (stage) => {
      const cleanup = cleanupEvidence();
      cleanup.step = "install";
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("repair"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          claim: { proceed: false, reason: "Executor interrupted" },
          "executor-cleanup": {
            cleanup,
            blocked: {
              code: "cleanup-unconfirmed",
              detail: "Owned cleanup needs proof",
            },
          },
          "executor-capacity": {
            blocked: { code: "check-capacity", detail: "No heavy slot" },
          },
        },
        {
          nodes: [
            { node_id: stage, state: "failed", error: "Cleanup unconfirmed" },
          ],
          nativeFaults: nativeFault("native-wait"),
        },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "cleanup-unconfirmed",
        cleanupPending: true,
        reservations: "kept",
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          status: "active",
          cleanup,
          blocker: { code: "cleanup-unconfirmed", route: "repair" },
        },
        lease: { live: true },
      });
      expect(state.doc("core/reservations")?.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    },
  );

  it("resumes central executor cleanup only after independent exact-label confirmation", async () => {
    const cleanup = cleanupEvidence();
    const { state, result, fire } = settle(
      {
        "core/issues/12": activeItem("oracle"),
        "core/reservations": reservations({ lockfile: 12 }),
      },
      {
        ...claimed,
        "executor-cleanup": {
          cleanup,
          blocked: { code: "cleanup-unconfirmed" },
        },
      },
      {
        reconcileCleanup: async () => ({
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          labels: cleanup.receipt.labels,
          remaining: [],
        }),
      },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "continue",
      cleanupPending: false,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        status: "waiting",
        route: "oracle",
        cleanup,
        cleanupReconciliation: { confirmed: true },
      },
      lease: { live: false },
    });
    expect(fire).toHaveBeenCalledOnce();
  });

  it.each([
    { fault: "missing success", patch: { ok: undefined } },
    { fault: "missing cleanup proof", patch: { cleanupConfirmed: undefined } },
    { fault: "not reusable", patch: { reusable: false } },
    { fault: "unknown remaining workloads", patch: { remaining: undefined } },
    { fault: "remaining workload", patch: { remaining: ["owned-container"] } },
    { fault: "missing labels", patch: { labels: undefined } },
    {
      fault: "different attempt",
      patch: {
        labels: {
          ...cleanupEvidence().receipt.labels,
          "core.archon.attempt": "different",
        },
      },
    },
    {
      fault: "broader label set",
      patch: {
        labels: { ...cleanupEvidence().receipt.labels, extra: "selector" },
      },
    },
  ])("keeps the exact cleanup hold with $fault", async ({ patch }) => {
    const cleanup = cleanupEvidence();
    const evidence = {
      ok: true,
      cleanupConfirmed: true,
      reusable: true,
      labels: cleanup.receipt.labels,
      remaining: [],
      ...patch,
    };
    const { state, result, fire } = settle(
      {
        "core/issues/12": activeItem("repair"),
        "core/reservations": reservations({ lockfile: 12 }),
      },
      { ...claimed, freeze: { cleanup, review: true, prepared: false } },
      {
        nodes: [
          { node_id: "freeze", state: "failed", error: "Cleanup unconfirmed" },
        ],
        reconcileCleanup: async () => evidence,
      },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "cleanup-unconfirmed",
      cleanupPending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        status: "active",
        cleanup,
        cleanupReconciliation: { confirmed: false, evidence },
      },
      lease: { live: true },
    });
    expect(state.doc("core/reservations")?.value.areas).toEqual({
      lockfile: 12,
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("retains durable cleanup without a claim ledger when independent reconciliation throws", async () => {
    const cleanup = cleanupEvidence();
    const active = activeItem("repair");
    active.value.cleanup = cleanup;
    active.value.blocker = { code: "cleanup-unconfirmed", route: "repair" };
    const { state, result, fire } = settle(
      {
        "core/issues/12": active,
        "core/reservations": reservations({ lockfile: 12 }),
      },
      {},
      {
        reconcileCleanup: async () => {
          throw new Error("Docker inspect unavailable");
        },
      },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "cleanup-unconfirmed",
      cleanupPending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        status: "active",
        cleanup,
        cleanupReconciliation: {
          confirmed: false,
          evidence: {
            error: { name: "Error", message: "Docker inspect unavailable" },
          },
        },
      },
      lease: { live: true },
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("does not release a new lease owner after a cleanup reconciliation CAS conflict", async () => {
    const cleanup = cleanupEvidence();
    const state = store({
      "core/factory": { revision: 3, value: RUNNING, lease: null },
      "core/issues/12": activeItem("repair"),
      "core/reservations": reservations({ lockfile: 12 }),
    });
    const originalPut = state.archon.put.getMockImplementation()!;
    let raced = false;
    state.archon.put.mockImplementation(async (name, value: any, options) => {
      if (
        name === "core/issues/12" &&
        value.cleanupReconciliation?.confirmed === true &&
        !raced
      ) {
        raced = true;
        const holder = state.doc(name)!;
        const replacement = activeItem("repair", "PR_READY", "run-9");
        replacement.value.cleanup = structuredClone(holder.value.cleanup);
        replacement.value.blocker = structuredClone(holder.value.blocker);
        Object.assign(holder, replacement, { revision: holder.revision + 1 });
      }
      return originalPut(name, value, options);
    });
    const fire = vi.fn(async () => ({ ok: true }));

    const result = await settleRound({
      archon: state.archon,
      issue: 12,
      runId: "run-5",
      assignment: ASSIGNMENT,
      ledger: { ...claimed, freeze: { cleanup, prepared: false } },
      now: T1,
      fire,
      reconcileCleanup: async () => ({
        ok: true,
        cleanupConfirmed: true,
        reusable: true,
        labels: cleanup.receipt.labels,
        remaining: [],
      }),
    });

    expect(raced).toBe(true);
    expect(result).toMatchObject({
      outcome: "unrecorded",
      cleanupPending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: {
        status: "active",
        run: { id: "run-9" },
        cleanup,
        blocker: { code: "cleanup-unconfirmed" },
      },
      lease: { live: true, runId: "run-9" },
    });
    expect(state.doc("core/reservations")?.value.areas).toEqual({
      lockfile: 12,
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it.each(["missing-directory", "unwritable-receipt", "linked-receipt"])(
    "retains a bounded durable hold after %s archival failure",
    async (fault) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-cleanup-archive-failure-"),
      );
      const cleanup = cleanupEvidence();
      cleanup.receipt.stdout = "x".repeat(70_000);
      const ledger = { ...claimed, freeze: { cleanup, prepared: false } };
      mkdirSync(path.join(artifactsDir, "round"));
      const original = JSON.stringify(ledger.freeze, null, 2);
      writeFileSync(path.join(artifactsDir, "round", "freeze.json"), original);
      if (fault === "unwritable-receipt")
        mkdirSync(path.join(artifactsDir, "round", "cleanup-state.json"));
      if (fault === "linked-receipt") {
        const target = path.join(artifactsDir, "original-receipt.json");
        writeFileSync(target, JSON.stringify(cleanup.receipt, null, 2));
        symlinkSync(
          target,
          path.join(artifactsDir, "round", "cleanup-state.json"),
          "file",
        );
      }
      const active = activeItem("repair");
      active.value.brief = { report: "" };
      active.value.brief.report = "x".repeat(
        65_500 - Buffer.byteLength(JSON.stringify(active.value), "utf8"),
      );
      const reconcileCleanup = vi.fn(async () => ({ ok: true }));
      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": active,
            "core/reservations": reservations({ lockfile: 12 }),
          },
          ledger,
          {
            artifactsDir: fault === "missing-directory" ? null : artifactsDir,
            reconcileCleanup,
          },
        );

        await expect(result).resolves.toMatchObject({
          outcome: "cleanup-unconfirmed",
          cleanupPending: true,
          reservations: "kept",
        });
        const held = state.doc("core/issues/12")!;
        expect(held.lease?.live).toBe(true);
        expect(held.value.blocker.code).toBe("cleanup-unconfirmed");
        expect(held.value.blocker.recovery).toContain(
          "Receipt archival failed",
        );
        expect(
          Buffer.byteLength(JSON.stringify(held.value), "utf8"),
        ).toBeLessThanOrEqual(65_536);
        expect(
          readFileSync(path.join(artifactsDir, "round", "freeze.json"), "utf8"),
        ).toBe(original);
        expect(state.doc("core/reservations")?.value.areas).toEqual({
          lockfile: 12,
        });
        expect(reconcileCleanup).not.toHaveBeenCalled();
        expect(fire).not.toHaveBeenCalled();
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );

  it("retains an unresolved durable cleanup blocker even when its original receipt is missing", async () => {
    const active = activeItem("repair");
    active.value.blocker = { code: "cleanup-unconfirmed", route: "repair" };
    const { state, result, fire } = settle(
      {
        "core/issues/12": active,
        "core/reservations": reservations({ lockfile: 12 }),
      },
      claimed,
      {
        nodes: [
          {
            node_id: "freeze",
            state: "failed",
            error: "Original ledger unavailable",
          },
        ],
      },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "cleanup-unconfirmed",
      cleanupPending: true,
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: { status: "active", blocker: { code: "cleanup-unconfirmed" } },
      lease: { live: true },
    });
    expect(state.doc("core/reservations")?.value.areas).toEqual({
      lockfile: 12,
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("persists a bounded cleanup hold when the existing item already fills the state budget", async () => {
    const artifactsDir = mkdtempSync(
      path.join(os.tmpdir(), "archon-cleanup-budget-"),
    );
    const cleanup = cleanupEvidence();
    cleanup.receipt.stdout = "x".repeat(70_000);
    const active = activeItem("repair");
    active.value.brief = { report: "" };
    active.value.brief.report = "x".repeat(
      65_500 - Buffer.byteLength(JSON.stringify(active.value), "utf8"),
    );
    try {
      const { state, result, fire } = settle(
        {
          "core/issues/12": active,
          "core/reservations": reservations({ lockfile: 12 }),
        },
        { ...claimed, freeze: { cleanup, prepared: false } },
        { artifactsDir },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "cleanup-unconfirmed",
        cleanupPending: true,
      });
      const held = state.doc("core/issues/12")!;
      expect(
        Buffer.byteLength(JSON.stringify(held.value), "utf8"),
      ).toBeLessThanOrEqual(65_536);
      expect(held.lease?.live).toBe(true);
      expect(held.value.cleanup.receiptReference.path).toBe(
        path.join(artifactsDir, "round", "cleanup-state.json"),
      );
      const retained = JSON.parse(
        readFileSync(
          path.join(artifactsDir, "round", "cleanup-item-state.json"),
          "utf8",
        ),
      );
      expect(retained.workItem.brief).toEqual(active.value.brief);
      expect(retained.ledger.freeze.cleanup).toEqual(cleanup);
      expect(state.doc("core/reservations")?.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).not.toHaveBeenCalled();
    } finally {
      rmSync(artifactsDir, { recursive: true, force: true });
    }
  });

  it("does not invent a review checkpoint when both candidate and head are absent", async () => {
    const cleanup = cleanupEvidence();
    const active = activeItem("initial");
    delete active.value.head;
    delete active.value.run.head;
    const evidence = {
      ok: true,
      cleanupConfirmed: true,
      reusable: true,
      labels: cleanup.receipt.labels,
      remaining: [],
    };
    const { state, result } = settle(
      { "core/issues/12": active },
      {
        ...claimed,
        "after-define": { acceptance: "criteria" },
        freeze: { cleanup, review: true, prepared: false },
      },
      { reconcileCleanup: async () => evidence },
    );

    await expect(result).resolves.toMatchObject({
      outcome: "continue",
      cleanupPending: false,
    });
    expect(state.doc("core/issues/12")!.value.route).toBe("repair");
  });

  it.each(["absent", "tampered"])(
    "retains ownership when the receipt artifact is %s despite purported confirmation",
    async (fault) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-cleanup-unreadable-"),
      );
      const cleanup = cleanupEvidence();
      cleanup.receipt.stdout = "x".repeat(70_000);
      try {
        const { state, result } = settle(
          {
            "core/issues/12": activeItem("repair"),
            "core/reservations": reservations({ lockfile: 12 }),
          },
          { ...claimed, freeze: { cleanup, prepared: false } },
          { artifactsDir },
        );
        await result;
        const original = structuredClone(
          state.doc("core/issues/12")!.value.cleanup,
        );
        if (fault === "absent") rmSync(original.receiptReference.path);
        else writeFileSync(original.receiptReference.path, "{}");
        const reconcileCleanup = vi.fn(async () => ({
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          labels: cleanup.receipt.labels,
          remaining: [],
          receiptSha256: original.receiptReference.sha256,
        }));
        const fire = vi.fn(async () => ({ ok: true }));

        const retried = await settleRound({
          archon: state.archon,
          issue: 12,
          runId: "run-5",
          assignment: ASSIGNMENT,
          ledger: {},
          now: T1,
          fire,
          reconcileCleanup,
          artifactsDir,
        });

        expect(retried).toMatchObject({
          outcome: "cleanup-unconfirmed",
          cleanupPending: true,
          reservations: "kept",
        });
        expect(state.doc("core/issues/12")).toMatchObject({
          value: {
            status: "active",
            cleanup: original,
            cleanupReconciliation: { confirmed: false },
          },
          lease: { live: true },
        });
        expect(state.doc("core/reservations")?.value.areas).toEqual({
          lockfile: 12,
        });
        expect(reconcileCleanup).not.toHaveBeenCalled();
        expect(fire).not.toHaveBeenCalled();
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );

  it.each([
    "outside",
    "sibling-prefix",
    "other-run",
    "other-file",
    "missing-root",
    "relative-root",
    "file-symlink",
    "round-junction",
    "root-junction",
  ])(
    "refuses a correctly hashed cleanup receipt before reading an untrusted %s path",
    async (fault) => {
      const root = realpathSync(
        mkdtempSync(path.join(os.tmpdir(), "archon-record-trusted-receipt-")),
      );
      const trustedRoot = path.join(root, "artifacts", "run-5");
      const directory = path.join(trustedRoot, "round");
      const expectedPath = path.join(directory, "cleanup-state.json");
      const cleanup = cleanupEvidence();
      const content = Buffer.from(
        JSON.stringify(cleanup.receipt, null, 2),
        "utf8",
      );
      mkdirSync(directory, { recursive: true });
      writeFileSync(expectedPath, content);
      let referencePath = expectedPath;
      let artifactsDir: string | null = trustedRoot;
      if (fault === "outside") referencePath = path.join(root, "outside.json");
      if (fault === "sibling-prefix")
        referencePath = path.join(
          `${trustedRoot}-other`,
          "round",
          "cleanup-state.json",
        );
      if (fault === "other-run")
        referencePath = path.join(
          root,
          "artifacts",
          "run-other",
          "round",
          "cleanup-state.json",
        );
      if (fault === "other-file")
        referencePath = path.join(directory, "other.json");
      if (referencePath !== expectedPath) {
        mkdirSync(path.dirname(referencePath), { recursive: true });
        writeFileSync(referencePath, content);
      }
      if (fault === "missing-root") artifactsDir = null;
      if (fault === "relative-root")
        artifactsDir = path.relative(process.cwd(), trustedRoot);
      if (fault === "file-symlink") {
        const target = path.join(root, "linked-receipt.json");
        writeFileSync(target, content);
        rmSync(expectedPath);
        symlinkSync(target, expectedPath, "file");
      }
      if (fault === "round-junction" || fault === "root-junction") {
        const redirected = fault === "round-junction" ? directory : trustedRoot;
        const target = path.join(root, "redirected");
        renameSync(redirected, target);
        symlinkSync(target, redirected, "junction");
      }
      const { receipt, ...identity } = cleanup;
      const active = activeItem("repair");
      active.value.cleanup = {
        ...identity,
        receiptReference: {
          path: referencePath,
          bytes: content.byteLength,
          sha256: createHash("sha256").update(content).digest("hex"),
          labels: receipt.labels,
        },
      };
      const reconcileCleanup = vi.fn(async () => ({
        ok: true,
        cleanupConfirmed: true,
        reusable: true,
        labels: receipt.labels,
        remaining: [],
        receiptSha256: active.value.cleanup.receiptReference.sha256,
      }));
      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": active,
            "core/reservations": reservations({ lockfile: 12 }),
          },
          {},
          { artifactsDir, reconcileCleanup },
        );

        await expect(result).resolves.toMatchObject({
          outcome: "cleanup-unconfirmed",
          cleanupPending: true,
          reservations: "kept",
        });
        expect(state.doc("core/issues/12")).toMatchObject({
          value: {
            status: "active",
            cleanup: active.value.cleanup,
            cleanupReconciliation: {
              confirmed: false,
              evidence: {
                error: { message: expect.stringMatching(/trusted|no-follow/i) },
              },
            },
          },
          lease: active.lease,
        });
        expect(state.doc("core/reservations")?.value.areas).toEqual({
          lockfile: 12,
        });
        expect(reconcileCleanup).not.toHaveBeenCalled();
        expect(fire).not.toHaveBeenCalled();
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    },
  );

  it("resumes an artifact-backed cleanup only with independent receipt hash and label proof", async () => {
    const artifactsDir = mkdtempSync(
      path.join(os.tmpdir(), "archon-cleanup-proof-"),
    );
    const cleanup = cleanupEvidence();
    cleanup.receipt.stdout = "x".repeat(70_000);
    const reconcileCleanup = vi.fn(
      async ({ cleanup: retained, labels }: any) => {
        const content = readFileSync(retained.receiptReference.path);
        const receipt = JSON.parse(content.toString("utf8"));
        if (JSON.stringify(receipt.labels) !== JSON.stringify(labels))
          throw new Error("Exact labels were not supplied");
        return {
          ok: true,
          cleanupConfirmed: true,
          reusable: true,
          labels,
          remaining: [],
          receiptSha256: createHash("sha256").update(content).digest("hex"),
        };
      },
    );
    try {
      const { state, result, fire } = settle(
        {
          "core/issues/12": activeItem("repair"),
          "core/reservations": reservations({ lockfile: 12 }),
        },
        { ...claimed, freeze: { cleanup, prepared: false } },
        { artifactsDir, reconcileCleanup },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "continue",
        cleanupPending: false,
        reservations: "kept",
      });
      const settled = state.doc("core/issues/12")!;
      expect(settled.value.route).toBe("repair");
      expect(settled.lease?.live).toBe(false);
      expect(settled.value.cleanup.receipt).toBeUndefined();
      expect(settled.value.cleanupReconciliation).toMatchObject({
        confirmed: true,
        evidence: {
          receiptSha256: settled.value.cleanup.receiptReference.sha256,
        },
      });
      expect(
        JSON.parse(
          readFileSync(settled.value.cleanup.receiptReference.path, "utf8"),
        ),
      ).toEqual(cleanup.receipt);
      expect(fire).toHaveBeenCalledTimes(1);
    } finally {
      rmSync(artifactsDir, { recursive: true, force: true });
    }
  });

  it.each(["x", "\u754c"])(
    "retains an oversized %s cleanup receipt outside the bounded leased item",
    async (character) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-cleanup-state-"),
      );
      const cleanup = cleanupEvidence();
      cleanup.receipt.stdout = character.repeat(70_000);
      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": activeItem("repair"),
            "core/reservations": reservations({ lockfile: 12 }),
          },
          {
            ...claimed,
            freeze: {
              cleanup,
              blocked: { code: "cleanup-unconfirmed" },
              prepared: false,
            },
          },
          { artifactsDir },
        );

        await expect(result).resolves.toMatchObject({
          outcome: "cleanup-unconfirmed",
          cleanupPending: true,
          reservations: "kept",
        });
        const held = state.doc("core/issues/12")!;
        const receiptPath = path.join(
          artifactsDir,
          "round",
          "cleanup-state.json",
        );
        const content = readFileSync(receiptPath);
        expect(JSON.parse(content.toString("utf8"))).toEqual(cleanup.receipt);
        const { receipt: _receipt, ...identity } = cleanup;
        expect(held.value.cleanup).toEqual({
          ...identity,
          receiptReference: {
            path: receiptPath,
            sha256: createHash("sha256").update(content).digest("hex"),
            bytes: content.byteLength,
            labels: cleanup.receipt.labels,
          },
        });
        expect(held.lease?.live).toBe(true);
        expect(held.value.status).toBe("active");
        expect(held.value.blocker.code).toBe("cleanup-unconfirmed");
        expect(
          Buffer.byteLength(JSON.stringify(held.value), "utf8"),
        ).toBeLessThanOrEqual(65_536);
        expect(state.doc("core/reservations")?.value.areas).toEqual({
          lockfile: 12,
        });
        expect(fire).not.toHaveBeenCalled();
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );

  it.each(["review", "repair", "oracle"])(
    "resumes %s only after independent exact-label confirmation",
    async (route) => {
      const cleanup = cleanupEvidence();
      const active = activeItem(route === "review" ? "initial" : route);
      active.value.head = "a".repeat(40);
      active.value.run.head = active.value.head;
      if (route === "review") active.value.head = "b".repeat(40);
      const evidence = {
        ok: true,
        cleanupConfirmed: true,
        reusable: true,
        labels: cleanup.receipt.labels,
        found: [cleanup.receipt.containerId],
        remaining: [],
      };
      const reconcileCleanup = vi.fn(async () => structuredClone(evidence));
      const { state, result, fire } = settle(
        {
          "core/issues/12": active,
          "core/reservations": reservations({ lockfile: 12 }),
        },
        {
          ...claimed,
          freeze: {
            cleanup,
            blocked: { code: "cleanup-unconfirmed" },
            review: route === "review",
            candidate: active.value.head,
            prepared: false,
          },
        },
        { reconcileCleanup },
      );

      await expect(result).resolves.toMatchObject({
        outcome: "continue",
        cleanupPending: false,
        reservations: "kept",
      });
      expect(reconcileCleanup).toHaveBeenCalledWith({
        cleanup,
        labels: cleanup.receipt.labels,
        runId: "run-5",
        assignment: ASSIGNMENT,
        issue: 12,
      });
      expect(state.doc("core/issues/12")).toMatchObject({
        value: {
          status: "waiting",
          route,
          cleanup,
          cleanupReconciliation: { confirmed: true, at: T1, evidence },
        },
        lease: { live: false },
      });
      expect(state.doc("core/issues/12")!.value.brief?.repair).toBeUndefined();
      expect(state.doc("core/reservations")!.value.areas).toEqual({
        lockfile: 12,
      });
      expect(fire).toHaveBeenCalledTimes(1);
    },
  );
});

describe("oversized repair settlement", () => {
  it.each(["large-checkpoint", "snapshot-unavailable"])(
    "bounds repair settlement with %s near the engine state limit",
    async (fault) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-repair-budget-"),
      );
      const repair = {
        implementation: ["x".repeat(2000)].concat(
          Array.from({ length: 39 }, () => "y".repeat(2000)),
        ),
        source: "after-assess",
      };
      const active = activeItem("repair");
      const field = fault === "large-checkpoint" ? "reviews" : "brief";
      active.value[field] = { report: "" };
      active.value[field].report = "x".repeat(
        65_500 - Buffer.byteLength(JSON.stringify(active.value), "utf8"),
      );
      expect(Buffer.byteLength(JSON.stringify(active.value), "utf8")).toBe(
        65_500,
      );
      const ledger = { ...claimed, "after-assess": { repair } };
      mkdirSync(path.join(artifactsDir, "round"));
      const original = JSON.stringify(ledger["after-assess"], null, 2);
      writeFileSync(
        path.join(artifactsDir, "round", "after-assess.json"),
        original,
      );
      if (fault === "snapshot-unavailable")
        mkdirSync(path.join(artifactsDir, "round", "repair-state.json"));
      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": active,
            "core/reservations": reservations({ lockfile: 12 }),
          },
          ledger,
          { artifactsDir },
        );

        await expect(result).resolves.toMatchObject({
          outcome: "BLOCKED",
          reservations: "released",
        });
        const settled = state.doc("core/issues/12")!;
        expect(settled.lease?.live).toBe(false);
        expect(settled.value.blocker).toMatchObject({
          code: "repair-state-limit",
          route: "repair",
        });
        expect(
          Buffer.byteLength(JSON.stringify(settled.value), "utf8"),
        ).toBeLessThanOrEqual(65_536);
        expect(
          readFileSync(
            path.join(artifactsDir, "round", "after-assess.json"),
            "utf8",
          ),
        ).toBe(original);
        if (fault === "large-checkpoint") {
          const retained = JSON.parse(
            readFileSync(
              path.join(artifactsDir, "round", "repair-state.json"),
              "utf8",
            ),
          );
          expect(retained.workItem.reviews).toEqual(active.value.reviews);
          expect(retained.ledger["after-assess"].repair).toEqual(repair);
        } else {
          expect(settled.value.brief.repairArtifact.path).toBe(
            "round/after-assess.json",
          );
          expect(settled.value.blocker.recovery).toContain(
            "Snapshot write failed",
          );
        }
        expect(fire).not.toHaveBeenCalled();
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );

  it.each(["x", "\u754c"])(
    "blocks a repair larger than the UTF-8 state limit without losing its %s corrections",
    async (character) => {
      const artifactsDir = mkdtempSync(
        path.join(os.tmpdir(), "archon-repair-state-"),
      );
      const repair = {
        acceptance: ["Recheck every acceptance criterion"],
        implementation: Array.from(
          { length: 40 },
          (_entry, index) => `${index}: ${character.repeat(1800)}`,
        ),
        source: "after-assess",
      };
      const ledger = { ...claimed, "after-assess": { repair } };
      mkdirSync(path.join(artifactsDir, "round"));
      const original = JSON.stringify(ledger["after-assess"], null, 2);
      writeFileSync(
        path.join(artifactsDir, "round", "after-assess.json"),
        original,
      );
      const active = activeItem("repair");
      active.value.brief = {
        summary: "Original scoped brief",
        shared_areas: ["lockfile"],
      };
      const proposed = {
        ...active.value,
        brief: { ...active.value.brief, repair },
      };
      expect(
        Buffer.byteLength(JSON.stringify(proposed), "utf8"),
      ).toBeGreaterThan(65_536);

      try {
        const { state, result, fire } = settle(
          {
            "core/issues/12": active,
            "core/reservations": reservations({ lockfile: 12 }),
          },
          ledger,
          { artifactsDir },
        );
        await expect(result).resolves.toMatchObject({
          outcome: "BLOCKED",
          next: "",
        });
        const settled = state.doc("core/issues/12")!;
        expect(settled.lease?.live).toBe(false);
        expect(settled.value).toMatchObject({
          status: "BLOCKED",
          run: null,
          brief: {
            summary: "Original scoped brief",
            repair: null,
            repairArtifact: { run: "run-5", path: "round/repair-state.json" },
          },
          blocker: { code: "repair-state-limit", route: "oracle" },
        });
        expect(settled.value.blocker.recovery).toContain(
          "round/repair-state.json",
        );
        expect(
          Buffer.byteLength(JSON.stringify(settled.value), "utf8"),
        ).toBeLessThanOrEqual(65_536);
        expect(state.doc("core/reservations")?.value.areas).toEqual({});
        expect(fire).not.toHaveBeenCalled();
        expect(
          readFileSync(
            path.join(artifactsDir, "round", "after-assess.json"),
            "utf8",
          ),
        ).toBe(original);
        const retained = JSON.parse(
          readFileSync(
            path.join(artifactsDir, "round", "repair-state.json"),
            "utf8",
          ),
        );
        expect(retained.ledger["after-assess"].repair).toEqual(repair);
        expect(retained.workItem.brief.repair).toEqual(repair);
      } finally {
        rmSync(artifactsDir, { recursive: true, force: true });
      }
    },
  );
});

describe("a round that never took the lease", () => {
  it("records the refusal on the idle item so the next dispatch key is new", async () => {
    const waiting = {
      revision: 10,
      value: { ...assign(), status: "waiting", route: "repair", round: 3 },
      lease: null,
    };
    const { state, result, fire } = settle(
      { "core/issues/12": waiting },
      {
        claim: {
          proceed: false,
          code: "factory-stopped",
          reason: "Factory does not permit rounds: factory-stopped",
        },
      },
    );
    expect({
      outcome: (await result).outcome,
      revision: state.doc("core/issues/12")?.revision,
      marker: state.doc("core/issues/12")?.value.lastRefusal,
      fired: fire.mock.calls.length,
    }).toEqual({
      outcome: "not-claimed",
      revision: 11,
      marker: { run: "run-5", code: "factory-stopped", at: T1 },
      fired: 0,
    });
  });

  it("records a refused unclaimed run despite its clear native observation", async () => {
    const waiting = {
      revision: 10,
      value: { ...assign(), status: "waiting", route: "repair", round: 3 },
      lease: null,
    };
    const { state, result, fire } = settle(
      { "core/issues/12": waiting },
      {
        claim: {
          proceed: false,
          code: "factory-stopped",
          reason: "Factory stopped",
        },
        "claim-lease": { taken: false },
      },
      { nativeFaults: nativeFault("none") },
    );
    await expect(result).resolves.toMatchObject({
      outcome: "not-claimed",
      marked: true,
    });
    expect(state.doc("core/issues/12")!.value.lastRefusal).toEqual({
      run: "run-5",
      code: "factory-stopped",
      at: T1,
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("preserves an existing live claim when this record lacks claim evidence", async () => {
    const { state, result, fire } = settle(
      { "core/issues/12": activeItem("repair") },
      {},
    );
    await expect(result).resolves.toMatchObject({
      outcome: "not-claimed",
      reservations: "kept",
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      lease: { live: true },
      value: { run: { id: "run-5" } },
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("marks the item when the claim node failed without recording anything", async () => {
    const waiting = {
      revision: 10,
      value: { ...assign(), status: "waiting", route: "repair", round: 3 },
      lease: null,
    };
    const { state, result } = settle({ "core/issues/12": waiting }, {});
    await result;
    expect(state.doc("core/issues/12")?.value.lastRefusal).toEqual({
      run: "run-5",
      code: "claim-failed",
      at: T1,
    });
  });
});

describe("terminal rounds release the issue's reservations", () => {
  it("records a merge made outside the factory and releases the issue's areas", async () => {
    const { state, result } = settle(
      {
        "core/issues/12": activeItem(),
        "core/reservations": reservations({ migrations: 12, lockfile: 20 }),
      },
      {
        ...claimed,
        readiness: {
          verdict: "MERGED",
          reason: "PR #7 is merged",
          merged_by: "external",
        },
      },
    );
    expect({
      outcome: (await result).outcome,
      status: state.doc("core/issues/12")?.value.status,
      areas: state.doc("core/reservations")?.value.areas,
    }).toEqual({
      outcome: "MERGED",
      status: "MERGED",
      areas: { lockfile: 20 },
    });
  });

  it("keeps the areas when a refused finish leaves the holder active with a live lease", async () => {
    const { state, result } = settle(
      {
        "core/issues/12": activeItem(),
        "core/reservations": reservations({ migrations: 12 }),
      },
      {
        ...claimed,
        readiness: {
          verdict: "MERGED",
          reason: "PR #7 is merged",
          merged_by: "factory",
        },
      },
    );
    expect({
      outcome: (await result).outcome,
      status: state.doc("core/issues/12")?.value.status,
      areas: state.doc("core/reservations")?.value.areas,
    }).toEqual({
      outcome: "unrecorded",
      status: "active",
      areas: { migrations: 12 },
    });
  });

  it("preserves a same-owner reservation reacquired between the fresh holder read and cleanup CAS", async () => {
    const state = store({
      "core/issues/12": activeItem(),
      "core/reservations": reservations({ lockfile: 12, migrations: 20 }),
    });
    const originalPut = state.archon.put.getMockImplementation()!;
    let reacquired = false;
    state.archon.put.mockImplementation(async (name, value, options) => {
      if (name === "core/reservations" && !reacquired) {
        reacquired = true;
        const holder = state.doc("core/issues/12")!;
        Object.assign(holder, activeItem("repair", "PR_READY", "run-9"), {
          revision: holder.revision + 1,
        });
        state.doc("core/reservations")!.revision += 1;
      }
      return originalPut(name, value, options);
    });
    const fire = vi.fn();

    const result = await settleRound({
      archon: state.archon,
      issue: 12,
      runId: "run-5",
      assignment: ASSIGNMENT,
      ledger: {
        ...claimed,
        readiness: { verdict: "BLOCKED", reason: "Needs operator recovery" },
      },
      now: T1,
      fire,
    });

    expect(reacquired).toBe(true);
    expect(result).toMatchObject({ outcome: "BLOCKED", reservations: "none" });
    expect(state.doc("core/reservations")?.value.areas).toEqual({
      lockfile: 12,
      migrations: 20,
    });
    expect(state.doc("core/issues/12")).toMatchObject({
      value: { status: "active", run: { id: "run-9" } },
      lease: { runId: "run-9", live: true },
    });
    expect(fire).not.toHaveBeenCalled();
  });

  it("keeps the areas of an item another live run now owns", async () => {
    const { state, result } = settle(
      {
        "core/issues/12": activeItem("repair", "PR_READY", "run-9"),
        "core/reservations": reservations({ migrations: 12 }),
      },
      { ...claimed, readiness: { verdict: "PR_READY", reason: "Ready" } },
    );
    expect({
      outcome: (await result).outcome,
      areas: state.doc("core/reservations")?.value.areas,
    }).toEqual({ outcome: "unrecorded", areas: { migrations: 12 } });
  });

  it("keeps the areas of a round that continues", async () => {
    const { state, result } = settle(
      {
        "core/issues/12": activeItem(),
        "core/reservations": reservations({ migrations: 12 }),
      },
      { ...claimed, readiness: { verdict: "WAIT", reason: "Checks pending" } },
    );
    await result;
    expect(state.doc("core/reservations")?.value.areas).toEqual({
      migrations: 12,
    });
  });
});

describe("the successor round", () => {
  it("fires the successor keyed by the revision the finish write produced", async () => {
    const { fire, result } = settle(
      { "core/issues/12": activeItem() },
      { ...claimed, readiness: { verdict: "WAIT", reason: "Checks pending" } },
    );
    expect({
      outcome: (await result).outcome,
      next: (await result).next,
      fired: fire.mock.calls.map(([args]) => ({
        round: args.value.round,
        revision: args.revision,
      })),
    }).toEqual({
      outcome: "continue",
      next: "feedback (a12-0123456789ab:r6:v12 accepted)",
      fired: [{ round: 5, revision: 12 }],
    });
  });

  it.each([
    [
      "a parked round",
      {
        "after-scope": {
          define: false,
          build: false,
          parked: {
            code: "area-reserved",
            areas: ["migrations"],
            holders: { migrations: 20 },
          },
        },
      },
    ],
    ["a held round", { context: { ok: false, control: "hold" } }],
  ])("starts no successor for %s", async (_label, entries) => {
    const { fire, state, result } = settle(
      { "core/issues/12": activeItem("initial") },
      { ...claimed, ...entries },
    );
    await result;
    expect({
      fired: fire.mock.calls.length,
      status: state.doc("core/issues/12")?.value.status,
    }).toEqual({
      fired: 0,
      status: "waiting",
    });
  });

  it("starts no successor while the factory is stopped", async () => {
    const { fire, result } = settle(
      {
        "core/issues/12": activeItem(),
        "core/factory": {
          revision: 3,
          value: { ...RUNNING, mode: "stop" },
          lease: null,
        },
      },
      { ...claimed, readiness: { verdict: "WAIT", reason: "Checks pending" } },
    );
    await result;
    expect(fire).not.toHaveBeenCalled();
  });

  it("applies the configured round budgets", async () => {
    const { state, result } = settle(
      { "core/issues/12": activeItem("repair") },
      { ...claimed, publish: { published: true, pr: 7 } },
      { limits: { maxRounds: 8, maxFeedbackRounds: 0, noProgressRepeats: 2 } },
    );
    expect({
      outcome: (await result).outcome,
      blocker: state.doc("core/issues/12")?.value.blocker?.code,
    }).toEqual({ outcome: "BLOCKED", blocker: "feedback-limit" });
  });
});
