import { describe, expect, it } from "vitest";

import {
  FACTORY_MARKER,
  currentDisposition,
  evaluateReadiness,
  feedbackItems,
  requiredApprovalsFromRules,
  requiredChecksFromRules,
  reviewProvidersFrom,
  reviewStanding,
  scopeMergeAuthority,
  threadLastComment,
  topLevelFeedback,
} from "../../../scripts/archon-factory/pack/.shared/readiness.mjs";

const HEAD = "1".repeat(40);
const STALE_HEAD = "2".repeat(40);
const MERGE_SHA = "3".repeat(40);
const ACTIONS_APP = 15368;
const OTHER_APP = 424242;
const POLICY = `sha256:${"c".repeat(64)}`;
const ISSUE = 12;
const PUBLISHED_AT = "2026-11-10T09:00:00Z";
const REQUIRED = ["ci-gate", "e2e-smoke-gate", "migrate", "smoke"];
const ALL_PASSED = `All 4 required checks passed on ${HEAD}`;
const THREAD_URL =
  "https://github.com/Asymmetric-al/core/pull/42#discussion_r9001";
const REPLY_URL =
  "https://github.com/Asymmetric-al/core/pull/42#discussion_r9002";

type CheckRun = {
  id: number;
  name: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  app: { id: number };
};
type Review = {
  user: { login: string };
  commit_id: string;
  state: string;
  id?: number;
  body?: string;
  html_url?: string;
};
type ThreadComment = {
  url: string;
  id?: string;
  databaseId?: number;
  body?: string;
};
type Thread = {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  comments: { nodes: ThreadComment[] };
  recent?: { nodes: ThreadComment[] };
};
type IssueComment = {
  id: number;
  user: { login: string; type?: string };
  body: string;
  html_url?: string;
  created_at?: string;
  updated_at?: string;
};
type Rule = { type: string; parameters?: Record<string, unknown> };
type Protection = {
  required_status_checks?: {
    strict: boolean;
    checks: { context: string; app_id?: number | null }[];
  };
  required_pull_request_reviews?: {
    required_approving_review_count: number;
    require_code_owner_reviews: boolean;
  };
} | null;
type ReadinessInput = {
  workItem: {
    issue: number;
    head: string;
    branch?: string;
    control: string;
    pr?: { publishedAt?: string } | null;
    assignment: { policyRevision: string; endState: string };
    acceptance: { revision: string } | null;
    final: {
      decision: string;
      candidate: string;
      acceptanceRevision: string;
    } | null;
    reviews: Record<string, { decision: string; candidate: string }> | null;
  };
  installedPolicyRevision: string;
  contextFingerprint: { recorded?: string; current?: string };
  targetBranch: string;
  pr: {
    number: number;
    state: string;
    merged: boolean;
    merge_commit_sha: string | null;
    head: { sha: string; ref?: string };
    base: { ref: string };
    mergeable: boolean | null | undefined;
    mergeable_state: string;
  } | null;
  rules: Rule[];
  protection: Protection;
  checkRuns: CheckRun[];
  statuses: { sha: string; statuses: { context: string; state: string }[] };
  reviews: Review[];
  threads: Thread[];
  dispositions: Record<string, unknown>;
  topLevelFeedback: { id: string; url?: string; updatedAt?: string | null }[];
  factory: { mode: string; mergeHold: boolean } | undefined;
  scope?: {
    issues: number[];
    endState: string;
    endStates?: Record<string, string>;
  } | null;
  comments?: IssueComment[];
  reviewProviders?: {
    login: string;
    required: boolean;
    skipMarkers: string[];
  }[];
  requiredBots?: string[];
};

function checkRun(
  name: string,
  id: number,
  overrides: Partial<CheckRun> = {},
): CheckRun {
  return {
    id,
    name,
    head_sha: HEAD,
    status: "completed",
    conclusion: "success",
    started_at: "2026-11-10T10:00:00Z",
    app: { id: ACTIONS_APP },
    ...overrides,
  };
}

function review(login: string, state: string, commit = HEAD): Review {
  return { user: { login }, commit_id: commit, state };
}

// A realistic all-green observation of a strict `develop` PR whose
// assignment authorizes merge: the protection mirrors Core's develop
// (four Actions-provided checks, strict, zero required approvals).
function ready(): ReadinessInput {
  return {
    workItem: {
      issue: ISSUE,
      head: HEAD,
      control: "run",
      pr: { publishedAt: PUBLISHED_AT },
      assignment: { policyRevision: POLICY, endState: "MERGED" },
      acceptance: { revision: "acceptance-3" },
      final: {
        decision: "PASS",
        candidate: HEAD,
        acceptanceRevision: "acceptance-3",
      },
      reviews: {
        micaiah: { decision: "CLEAR", candidate: HEAD },
        luke: { decision: "CLEAR", candidate: HEAD },
      },
    },
    installedPolicyRevision: POLICY,
    contextFingerprint: { recorded: "context-7", current: "context-7" },
    targetBranch: "develop",
    pr: {
      number: 42,
      state: "open",
      merged: false,
      merge_commit_sha: null,
      head: { sha: HEAD },
      base: { ref: "develop" },
      mergeable: true,
      mergeable_state: "clean",
    },
    rules: [],
    protection: {
      required_status_checks: {
        strict: true,
        checks: REQUIRED.map((context) => ({ context, app_id: ACTIONS_APP })),
      },
      required_pull_request_reviews: {
        required_approving_review_count: 0,
        require_code_owner_reviews: false,
      },
    },
    checkRuns: REQUIRED.map((name, index) => checkRun(name, 500 + index)),
    statuses: { sha: HEAD, statuses: [] },
    reviews: [],
    threads: [],
    dispositions: {},
    topLevelFeedback: [],
    factory: { mode: "run", mergeHold: false },
    scope: { issues: [ISSUE], endState: "MERGED" },
  };
}

function decide(change: (input: ReadinessInput) => void = () => {}) {
  const input = ready();
  change(input);
  return evaluateReadiness(input);
}

function pull(input: ReadinessInput) {
  if (!input.pr) throw new Error("baseline has a pull request");
  return input.pr;
}

function setRun(
  input: ReadinessInput,
  name: string,
  overrides: Partial<CheckRun>,
) {
  input.checkRuns = input.checkRuns.map((run) =>
    run.name === name ? { ...run, ...overrides } : run,
  );
}

function withoutRun(input: ReadinessInput, name: string) {
  input.checkRuns = input.checkRuns.filter((run) => run.name !== name);
}

function approvalsRequired(input: ReadinessInput, count: number) {
  input.protection = {
    ...input.protection,
    required_pull_request_reviews: {
      required_approving_review_count: count,
      require_code_owner_reviews: false,
    },
  };
}

// An unresolved thread whose opening comment has one reply; the opening
// comment's URL is the thread's link and the reply is its last comment.
function unresolvedThread(id = "PRRT_1"): Thread {
  return {
    id,
    isResolved: false,
    isOutdated: false,
    comments: {
      nodes: [
        { id: "C1", databaseId: 9001, url: THREAD_URL, body: "Null check?" },
        { id: "C2", databaseId: 9002, url: REPLY_URL, body: "Still open" },
      ],
    },
  };
}

describe("evaluateReadiness baseline", () => {
  it("merges when every condition holds and the assignment authorizes merge", () => {
    expect(decide()).toEqual({ verdict: "MERGE", reasons: [ALL_PASSED] });
  });

  it("refuses without a recorded pull request", () => {
    expect(
      decide((input) => {
        input.pr = null;
      }),
    ).toEqual({ verdict: "BLOCKED", reasons: ["No pull request recorded"] });
  });
});

describe("evaluateReadiness MERGED", () => {
  it("reports MERGED with GitHub's merge commit", () => {
    expect(
      decide((input) => {
        pull(input).merged = true;
        pull(input).state = "closed";
        pull(input).merge_commit_sha = MERGE_SHA;
      }),
    ).toEqual({
      verdict: "MERGED",
      reasons: ["GitHub reports the PR merged"],
      mergeCommit: MERGE_SHA,
    });
  });

  it("reports MERGED even after the PR closed on a head the factory did not review", () => {
    expect(
      decide((input) => {
        pull(input).merged = true;
        pull(input).state = "closed";
        pull(input).head.sha = STALE_HEAD;
      }).verdict,
    ).toBe("MERGED");
  });
});

