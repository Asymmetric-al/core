import { describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import {
  createAssignment,
  planClaim,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import {
  admissionCheck,
  admissionGates,
  announceBlocked,
  observeMerges,
  pruneFinished,
  recoverNativeFaults,
  releaseStaleReservations,
  scopeDigest,
  sweepItems,
} from "../../../scripts/archon-factory/pack/select/scripts/intake-logic.mjs";

// The selector's intake decisions: admission gates (lease-control#7, #8),
// admit's last checks before it writes an assignment (installer-ops#0 / I7,
// installer-ops#4) and the sweep that restarts or reconciles work items
// (I6, lease-control#3, I4).

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const POLICY = "c".repeat(64);
const RUNNING = { v: 1, intake: "open", mode: "run", mergeHold: false };
const SCOPE = {
  v: 1,
  issues: [12, 14],
  endState: "PR_READY",
  endStates: {},
  owner: "conrad",
  approvedBy: "ops",
  approvedAt: T0,
  note: null,
  priorities: {},
  requests: [],
};

function assign(issue = 12) {
  return createAssignment({
    issue,
    assignmentId: issue === 12 ? ASSIGNMENT : `a${issue}-0123456789ab`,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
    endState: "PR_READY",
    reason: "Only eligible issue",
    by: "selector:run-0",
    now: T0,
  });
}

describe("scopeDigest", () => {
  it("binds the issues, end states, owner and approval, not priorities or receipts", () => {
    const base = scopeDigest(SCOPE);
    expect({
      reordered: scopeDigest({ ...SCOPE, issues: [14, 12] }) === base,
      prioritized:
        scopeDigest({
          ...SCOPE,
          priorities: { 12: 90 },
          requests: [{ id: "x" }],
        }) === base,
      endState: scopeDigest({ ...SCOPE, endState: "MERGED" }) === base,
      issues: scopeDigest({ ...SCOPE, issues: [13] }) === base,
      form: /^[a-f0-9]{64}$/.test(base),
    }).toEqual({
      reordered: true,
      prioritized: true,
      endState: false,
      issues: false,
      form: true,
    });
  });
});

describe("admissionGates", () => {
  const gates = (overrides: Record<string, unknown> = {}) =>
    admissionGates({
      issue: 12,
      existing: null,
      foreignPr: null,
      capacity: 1,
      reservations: {},
      ...overrides,
    });

  it("clears an issue with no work item, no foreign PR and free capacity", () => {
    expect(gates()).toEqual({
      hold: "clear",
      owner: "clear",
      sharedArea: "clear",
      resources: "clear",
    });
  });

  it.each(["PR_READY", "BLOCKED", "stopped", "MERGED", "waiting"])(
    "treats an issue that already has a %s work item as owned",
    (status) => {
      expect(gates({ existing: { ...assign(), status } }).owner).toBe(
        "conflict",
      );
    },
  );

  it("holds an issue while intake is closed or the GitHub issue is not open", () => {
    expect(gates({ intakeOpen: false }).hold).toBe("conflict");
    expect(gates({ issueOpen: false }).hold).toBe("conflict");
  });

  it("reports what could not be read as unavailable, never as clear", () => {
    expect(gates({ ownersKnown: false }).owner).toBe("unavailable");
    expect(gates({ resourcesKnown: false })).toMatchObject({
      sharedArea: "unavailable",
      resources: "unavailable",
    });
  });

  it("uses the areas the observer found for the issue", () => {
    expect(
      gates({ areas: ["migrations"], reservations: { migrations: 30 } })
        .sharedArea,
    ).toBe("conflict");
  });

  it("treats an open pull request from outside the factory as another owner", () => {
    expect(
      gates({ foreignPr: { html_url: "https://example.invalid/pull/9" } })
        .owner,
    ).toBe("conflict");
  });

  it("reports full delivery capacity", () => {
    expect(gates({ capacity: 0 }).resources).toBe("conflict");
  });

  it("reports a recorded shared area another issue reserves, but not one this issue holds", () => {
    const existing = {
      ...assign(),
      status: "waiting",
      parked: { areas: ["migrations"], holders: { migrations: 20 }, at: T1 },
    };
    expect({
      other: gates({ existing, reservations: { migrations: 20 } }).sharedArea,
      own: gates({ existing, reservations: { migrations: 12 } }).sharedArea,
    }).toEqual({ other: "conflict", own: "clear" });
  });
});

describe("admissionCheck", () => {
  const check = (overrides: Record<string, unknown> = {}) =>
    admissionCheck({
      factory: RUNNING,
      scope: { revision: 7, value: SCOPE },
      recorded: { scopeRevision: scopeDigest(SCOPE), scopeDocumentRevision: 7 },
      issue: 12,
      existing: null,
      ...overrides,
    });

  it("admits a chosen issue the current scope still authorizes, with its current end state", () => {
    const scope = { ...SCOPE, endStates: { 12: "MERGED" } };
    expect(
      check({
        scope: { revision: 7, value: scope },
        recorded: {
          scopeRevision: scopeDigest(scope),
          scopeDocumentRevision: 7,
        },
      }),
    ).toEqual({ ok: true, endState: "MERGED" });
  });

  it.each([
    ["stopped", { ...RUNNING, mode: "stop", intake: "paused" }, "factory-stop"],
    [
      "draining",
      { ...RUNNING, mode: "drain", intake: "paused" },
      "factory-drain",
    ],
    ["closed to intake", { ...RUNNING, intake: "paused" }, "intake-paused"],
  ])("refuses while the factory is %s", (_label, factory, code) => {
    expect(check({ factory })).toMatchObject({ ok: false, code });
  });

  it("refuses when the scope was replaced while Samson ranked", () => {
    const replaced = {
      ...SCOPE,
      issues: [13],
      endState: "MERGED",
      approvedAt: T1,
    };
    expect(check({ scope: { revision: 8, value: replaced } })).toMatchObject({
      ok: false,
      code: "scope-changed",
    });
  });

  it("refuses when the scope document changed revision since facts read it", () => {
    expect(check({ scope: { revision: 8, value: SCOPE } })).toMatchObject({
      ok: false,
      code: "scope-changed",
    });
  });

  it("refuses an issue the scope no longer lists", () => {
    const scope = { ...SCOPE, issues: [14] };
    expect(
      check({
        scope: { revision: 7, value: scope },
        recorded: {
          scopeRevision: scopeDigest(scope),
          scopeDocumentRevision: 7,
        },
      }),
    ).toMatchObject({ ok: false, code: "not-in-scope" });
  });

  it.each([
    ["live", "waiting", "live-assignment"],
    ["finished", "PR_READY", "finished-assignment"],
  ])("refuses an issue with a %s work item", (_label, status, code) => {
    expect(check({ existing: { ...assign(), status } })).toMatchObject({
      ok: false,
      code,
    });
  });
});

type Doc = {
  revision: number;
  value: any;
  lease: { runId: string; live: boolean } | null;
};

function store(seed: Record<string, Doc>) {
  const docs = new Map(Object.entries(structuredClone(seed)));
  return {
    doc: (name: string) => docs.get(name),
    archon: {
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
          options: { ifRevision: number },
        ) => {
          const doc = docs.get(name) ?? {
            revision: 0,
            value: null,
            lease: null,
          };
          if (doc.revision !== options.ifRevision)
            throw new StateConflict("conflict", null);
          docs.set(name, {
            revision: doc.revision + 1,
            value: structuredClone(value),
            lease: doc.lease,
          });
          return { name, revision: doc.revision + 1, value };
        },
      ),
      runStatus: vi.fn(async (runId: string) => ({
        id: runId,
        status: "cancelled",
      })),
    },
  };
}

