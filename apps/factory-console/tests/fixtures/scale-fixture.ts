// TEST-ONLY synthetic scale fixture: about 2,000 generated issues with long
// round histories, for pagination, render-time, overflow and memory checks.
// It is labeled everywhere it appears (factory reason, scope note, every
// summary) and is only ever loaded behind the native fixture's test-only
// /fixture/scale endpoint. It makes no claim about any real factory.
export const SCALE_LABEL =
  "SYNTHETIC SCALE FIXTURE: generated test data, not live factory state";

const sha = (seed: number) =>
  (seed.toString(16).padStart(8, "0") + "c0ffee".repeat(6)).slice(0, 40);
const uuid = (issue: number, round: number) =>
  `${issue.toString(16).padStart(8, "0")}-${round
    .toString(16)
    .padStart(4, "0")}-4000-8000-${"0".repeat(12)}`;

// Admission capacity bounds unfinished work, so only the first two issues
// wait for their next round; the long tail is finished work.
const STATUSES = [
  "PR_READY",
  "PR_READY",
  "PR_READY",
  "MERGED",
  "BLOCKED",
  "PR_READY",
  "MERGED",
  "stopped",
  "PR_READY",
  "PR_READY",
] as const;
const ROUTES = ["initial", "repair", "feedback", "oracle", "review"] as const;

export function seedScale({
  base = Date.now(),
  issues = 2000,
  history = 40,
  first = 10_001,
}: {
  base?: number;
  issues?: number;
  history?: number;
  first?: number;
} = {}): Record<string, unknown> {
  const minutes = (value: number) =>
    new Date(base - value * 60_000).toISOString();
  const numbers = Array.from({ length: issues }, (_, index) => first + index);
  const seed: Record<string, unknown> = {
    "core/factory": {
      v: 1,
      intake: "open",
      mode: "run",
      mergeHold: false,
      reason: SCALE_LABEL,
      updatedAt: minutes(1),
      updatedBy: "fixture",
      requests: [],
    },
    "core/scope": {
      v: 1,
      issues: numbers,
      endState: "PR_READY",
      owner: "conrad",
      approvedBy: "fixture",
      approvedAt: minutes(100_000),
      note: SCALE_LABEL,
      priorities: {},
      requests: [],
    },
  };
  const decisions: Record<string, unknown>[] = [];
  numbers.forEach((issue, index) => {
    const status = index < 2 ? "waiting" : STATUSES[index % STATUSES.length];
    const rounds = 1 + ((index * 7) % history);
    const assigned = 60 * 24 * 30 - index * 10;
    const head = sha(issue);
    const revision = sha(issue + 1).padEnd(64, "e");
    const terminal = status !== "waiting";
    const entries = Array.from({ length: rounds }, (_, round) => {
      const last = round === rounds - 1;
      const end = assigned - (round + 1) * Math.floor(assigned / (rounds + 1));
      return {
        round: round + 1,
        run: uuid(issue, round + 1),
        route:
          round === 0 ? "initial" : ROUTES[(issue + round) % ROUTES.length],
        outcome: last && terminal ? status : "continue",
        next: last && terminal ? null : "feedback",
        at: minutes(end),
        startedAt: minutes(end + 20),
        summary: `${SCALE_LABEL}. Round ${round + 1} of synthetic issue #${issue}: ${"a long generated summary that wraps across lines ".repeat(4)}`,
      };
    });
    const clean = index % 10 !== 8;
    seed[`core/issues/${issue}`] = {
      v: 1,
      issue,
      assignment: {
        id: `a${issue}-scale0000000`,
        owner: index % 3 ? "conrad" : "fixture-owner",
        endState: status === "MERGED" ? "MERGED" : "PR_READY",
        assignedAt: minutes(assigned),
        assignedBy: "selector:scale-fixture",
        reason: JSON.stringify({ summary: `${SCALE_LABEL} (#${issue})` }),
      },
      control: status === "stopped" ? "stop" : "run",
      controlReason: null,
      status,
      route: terminal ? null : "feedback",
      round: rounds,
      run: null,
      branch: `factory/${issue}-synthetic-scale-${"long-branch-name-".repeat(3)}`,
      base: sha(issue + 2),
      head,
      acceptance: {
        revision,
        criteria: [
          {
            id: "AC1",
            statement: `Synthetic criterion for #${issue}`,
            check: "unit test",
            evidence: "synthetic",
          },
        ],
        tests: [],
        gaps: [],
        checks: ["bun run test (synthetic)"],
        at: minutes(assigned - 5),
        run: uuid(issue, 1),
      },
      reviews: {
        micaiah: {
          decision: "CLEAR",
          candidate: head,
          acceptance: revision,
          findings: 0,
          sealedAt: minutes(assigned - 30),
          run: uuid(issue, 1),
        },
        luke: {
          decision: clean ? "CLEAR" : "FINDINGS",
          candidate: head,
          acceptance: revision,
          findings: clean ? 0 : 2,
          sealedAt: minutes(assigned - 30),
          run: uuid(issue, 1),
        },
      },
      final:
        status === "PR_READY" || status === "MERGED"
          ? {
              decision: "PASS",
              candidate: head,
              acceptanceRevision: revision,
              criteria: [{ id: "AC1", result: "PASS", evidence: "synthetic" }],
              at: minutes(assigned - 40),
              run: uuid(issue, 1),
            }
          : null,
      pr:
        status === "BLOCKED"
          ? null
          : {
              number: 50_000 + index,
              url: `https://github.com/Asymmetric-al/core/pull/${50_000 + index}`,
              head,
              publishedAt: minutes(assigned - 45),
              ...(status === "MERGED"
                ? {
                    mergedAt: entries.at(-1)?.at ?? minutes(1),
                    mergeCommit: sha(issue + 3),
                  }
                : {}),
            },
      brief: null,
      blocker:
        status === "BLOCKED"
          ? {
              code: "round-limit",
              detail: `${SCALE_LABEL}: synthetic blocker with a long explanation. ${"detail ".repeat(40)}`,
              recovery: "Synthetic recovery",
              at: entries.at(-1)?.at ?? minutes(1),
            }
          : null,
      feedbackRounds: 0,
      history: entries,
      requests: [],
      updatedAt: entries.at(-1)?.at ?? minutes(1),
    };
    if (index % 5 === 0)
      seed[`core/issues/${issue}/feedback`] = {
        v: 1,
        dispositions: {
          [`thread-${issue}`]: {
            action: "fix-implementation",
            reason: `${SCALE_LABEL}: synthetic review thread`,
            head,
            at: minutes(assigned - 50),
            run: uuid(issue, 2),
          },
          [`check-${issue}`]: {
            action: "rerun-flake",
            reason: "Synthetic flaky check",
            head,
            at: minutes(assigned - 51),
            run: uuid(issue, 2),
          },
        },
      };
    if (index % 10 === 0)
      decisions.push({
        at: minutes(assigned + 1),
        run: uuid(issue, 0),
        issue,
        assignment: `a${issue}-scale0000000`,
        frontier: [`#${issue}`],
        reason: {
          summary: `${SCALE_LABEL}: synthetic selection reason`,
          sources: ["roadmap:synthetic"],
        },
      });
  });
  seed["core/selection"] = { v: 1, decisions: decisions.slice(-200) };
  return seed;
}