describe("evaluateReadiness BLOCKED", () => {
  it("blocks a PR that is no longer open", () => {
    expect(
      decide((input) => {
        pull(input).state = "closed";
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["The pull request is not open"],
    });
  });

  it("blocks when the PR head is not the reviewed candidate", () => {
    expect(
      decide((input) => {
        pull(input).head.sha = STALE_HEAD;
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: [`PR head ${STALE_HEAD} is not the reviewed candidate ${HEAD}`],
    });
  });

  it("blocks when the PR's branch is not the work item's branch", () => {
    expect(
      decide((input) => {
        input.workItem.branch = "factory/issue-12";
        pull(input).head.ref = "someone/else";
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: [
        "PR branch someone/else is not the issue branch factory/issue-12",
      ],
    });
    expect(
      decide((input) => {
        input.workItem.branch = "factory/issue-12";
        pull(input).head.ref = "factory/issue-12";
      }).verdict,
    ).toBe("MERGE");
  });

  it("blocks when the PR targets a different base branch", () => {
    expect(
      decide((input) => {
        pull(input).base.ref = "main";
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["PR targets main, not develop"],
    });
  });

  it("blocks when the installed policy changed after admission", () => {
    expect(
      decide((input) => {
        input.installedPolicyRevision = `sha256:${"d".repeat(64)}`;
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["Installed factory policy changed after admission"],
    });
  });

  it("blocks without Ezra's final acceptance", () => {
    expect(
      decide((input) => {
        input.workItem.final = null;
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["Ezra's final acceptance is not PASS for this candidate"],
    });
  });

  it("blocks when final acceptance is not PASS", () => {
    expect(
      decide((input) => {
        input.workItem.final = {
          decision: "INCONCLUSIVE",
          candidate: HEAD,
          acceptanceRevision: "acceptance-3",
        };
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["Ezra's final acceptance is not PASS for this candidate"],
    });
  });

  it("blocks when final acceptance PASSed a different candidate", () => {
    expect(
      decide((input) => {
        input.workItem.final = {
          decision: "PASS",
          candidate: STALE_HEAD,
          acceptanceRevision: "acceptance-3",
        };
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["Ezra's final acceptance is not PASS for this candidate"],
    });
  });

  it("blocks when final acceptance used a different acceptance revision", () => {
    expect(
      decide((input) => {
        input.workItem.acceptance = { revision: "acceptance-4" };
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["Final acceptance used a different acceptance revision"],
    });
  });

  it("blocks a final acceptance when the work item has no acceptance record", () => {
    expect(
      decide((input) => {
        input.workItem.acceptance = null;
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["Final acceptance used a different acceptance revision"],
    });
  });

  it("blocks when Micaiah's review is not CLEAR", () => {
    expect(
      decide((input) => {
        input.workItem.reviews = {
          micaiah: { decision: "INCONCLUSIVE", candidate: HEAD },
          luke: { decision: "CLEAR", candidate: HEAD },
        };
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["micaiah review is not CLEAR for this candidate"],
    });
  });

  it("blocks when Luke's CLEAR review was for a different candidate", () => {
    expect(
      decide((input) => {
        input.workItem.reviews = {
          micaiah: { decision: "CLEAR", candidate: HEAD },
          luke: { decision: "CLEAR", candidate: STALE_HEAD },
        };
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["luke review is not CLEAR for this candidate"],
    });
  });

  it("blocks on both reviewers when no reviews are recorded", () => {
    expect(
      decide((input) => {
        input.workItem.reviews = null;
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: [
        "micaiah review is not CLEAR for this candidate",
        "luke review is not CLEAR for this candidate",
      ],
    });
  });

  it("blocks when a required check is reported only by an unexpected app", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { app: { id: OTHER_APP } });
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: ["smoke reported by an unexpected app"],
    });
  });

  it("ignores an unexpected app's run when the required app also reported", () => {
    expect(
      decide((input) => {
        input.checkRuns.push(
          checkRun("smoke", 900, {
            app: { id: OTHER_APP },
            conclusion: "failure",
            started_at: "2026-11-10T11:00:00Z",
          }),
        );
      }).verdict,
    ).toBe("MERGE");
  });

  it("puts blockers ahead of repairs and pending work, reporting all three", () => {
    expect(
      decide((input) => {
        pull(input).head.sha = STALE_HEAD;
        pull(input).mergeable = null;
        setRun(input, "smoke", { conclusion: "failure" });
      }),
    ).toEqual({
      verdict: "BLOCKED",
      reasons: [`PR head ${STALE_HEAD} is not the reviewed candidate ${HEAD}`],
      pending: ["GitHub mergeability is still being computed"],
      repairs: ["check smoke: failure"],
    });
  });
});

describe("evaluateReadiness WAIT", () => {
  it("waits for a required check that is still running", () => {
    expect(
      decide((input) => {
        setRun(input, "migrate", { status: "in_progress", conclusion: null });
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check migrate pending"] });
  });

  it("waits for a required check that is queued", () => {
    expect(
      decide((input) => {
        setRun(input, "migrate", { status: "queued", conclusion: null });
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check migrate pending"] });
  });

  it("waits for a required check that has not reported", () => {
    expect(
      decide((input) => {
        withoutRun(input, "smoke");
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check smoke missing"] });
  });

  it("treats a required check that passed only on another head as missing", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { head_sha: STALE_HEAD });
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check smoke missing"] });
  });

  it("waits while GitHub has not computed mergeability (null)", () => {
    expect(
      decide((input) => {
        pull(input).mergeable = null;
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: ["GitHub mergeability is still being computed"],
    });
  });

  it("waits while mergeability is absent from the observation", () => {
    expect(
      decide((input) => {
        pull(input).mergeable = undefined;
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: ["GitHub mergeability is still being computed"],
    });
  });

  it("waits while GitHub reports the mergeable state as unknown", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "unknown";
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: ["GitHub mergeability is still being computed"],
    });
  });

  it("waits for a required review provider that has not reviewed", () => {
    expect(
      decide((input) => {
        input.requiredBots = ["coderabbitai[bot]"];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: ["review provider coderabbitai[bot] has not reviewed this head"],
    });
  });

  it("waits for a review provider whose review is for an older head", () => {
    expect(
      decide((input) => {
        input.requiredBots = ["coderabbitai[bot]"];
        input.reviews = [review("coderabbitai[bot]", "COMMENTED", STALE_HEAD)];
      }).verdict,
    ).toBe("WAIT");
  });

  it("does not accept another reviewer's review of this head for a review provider", () => {
    expect(
      decide((input) => {
        input.requiredBots = ["coderabbitai[bot]"];
        input.reviews = [review("alice", "COMMENTED")];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: ["review provider coderabbitai[bot] has not reviewed this head"],
    });
  });

  it("accepts a review provider that reviewed this head", () => {
    expect(
      decide((input) => {
        input.requiredBots = ["coderabbitai[bot]"];
        input.reviews = [review("coderabbitai[bot]", "COMMENTED")];
      }).verdict,
    ).toBe("MERGE");
  });
});

describe("evaluateReadiness REPAIR", () => {
  it("repairs a failed required check", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { conclusion: "failure" });
      }),
    ).toEqual({
      verdict: "REPAIR",
      reasons: ["check smoke: failure"],
      pending: [],
      repair: {
        acceptance: [],
        implementation: ["check smoke: failure"],
        source: "readiness",
      },
    });
  });

  it.each(["timed_out", "cancelled", "action_required", "startup_failure"])(
    "repairs a required check that concluded %s",
    (conclusion) => {
      expect(
        decide((input) => {
          setRun(input, "smoke", { conclusion });
        }).verdict,
      ).toBe("REPAIR");
    },
  );

  it.each(["neutral", "skipped"])(
    "counts a required check that concluded %s as passing",
    (conclusion) => {
      expect(
        decide((input) => {
          setRun(input, "smoke", { conclusion });
        }).verdict,
      ).toBe("MERGE");
    },
  );

  it("repairs a PR that conflicts with its base", () => {
    expect(
      decide((input) => {
        pull(input).mergeable = false;
        pull(input).mergeable_state = "dirty";
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      reasons: ["The PR conflicts with its base"],
    });
  });

  it("treats mergeable false as a conflict whatever the mergeable state says", () => {
    expect(
      decide((input) => {
        pull(input).mergeable = false;
      }).verdict,
    ).toBe("REPAIR");
  });

  it("treats a dirty mergeable state as a conflict", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "dirty";
      }).verdict,
    ).toBe("REPAIR");
  });

  it("repairs a branch that is behind under strict protection", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "behind";
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      reasons: ["Strict protection requires updating the branch with its base"],
    });
  });

  it("does not require updating a branch that is behind without strict protection", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "behind";
        input.protection = {
          ...input.protection,
          required_status_checks: {
            strict: false,
            checks: REQUIRED.map((context) => ({
              context,
              app_id: ACTIONS_APP,
            })),
          },
        };
      }).verdict,
    ).toBe("MERGE");
  });

  it("repairs a behind branch when a ruleset makes the checks strict", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "behind";
        input.protection = null;
        input.rules = [
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: true,
              required_status_checks: [
                { context: "smoke", integration_id: ACTIONS_APP },
              ],
            },
          },
        ];
      }).verdict,
    ).toBe("REPAIR");
  });

  it("repairs a behind branch when any one required check is strict", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "behind";
        input.protection = {
          ...input.protection,
          required_status_checks: {
            strict: false,
            checks: REQUIRED.map((context) => ({
              context,
              app_id: ACTIONS_APP,
            })),
          },
        };
        input.rules = [
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: true,
              required_status_checks: [
                { context: "smoke", integration_id: ACTIONS_APP },
              ],
            },
          },
        ];
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      reasons: ["Strict protection requires updating the branch with its base"],
    });
  });

  // An undispositioned item is Samson's to judge in the next feedback round;
  // a REPAIR would hand Bezalel a bare link he cannot act on.
  it("waits on an unresolved review thread with no disposition", () => {
    expect(
      decide((input) => {
        input.threads = [unresolvedThread()];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`Review thread ${THREAD_URL} awaits disposition`],
    });
  });

  it("names an unresolved thread by its id when it has no comments", () => {
    expect(
      decide((input) => {
        input.threads = [
          { ...unresolvedThread("PRRT_7"), comments: { nodes: [] } },
        ];
      }),
    ).toMatchObject({ reasons: ["Review thread PRRT_7 awaits disposition"] });
  });

  it("waits until a dispositioned thread is resolved", () => {
    expect(
      decide((input) => {
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = {
          PRRT_1: {
            action: "rebut",
            reason: "False positive",
            head: HEAD,
            lastComment: "C2",
          },
        };
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [
        `Review thread ${THREAD_URL} is dispositioned (rebut) but not resolved`,
      ],
    });
  });

  it("accepts a dispositioned thread once it is resolved", () => {
    expect(
      decide((input) => {
        input.threads = [{ ...unresolvedThread("PRRT_1"), isResolved: true }];
        input.dispositions = {
          PRRT_1: {
            action: "rebut",
            reason: "False positive",
            head: HEAD,
            lastComment: "C2",
          },
        };
      }).verdict,
    ).toBe("MERGE");
  });

  it("re-surfaces a dispositioned thread when someone replies after the disposition", () => {
    expect(
      decide((input) => {
        const thread = unresolvedThread("PRRT_1");
        thread.comments.nodes.push({
          id: "C3",
          url: `${THREAD_URL}3`,
          body: "That rebuttal is wrong",
        });
        input.threads = [thread];
        input.dispositions = {
          PRRT_1: {
            action: "rebut",
            reason: "False positive",
            head: HEAD,
            lastComment: "C2",
          },
        };
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`Review thread ${THREAD_URL} awaits disposition`],
    });
  });

  it("does not let the factory's own reply re-surface a dispositioned thread", () => {
    expect(
      decide((input) => {
        const thread = unresolvedThread("PRRT_1");
        thread.comments.nodes.push({
          id: "C3",
          url: `${THREAD_URL}3`,
          body: `Not a defect.\n\n${FACTORY_MARKER}`,
        });
        input.threads = [thread];
        input.dispositions = {
          PRRT_1: {
            action: "rebut",
            reason: "False positive",
            head: HEAD,
            lastComment: "C2",
          },
        };
      }).reasons,
    ).toEqual([
      `Review thread ${THREAD_URL} is dispositioned (rebut) but not resolved`,
    ]);
  });

  it("does not accept a legacy thread disposition that names no last comment", () => {
    expect(
      decide((input) => {
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = {
          PRRT_1: { action: "rebut", reason: "False positive", head: HEAD },
        };
      }).reasons,
    ).toEqual([`Review thread ${THREAD_URL} awaits disposition`]);
  });

  it("ignores a resolved review thread", () => {
    expect(
      decide((input) => {
        input.threads = [{ ...unresolvedThread(), isResolved: true }];
      }).verdict,
    ).toBe("MERGE");
  });

  // GitHub's conversation-resolution rule counts outdated threads too.
  it("waits on an outdated unresolved thread that has no disposition", () => {
    expect(
      decide((input) => {
        input.threads = [{ ...unresolvedThread(), isOutdated: true }];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`Review thread ${THREAD_URL} awaits disposition`],
    });
  });

  it("repairs a thread accepted as a defect that this head has not fixed", () => {
    expect(
      decide((input) => {
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = {
          PRRT_1: {
            action: "fix-implementation",
            reason: "Missing null check",
            head: HEAD,
            lastComment: "C2",
          },
        };
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      repair: {
        acceptance: [],
        implementation: [
          `Review thread ${THREAD_URL} was accepted as a defect and is not fixed on this head: Missing null check`,
        ],
        source: "readiness",
      },
    });
  });

  it("waits for the resolution of a thread fixed by a later head", () => {
    expect(
      decide((input) => {
        Object.assign(input.workItem.final!, { taskStatus: "DONE" });
        for (const review of Object.values(input.workItem.reviews!))
          Object.assign(review, {
            acceptance: input.workItem.acceptance!.revision,
          });
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = {
          PRRT_1: {
            action: "fix-acceptance",
            reason: "Oracle missed a case",
            head: STALE_HEAD,
            acceptanceRevision: "acceptance-2",
            lastComment: "C2",
          },
        };
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [
        `Review thread ${THREAD_URL} is dispositioned (fix-acceptance) but not resolved`,
      ],
    });
  });

  it("waits on new top-level feedback that has no disposition", () => {
    expect(
      decide((input) => {
        input.topLevelFeedback = [
          {
            id: "comment-77",
            url: "https://github.com/Asymmetric-al/core/pull/42#issuecomment-77",
          },
        ];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [
        "New feedback https://github.com/Asymmetric-al/core/pull/42#issuecomment-77 awaits disposition",
      ],
    });
  });

  it("re-surfaces a comment edited after its disposition", () => {
    expect(
      decide((input) => {
        input.topLevelFeedback = [
          { id: "comment-77", updatedAt: "2026-11-10T12:00:00Z" },
        ];
        input.dispositions = {
          "comment-77": {
            action: "decline-nit",
            updatedAt: "2026-11-10T11:00:00Z",
          },
        };
      }).verdict,
    ).toBe("WAIT");
  });

  it("accepts top-level feedback that has a disposition", () => {
    expect(
      decide((input) => {
        input.topLevelFeedback = [{ id: "comment-77" }];
        input.dispositions = { "comment-77": { action: "decline-nit" } };
      }).verdict,
    ).toBe("MERGE");
  });

  // A standing change request is the reviewer's to lift: it holds the PR for
  // a person (PR_READY) and never sends Bezalel a repair with no content.
  it("holds for a person while a reviewer's change request stands", () => {
    expect(
      decide((input) => {
        input.reviews = [review("alice", "CHANGES_REQUESTED")];
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [
        ALL_PASSED,
        "Change request from alice stands until alice approves or it is dismissed",
      ],
      humanReviewPending: true,
    });
  });

  it("holds when one reviewer requests changes even though another approved", () => {
    expect(
      decide((input) => {
        input.reviews = [
          review("alice", "CHANGES_REQUESTED"),
          review("bob", "APPROVED"),
        ];
      }).verdict,
    ).toBe("PR_READY");
  });

  it("holds when a reviewer's latest review requests changes after approving", () => {
    expect(
      decide((input) => {
        input.reviews = [
          review("alice", "APPROVED"),
          review("alice", "CHANGES_REQUESTED"),
        ];
      }).verdict,
    ).toBe("PR_READY");
  });

  it("keeps a change request standing after the same reviewer only comments", () => {
    expect(
      decide((input) => {
        input.reviews = [
          review("alice", "CHANGES_REQUESTED"),
          review("alice", "COMMENTED"),
        ];
      }).verdict,
    ).toBe("PR_READY");
  });

  it("keeps a change request on an older head standing after the head moves", () => {
    expect(
      decide((input) => {
        input.reviews = [review("alice", "CHANGES_REQUESTED", STALE_HEAD)];
      }),
    ).toMatchObject({
      verdict: "PR_READY",
      reasons: [
        ALL_PASSED,
        "Change request from alice stands until alice approves or it is dismissed",
      ],
    });
  });

  it("clears a change request that was dismissed", () => {
    expect(
      decide((input) => {
        input.reviews = [review("alice", "DISMISSED", STALE_HEAD)];
      }).verdict,
    ).toBe("MERGE");
  });

  it("treats a change request Samson rebutted as human-pending, not a repair", () => {
    expect(
      decide((input) => {
        input.reviews = [
          {
            ...review("alice", "CHANGES_REQUESTED"),
            id: 9,
            body: "Wrong approach",
          },
        ];
        input.topLevelFeedback = [{ id: "review-9" }];
        input.dispositions = { "review-9": { action: "rebut" } };
      }),
    ).toMatchObject({ verdict: "PR_READY", humanReviewPending: true });
  });

  it("waits on a failed check whose rerun Samson requested", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { conclusion: "failure" });
        input.dispositions = { "check-503": { action: "rerun-flake" } };
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: ["check smoke: failure rerun requested"],
    });
  });

  it("blocks a failed required check Samson dismissed instead of fixing or rerunning", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { conclusion: "failure" });
        input.dispositions = { "check-503": { action: "rebut" } };
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      reasons: [
        "Required check smoke: failure was dispositioned rebut; a required check must pass",
      ],
    });
  });

  it("clears a change request the same reviewer later approved", () => {
    expect(
      decide((input) => {
        input.reviews = [
          review("alice", "CHANGES_REQUESTED"),
          review("alice", "APPROVED"),
        ];
      }).verdict,
    ).toBe("MERGE");
  });

  it("repairs when the governing issue context changed", () => {
    expect(
      decide((input) => {
        input.contextFingerprint = {
          recorded: "context-7",
          current: "context-8",
        };
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      reasons: [
        "Governing issue context changed; acceptance must be refreshed",
      ],
      repair: {
        acceptance: [
          "Governing issue context changed; acceptance must be refreshed",
        ],
        implementation: [],
        source: "readiness",
      },
    });
  });

  it("asks for a base integration, not an implementation repair, for a conflict", () => {
    expect(
      decide((input) => {
        pull(input).mergeable = false;
        pull(input).mergeable_state = "dirty";
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      integrate: true,
      repair: { acceptance: [], implementation: [], source: "readiness" },
    });
  });

  it("puts repairs ahead of pending work, reporting both", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { conclusion: "failure" });
        setRun(input, "migrate", { status: "in_progress", conclusion: null });
      }),
    ).toEqual({
      verdict: "REPAIR",
      reasons: ["check smoke: failure"],
      pending: ["check migrate pending"],
      repair: {
        acceptance: [],
        implementation: ["check smoke: failure"],
        source: "readiness",
      },
    });
  });
});