function abandoned(): Doc {
  const waiting = { ...assign(), status: "waiting", route: "repair", round: 2 };
  const plan = planClaim(
    { name: "core/issues/12", revision: 6, value: waiting, lease: null } as any,
    {
      runId: "run-3",
      assignmentId: ASSIGNMENT,
      policyRevision: POLICY,
      now: T1,
    },
  );
  return {
    revision: 7,
    value: plan.value,
    lease: { runId: "run-3", live: false },
  };
}

async function sweep(
  seed: Record<string, Doc>,
  { factory = RUNNING, reservations = {} } = {},
  setup?: (state: ReturnType<typeof store>) => void,
) {
  const state = store(seed);
  setup?.(state);
  const fire = vi.fn(
    async ({ value, revision }: { value: any; revision: number }) => ({
      ok: true,
      deliveryId: `${value.assignment.id}:r${value.round + 1}:v${revision}`,
    }),
  );
  const results = await sweepItems({
    archon: state.archon,
    names: Object.keys(seed).filter((name) => name.startsWith("core/issues/")),
    factory,
    reservations,
    now: T1,
    limits: { maxRounds: 8, maxFeedbackRounds: 12, noProgressRepeats: 2 },
    fire,
  });
  return { state, fire, results };
}

describe("sweepItems", () => {
  it("restarts an idle item under its revision key", async () => {
    const { results } = await sweep({
      "core/issues/12": {
        revision: 10,
        value: { ...assign(), status: "waiting", route: "repair", round: 3 },
        lease: null,
      },
    });
    expect(results).toEqual([
      {
        issue: 12,
        action: "fire",
        ok: true,
        deliveryId: "a12-0123456789ab:r4:v10",
      },
    ]);
  });

  it("reconciles an item whose run the engine reports ended, then restarts it under the new revision", async () => {
    const { results, state } = await sweep({ "core/issues/12": abandoned() });
    expect({
      results,
      status: state.doc("core/issues/12")?.value.status,
      asked: state.archon.runStatus.mock.calls,
    }).toEqual({
      results: [
        {
          issue: 12,
          action: "reconcile",
          outcome: "reconciled",
          ok: true,
          deliveryId: "a12-0123456789ab:r4:v8",
        },
      ],
      status: "waiting",
      asked: [["run-3"]],
    });
  });

  it("reconciles but does not restart while the factory is stopped", async () => {
    const { results, fire } = await sweep(
      { "core/issues/12": abandoned() },
      { factory: { ...RUNNING, mode: "stop" } },
    );
    expect({ results, fired: fire.mock.calls.length }).toEqual({
      results: [{ issue: 12, action: "reconcile", outcome: "reconciled" }],
      fired: 0,
    });
  });

  it("leaves an item alone while the engine reports its run still running", async () => {
    const { results, state } = await sweep(
      { "core/issues/12": abandoned() },
      {},
      (s) => {
        s.archon.runStatus.mockImplementation(async (runId: string) => ({
          id: runId,
          status: "running",
        }));
      },
    );
    expect({
      results,
      status: state.doc("core/issues/12")?.value.status,
    }).toEqual({
      results: [{ issue: 12, action: "reconcile", code: "run-not-terminal" }],
      status: "active",
    });
  });

  it("releases the reservations of an item the no-progress rule blocks while reconciling", async () => {
    const stuck = abandoned();
    stuck.value.repeats = { "unfinished-run": 2 };
    const { state } = await sweep({
      "core/issues/12": stuck,
      "core/reservations": {
        revision: 3,
        value: { v: 1, areas: { migrations: 12 } },
        lease: null,
      },
    });
    expect({
      status: state.doc("core/issues/12")?.value.status,
      areas: state.doc("core/reservations")?.value.areas,
    }).toEqual({ status: "BLOCKED", areas: {} });
  });

  it("keeps a parked item parked while another issue holds its area, and starts it once released", async () => {
    const parked = {
      revision: 9,
      value: {
        ...assign(),
        status: "waiting",
        route: "initial",
        round: 1,
        parked: { areas: ["migrations"], holders: { migrations: 20 }, at: T1 },
      },
      lease: null,
    };
    const held = await sweep(
      { "core/issues/12": parked },
      { reservations: { migrations: 20 } },
    );
    const free = await sweep(
      { "core/issues/12": parked },
      { reservations: {} },
    );
    expect({ held: held.results, free: free.results }).toEqual({
      held: [{ issue: 12, action: "skip", reason: "parked" }],
      free: [
        {
          issue: 12,
          action: "fire",
          ok: true,
          deliveryId: "a12-0123456789ab:r2:v9",
        },
      ],
    });
  });
});

