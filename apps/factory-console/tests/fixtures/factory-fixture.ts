// TEST-ONLY synthetic factory. An in-memory Archon state store and a fake
// control runner injected at the Console's StateReader / ControlRunner seams.
// The fake mirrors the documented control.mjs contract (one JSON result with
// `ok`, request-id idempotency, refusal codes); it is not the pack and makes
// no claim about the real VM.
import {
  StateUnavailable,
  type StateDocument,
  type StateReader,
} from "../../src/server/state";

import type { ControlRun, ControlRunner } from "../../src/server/control";

type Stored = {
  revision: number;
  value: unknown;
  lease: { runId: string; live: boolean } | null;
};

export const RUN = {
  repair: "a1a1a1a1-0000-4000-8000-000000000101",
  review: "b2b2b2b2-0000-4000-8000-000000000102",
  history101: "c3c3c3c3-0000-4000-8000-000000000101",
  published103: "d4d4d4d4-0000-4000-8000-000000000103",
  blocked104: "e5e5e5e5-0000-4000-8000-000000000104",
  merged105: "f6f6f6f6-0000-4000-8000-000000000105",
  select: "abababab-0000-4000-8000-00000000000a",
  analysis: "cdcdcdcd-0000-4000-8000-00000000000c",
} as const;

export class FixtureState implements StateReader {
  docs = new Map<string, Stored>();
  reads: string[] = [];
  failure: string | null = null;

  constructor(seed: Record<string, unknown> = {}) {
    for (const [name, value] of Object.entries(seed)) this.set(name, value);
  }

  set(name: string, value: unknown, lease: Stored["lease"] = null) {
    const previous = this.docs.get(name);
    this.docs.set(name, {
      revision: (previous?.revision ?? 0) + 1,
      value: structuredClone(value),
      lease: lease ?? previous?.lease ?? null,
    });
  }

  value<T = Record<string, unknown>>(name: string) {
    return (this.docs.get(name)?.value ?? null) as T | null;
  }

  async get(name: string): Promise<StateDocument> {
    this.reads.push(`get ${name}`);
    if (this.failure) throw new StateUnavailable(this.failure);
    const stored = this.docs.get(name);
    return {
      name,
      revision: stored?.revision ?? 0,
      value: stored ? structuredClone(stored.value) : null,
      lease: stored?.lease ?? null,
    };
  }

  async list(prefix: string): Promise<StateDocument[]> {
    this.reads.push(`list ${prefix}`);
    if (this.failure) throw new StateUnavailable(this.failure);
    return [...this.docs.entries()]
      .filter(([name]) => name.startsWith(prefix))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, stored]) => ({
        name,
        revision: stored.revision,
        value: structuredClone(stored.value),
        lease: stored.lease,
      }));
  }
}

export type FireHook = (
  workflow: "answer" | "analyze",
  inputs: Record<string, string>,
  deliveryId: string,
) => {
  ok: boolean;
  outcome: string;
  status: number | null;
  receipt: string | null;
};

export type CancelHook = (runId: string) => {
  status: number;
  observed: string | null;
  detail: string;
};

const requestPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;

class Refusal extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function parseArgs(argv: readonly string[]) {
  const positional: string[] = [];
  const flags: Record<string, string | undefined> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value.startsWith("--")) {
      flags[value.slice(2)] = argv[index + 1];
      index += 1;
    } else positional.push(value);
  }
  return { positional, flags };
}

type Rec = Record<string, unknown> & { requests?: { id: string }[] };

/** executor.mjs removeLabeledContainers plus control.mjs's `removed`. */
export type ContainerHook = (runId: string) => {
  ok?: boolean;
  found?: string[];
  removed: string[];
  remaining: string[] | null;
  error?: string;
};

export class FixtureControl implements ControlRunner {
  calls: string[][] = [];
  mode: "normal" | "timeout" | "crash" | "killed" | "garbage" = "normal";
  /** What cancel-run finds of the run's labelled executor containers. */
  containers: ContainerHook | undefined;
  private deliveries = new Map<string, string>();
  private removedContainers = new Set<string>();

  constructor(
    private state: FixtureState,
    private hooks: {
      fire?: FireHook;
      cancel?: CancelHook;
      now?: () => string;
    } = {},
  ) {}