describe("evaluateReadiness latest check attempt wins", () => {
  it("waits on a newer pending rerun even though an older attempt succeeded", () => {
    expect(
      decide((input) => {
        input.checkRuns.push(
          checkRun("smoke", 901, {
            status: "in_progress",
            conclusion: null,
            started_at: "2026-11-10T12:00:00Z",
          }),
        );
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check smoke pending"] });
  });

  it("passes when a newer attempt succeeded after an older failure", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", {
          conclusion: "failure",
          started_at: "2026-11-10T09:00:00Z",
        });
        input.checkRuns.push(
          checkRun("smoke", 902, { started_at: "2026-11-10T12:00:00Z" }),
        );
      }).verdict,
    ).toBe("MERGE");
  });

  it("repairs when the newer attempt, listed first, failed after an older success", () => {
    expect(
      decide((input) => {
        input.checkRuns.unshift(
          checkRun("smoke", 903, {
            conclusion: "failure",
            started_at: "2026-11-10T12:00:00Z",
          }),
        );
      }),
    ).toMatchObject({ verdict: "REPAIR", reasons: ["check smoke: failure"] });
  });

  // Start time is the primary order; the run id only breaks a tie. A job that
  // waited for a runner can start after a later-created attempt.
  it("lets the later-started attempt win even when it has the lower run id", () => {
    expect(
      decide((input) => {
        input.checkRuns.push(
          checkRun("smoke", 499, {
            conclusion: "failure",
            started_at: "2026-11-10T12:00:00Z",
          }),
        );
      }),
    ).toMatchObject({ verdict: "REPAIR", reasons: ["check smoke: failure"] });
  });

  it("breaks a start-time tie with the higher run id", () => {
    expect(
      decide((input) => {
        input.checkRuns.push(checkRun("smoke", 904, { conclusion: "failure" }));
      }).verdict,
    ).toBe("REPAIR");
  });

  it("accepts any app when the required check names no app", () => {
    expect(
      decide((input) => {
        input.protection = {
          ...input.protection,
          required_status_checks: {
            strict: true,
            checks: REQUIRED.map((context) =>
              context === "smoke"
                ? { context }
                : { context, app_id: ACTIONS_APP },
            ),
          },
        };
        setRun(input, "smoke", { app: { id: OTHER_APP } });
      }).verdict,
    ).toBe("MERGE");
  });
});