describe("releaseStaleReservations", () => {
  it("releases areas whose holder has no live work item, keeping live holders' areas", async () => {
    const state = store({
      "core/issues/12": {
        revision: 2,
        value: { ...assign(12), status: "waiting" },
        lease: null,
      },
      "core/issues/20": {
        revision: 2,
        value: { ...assign(20), status: "PR_READY" },
        lease: null,
      },
      "core/issues/31": {
        revision: 2,
        value: { ...assign(31), status: "active" },
        lease: null,
      },
      "core/reservations": {
        revision: 5,
        value: {
          v: 1,
          areas: { migrations: 12, lockfile: 20, "shared-ui": 31, ci: 40 },
        },
        lease: null,
      },
    });
    const released = await releaseStaleReservations({
      archon: state.archon,
      items: new Map<number, any>([
        [12, { ...assign(12), status: "waiting" }],
        [20, { ...assign(20), status: "PR_READY" }],
        [31, { ...assign(31), status: "active" }],
      ]),
    });
    expect({
      released,
      areas: state.doc("core/reservations")?.value.areas,
    }).toEqual({
      released: ["ci", "lockfile"],
      areas: { migrations: 12, "shared-ui": 31 },
    });
  });

  it("writes nothing when every holder is live", async () => {
    const state = store({
      "core/issues/12": {
        revision: 2,
        value: { ...assign(12), status: "active" },
        lease: null,
      },
      "core/reservations": {
        revision: 5,
        value: { v: 1, areas: { migrations: 12 } },
        lease: null,
      },
    });
    await releaseStaleReservations({
      archon: state.archon,
      items: new Map([[12, { ...assign(12), status: "active" }]]),
    });
    expect(state.archon.put).not.toHaveBeenCalled();
  });
});