  async run(args: readonly string[]): Promise<ControlRun> {
    this.calls.push([...args]);
    if (this.mode === "timeout")
      return { exit: null, json: null, timedOut: true, overflow: false };
    // crash: the executable never started; killed: it started, then died by a signal.
    if (this.mode === "crash")
      return {
        exit: null,
        started: false,
        json: null,
        timedOut: false,
        overflow: false,
      };
    if (this.mode === "killed")
      return {
        exit: null,
        started: true,
        json: null,
        timedOut: false,
        overflow: false,
      };
    if (this.mode === "garbage")
      return { exit: 1, json: null, timedOut: false, overflow: false };
    try {
      const json = this.execute(args);
      return { exit: json.ok ? 0 : 2, json, timedOut: false, overflow: false };
    } catch (error) {
      const code = error instanceof Refusal ? error.code : "error";
      return {
        exit: 1,
        json: { ok: false, code, message: String((error as Error).message) },
        timedOut: false,
        overflow: false,
      };
    }
  }

  private now() {
    return this.hooks.now?.() ?? new Date().toISOString();
  }

  private write(
    name: string,
    plan: (value: Rec | null) => Rec | { noop: true; value: Rec },
  ) {
    const current = this.state.value<Rec>(name);
    const planned = plan(current);
    if ("noop" in planned)
      return { ok: true, noop: true, value: planned.value };
    this.state.set(name, planned);
    return {
      ok: true,
      revision: this.state.docs.get(name)?.revision,
      value: planned,
    };
  }