describe("evaluateReadiness commit status fallback", () => {
  // A commit status carries no App identity, so only a required check that
  // names no App may be satisfied by one.
  function statusOnly(state: string, sha = HEAD) {
    return decide((input) => {
      withoutRun(input, "smoke");
      input.protection = {
        ...input.protection,
        required_status_checks: {
          strict: true,
          checks: REQUIRED.map((context) =>
            context === "smoke"
              ? { context }
              : { context, app_id: ACTIONS_APP },
          ),
        },
      };
      input.statuses = { sha, statuses: [{ context: "smoke", state }] };
    });
  }

  it("never satisfies an App-pinned required check with a commit status", () => {
    expect(
      decide((input) => {
        withoutRun(input, "smoke");
        input.statuses = {
          sha: HEAD,
          statuses: [{ context: "smoke", state: "success" }],
        };
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check smoke missing"] });
  });

  it("passes a required check reported as a successful commit status", () => {
    expect(statusOnly("success").verdict).toBe("MERGE");
  });

  it("waits on a pending commit status", () => {
    expect(statusOnly("pending")).toEqual({
      verdict: "WAIT",
      reasons: ["check smoke pending"],
    });
  });

  it("repairs a failed commit status", () => {
    expect(statusOnly("failure")).toMatchObject({
      verdict: "REPAIR",
      reasons: ["check smoke: failure"],
    });
  });

  it("repairs an errored commit status", () => {
    expect(statusOnly("error")).toMatchObject({
      verdict: "REPAIR",
      reasons: ["check smoke: error"],
    });
  });

  it("ignores a commit status observed for another head", () => {
    expect(statusOnly("success", STALE_HEAD)).toEqual({
      verdict: "WAIT",
      reasons: ["check smoke missing"],
    });
  });

  it("does not let a commit status override a failed check run of the same name", () => {
    expect(
      decide((input) => {
        setRun(input, "smoke", { conclusion: "failure" });
        input.statuses = {
          sha: HEAD,
          statuses: [{ context: "smoke", state: "success" }],
        };
      }),
    ).toMatchObject({ verdict: "REPAIR", reasons: ["check smoke: failure"] });
  });
});

describe("evaluateReadiness PR_READY versus MERGE", () => {
  it("stops at PR_READY when the assignment end state is PR_READY", () => {
    expect(
      decide((input) => {
        input.workItem.assignment.endState = "PR_READY";
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Assignment end state is PR_READY"],
      humanReviewPending: false,
    });
  });

  it("stops at PR_READY while the operator merge hold is active", () => {
    expect(
      decide((input) => {
        input.factory = { mode: "run", mergeHold: true };
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Operator merge hold is active"],
      humanReviewPending: false,
    });
  });

  it.each(["drain", "stop"])(
    "stops at PR_READY while the factory mode is %s",
    (mode) => {
      expect(
        decide((input) => {
          input.factory = { mode, mergeHold: false };
        }).verdict,
      ).toBe("PR_READY");
    },
  );

  it("stops at PR_READY when the factory document is unavailable", () => {
    expect(
      decide((input) => {
        input.factory = undefined;
      }).verdict,
    ).toBe("PR_READY");
  });

  it("stops at PR_READY while the issue control is not run", () => {
    expect(
      decide((input) => {
        input.workItem.control = "hold";
      }).verdict,
    ).toBe("PR_READY");
  });

  it("stops at PR_READY with human review pending when GitHub reports blocked", () => {
    expect(
      decide((input) => {
        pull(input).mergeable_state = "blocked";
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Required human review pending (0/0)"],
      humanReviewPending: true,
    });
  });

  it("stops at PR_READY when required approvals are missing", () => {
    expect(
      decide((input) => {
        approvalsRequired(input, 1);
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Required human review pending (0/1)"],
      humanReviewPending: true,
    });
  });

  it("merges once the required approval is on this head", () => {
    expect(
      decide((input) => {
        approvalsRequired(input, 1);
        input.reviews = [review("alice", "APPROVED")];
      }).verdict,
    ).toBe("MERGE");
  });

  it("keeps an approval after the same reviewer only comments", () => {
    expect(
      decide((input) => {
        approvalsRequired(input, 1);
        input.reviews = [
          review("alice", "APPROVED"),
          review("alice", "COMMENTED"),
        ];
      }).verdict,
    ).toBe("MERGE");
  });

  it("does not count an approval given to an older head", () => {
    expect(
      decide((input) => {
        approvalsRequired(input, 1);
        input.reviews = [review("alice", "APPROVED", STALE_HEAD)];
      }).verdict,
    ).toBe("PR_READY");
  });

  it("counts repeated approvals from one reviewer once", () => {
    expect(
      decide((input) => {
        approvalsRequired(input, 2);
        input.reviews = [
          review("alice", "APPROVED"),
          review("alice", "APPROVED"),
        ];
      }),
    ).toMatchObject({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Required human review pending (1/2)"],
    });
  });

  it("merges with approvals from two distinct reviewers when two are required", () => {
    expect(
      decide((input) => {
        approvalsRequired(input, 2);
        input.reviews = [
          review("alice", "APPROVED"),
          review("bob", "APPROVED"),
        ];
      }).verdict,
    ).toBe("MERGE");
  });

  it("holds code-owner review as pending until GitHub reports the PR clean", () => {
    expect(
      decide((input) => {
        input.protection = {
          ...input.protection,
          required_pull_request_reviews: {
            required_approving_review_count: 0,
            require_code_owner_reviews: true,
          },
        };
        pull(input).mergeable_state = "unstable";
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Required human review pending (0/0, code owners)"],
      humanReviewPending: true,
    });
  });

  it("merges under code-owner review when GitHub reports the PR clean", () => {
    expect(
      decide((input) => {
        input.protection = {
          ...input.protection,
          required_pull_request_reviews: {
            required_approving_review_count: 0,
            require_code_owner_reviews: true,
          },
        };
      }).verdict,
    ).toBe("MERGE");
  });

  it("gates on checks required only by a ruleset", () => {
    expect(
      decide((input) => {
        input.rules = [
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: false,
              required_status_checks: [
                { context: "codeql", integration_id: ACTIONS_APP },
              ],
            },
          },
        ];
      }),
    ).toEqual({ verdict: "WAIT", reasons: ["check codeql missing"] });
  });

  it("gates on approvals required only by a ruleset", () => {
    expect(
      decide((input) => {
        input.rules = [
          {
            type: "pull_request",
            parameters: {
              required_approving_review_count: 1,
              require_code_owner_review: false,
            },
          },
        ];
      }),
    ).toMatchObject({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "Required human review pending (0/1)"],
    });
  });
});

describe("requiredChecksFromRules", () => {
  it("requires nothing without rules or protection", () => {
    expect(requiredChecksFromRules(undefined, null)).toEqual([]);
  });

  it("reads legacy branch protection checks with their app ids", () => {
    expect(
      requiredChecksFromRules([], {
        required_status_checks: {
          strict: true,
          checks: [
            { context: "ci-gate", app_id: ACTIONS_APP },
            { context: "Vercel", app_id: null },
          ],
        },
      }),
    ).toEqual([
      { context: "ci-gate", appId: ACTIONS_APP, strict: true },
      { context: "Vercel", appId: null, strict: true },
    ]);
  });

  it("reads ruleset checks with their integration ids", () => {
    expect(
      requiredChecksFromRules(
        [
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: false,
              required_status_checks: [
                { context: "smoke", integration_id: ACTIONS_APP },
                { context: "lint" },
              ],
            },
          },
        ],
        null,
      ),
    ).toEqual([
      { context: "smoke", appId: ACTIONS_APP, strict: false },
      { context: "lint", appId: null, strict: false },
    ]);
  });

  it("ignores rules that do not require status checks", () => {
    expect(
      requiredChecksFromRules(
        [
          {
            type: "pull_request",
            parameters: { required_approving_review_count: 1 },
          },
          { type: "deletion" },
        ],
        null,
      ),
    ).toEqual([]);
  });

  it("unions rulesets with legacy protection, keeping the ruleset entry for a shared context", () => {
    expect(
      requiredChecksFromRules(
        [
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: false,
              required_status_checks: [
                { context: "smoke", integration_id: ACTIONS_APP },
              ],
            },
          },
        ],
        {
          required_status_checks: {
            strict: true,
            checks: [
              { context: "smoke", app_id: OTHER_APP },
              { context: "ci-gate", app_id: ACTIONS_APP },
            ],
          },
        },
      ),
    ).toEqual([
      { context: "smoke", appId: ACTIONS_APP, strict: false },
      { context: "ci-gate", appId: ACTIONS_APP, strict: true },
    ]);
  });

  it("keeps each ruleset's strict policy with its own checks", () => {
    expect(
      requiredChecksFromRules(
        [
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: true,
              required_status_checks: [{ context: "smoke" }],
            },
          },
          {
            type: "required_status_checks",
            parameters: {
              strict_required_status_checks_policy: false,
              required_status_checks: [{ context: "lint" }],
            },
          },
        ],
        null,
      ),
    ).toEqual([
      { context: "smoke", appId: null, strict: true },
      { context: "lint", appId: null, strict: false },
    ]);
  });
});