describe("observeMerges", () => {
  const MERGE = "d".repeat(40);
  const ready = (issue = 12) => ({
    ...assign(issue),
    status: "PR_READY",
    route: null,
    round: 4,
    head: "e".repeat(40),
    pr: {
      number: 700 + issue,
      url: `https://example.invalid/pull/${700 + issue}`,
    },
    updatedAt: T0,
  });
  const merged = (number: number, extra: Record<string, unknown> = {}) => ({
    number,
    merged: true,
    merged_at: "2026-11-11T09:30:00Z",
    merge_commit_sha: MERGE,
    merged_by: { login: "an-owner" },
    base: { ref: "develop" },
    ...extra,
  });
  const observe = async (
    seed: Record<string, Doc>,
    pulls: Record<number, unknown>,
    nowMs = Date.parse(T1),
  ) => {
    const state = store(seed);
    const github = {
      pull: vi.fn(async (number: number) => {
        if (!(number in pulls)) throw new Error("github");
        return pulls[number];
      }),
    };
    const results = await observeMerges({
      archon: state.archon,
      github,
      items: new Map(
        Object.entries(seed).map(([name, doc]) => [
          Number(name.split("/").pop()),
          doc.value,
        ]),
      ),
      targetBranch: "develop",
      by: "select-run-1",
      now: T1,
      nowMs,
    });
    return { results, state, github };
  };

  it("records a ready pull request that someone else merged", async () => {
    const { results, state } = await observe(
      { "core/issues/12": { revision: 9, value: ready(), lease: null } },
      { 712: merged(712) },
    );
    const value = state.doc("core/issues/12")?.value;
    expect({
      results,
      status: value.status,
      route: value.route,
      pr: value.pr,
      last: value.history.at(-1),
    }).toEqual({
      results: [{ issue: 12, action: "merged", pr: 712 }],
      status: "MERGED",
      route: null,
      pr: {
        number: 712,
        url: "https://example.invalid/pull/712",
        mergedAt: "2026-11-11T09:30:00Z",
        mergeCommit: MERGE,
        mergedBy: "external",
      },
      last: {
        round: 4,
        run: "select-run-1",
        route: null,
        outcome: "MERGED",
        next: null,
        at: T1,
        external: true,
        summary:
          "Merged outside the factory by an-owner at 2026-11-11T09:30:00Z; seen by the intake pass.",
      },
    });
  });

  it("leaves an open or closed-unmerged pull request ready, and asks only about ready issues", async () => {
    const { results, state, github } = await observe(
      {
        "core/issues/12": { revision: 9, value: ready(), lease: null },
        "core/issues/14": {
          revision: 3,
          value: { ...ready(14), status: "BLOCKED" },
          lease: null,
        },
      },
      { 712: { number: 712, merged: false, state: "closed" } },
    );
    expect({
      results,
      status: state.doc("core/issues/12")?.value.status,
      asked: github.pull.mock.calls,
    }).toEqual({ results: [], status: "PR_READY", asked: [[712]] });
  });

  it("does not record a merge into another branch, or a held issue's", async () => {
    const { results, state } = await observe(
      {
        "core/issues/12": { revision: 9, value: ready(), lease: null },
        "core/issues/14": {
          revision: 3,
          value: {
            ...ready(14),
            nativeFaults: { schema: "core-native-faults/v1" },
          },
          lease: null,
        },
      },
      {
        712: merged(712, { base: { ref: "release" } }),
        714: merged(714),
      },
    );
    expect({
      results,
      statuses: [12, 14].map(
        (issue) => state.doc(`core/issues/${issue}`)?.value.status,
      ),
    }).toEqual({
      results: [
        { issue: 12, action: "merged", code: "not-merged" },
        { issue: 14, action: "merged", code: "native-fault-held" },
      ],
      statuses: ["PR_READY", "PR_READY"],
    });
  });

  it("stops asking about a pull request that has been ready for a month, and survives GitHub failing", async () => {
    const { results, github } = await observe(
      {
        "core/issues/12": { revision: 9, value: ready(), lease: null },
        "core/issues/14": {
          revision: 3,
          value: { ...ready(14), updatedAt: "2026-09-01T00:00:00.000Z" },
          lease: null,
        },
      },
      {},
    );
    expect({ results, asked: github.pull.mock.calls }).toEqual({
      results: [],
      asked: [[712]],
    });
  });
});