  execute(argv: readonly string[]): Record<string, unknown> {
    const { positional, flags } = parseArgs(argv);
    const [command, ...rest] = positional;
    const request = flags.request ?? "";
    const by = String(flags.by ?? "operator").slice(0, 80);
    const reason = flags.reason ? flags.reason.slice(0, 600) : null;
    const needRequest = () => {
      if (!requestPattern.test(request))
        throw new Refusal("request-id-required");
    };
    const seen = (value: Rec | null) =>
      (value?.requests ?? []).some((entry) => entry.id === request);
    const stamp = this.now();
    switch (command) {
      case "factory": {
        needRequest();
        const action = rest[0];
        return this.write("core/factory", (value) => {
          const doc = (value ?? {
            v: 1,
            intake: "paused",
            mode: "run",
            mergeHold: false,
            requests: [],
          }) as Rec;
          if (seen(doc)) return { noop: true, value: doc };
          const next = structuredClone(doc);
          if (action === "pause-intake") next.intake = "paused";
          else if (action === "resume-intake") {
            if (doc.mode === "stop") throw new Refusal("factory-stopped");
            next.intake = "open";
          } else if (action === "drain")
            Object.assign(next, { intake: "paused", mode: "drain" });
          else if (action === "stop")
            Object.assign(next, { intake: "paused", mode: "stop" });
          else if (action === "resume") next.mode = "run";
          else if (action === "hold-merge") next.mergeHold = true;
          else if (action === "release-merge") next.mergeHold = false;
          else throw new Refusal("unknown-action");
          next.reason = reason;
          next.updatedAt = stamp;
          next.updatedBy = by;
          next.requests = [
            ...(doc.requests ?? []),
            { id: request, action, by, at: stamp },
          ].slice(-20);
          return next;
        });
      }
      case "issue": {
        needRequest();
        const issue = Number(rest[0]);
        if (!Number.isSafeInteger(issue) || issue <= 0)
          throw new Refusal("invalid-issue");
        const action = rest[1];
        return this.write(`core/issues/${issue}`, (value) => {
          if (!value) throw new Refusal("no-assignment");
          if (seen(value)) return { noop: true, value };
          const next = structuredClone(value) as Rec & Record<string, unknown>;
          if (action === "hold") {
            if (value.control === "stop") throw new Refusal("stopped");
            next.control = "hold";
          } else if (action === "release") {
            if (value.control !== "hold") throw new Refusal("not-held");
            next.control = "run";
          } else if (action === "stop") {
            next.control = "stop";
            if (!value.run) next.status = "stopped";
          } else if (action === "retry") {
            if (value.control !== "run") throw new Refusal("not-running");
            if (value.status !== "BLOCKED") throw new Refusal("not-blocked");
            Object.assign(next, {
              status: "pending",
              route: "initial",
              blocker: null,
            });
          } else if (action === "reopen") {
            if (value.control === "hold") throw new Refusal("not-running");
            if (!["PR_READY", "stopped"].includes(String(value.status)))
              throw new Refusal("not-reopenable");
            Object.assign(next, {
              control: "run",
              status: "pending",
              route: value.pr ? "feedback" : "initial",
            });
          } else if (action === "reconcile") {
            // Settles an item a run left active once its lease has ended; on
            // an idle item only the recorded request moves the revision.
            if (value.status === "active") {
              const lease = this.state.docs.get(`core/issues/${issue}`)?.lease;
              if (lease?.live) throw new Refusal("lease-live");
              const run = value.run as { id: string; route: string } | null;
              if (!run || lease?.runId !== run.id)
                throw new Refusal("run-unconfirmed");
              Object.assign(next, {
                status: "waiting",
                route: run.route,
                run: null,
                history: [
                  ...((value.history as unknown[]) ?? []),
                  {
                    round: value.round,
                    run: run.id,
                    route: run.route,
                    outcome: "reconciled",
                    next: run.route,
                    at: stamp,
                    summary: `Run ${run.id} ended (lease ended) without recording its round`,
                  },
                ].slice(-12),
              });
            } else if (!["pending", "waiting"].includes(String(value.status)))
              throw new Refusal("not-active");
          } else throw new Refusal("unknown-action");
          next.controlReason = reason;
          next.updatedAt = stamp;
          next.requests = [
            ...(value.requests ?? []),
            { id: request, action, by, at: stamp },
          ].slice(-20);
          return next;
        });
      }
      case "scope": {
        needRequest();
        const issues = String(flags.issues ?? "")
          .split(",")
          .map(Number)
          .filter((value) => Number.isSafeInteger(value) && value > 0);
        if (!issues.length) throw new Refusal("scope-issues-required");
        if (!["PR_READY", "MERGED"].includes(String(flags["end-state"])))
          throw new Refusal("end-state-required");
        if (flags.owner !== "conrad") throw new Refusal("unknown-owner");
        return this.write("core/scope", (value) => {
          if (seen(value)) return { noop: true, value: value as Rec };
          return {
            v: 1,
            issues: [...new Set(issues)].sort((a, b) => a - b),
            endState: flags["end-state"],
            owner: flags.owner,
            approvedBy: by,
            approvedAt: stamp,
            note: flags.note ?? null,
            // Like control.mjs: the map is replaced by what --end-states names.
            endStates: Object.fromEntries(
              String(flags["end-states"] ?? "")
                .split(",")
                .filter(Boolean)
                .map((pair) => pair.split("=")),
            ),
            priorities: (value?.priorities as Record<string, number>) ?? {},
            requests: [
              ...(value?.requests ?? []),
              { id: request, by, at: stamp },
            ].slice(-20),
          };
        });
      }
      case "prioritize": {
        needRequest();
        const issue = Number(rest[0]);
        const priority = Number(rest[1]);
        if (
          !Number.isSafeInteger(issue) ||
          !Number.isInteger(priority) ||
          priority < 0 ||
          priority > 100
        )
          throw new Refusal("invalid-priority");
        return this.write("core/scope", (value) => {
          if (!value) throw new Refusal("no-scope");
          if (!(value.issues as number[]).includes(issue))
            throw new Refusal("not-in-scope");
          return {
            ...value,
            priorities: {
              ...(value.priorities as Record<string, number>),
              [issue]: priority,
            },
            requests: [
              ...(value.requests ?? []),
              { id: request, by, at: stamp },
            ].slice(-20),
          };
        });
      }
      case "cancel-run": {
        needRequest();
        const runId = rest[0] ?? "";
        if (!/^[a-f0-9-]{36}$/.test(runId)) throw new Refusal("invalid-run");
        // Hold the issue whose round this run is first, so the cancelled
        // round is not requeued (control.mjs cancel-run).
        const owner = [...this.state.docs.entries()].find(
          ([name, stored]) =>
            /^core\/issues\/\d+$/.test(name) &&
            (stored.value as { run?: { id?: string } } | null)?.run?.id ===
              runId,
        );
        let held: { issue: number; ok: boolean; code: string | null } | null =
          null;
        if (owner) {
          const issue = Number(owner[0].split("/").at(-1));
          try {
            const hold = this.execute([
              "issue",
              String(issue),
              "hold",
              "--request",
              request,
              "--by",
              by,
              "--reason",
              reason ?? `Run ${runId} cancelled by ${by}`,
            ]);
            held = { issue, ok: hold.ok === true, code: null };
          } catch (error) {
            held = {
              issue,
              ok: false,
              code: error instanceof Refusal ? error.code : "error",
            };
          }
        }
        const result = this.hooks.cancel?.(runId) ?? {
          status: 404,
          observed: null,
          detail: "No such run",
        };
        // The executor labels every container with core.archon.run=<runId>;
        // by default the fixture's run had one, removed on the first cancel.
        const removedBefore = this.removedContainers.has(runId);
        this.removedContainers.add(runId);
        const found = removedBefore ? [] : [`${runId.slice(0, 8)}0000`];
        const containers = this.containers?.(runId) ?? {
          ok: true,
          found,
          removed: found,
          remaining: [],
        };
        const ended =
          result.observed === "cancelled" || result.observed === "completed";
        return {
          ok:
            result.status === 200 &&
            ended &&
            Array.isArray(containers.remaining) &&
            containers.remaining.length === 0,
          status: result.status,
          detail: result.detail,
          observed: result.observed,
          containers,
          ...(held ? { held } : {}),
        };
      }
      case "ask":
      case "analyze": {
        needRequest();
        const inputs =
          command === "ask"
            ? {
                question: String(flags.question ?? "").slice(0, 2000),
                conversation: String(flags.conversation ?? ""),
                request,
              }
            : {
                scope: String(flags.scope ?? "factory"),
                trigger: String(flags.trigger ?? "operator"),
                request,
              };
        if (
          command === "ask" &&
          (!inputs.question?.trim() ||
            !/^[a-z0-9-]{8,64}$/.test(String(inputs.conversation)))
        )
          throw new Refusal("invalid-question");
        const deliveryId = `${command}:${request}`;
        const body = JSON.stringify(inputs);
        const previous = this.deliveries.get(deliveryId);
        if (previous !== undefined && previous !== body)
          return {
            ok: false,
            outcome: "conflict",
            status: 409,
            receipt: null,
            detail: "Delivery id reused with another body",
          };
        if (previous !== undefined)
          return {
            ok: true,
            outcome: "accepted",
            status: 200,
            receipt: `receipt-${request}`,
            detail: null,
          };
        this.deliveries.set(deliveryId, body);
        const fired = this.hooks.fire?.(
          command === "ask" ? "answer" : "analyze",
          inputs as unknown as Record<string, string>,
          deliveryId,
        ) ?? {
          ok: true,
          outcome: "accepted",
          status: 200,
          receipt: `receipt-${request}`,
        };
        return { ...fired, detail: fired.ok ? null : "refused" };
      }
      default:
        throw new Refusal("unknown-command");
    }
  }
}