describe("requiredApprovalsFromRules", () => {
  it("requires no approvals without rules or protection", () => {
    expect(requiredApprovalsFromRules(undefined, null)).toEqual({
      count: 0,
      codeOwners: false,
    });
  });

  it("reads legacy protection review requirements", () => {
    expect(
      requiredApprovalsFromRules([], {
        required_pull_request_reviews: {
          required_approving_review_count: 2,
          require_code_owner_reviews: true,
        },
      }),
    ).toEqual({ count: 2, codeOwners: true });
  });

  it("takes the larger count when a ruleset requires more than protection", () => {
    expect(
      requiredApprovalsFromRules(
        [
          {
            type: "pull_request",
            parameters: { required_approving_review_count: 3 },
          },
        ],
        {
          required_pull_request_reviews: {
            required_approving_review_count: 1,
            require_code_owner_reviews: false,
          },
        },
      ),
    ).toEqual({ count: 3, codeOwners: false });
  });

  it("keeps the larger protection count when a ruleset requires fewer", () => {
    expect(
      requiredApprovalsFromRules(
        [
          {
            type: "pull_request",
            parameters: { required_approving_review_count: 1 },
          },
        ],
        {
          required_pull_request_reviews: {
            required_approving_review_count: 2,
            require_code_owner_reviews: false,
          },
        },
      ),
    ).toEqual({ count: 2, codeOwners: false });
  });

  it("requires code owners when any ruleset requires them", () => {
    expect(
      requiredApprovalsFromRules(
        [
          {
            type: "pull_request",
            parameters: {
              required_approving_review_count: 0,
              require_code_owner_review: true,
            },
          },
          {
            type: "pull_request",
            parameters: {
              required_approving_review_count: 0,
              require_code_owner_review: false,
            },
          },
        ],
        {
          required_pull_request_reviews: {
            required_approving_review_count: 0,
            require_code_owner_reviews: false,
          },
        },
      ),
    ).toEqual({ count: 0, codeOwners: true });
  });

  it("ignores review parameters on rules that are not pull_request rules", () => {
    expect(
      requiredApprovalsFromRules(
        [
          {
            type: "required_status_checks",
            parameters: {
              required_approving_review_count: 5,
              require_code_owner_review: true,
            },
          },
        ],
        null,
      ),
    ).toEqual({ count: 0, codeOwners: false });
  });
});