describe("recoverNativeFaults", () => {
  const NOW_MS = Date.parse(T1);
  const held = (issue: number, fault: Record<string, unknown> = {}) => ({
    ...assign(issue),
    status: "active",
    run: { id: `run-${issue}`, route: "repair" },
    nativeFaults: {
      schema: "core-native-faults/v1",
      runId: `run-${issue}`,
      action: "native-recovery",
      reason: "native-transient",
      faults: [],
      ...fault,
    },
  });
  const pass = async (
    items: [number, Record<string, unknown>][],
    answer: (issue: number) => unknown = () => ({ ok: true }),
  ) => {
    const recover = vi.fn(async (issue: number, _runId: string) =>
      answer(issue),
    );
    const results = await recoverNativeFaults({
      items: new Map(items),
      recover,
      nowMs: NOW_MS,
    });
    return { results, asked: recover.mock.calls };
  };

  it("recovers a round the engine classified as recoverable, with the command an operator would use", async () => {
    expect(await pass([[12, held(12)]])).toEqual({
      results: [{ issue: 12, action: "recover-native", ok: true }],
      asked: [[12, "run-12"]],
    });
  });

  it("leaves every other native hold for a person", async () => {
    const { results, asked } = await pass([
      [12, held(12, { action: "owner-action", reason: "provider-auth" })],
      [13, held(13, { action: "reconcile" })],
      [14, held(14, { action: "configuration-action" })],
      [15, held(15, { runId: "another-run" })],
      [16, { ...assign(16), status: "waiting" }],
    ]);
    expect({ results, asked }).toEqual({ results: [], asked: [] });
  });

  it("waits for a quota reset the provider reported", async () => {
    const later = new Date(NOW_MS + 60_000).toISOString();
    const earlier = new Date(NOW_MS - 10 * 60_000).toISOString();
    const { results, asked } = await pass([
      [12, held(12, { faults: [{ resetAt: later }] })],
      [14, held(14, { faults: [{ resetAt: earlier }, { resetAt: null }] })],
    ]);
    expect({ results, asked }).toEqual({
      results: [
        {
          issue: 12,
          action: "recover-native",
          ok: false,
          code: "reset-pending",
        },
        { issue: 14, action: "recover-native", ok: true },
      ],
      asked: [[14, "run-14"]],
    });
  });

  // The engine wakes a run it paused for a usage limit within seconds of the
  // reset. The command would end a run that is still paused, so a pass that
  // lands in those seconds must not get there first.
  it("gives the engine two minutes after the reset to wake the paused run itself", async () => {
    const at = (secondsAgo: number) =>
      new Date(NOW_MS - secondsAgo * 1000).toISOString();
    const { results, asked } = await pass([
      [12, held(12, { faults: [{ resetAt: at(1) }] })],
      [13, held(13, { faults: [{ resetAt: at(119) }] })],
      [14, held(14, { faults: [{ resetAt: at(120) }] })],
    ]);
    expect({ results, asked }).toEqual({
      results: [
        {
          issue: 12,
          action: "recover-native",
          ok: false,
          code: "reset-pending",
        },
        {
          issue: 13,
          action: "recover-native",
          ok: false,
          code: "reset-pending",
        },
        { issue: 14, action: "recover-native", ok: true },
      ],
      asked: [[14, "run-14"]],
    });
  });

  it("reports a refusal or a failure and carries on", async () => {
    const { results } = await pass(
      [
        [12, held(12)],
        [14, held(14)],
        [15, held(15)],
      ],
      (issue) => {
        if (issue === 12) return { ok: false, code: "run-not-ended" };
        if (issue === 14) throw new Error("engine offline");
        return { ok: true };
      },
    );
    expect(results).toEqual([
      { issue: 12, action: "recover-native", ok: false, code: "run-not-ended" },
      { issue: 14, action: "recover-native", ok: false, code: "error" },
      { issue: 15, action: "recover-native", ok: true },
    ]);
  });
});

