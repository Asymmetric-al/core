import { describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { settleRound } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import {
  createAssignment,
  planClaim,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// Hand-offs other stages make to record, proven end to end through
// settleRound's finish write (planFinish) rather than by reading:
// - boundary #6: freeze checkpoints the candidate and writes ledger.freeze
//   {review: true, prepared: false, candidate}; a later failure re-runs only
//   the reviews (I1). Freeze and pre-push repairs use the I2 shape, and the
//   new freeze BLOCKED codes flow through the generic blocker.
// - readiness #3: readiness BLOCKED codes flow through the generic blocker
//   (code, detail and recovery clipped), and a REPAIR with reviewOnly from
//   source "readiness" sends the next round to the review route (I1/I2).

type Doc = {
  revision: number;
  value: any;
  lease: { runId: string; live: boolean } | null;
};

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const POLICY = "c".repeat(64);
const HEAD = "1".repeat(40);
const CANDIDATE = "2".repeat(40);

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

// #12 waiting on `route` with head HEAD, claimed by run-5 at revision 11. A
// checkpoint during the round may have moved the head (`head`).
function activeItem(route: string, head = HEAD): Doc {
  const assignment = createAssignment({
    issue: 12,
    assignmentId: ASSIGNMENT,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
    endState: "PR_READY",
    reason: "Only eligible issue",
    by: "selector:run-0",
    now: T0,
  });
  const waiting = {
    ...assignment,
    status: "waiting",
    route,
    round: 4,
    head: HEAD,
    base: "0".repeat(40),
  };
  const plan = planClaim(
    {
      name: "core/issues/12",
      revision: 10,
      value: waiting,
      lease: null,
    } as any,
    {
      runId: "run-5",
      assignmentId: ASSIGNMENT,
      policyRevision: POLICY,
      now: T1,
    },
  );
  return {
    revision: 11,
    value: { ...plan.value, head },
    lease: { runId: "run-5", live: true },
  };
}

const claimed = {
  claim: { proceed: true },
  "claim-lease": { taken: true },
  context: { ok: true },
};

async function settle(
  item: Doc,
  ledger: Record<string, unknown>,
  nodes: unknown[] = [],
) {
  const state = store({
    "core/factory": {
      revision: 3,
      value: { v: 1, intake: "open", mode: "run", mergeHold: false },
      lease: null,
    },
    "core/reservations": {
      revision: 4,
      value: { v: 1, areas: { billing: 12 } },
      lease: null,
    },
    "core/issues/12": item,
  });
  const fire = vi.fn(
    async ({ value, revision }: { value: any; revision: number }) => ({
      ok: true,
      outcome: "accepted",
      deliveryId: `${value.assignment.id}:r${value.round + 1}:v${revision}`,
    }),
  );
  const result = await settleRound({
    archon: state.archon,
    issue: 12,
    runId: "run-5",
    assignment: ASSIGNMENT,
    ledger,
    nodes,
    now: T1,
    limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
    fire,
  });
  const value = state.doc("core/issues/12")?.value;
  return {
    result,
    value,
    fired: fire.mock.calls.map(([call]) => ({
      route: call.value.route,
      revision: call.revision,
    })),
    reservations: state.doc("core/reservations")?.value.areas,
  };
}

const failed = (node_id: string, error: string) => ({
  node_id,
  state: "failed",
  error,
});

describe("freeze hand-offs (boundary #6)", () => {
  it.each([
    [
      "the freeze node itself, after the checkpoint",
      "freeze",
      {
        review: true,
        prepared: false,
        route: "repair",
        candidate: CANDIDATE,
        previousHead: HEAD,
      },
    ],
    [
      "a first-pass review after the views were prepared",
      "micaiah",
      {
        review: true,
        prepared: true,
        route: "repair",
        candidate: CANDIDATE,
        previousHead: HEAD,
      },
    ],
  ])("re-runs only the reviews when %s fails", async (_label, node, freeze) => {
    const settled = await settle(
      activeItem("repair", CANDIDATE),
      {
        ...claimed,
        "after-define": { build: true, acceptance: "rev-1" },
        freeze,
      },
      [failed(node, `${node} crashed`)],
    );
    expect({
      outcome: settled.result.outcome,
      status: settled.value.status,
      route: settled.value.route,
      head: settled.value.head,
      last: settled.value.history.at(-1),
      fired: settled.fired,
    }).toEqual({
      outcome: "continue",
      status: "waiting",
      route: "review",
      head: CANDIDATE,
      last: expect.objectContaining({
        route: "repair",
        outcome: "continue",
        next: "review",
        summary: `Node ${node} failed: ${node} crashed`,
      }),
      fired: [{ route: "review", revision: 12 }],
    });
  });

  it.each([
    [
      "freeze",
      {
        review: false,
        reason: "Normal commit hooks failed",
        repair: {
          acceptance: [],
          implementation: ["lint failed"],
          source: "freeze",
        },
        fingerprint: "hooks",
      },
    ],
    [
      "publish",
      {
        published: false,
        repair: {
          acceptance: [],
          implementation: ["ci:preflight failed"],
          source: "pre-push",
        },
        fingerprint: "pre-push",
      },
    ],
  ])(
    "hands an I2 %s repair to Bezalel with its source",
    async (stage, entry) => {
      const settled = await settle(activeItem("repair"), {
        ...claimed,
        [stage]: entry,
      });
      expect({
        route: settled.value.route,
        repair: settled.value.brief?.repair,
        fired: settled.fired,
      }).toEqual({
        route: "repair",
        repair: entry.repair,
        fired: [{ route: "repair", revision: 12 }],
      });
    },
  );

  it.each([
    "unexpected-commit",
    "acceptance-tampered",
    "candidate-integrity",
    "hooks-unverified",
    "hooks-unpinned",
    "review-precondition",
  ])(
    "blocks on freeze's %s through the generic blocker and releases the issue's areas",
    async (code) => {
      const settled = await settle(activeItem("review"), {
        ...claimed,
        freeze: {
          review: false,
          reason: "Freeze refused",
          blocked: { code, detail: "d".repeat(1500) },
        },
      });
      expect({
        outcome: settled.result.outcome,
        status: settled.value.status,
        route: settled.value.route,
        blocker: settled.value.blocker,
        fired: settled.fired,
        reservations: settled.reservations,
      }).toEqual({
        outcome: "BLOCKED",
        status: "BLOCKED",
        route: null,
        blocker: {
          code,
          detail: "d".repeat(1200),
          recovery: null,
          route: "review",
          at: T1,
        },
        fired: [],
        reservations: {},
      });
    },
  );
});

describe("readiness hand-offs (readiness #3)", () => {
  it.each([
    "feedback-dispute",
    "base-conflict",
    "base-merge-failed",
    "merged-elsewhere",
    "review-providers-config",
  ])(
    "blocks on readiness's %s with its detail and recovery clipped",
    async (code) => {
      const settled = await settle(activeItem("feedback"), {
        ...claimed,
        readiness: {
          verdict: "BLOCKED",
          reason: `Readiness stopped: ${code}`,
          blocked: {
            code,
            detail: "d".repeat(3000),
            recovery: "r".repeat(1000),
          },
        },
      });
      expect({
        status: settled.value.status,
        blocker: settled.value.blocker,
        last: settled.value.history.at(-1)?.outcome,
      }).toEqual({
        status: "BLOCKED",
        blocker: {
          code,
          detail: "d".repeat(1200),
          recovery: "r".repeat(600),
          route: "feedback",
          at: T1,
        },
        last: "BLOCKED",
      });
    },
  );

  it("sends a readiness REPAIR with reviewOnly to the review route with nothing for the writers", async () => {
    const repair = {
      acceptance: [],
      implementation: [],
      reviewOnly: true,
      source: "readiness",
    };
    const settled = await settle(activeItem("feedback"), {
      ...claimed,
      readiness: {
        verdict: "REPAIR",
        reason: "Base integration changed the candidate's own diff",
        repair,
        fingerprint: "integrate-review",
      },
    });
    expect({
      outcome: settled.result.outcome,
      status: settled.value.status,
      route: settled.value.route,
      repair: settled.value.brief?.repair,
      repeats: settled.value.repeats,
      fired: settled.fired,
    }).toEqual({
      outcome: "continue",
      status: "waiting",
      route: "review",
      repair,
      repeats: { "integrate-review": 1 },
      fired: [{ route: "review", revision: 12 }],
    });
  });
});