describe("evaluateReadiness current scope authority (I7)", () => {
  it("stops at PR_READY when the current scope no longer includes the issue", () => {
    expect(
      decide((input) => {
        input.scope = { issues: [13], endState: "MERGED" };
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [ALL_PASSED, "The current scope no longer includes issue #12"],
      humanReviewPending: false,
    });
  });

  it("stops at PR_READY when the current scope ends the issue at PR_READY", () => {
    expect(
      decide((input) => {
        input.scope = { issues: [ISSUE], endState: "PR_READY" };
      }).reasons,
    ).toEqual([
      ALL_PASSED,
      "The current scope's end state for issue #12 is PR_READY",
    ]);
  });

  it("lets a per-issue end state override the scope's default", () => {
    expect(
      decide((input) => {
        input.scope = {
          issues: [ISSUE],
          endState: "MERGED",
          endStates: { [ISSUE]: "PR_READY" },
        };
      }).verdict,
    ).toBe("PR_READY");
    expect(
      decide((input) => {
        input.scope = {
          issues: [ISSUE],
          endState: "PR_READY",
          endStates: { [ISSUE]: "MERGED" },
        };
      }).verdict,
    ).toBe("MERGE");
  });

  it("never merges without a readable scope", () => {
    expect(
      decide((input) => {
        input.scope = null;
      }).verdict,
    ).toBe("PR_READY");
  });
});

describe("evaluateReadiness configured review providers", () => {
  const CODERABBIT = "coderabbitai[bot]";
  const SKIP = "Review skipped";
  const provider = (required = true) => ({
    login: CODERABBIT,
    required,
    skipMarkers: [SKIP],
  });

  it("waits for a required provider that has not reviewed this head", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [provider()];
        input.reviews = [review(CODERABBIT, "COMMENTED", STALE_HEAD)];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`review provider ${CODERABBIT} has not reviewed this head`],
    });
  });

  it("accepts a required provider that reviewed this head", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [provider()];
        input.reviews = [review(CODERABBIT, "COMMENTED")];
      }).verdict,
    ).toBe("MERGE");
  });

  it("ignores a provider that is not required", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [provider(false)];
      }).verdict,
    ).toBe("MERGE");
  });

  it("stops waiting on a skip marker posted after publication, but never calls it clean", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [provider()];
        input.comments = [
          {
            id: 5,
            user: { login: CODERABBIT },
            body: `> ${SKIP}: auto reviews are disabled`,
            created_at: "2026-11-10T09:05:00Z",
            updated_at: "2026-11-10T09:05:00Z",
          },
        ];
      }),
    ).toEqual({
      verdict: "PR_READY",
      reasons: [
        ALL_PASSED,
        `Review provider ${CODERABBIT} skipped this head; a person must confirm review coverage`,
      ],
      humanReviewPending: true,
    });
  });

  it("does not accept a skip marker older than the published head", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [provider()];
        input.comments = [
          {
            id: 5,
            user: { login: CODERABBIT },
            body: SKIP,
            created_at: "2026-11-10T08:00:00Z",
            updated_at: "2026-11-10T08:00:00Z",
          },
        ];
      }).verdict,
    ).toBe("WAIT");
  });

  it("does not accept another author's skip marker", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [provider()];
        input.comments = [
          {
            id: 5,
            user: { login: "alice" },
            body: SKIP,
            updated_at: "2026-11-10T09:05:00Z",
          },
        ];
      }).verdict,
    ).toBe("WAIT");
  });
});

describe("evaluateReadiness provider coverage by check run and first-head review", () => {
  const CODERABBIT = "coderabbitai[bot]";
  const CURSOR = "cursor[bot]";
  const byCheck = {
    login: CODERABBIT,
    required: true,
    skipMarkers: [],
    appSlug: "coderabbitai",
  };
  const once = {
    login: CURSOR,
    required: true,
    skipMarkers: [],
    appSlug: "cursor",
    coverage: "once",
  };
  const appRun = (slug: string, overrides: Partial<CheckRun> = {}) =>
    checkRun(slug, 900, {
      app: { id: 77, slug },
      ...overrides,
    } as Partial<CheckRun>);

  it("accepts the provider's completed check run on this head as coverage", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [byCheck];
        input.checkRuns = [...(input.checkRuns ?? []), appRun("coderabbitai")];
      }).verdict,
    ).toBe("MERGE");
  });

  it.each(["skipped", "neutral", "cancelled", "failure"])(
    "does not count a check run that ended %s as a review: a person confirms coverage",
    (conclusion) => {
      const result = decide((input) => {
        input.reviewProviders = [byCheck];
        input.checkRuns = [
          ...(input.checkRuns ?? []),
          appRun("coderabbitai", { conclusion } as Partial<CheckRun>),
        ];
      });
      expect(result).toMatchObject({
        verdict: "PR_READY",
        humanReviewPending: true,
      });
      expect(result.reasons).toContain(
        `Review provider ${CODERABBIT} skipped this head; a person must confirm review coverage`,
      );
    },
  );

  it("keeps an earlier-head review of a once-per-pull-request provider when its check on this head was skipped", () => {
    const result = decide((input) => {
      input.reviewProviders = [once];
      input.reviews = [review(CURSOR, "COMMENTED", STALE_HEAD)];
      input.checkRuns = [
        ...(input.checkRuns ?? []),
        appRun("cursor", { conclusion: "skipped" } as Partial<CheckRun>),
      ];
    });
    expect(result.verdict).toBe("MERGE");
  });

  it("waits while the provider's check run on this head is still running", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [byCheck];
        input.checkRuns = [
          ...(input.checkRuns ?? []),
          appRun("coderabbitai", { status: "in_progress", conclusion: null }),
        ];
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`review provider ${CODERABBIT} has not reviewed this head`],
    });
  });

  it("does not accept a check run for another head or from another app", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [byCheck];
        input.checkRuns = [
          ...(input.checkRuns ?? []),
          appRun("coderabbitai", { head_sha: STALE_HEAD }),
          appRun("someone-else"),
        ];
      }).verdict,
    ).toBe("WAIT");
  });

  it("does not accept a check run when no app is configured for the provider", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [
          { login: CODERABBIT, required: true, skipMarkers: [] },
        ];
        input.checkRuns = [...(input.checkRuns ?? []), appRun("coderabbitai")];
      }).verdict,
    ).toBe("WAIT");
  });

  it("accepts a once-per-pull-request provider that reviewed an earlier head, and says so", () => {
    const result = decide((input) => {
      input.reviewProviders = [once];
      input.reviews = [review(CURSOR, "COMMENTED", STALE_HEAD)];
    });
    expect(result.verdict).toBe("MERGE");
    expect(result.reasons).toContain(
      `Review provider ${CURSOR} reviews each pull request once and reviewed an earlier head`,
    );
  });

  it("still waits for a once-per-pull-request provider that never reviewed", () => {
    expect(
      decide((input) => {
        input.reviewProviders = [once];
      }).verdict,
    ).toBe("WAIT");
  });

  it("reads the app and coverage settings and refuses malformed ones", () => {
    expect(
      reviewProvidersFrom({
        reviewProviders: [
          { login: CURSOR, appSlug: "cursor", coverage: "once" },
        ],
      }),
    ).toEqual([
      {
        login: CURSOR,
        required: true,
        skipMarkers: [],
        appSlug: "cursor",
        coverage: "once",
      },
    ]);
    expect(() =>
      reviewProvidersFrom({
        reviewProviders: [{ login: CURSOR, coverage: "sometimes" }],
      }),
    ).toThrow(/reviewProviders/);
    expect(() =>
      reviewProvidersFrom({
        reviewProviders: [{ login: CURSOR, appSlug: "" }],
      }),
    ).toThrow(/reviewProviders/);
  });
});