describe("pruneFinished", () => {
  const paths = { issues: "/srv/f/issues" };
  const prune = (items: [number, Record<string, unknown>][], has = true) => {
    const calls: string[] = [];
    const results = pruneFinished({
      items: new Map(items),
      paths,
      exists: (file: string) => {
        calls.push(`exists ${file}`);
        return has;
      },
      removeFile: (file: string) => calls.push(`rm ${file}`),
      removeTrees: (repo: string) => {
        calls.push(`trees ${repo}`);
        return ["node_modules", "apps/admin/node_modules"];
      },
    });
    return { results, calls };
  };

  it("removes the dependency trees of a merged issue, install marker first", () => {
    expect(prune([[12, { ...assign(), status: "MERGED" }]])).toEqual({
      results: [{ issue: 12, action: "prune", removed: 2 }],
      calls: [
        "exists /srv/f/issues/12/repo/node_modules",
        "rm /srv/f/issues/12/install.json",
        "trees /srv/f/issues/12/repo",
      ],
    });
  });

  it("touches nothing for an issue that is not merged, is held, or is already pruned", () => {
    const held = {
      ...assign(14),
      status: "MERGED",
      nativeFaults: { schema: "core-native-faults/v1" },
    };
    expect([
      prune([
        [12, { ...assign(), status: "PR_READY" }],
        [13, { ...assign(13), status: "BLOCKED" }],
        [14, held],
      ]).calls,
      prune([[12, { ...assign(), status: "MERGED" }]], false).results,
    ]).toEqual([[], []]);
  });

  it("reports a removal that failed and carries on", () => {
    const results = pruneFinished({
      items: new Map([
        [12, { ...assign(), status: "MERGED" }],
        [14, { ...assign(14), status: "MERGED" }],
      ]),
      paths,
      exists: () => true,
      removeFile: () => {},
      removeTrees: (repo: string) => {
        if (repo.includes("/12/")) throw new Error("EBUSY");
        return ["node_modules"];
      },
    });
    expect(results).toEqual([
      { issue: 12, action: "prune", error: "EBUSY" },
      { issue: 14, action: "prune", removed: 1 },
    ]);
  });
});