const digest = (seed: string) => seed.repeat(64).slice(0, 64);

/** A synthetic factory mid-flight: two live rounds, a held lineage, terminal outcomes and queued scope. */
export function seedFactory(base = Date.now()) {
  const at = (minutes: number) =>
    new Date(base - minutes * 60_000).toISOString();
  const assignment = (issue: number, minutes: number) => ({
    id: `a${issue}-fixture000000`,
    owner: "conrad",
    profileDigest: digest("a"),
    scopeRevision: digest("b"),
    policyRevision: digest("c"),
    endState: "PR_READY",
    assignedAt: at(minutes),
    assignedBy: `selector:${RUN.select}`,
    reason: JSON.stringify({ summary: `Synthetic admission of #${issue}` }),
  });
  const brief = (issue: number) => ({
    summary: `Synthetic brief for issue #${issue}: change the fixture widget and keep behaviour covered.\nSecond line keeps long text wrapping honest.`,
    source_paths: [`apps/fixture/src/widget-${issue}/**`],
    test_paths: [`tests/fixture/widget-${issue}.test.ts`],
    docs_only: false,
    shared_areas: ["fixture-area"],
    out_of_scope: ["Unrelated fixture refactors"],
    sources: [`https://github.com/Asymmetric-al/core/issues/${issue}`],
    contextFingerprint: digest("d"),
    uncertainty: "Synthetic uncertainty note.",
    repair: null,
  });
  const acceptance = (issue: number) => ({
    revision: digest("e"),
    criteria: [
      {
        id: "AC1",
        statement: `Widget ${issue} renders its label`,
        check: "unit test",
        evidence: "widget test",
      },
      {
        id: "AC2",
        statement: "Keyboard users can operate the widget",
        check: "e2e",
        evidence: "playwright",
      },
    ],
    tests: [
      [`tests/fixture/widget-${issue}.test.ts`, digest("f").slice(0, 40)],
    ],
    gaps: [],
    checks: ["bun run test (fixture)"],
    at: at(50),
    run: RUN.history101,
  });
  const item = (issue: number, extra: Record<string, unknown>) => ({
    v: 1,
    issue,
    assignment: assignment(issue, 120),
    control: "run",
    controlReason: null,
    status: "pending",
    route: "initial",
    round: 0,
    run: null,
    branch: null,
    base: null,
    head: null,
    acceptance: null,
    reviews: null,
    final: null,
    pr: null,
    brief: null,
    blocker: null,
    feedbackRounds: 0,
    repeats: {},
    areas: [],
    history: [],
    requests: [],
    updatedAt: at(1),
    ...extra,
  });
  return {
    "core/factory": {
      v: 1,
      intake: "open",
      mode: "run",
      mergeHold: false,
      reason: "Fixture factory open for intake",
      updatedAt: at(240),
      updatedBy: "fixture",
      requests: [],
    },
    "core/scope": {
      v: 1,
      issues: [101, 102, 103, 104, 105, 106, 107],
      endState: "PR_READY",
      owner: "conrad",
      approvedBy: "fixture",
      approvedAt: at(300),
      note: "Synthetic fixture scope",
      priorities: { "106": 80 },
      requests: [],
    },
    "core/issues/101": item(101, {
      status: "active",
      route: "repair",
      round: 2,
      run: { id: RUN.repair, startedAt: at(12), route: "repair" },
      branch: "factory/101-fixture-widget",
      base: digest("1").slice(0, 40),
      head: digest("2").slice(0, 40),
      brief: {
        ...brief(101),
        repair: {
          kind: "implementation",
          items: ["[M1] Widget label is not announced"],
        },
      },
      acceptance: acceptance(101),
      history: [
        {
          round: 1,
          run: RUN.history101,
          route: "initial",
          outcome: "continue",
          next: "repair",
          at: at(14),
          summary: "after-assess: 1 repair item(s) for Bezalel",
        },
      ],
    }),
    "core/issues/102": item(102, {
      status: "active",
      route: "initial",
      round: 1,
      run: { id: RUN.review, startedAt: at(40), route: "initial" },
      branch: "factory/102-fixture-form",
      base: digest("3").slice(0, 40),
      head: digest("4").slice(0, 40),
      brief: brief(102),
      acceptance: acceptance(102),
    }),
    "core/issues/103": item(103, {
      status: "PR_READY",
      route: null,
      round: 3,
      branch: "factory/103-fixture-docs",
      base: digest("5").slice(0, 40),
      head: digest("6").slice(0, 40),
      brief: brief(103),
      acceptance: acceptance(103),
      reviews: {
        micaiah: {
          decision: "CLEAR",
          candidate: digest("6").slice(0, 40),
          acceptance: digest("e"),
          findings: 0,
          sealedAt: at(80),
          run: RUN.published103,
        },
        luke: {
          decision: "CLEAR",
          candidate: digest("6").slice(0, 40),
          acceptance: digest("e"),
          findings: 1,
          sealedAt: at(80),
          run: RUN.published103,
          cleared: true,
        },
      },
      final: {
        decision: "PASS",
        candidate: digest("6").slice(0, 40),
        acceptanceRevision: digest("e"),
        criteria: [
          { id: "AC1", result: "PASS", evidence: "Fixture evidence one" },
          { id: "AC2", result: "PASS", evidence: "Fixture evidence two" },
        ],
        at: at(75),
        run: RUN.published103,
      },
      pr: {
        number: 9103,
        url: "https://github.com/Asymmetric-al/core/pull/9103",
        nodeId: "PR_fixture",
        head: digest("6").slice(0, 40),
        publishedAt: at(70),
      },
      history: [
        {
          round: 1,
          run: RUN.published103,
          route: "initial",
          outcome: "continue",
          next: "feedback",
          at: at(70),
          summary: "Published PR #9103",
        },
        {
          round: 2,
          run: RUN.published103,
          route: "feedback",
          outcome: "continue",
          next: "feedback",
          at: at(40),
          summary: "Waiting for required checks",
        },
        {
          round: 3,
          run: RUN.published103,
          route: "feedback",
          outcome: "PR_READY",
          next: null,
          at: at(20),
          summary: "All required checks passed; PR is ready",
        },
      ],
      requests: [
        {
          id: "cr-fixturereopen-0000000000000000-0000000000000000",
          action: "reopen",
          by: "conrad",
          at: at(65),
          policy: { from: digest("c"), to: digest("1") },
          profile: { from: digest("a"), to: digest("2") },
        },
      ],
      updatedAt: at(20),
    }),
    "core/issues/103/feedback": {
      v: 1,
      dispositions: {
        "thread-1": {
          action: "fix-implementation",
          reason: "Reviewer found a missing label",
          head: digest("6").slice(0, 40),
          at: at(45),
          run: RUN.published103,
        },
        "comment-2": {
          action: "decline-nit",
          reason: "Style preference only",
          head: digest("6").slice(0, 40),
          at: at(45),
          run: RUN.published103,
        },
      },
    },
    "core/issues/104": item(104, {
      status: "BLOCKED",
      route: null,
      round: 1,
      blocker: {
        code: "scope-blocked",
        detail:
          "Samson blocked the issue: the request contradicts the accepted ADR.",
        recovery: "Clarify the request on GitHub, then retry",
        at: at(90),
        route: "initial",
      },
      workRounds: 1,
      history: [
        {
          round: 1,
          run: RUN.blocked104,
          route: "initial",
          outcome: "BLOCKED",
          next: null,
          at: at(90),
          summary: "after-scope: scope-blocked",
        },
      ],
      updatedAt: at(90),
    }),
    "core/issues/105": item(105, {
      status: "MERGED",
      route: null,
      round: 2,
      pr: {
        number: 9105,
        url: "https://github.com/Asymmetric-al/core/pull/9105",
        head: digest("7").slice(0, 40),
        publishedAt: at(200),
        mergedAt: at(150),
        mergeCommit: digest("8").slice(0, 40),
        mergedBy: "external",
        onTarget: true,
        issueClosed: true,
      },
      history: [
        {
          round: 2,
          run: RUN.merged105,
          route: "feedback",
          outcome: "MERGED",
          next: null,
          at: at(150),
          external: true,
          summary: "Merged outside the factory. Merged at the expected head",
        },
      ],
      updatedAt: at(150),
    }),
    "core/issues/107": item(107, {
      status: "waiting",
      control: "hold",
      controlReason: "Operator wants to review the PR first",
      route: "feedback",
      round: 2,
      pr: {
        number: 9107,
        url: "https://github.com/Asymmetric-al/core/pull/9107",
        head: digest("9").slice(0, 40),
        publishedAt: at(60),
        pending: {
          head: digest("a").slice(0, 40),
          base: digest("b").slice(0, 40),
          from: digest("9").slice(0, 40),
          carried: true,
          at: at(29),
        },
      },
      feedbackRounds: 2,
      lastRefusal: { run: RUN.review, code: "held", at: at(28) },
      history: [
        {
          round: 2,
          run: RUN.published103,
          route: "feedback",
          outcome: "held",
          next: "feedback",
          at: at(30),
          summary: "Operator hold took effect at the round boundary",
        },
      ],
      requests: [
        {
          id: "cr-fixturehold-0000000000000000-0000000000000000",
          action: "hold",
          by: "conrad",
          at: at(31),
        },
      ],
      updatedAt: at(30),
    }),
    "core/issues/107/feedback": {
      v: 1,
      dispositions: {
        "thread-7": {
          action: "fix-implementation",
          reason: "The empty state is not announced",
          head: digest("9").slice(0, 40),
          kind: "review-thread",
          lastComment: "PRRC_fixture_last_comment",
          status: "fix-pending",
          at: at(32),
          run: RUN.published103,
        },
      },
    },
    "core/selection": {
      v: 1,
      decisions: [
        {
          at: at(130),
          run: RUN.select,
          issue: 101,
          assignment: "a101-fixture000000",
          frontier: ["#101", "#102", "#106"],
          reason: {
            summary: "Unblocks the form work",
            sources: ["roadmap:fixture"],
            expectedBenefit: "Unlocks #102",
            affectedAreas: ["fixture-area"],
            uncertainty: "Low",
          },
        },
        {
          at: at(45),
          run: RUN.select,
          issue: 102,
          assignment: "a102-fixture000000",
          frontier: ["#102", "#106"],
          reason: {
            summary: "Highest roadmap priority in the frontier",
            sources: ["roadmap:fixture", "issue #102"],
            expectedBenefit: "Completes the fixture form",
            affectedAreas: ["fixture-area"],
            uncertainty: "Medium: depends on #101's widget",
          },
        },
      ],
    },
    "core/attention": {
      v: 1,
      items: [
        {
          fingerprint: "fixture-attention-1",
          title: "Reviews repeatedly find missing labels",
          scope: "factory",
          report: RUN.analysis,
          status: "open",
          at: at(25),
        },
      ],
    },
    "core/analysis": {
      v: 1,
      reports: [
        {
          run: RUN.analysis,
          scope: "factory",
          trigger: "operator",
          digest: digest("a"),
          status: "completed",
          at: at(25),
          findings: 1,
        },
      ],
    },
    [`core/analysis/reports/${RUN.analysis}`]: {
      v: 1,
      run: RUN.analysis,
      scope: "factory",
      trigger: "operator",
      digest: digest("a"),
      status: "completed",
      problem: "",
      at: at(25),
      instructions: "analyze-v1",
      result: {
        result: "findings",
        observations: [
          {
            text: "Two rounds repaired accessibility labels",
            evidence: ["E1", "E2"],
          },
        ],
        findings: [
          {
            title: "Reviews repeatedly find missing labels",
            material: true,
            explanation:
              "Synthetic finding: repeated label repairs suggest acceptance misses accessible names.",
            alternatives: ["The widget library changed"],
            evidence: ["E1"],
            next_step: "Ask Ezra to add an accessible-name criterion",
            how_to_tell: "The next round's reviews no longer report labels",
          },
        ],
        coverage_limits: [
          "Worker transcripts are excluded",
          "Only six guard logs were sampled",
        ],
      },
    },
    "core/chat/op-fixture-conversation": {
      v: 1,
      messages: [
        {
          role: "operator",
          text: "Hold #102 while I check the form design.",
          request: "cr-fixtureask-0000000000000000-0000000000000000",
          at: at(10),
        },
        {
          role: "samson",
          request: "cr-fixtureask-0000000000000000-0000000000000000",
          at: at(9),
          run: RUN.analysis,
          text: "Issue #102 is in its review step. Holding it lets the current step finish, then the next claim refuses.",
          sources: ["core/issues/102"],
          operation: {
            kind: "hold",
            issue: 102,
            issues: [],
            endState: "unchanged",
            reason: "Operator wants to check the form design",
            status: "proposed",
          },
        },
      ],
    },
  } as Record<string, unknown>;
}

/** The seeded store with the two live round leases the engine fixture reports. */
export function createFixtureState(base = Date.now()) {
  const state = new FixtureState(seedFactory(base));
  for (const [issue, runId] of [
    [101, RUN.repair],
    [102, RUN.review],
  ] as const) {
    const stored = state.docs.get(`core/issues/${issue}`);
    if (stored) stored.lease = { runId, live: true };
  }
  return state;
}