describe("reviewProvidersFrom", () => {
  it("defaults to no providers", () => {
    expect(reviewProvidersFrom({})).toEqual([]);
  });

  it("reads providers, treating an unstated requirement as required", () => {
    expect(
      reviewProvidersFrom({
        reviewProviders: [
          { login: "coderabbitai[bot]", skipMarkers: ["Review skipped"] },
          { login: "cursor[bot]", required: false },
        ],
      }),
    ).toEqual([
      {
        login: "coderabbitai[bot]",
        required: true,
        skipMarkers: ["Review skipped"],
      },
      { login: "cursor[bot]", required: false, skipMarkers: [] },
    ]);
  });

  it.each([
    [{ reviewProviders: "coderabbit" }],
    [{ reviewProviders: [{ required: true }] }],
    [{ reviewProviders: [{ login: "x", skipMarkers: [""] }] }],
    [{ reviewProviders: [{ login: "x", required: "yes" }] }],
  ])("refuses malformed provider configuration %#", (config) => {
    expect(() => reviewProvidersFrom(config)).toThrow(/reviewProviders/);
  });
});

describe("scopeMergeAuthority", () => {
  it("authorizes only an in-scope issue whose effective end state is MERGED", () => {
    expect(
      scopeMergeAuthority({ issues: [12], endState: "MERGED" }, 12),
    ).toEqual({ ok: true });
    expect(
      scopeMergeAuthority({ issues: [12], endState: "MERGED" }, 13).ok,
    ).toBe(false);
    expect(scopeMergeAuthority(undefined, 12).ok).toBe(false);
  });
});

describe("reviewStanding", () => {
  it("binds approvals to the head and keeps change requests across heads", () => {
    expect(
      reviewStanding(
        [
          review("alice", "CHANGES_REQUESTED", STALE_HEAD),
          review("bob", "APPROVED", STALE_HEAD),
          review("carol", "APPROVED"),
          review("dave", "CHANGES_REQUESTED", STALE_HEAD),
          review("dave", "APPROVED"),
        ],
        HEAD,
      ),
    ).toEqual({ changesRequested: ["alice"], approved: 2 });
  });
});

describe("feedback identity", () => {
  const thread = (
    nodes: ThreadComment[],
    recent?: ThreadComment[],
  ): Thread => ({
    id: "PRRT_1",
    isResolved: false,
    isOutdated: false,
    comments: { nodes },
    ...(recent ? { recent: { nodes: recent } } : {}),
  });

  it("names a thread's last comment, skipping the factory's own replies", () => {
    expect(
      threadLastComment(
        thread([
          { id: "C1", url: "u1", body: "Bug" },
          { id: "C2", url: "u2", body: `Rebutted\n\n${FACTORY_MARKER}` },
        ]),
      ),
    ).toBe("C1");
  });

  it("prefers the thread's most recent comments when GitHub lists them", () => {
    expect(
      threadLastComment(
        thread(
          [{ id: "C1", url: "u1", body: "Bug" }],
          [{ id: "C60", url: "u60", body: "New reply" }],
        ),
      ),
    ).toBe("C60");
  });

  it("matches a disposition only for the same last comment and edit time", () => {
    const item = { id: "PRRT_1", lastComment: "C2" };
    expect(
      currentDisposition(
        { PRRT_1: { action: "rebut", lastComment: "C2" } },
        item,
      ),
    ).toMatchObject({ action: "rebut" });
    expect(
      currentDisposition(
        { PRRT_1: { action: "rebut", lastComment: "C1" } },
        item,
      ),
    ).toBeNull();
    expect(currentDisposition({}, item)).toBeNull();
    const comment = { id: "comment-7", updatedAt: "2026-11-10T10:00:00Z" };
    expect(
      currentDisposition(
        {
          "comment-7": {
            action: "obsolete",
            updatedAt: "2026-11-10T10:00:00Z",
          },
        },
        comment,
      ),
    ).not.toBeNull();
    expect(
      currentDisposition({ "comment-7": { action: "obsolete" } }, comment),
    ).toBeNull();
  });

  it("lists top-level comments and non-empty review bodies, never the factory's own", () => {
    expect(
      topLevelFeedback({
        comments: [
          {
            id: 1,
            user: { login: "alice" },
            body: "Do not merge yet",
            html_url: "c1",
            updated_at: "2026-11-10T10:00:00Z",
          },
          {
            id: 2,
            user: { login: "factory" },
            body: `PR_READY\n\n${FACTORY_MARKER}`,
            html_url: "c2",
          },
        ],
        reviews: [
          {
            ...review("bob", "COMMENTED"),
            id: 3,
            body: "Consider caching",
            html_url: "r3",
          },
          { ...review("carol", "APPROVED"), id: 4, body: "  ", html_url: "r4" },
          {
            ...review("factory", "COMMENTED"),
            id: 5,
            body: FACTORY_MARKER,
            html_url: "r5",
          },
        ],
      }),
    ).toEqual([
      { id: "review-3", url: "r3" },
      { id: "comment-1", url: "c1", updatedAt: "2026-11-10T10:00:00Z" },
    ]);
  });

  it("re-surfaces a person's edited comment but not a bot's self-updating status comment", () => {
    const items = topLevelFeedback({
      comments: [
        {
          id: 1,
          user: { login: "alice", type: "User" },
          body: "Do not merge",
          html_url: "c1",
          updated_at: "2026-11-10T10:00:00Z",
        },
        {
          id: 2,
          user: { login: "vercel[bot]", type: "Bot" },
          body: "Preview ready",
          html_url: "c2",
          updated_at: "2026-11-10T10:05:00Z",
        },
      ],
      reviews: [],
    });
    expect(items).toEqual([
      { id: "comment-1", url: "c1", updatedAt: "2026-11-10T10:00:00Z" },
      { id: "comment-2", url: "c2" },
    ]);
  });

  it("presents outdated and undispositioned items to Samson with their identity", () => {
    const items = feedbackItems({
      threads: [
        {
          ...thread([{ id: "C1", databaseId: 11, url: "t1", body: "Bug" }]),
          isOutdated: true,
          path: "a.ts",
          line: 3,
        },
        { ...thread([{ id: "C9", url: "t9", body: "Old" }]), id: "PRRT_9" },
        {
          ...thread([{ id: "C8", url: "t8", body: "Done" }]),
          id: "PRRT_8",
          isResolved: true,
        },
      ],
      reviews: [],
      comments: [
        {
          id: 7,
          user: { login: "alice" },
          body: "Why?",
          html_url: "c7",
          updated_at: "2026-11-10T10:00:00Z",
        },
      ],
      failedRuns: [
        { id: 503, name: "smoke", conclusion: "failure", html_url: "r503" },
      ],
      dispositions: { PRRT_9: { action: "rebut", lastComment: "C9" } },
    });
    expect(items.map((item: { id: string }) => item.id)).toEqual([
      "PRRT_1",
      "comment-7",
      "check-503",
    ]);
    expect(items[0]).toMatchObject({
      kind: "review-thread",
      outdated: true,
      lastComment: "C1",
      replyTo: 11,
      url: "t1",
    });
    expect(items[1]).toMatchObject({
      kind: "comment",
      updatedAt: "2026-11-10T10:00:00Z",
    });
    expect(items[2]).toMatchObject({ kind: "failed-check", name: "smoke" });
  });
});