describe("announceBlocked", () => {
  const NOW = Date.parse("2026-11-12T17:00:00Z");
  const blocked = (overrides: Record<string, unknown> = {}) => ({
    issue: 12,
    status: "BLOCKED",
    round: 3,
    blocker: {
      code: "final-inconclusive",
      detail:
        "Checks under /srv/core-factory/views/abc/ezra failed; ask @alice",
      recovery: null,
      at: "2026-11-12T16:31:52.153Z",
    },
    ...overrides,
  });
  const client = (existing: { body: string }[] = []) => ({
    issueComments: vi.fn(async () => existing),
    comment: vi.fn(async () => ({})),
  });

  it("tells the owner once, on the issue, why the factory stopped and what to do", async () => {
    const github = client();
    const result = await announceBlocked({
      github,
      items: new Map([[12, blocked()]]),
      nowMs: NOW,
    });
    expect(result).toEqual([{ issue: 12, announced: true }]);
    const [issue, body] = github.comment.mock.calls[0] as unknown as [
      number,
      string,
    ];
    expect(issue).toBe(12);
    expect(body).toContain("final-inconclusive");
    expect(body).toContain("round 3");
    expect(body).toContain("issue 12 retry");
    expect(body).toContain("<!-- core-factory -->");
    expect(body).toContain(
      "<!-- core-factory:blocked 2026-11-12T16:31:52.153Z -->",
    );
    // No private path and no live mention leaves the factory.
    expect(body).not.toContain("/srv/core-factory");
    expect(body).not.toMatch(/(^|[^`])@alice/);
  });

  it("uses the recovery the blocker itself names", async () => {
    const github = client();
    await announceBlocked({
      github,
      items: new Map([
        [
          12,
          blocked({
            blocker: {
              code: "base-conflict",
              detail: "docs/a.md",
              recovery: "Merge develop into the branch, then retry",
              at: "2026-11-12T16:31:52.153Z",
            },
          }),
        ],
      ]),
      nowMs: NOW,
    });
    expect(String(github.comment.mock.calls[0]?.[1])).toContain(
      "Merge develop into the branch, then retry",
    );
  });

  it("does not repeat itself for the same blocker", async () => {
    const github = client([
      {
        body: "x <!-- core-factory:blocked 2026-11-12T16:31:52.153Z -->",
      },
    ]);
    const result = await announceBlocked({
      github,
      items: new Map([[12, blocked()]]),
      nowMs: NOW,
    });
    expect(github.comment).not.toHaveBeenCalled();
    expect(result).toEqual([
      { issue: 12, announced: false, reason: "already" },
    ]);
  });

  it("says nothing about issues that are not blocked or blocked long ago", async () => {
    const github = client();
    const result = await announceBlocked({
      github,
      items: new Map<number, unknown>([
        [12, blocked({ status: "PR_READY" })],
        [
          13,
          blocked({
            issue: 13,
            blocker: { code: "x", at: "2026-11-01T00:00:00Z" },
          }),
        ],
        [14, null],
      ]),
      nowMs: NOW,
    });
    expect(result).toEqual([]);
    expect(github.issueComments).not.toHaveBeenCalled();
  });

  // The timer or GitHub can be away for more than a day; the owner is still
  // told when it is back.
  it("still announces a blocker that is several days old", async () => {
    const github = client();
    const result = await announceBlocked({
      github,
      items: new Map([
        [12, blocked({ blocker: { code: "x", at: "2026-11-08T00:00:00Z" } })],
      ]),
      nowMs: NOW,
    });
    expect(result).toEqual([{ issue: 12, announced: true }]);
  });

  it("never fails the pass when GitHub does", async () => {
    const github = {
      issueComments: vi.fn(async () => {
        throw new Error("rate limited");
      }),
      comment: vi.fn(),
    };
    expect(
      await announceBlocked({
        github,
        items: new Map([[12, blocked()]]),
        nowMs: NOW,
      }),
    ).toEqual([{ issue: 12, announced: false, reason: "github" }]);
  });
});