// publication-merge#4 Case 2: a reply inside a thread the factory already
// resolved is still feedback. The disposition names the last comment it
// judged, so a newer non-factory reply re-surfaces the resolved thread.
describe("resolved threads with a newer reply", () => {
  function resolvedWithReply(): Thread {
    return {
      id: "PRRT_1",
      isResolved: true,
      isOutdated: false,
      comments: {
        nodes: [
          {
            id: "C1",
            databaseId: 9001,
            url: THREAD_URL,
            body: "Tenant check missing",
          },
          {
            id: "C2",
            databaseId: 9002,
            url: REPLY_URL,
            body: `Checked in withTenant (api.ts:40).\n\n${FACTORY_MARKER}`,
          },
          {
            id: "C3",
            databaseId: 9003,
            url: `${THREAD_URL}3`,
            body: "Your rebuttal is wrong, do not merge",
          },
        ],
      },
    };
  }
  const rebutted = {
    PRRT_1: {
      action: "rebut",
      reason: "False positive",
      head: HEAD,
      lastComment: "C1",
    },
  };

  it("waits on a resolved thread someone replied to after its disposition", () => {
    expect(
      decide((input) => {
        input.threads = [resolvedWithReply()];
        input.dispositions = rebutted;
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`Review thread ${THREAD_URL} awaits disposition`],
    });
  });

  it("presents that resolved thread to Samson again, marked resolved", () => {
    const items = feedbackItems({
      threads: [resolvedWithReply()],
      dispositions: rebutted,
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "PRRT_1",
      kind: "review-thread",
      lastComment: "C3",
      resolved: true,
      replyTo: 9001,
    });
  });

  it("keeps a resolved thread settled while its disposition is current", () => {
    const thread = resolvedWithReply();
    thread.comments.nodes.pop();
    expect(
      feedbackItems({ threads: [thread], dispositions: rebutted }),
    ).toEqual([]);
    expect(
      decide((input) => {
        input.threads = [thread];
        input.dispositions = rebutted;
      }).verdict,
    ).toBe("MERGE");
  });

  it("leaves a thread a person resolved without any disposition alone", () => {
    expect(
      feedbackItems({ threads: [resolvedWithReply()], dispositions: {} }),
    ).toEqual([]);
  });

  it("settles a resolved thread whose accepted defect an earlier head already fixed", () => {
    expect(
      decide((input) => {
        input.threads = [{ ...unresolvedThread("PRRT_1"), isResolved: true }];
        input.dispositions = {
          PRRT_1: {
            action: "fix-implementation",
            reason: "Missing null check",
            head: STALE_HEAD,
            lastComment: "C2",
            status: "fixed",
          },
        };
      }).verdict,
    ).toBe("MERGE");
  });

  it("repairs a resolved thread accepted as a defect that this head has not fixed", () => {
    expect(
      decide((input) => {
        input.threads = [{ ...unresolvedThread("PRRT_1"), isResolved: true }];
        input.dispositions = {
          PRRT_1: {
            action: "fix-implementation",
            reason: "Missing null check",
            head: HEAD,
            lastComment: "C2",
          },
        };
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      repair: {
        implementation: [
          `Review thread ${THREAD_URL} was accepted as a defect and is not fixed on this head: Missing null check`,
        ],
      },
    });
  });
});

// publication-merge#8 / readiness.ts:211: a base integration moves the head
// without fixing anything, so it never runs while an owner's repair is
// pending, and a head carried over an integration is not a fix.
describe("base integration never stands in for a pending repair", () => {
  function behind(input: ReadinessInput) {
    pull(input).mergeable_state = "behind";
  }
  const accepted = {
    PRRT_1: {
      action: "fix-implementation",
      reason: "Missing null check",
      head: HEAD,
      lastComment: "C2",
    },
  };

  it("asks for an integration when the branch is only behind", () => {
    expect(decide(behind)).toMatchObject({
      verdict: "REPAIR",
      integrate: true,
    });
  });

  it("returns an accepted defect to its owner instead of integrating the base", () => {
    const decision = decide((input) => {
      behind(input);
      input.threads = [unresolvedThread("PRRT_1")];
      input.dispositions = accepted;
    });
    expect(decision).toMatchObject({
      verdict: "REPAIR",
      repair: {
        implementation: [expect.stringContaining("Missing null check")],
      },
    });
    expect(decision).not.toHaveProperty("integrate");
  });

  it("returns a failed check to its owner instead of integrating a conflicting base", () => {
    const decision = decide((input) => {
      pull(input).mergeable = false;
      pull(input).mergeable_state = "dirty";
      setRun(input, "smoke", { conclusion: "failure" });
    });
    expect(decision).toMatchObject({
      verdict: "REPAIR",
      repair: { implementation: ["check smoke: failure"] },
    });
    expect(decision).not.toHaveProperty("integrate");
  });

  it("returns acceptance work to Ezra instead of integrating the base", () => {
    const decision = decide((input) => {
      behind(input);
      input.contextFingerprint = {
        recorded: "context-7",
        current: "context-8",
      };
    });
    expect(decision).toMatchObject({
      verdict: "REPAIR",
      repair: { acceptance: [expect.any(String)] },
    });
    expect(decision).not.toHaveProperty("integrate");
  });

  it("treats a fix accepted on the head this one was carried from as not fixed", () => {
    expect(
      decide((input) => {
        input.workItem.final = {
          decision: "PASS",
          candidate: HEAD,
          acceptanceRevision: "acceptance-3",
          carriedFrom: STALE_HEAD,
        } as ReadinessInput["workItem"]["final"];
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = {
          PRRT_1: { ...accepted.PRRT_1, head: STALE_HEAD },
        };
      }),
    ).toMatchObject({
      verdict: "REPAIR",
      repair: {
        implementation: [expect.stringContaining("not fixed on this head")],
      },
    });
  });
});

// A person who unresolves a thread the factory resolved is disagreeing, even
// without a reply: the thread goes back to Samson instead of being resolved
// again on the old disposition.
describe("a thread a person reopened after the factory resolved it", () => {
  const resolvedByFactory = {
    PRRT_1: {
      action: "rebut",
      reason: "False positive",
      head: HEAD,
      lastComment: "C2",
      resolvedAt: "2026-11-10T11:00:00Z",
    },
  };

  it("presents the reopened thread to Samson, flagged as reopened", () => {
    const items = feedbackItems({
      threads: [unresolvedThread("PRRT_1")],
      dispositions: resolvedByFactory,
    });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "PRRT_1",
      lastComment: "C2",
      resolved: false,
      reopened: true,
    });
  });

  it("waits for a new disposition instead of deciding on the old one", () => {
    expect(
      decide((input) => {
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = resolvedByFactory;
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [`Review thread ${THREAD_URL} awaits disposition`],
    });
  });

  it("still waits for the factory to resolve a dismissal it has not resolved yet", () => {
    const pendingResolution = {
      PRRT_1: { ...resolvedByFactory.PRRT_1, resolvedAt: undefined },
    };
    expect(
      feedbackItems({
        threads: [unresolvedThread("PRRT_1")],
        dispositions: pendingResolution,
      }),
    ).toEqual([]);
    expect(
      decide((input) => {
        input.threads = [unresolvedThread("PRRT_1")];
        input.dispositions = pendingResolution;
      }),
    ).toEqual({
      verdict: "WAIT",
      reasons: [
        `Review thread ${THREAD_URL} is dispositioned (rebut) but not resolved`,
      ],
    });
  });

  it("keeps a thread the factory resolved settled while it stays resolved", () => {
    expect(
      decide((input) => {
        input.threads = [{ ...unresolvedThread("PRRT_1"), isResolved: true }];
        input.dispositions = resolvedByFactory;
      }).verdict,
    ).toBe("MERGE");
  });
});
