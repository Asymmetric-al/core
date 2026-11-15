import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { FACTORY_MARKER } from "../../../scripts/archon-factory/pack/.shared/readiness.mjs";
import {
  DISPOSITION_CHOICES,
  adoptBaseUpdate,
  adoptResolution,
  outsideHeadBlock,
  outsideHeadDecision,
  asRepair,
  baseIntegrationFailure,
  carryForward,
  closeoutDecision,
  conflictFiles,
  decisionOutcome,
  mergeDispositions,
  markResolved,
  mergedBy,
  planDispositions,
  reconcileHead,
  replyBody,
  resolutionWait,
  reviewAgain,
  shouldIntegrate,
  threadsToResolve,
  withMergeLane,
} from "../../../scripts/archon-factory/pack/deliver/scripts/readiness-logic.mjs";
import { makeRepair } from "../../../scripts/archon-factory/pack/deliver/scripts/repair-logic.mjs";

const HEAD = "1".repeat(40);
const OLD = "2".repeat(40);
const MERGE_SHA = "3".repeat(40);
const BASE = "4".repeat(40);

const thread = {
  id: "PRRT_1",
  kind: "review-thread",
  url: "https://github.com/acme/core/pull/7#discussion_r1",
  lastComment: "C2",
  lastReply: { id: "C2", author: "alice", body: "tenant check is missing" },
  replyTo: 101,
  comments: "alice: tenant check is missing",
};
const comment = {
  id: "comment-5",
  kind: "comment",
  url: "https://github.com/acme/core/pull/7#issuecomment-5",
  updatedAt: "2026-11-10T10:00:00Z",
  body: "Please split this PR",
};
const check = {
  id: "check-503",
  kind: "failed-check",
  name: "smoke",
  url: "https://github.com/acme/core/runs/503",
  log: "flaky network",
};

function dispose(
  items: { id: string; action: string; reply?: string; reason?: string }[],
  status = "DONE",
) {
  return {
    task_status: status,
    summary: "done",
    items: items.map((item) => ({ reply: "", reason: "because", ...item })),
  };
}

// 12 Nov 2026, PR #2659: CodeRabbit asked for the deploy checklist in the
// description. Samson assigned it as a fix, no repair can change the
// description, and the request was never answered.
describe("Samson's disposition choices", () => {
  it("answers a request about the pull-request description in a reply", () => {
    expect(DISPOSITION_CHOICES).toMatch(
      /pull-request description is written by the factory[^.]*no repair can change it/,
    );
    expect(DISPOSITION_CHOICES).toMatch(
      /deploy checklist[^.]*reply[^.]*each item/,
    );
    expect(DISPOSITION_CHOICES).toContain("never as a fix");
  });

  it("keeps every existing choice", () => {
    for (const action of [
      "fix-implementation / fix-acceptance",
      "rebut",
      "obsolete",
      "decline-nit",
      "rerun-flake",
      "adjudicate",
    ])
      expect(DISPOSITION_CHOICES).toContain(`- ${action}:`);
  });

  it("is what feedback-facts.ts gives Samson", () => {
    const source = readFileSync(
      new URL(
        "../../../scripts/archon-factory/pack/deliver/scripts/feedback-facts.ts",
        import.meta.url,
      ),
      "utf8",
    );
    expect(source).toContain('["Your decision", DISPOSITION_CHOICES]');
  });
});

describe("planDispositions: adjudicate and unhandled actions block (publication-merge#3, wiring-bugs#4)", () => {
  it("blocks an adjudicate disposition, naming the item, and plans no GitHub write or record", () => {
    const plan = planDispositions({
      items: [thread, comment],
      dispose: dispose([
        {
          id: "PRRT_1",
          action: "adjudicate",
          reason: "Disputed tenant claim",
          reply: "We disagree",
        },
        {
          id: "comment-5",
          action: "decline-nit",
          reply: "Kept together on purpose",
        },
      ]),
      head: HEAD,
    });
    expect(plan).toEqual({
      blocked: {
        code: "feedback-dispute",
        detail: `adjudicate: [review-thread ${thread.url}] Disputed tenant claim`,
        items: ["PRRT_1"],
        recovery: expect.stringMatching(/operator|Agabus/),
      },
    });
  });

  it("blocks any action the factory has no handler for", () => {
    expect(
      planDispositions({
        items: [thread],
        dispose: dispose([{ id: "PRRT_1", action: "escalate" }]),
        head: HEAD,
      }),
    ).toMatchObject({
      blocked: { code: "feedback-dispute", items: ["PRRT_1"] },
    });
  });

  it("blocks a rerun disposition on anything but a failed check", () => {
    expect(
      planDispositions({
        items: [thread],
        dispose: dispose([{ id: "PRRT_1", action: "rerun-flake" }]),
        head: HEAD,
      }),
    ).toMatchObject({ blocked: { code: "feedback-dispute" } });
  });

  it("blocks an incomplete disposition before anything is written", () => {
    expect(
      planDispositions({
        items: [thread, comment],
        dispose: dispose([{ id: "PRRT_1", action: "rebut" }]),
        head: HEAD,
      }),
    ).toMatchObject({
      blocked: {
        code: "dispose-incomplete",
        detail: "No disposition for comment-5",
      },
    });
    expect(
      planDispositions({
        items: [thread],
        dispose: dispose([], "BLOCKED"),
        head: HEAD,
      }),
    ).toMatchObject({ blocked: { code: "dispose-incomplete" } });
  });
});

describe("planDispositions: handled actions", () => {
  it("returns fixes to their owners in the I2 shape and records them as pending for this head", () => {
    const plan = planDispositions({
      items: [thread, comment],
      dispose: dispose([
        {
          id: "PRRT_1",
          action: "fix-implementation",
          reason: "Real tenant bug",
        },
        {
          id: "comment-5",
          action: "fix-acceptance",
          reason: "Oracle misses split",
        },
      ]),
      head: HEAD,
      acceptanceRevision: "acceptance-3",
    });
    expect(plan.implementation).toEqual([
      `[review-thread ${thread.url}] Real tenant bug\nalice: tenant check is missing`,
    ]);
    expect(plan.acceptance).toEqual([
      `[comment ${comment.url}] Oracle misses split`,
    ]);
    expect(plan.actions).toEqual([
      {
        id: "PRRT_1",
        type: "record",
        kind: "review-thread",
        record: {
          action: "fix-implementation",
          reason: "Real tenant bug",
          head: HEAD,
          kind: "review-thread",
          lastComment: "C2",
          status: "fix-pending",
        },
      },
      {
        id: "comment-5",
        type: "record",
        kind: "comment",
        record: {
          action: "fix-acceptance",
          reason: "Oracle misses split",
          head: HEAD,
          acceptanceRevision: "acceptance-3",
          kind: "comment",
          updatedAt: comment.updatedAt,
          status: "fix-pending",
        },
      },
    ]);
  });

  it("replies to and resolves a rebutted thread, keyed by its last comment", () => {
    const plan = planDispositions({
      items: [thread],
      dispose: dispose([
        {
          id: "PRRT_1",
          action: "rebut",
          reply: "Tenant is checked in withTenant (api.ts:40)",
          reason: "False positive",
        },
      ]),
      head: HEAD,
    });
    expect(plan.actions).toEqual([
      {
        id: "PRRT_1",
        type: "reply",
        kind: "review-thread",
        replyTo: 101,
        body: `Tenant is checked in withTenant (api.ts:40)\n\n${FACTORY_MARKER}`,
        resolve: true,
        record: {
          action: "rebut",
          reason: "False positive",
          head: HEAD,
          kind: "review-thread",
          lastComment: "C2",
        },
      },
    ]);
  });

  it("requests a rerun for a flaky failed check", () => {
    const plan = planDispositions({
      items: [check],
      dispose: dispose([
        {
          id: "check-503",
          action: "rerun-flake",
          reason: "network timeout at line 4",
        },
      ]),
      head: HEAD,
      feedbackRounds: 1,
      maxFeedbackRounds: 12,
    });
    expect(plan.actions).toEqual([
      expect.objectContaining({
        id: "check-503",
        type: "rerun",
        jobId: "503",
        name: "smoke",
      }),
    ]);
    expect(plan.implementation).toEqual([]);
  });

  it("turns a rerun into an implementation repair once feedback rounds run out", () => {
    const plan = planDispositions({
      items: [check],
      dispose: dispose([
        { id: "check-503", action: "rerun-flake", reason: "flaky" },
      ]),
      head: HEAD,
      feedbackRounds: 13,
      maxFeedbackRounds: 12,
    });
    expect(plan.implementation).toEqual([
      "Check smoke keeps failing: flaky\nflaky network",
    ]);
    expect(plan.actions.map((action: { type: string }) => action.type)).toEqual(
      ["record"],
    );
  });

  it("never resolves a dismissed review thread without posting an explanation", () => {
    const explained = planDispositions({
      items: [thread],
      dispose: dispose([
        {
          id: "PRRT_1",
          action: "decline-nit",
          reply: "   ",
          reason: "Style preference; the repository formatter owns this",
        },
      ]),
      head: HEAD,
    });
    expect(explained.actions[0]).toMatchObject({
      type: "reply",
      resolve: true,
      body: `Style preference; the repository formatter owns this\n\n${FACTORY_MARKER}`,
    });
    const silent = planDispositions({
      items: [thread],
      dispose: dispose([
        { id: "PRRT_1", action: "rebut", reply: "", reason: " " },
      ]),
      head: HEAD,
    });
    expect(silent.actions).toBeUndefined();
    expect(silent.blocked).toMatchObject({
      code: "dispose-incomplete",
      detail: expect.stringContaining("PRRT_1"),
    });
  });

  it("still lets an automated top-level comment be dismissed without a reply", () => {
    const plan = planDispositions({
      items: [comment],
      dispose: dispose([
        { id: "comment-5", action: "decline-nit", reply: "", reason: "notice" },
      ]),
      head: HEAD,
    });
    expect(plan.actions[0]).toMatchObject({ body: null, resolve: false });
  });

  it("neutralizes @mentions so a reply never summons a bot or pings a person", () => {
    expect(replyBody("Thanks @coderabbitai and @alice-b, see code")).toBe(
      `Thanks \`@coderabbitai\` and \`@alice-b\`, see code\n\n${FACTORY_MARKER}`,
    );
  });
});

describe("threadsToResolve (publication-merge#8)", () => {
  const live = (overrides = {}) => ({
    id: "PRRT_1",
    isResolved: false,
    isOutdated: false,
    comments: {
      nodes: [
        { id: "C1", databaseId: 101, url: "u1", body: "Bug" },
        { id: "C2", databaseId: 102, url: "u2", body: "Still a bug" },
      ],
    },
    ...overrides,
  });

  it("replies with the fixing commit and resolves a fix thread once a newer head is published", () => {
    expect(
      threadsToResolve({
        threads: [live()],
        dispositions: {
          PRRT_1: {
            action: "fix-implementation",
            head: OLD,
            lastComment: "C2",
          },
        },
        head: HEAD,
      }),
    ).toEqual([
      {
        id: "PRRT_1",
        fixed: true,
        replyTo: 101,
        body: `Addressed in \`${HEAD}\`.\n\n${FACTORY_MARKER}`,
      },
    ]);
  });

  it("does not reply twice when the fix reply is already on the thread", () => {
    const thread = live();
    thread.comments.nodes.push({
      id: "C3",
      databaseId: 103,
      url: "u3",
      body: `Addressed in \`${HEAD}\`.\n\n${FACTORY_MARKER}`,
    });
    expect(
      threadsToResolve({
        threads: [thread],
        dispositions: {
          PRRT_1: {
            action: "fix-implementation",
            head: OLD,
            lastComment: "C2",
          },
        },
        head: HEAD,
      }),
    ).toEqual([{ id: "PRRT_1", fixed: true, replyTo: 101, body: null }]);
  });

  it("leaves a fix thread open while the fix is not yet published", () => {
    expect(
      threadsToResolve({
        threads: [live()],
        dispositions: {
          PRRT_1: {
            action: "fix-implementation",
            head: HEAD,
            lastComment: "C2",
          },
        },
        head: HEAD,
      }),
    ).toEqual([]);
  });

  it("resolves a rebutted, obsolete or declined thread, outdated ones included", () => {
    expect(
      threadsToResolve({
        threads: [live({ isOutdated: true })],
        dispositions: {
          PRRT_1: { action: "obsolete", head: OLD, lastComment: "C2" },
        },
        head: HEAD,
      }),
    ).toEqual([{ id: "PRRT_1", fixed: false, replyTo: 101, body: null }]);
  });

  it("never resolves a thread that has a reply newer than its disposition", () => {
    expect(
      threadsToResolve({
        threads: [live()],
        dispositions: {
          PRRT_1: { action: "rebut", head: OLD, lastComment: "C1" },
        },
        head: HEAD,
      }),
    ).toEqual([]);
  });
});

describe("reconcileHead (boundary-shell-secrets#6)", () => {
  const value = (overrides: Record<string, unknown> = {}) => ({
    head: HEAD,
    pr: { number: 7, head: HEAD },
    ...overrides,
  });

  it("does nothing when the recorded head is the published one", () => {
    expect(reconcileHead({ value: value(), liveHead: HEAD })).toEqual({
      action: "ok",
    });
  });

  it("sends a recorded head that was never published back through review", () => {
    expect(
      reconcileHead({
        value: value({ pr: { number: 7, head: OLD } }),
        liveHead: OLD,
      }),
    ).toEqual({ action: "review" });
  });

  it("adopts an integration whose push landed after its record was lost", () => {
    const pending = { head: MERGE_SHA, base: BASE, from: HEAD, carried: true };
    expect(
      reconcileHead({
        value: value({ pr: { number: 7, head: HEAD, pending } }),
        liveHead: MERGE_SHA,
      }),
    ).toEqual({ action: "adopt", pending });
  });

  it("clears a pending integration whose push never landed", () => {
    const pending = { head: MERGE_SHA, base: BASE, from: HEAD, carried: true };
    expect(
      reconcileHead({
        value: value({ pr: { number: 7, head: HEAD, pending } }),
        liveHead: HEAD,
      }),
    ).toEqual({ action: "record" });
  });

  it("records the publication when the recorded head is live but its record is stale", () => {
    expect(
      reconcileHead({
        value: value({ pr: { number: 7, head: OLD } }),
        liveHead: HEAD,
      }),
    ).toEqual({ action: "record" });
  });

  it("leaves a head nobody in the factory published to the readiness decision", () => {
    expect(reconcileHead({ value: value(), liveHead: OLD })).toEqual({
      action: "none",
    });
  });

  it("carries reviews and final acceptance to the integrated head", () => {
    expect(
      carryForward(
        {
          reviews: {
            micaiah: { decision: "CLEAR", candidate: HEAD },
            luke: { decision: "CLEAR", candidate: HEAD },
          },
          final: { decision: "PASS", candidate: HEAD },
        },
        MERGE_SHA,
        HEAD,
      ),
    ).toEqual({
      reviews: {
        micaiah: { decision: "CLEAR", candidate: MERGE_SHA, carriedFrom: HEAD },
        luke: { decision: "CLEAR", candidate: MERGE_SHA, carriedFrom: HEAD },
      },
      final: { decision: "PASS", candidate: MERGE_SHA, carriedFrom: HEAD },
    });
  });
});

describe("base integration outcomes (publication-merge#7, wiring-bugs#5)", () => {
  const output = [
    "Auto-merging apps/admin/page.tsx",
    "CONFLICT (content): Merge conflict in apps/admin/page.tsx",
    "CONFLICT (modify/delete): bun.lock deleted in HEAD and modified in origin/develop.",
    "Automatic merge failed; fix conflicts and then commit the result.",
  ].join("\n");

  it("names the conflicting files", () => {
    expect(conflictFiles(output)).toEqual([
      "apps/admin/page.tsx",
      "bun.lock deleted in HEAD and modified in origin/develop.",
    ]);
  });

  it("blocks a conflicting base merge with its files and a recovery instead of looping a repair", () => {
    const outcome = baseIntegrationFailure({
      output,
      target: "develop",
      branch: "factory/12",
    });
    expect(outcome).toMatchObject({
      verdict: "BLOCKED",
      ledger: {
        blocked: {
          code: "base-conflict",
          files: [
            "apps/admin/page.tsx",
            "bun.lock deleted in HEAD and modified in origin/develop.",
          ],
          recovery: expect.stringContaining("retry"),
        },
      },
    });
    expect(outcome.ledger).not.toHaveProperty("repair");
  });

  it("blocks a base merge that failed without a conflict as a merge failure", () => {
    expect(
      baseIntegrationFailure({
        output: "fatal: refusing to merge unrelated histories",
        target: "develop",
        branch: "factory/12",
      }).ledger.blocked.code,
    ).toBe("base-merge-failed");
  });

  it("sends an integration that changed the candidate's diff to the review-only route (I2)", () => {
    expect(reviewAgain({ before: HEAD, after: MERGE_SHA, base: BASE })).toEqual(
      {
        verdict: "REPAIR",
        reason: expect.stringContaining("reviews"),
        ledger: {
          repair: {
            acceptance: [],
            implementation: [],
            reviewOnly: true,
            source: "readiness",
          },
          fingerprint: `integrate-review:${MERGE_SHA}`,
          integrated: {
            before: HEAD,
            after: MERGE_SHA,
            base: BASE,
            carried: false,
          },
        },
      },
    );
  });

  it("converts a legacy repair into the I2 shape", () => {
    expect(
      asRepair(
        { kind: "implementation", items: ["preflight failed"] },
        "readiness",
      ),
    ).toEqual({
      acceptance: [],
      implementation: ["preflight failed"],
      source: "readiness",
    });
    expect(
      asRepair({ kind: "acceptance", items: ["oracle"] }, "readiness"),
    ).toEqual({
      acceptance: ["oracle"],
      implementation: [],
      source: "readiness",
    });
  });
});

describe("withMergeLane (lease-control#11, publication-merge#11, wiring-bugs#11)", () => {
  function fakeArchon({ conflict = false } = {}) {
    let revision = 4;
    const puts: { value: unknown; options: unknown }[] = [];
    const archon = {
      get: vi.fn(async () => ({
        name: "core/merge-lane",
        revision,
        value: null,
      })),
      put: vi.fn(
        async (_name: string, value: unknown, options: { lease?: string }) => {
          if (conflict && options.lease === "take")
            throw new StateConflict("held", null);
          puts.push({ value, options });
          revision += 1;
          return { revision };
        },
      ),
    };
    return { archon, puts };
  }

  it("releases the lane before returning the merge outcome", async () => {
    const { archon, puts } = fakeArchon();
    const outcome = await withMergeLane(
      archon,
      { issue: 12, pr: 7, now: "t" },
      async () => {
        expect(
          puts.map((put) => (put.options as { lease: string }).lease),
        ).toEqual(["take"]);
        return {
          verdict: "MERGED",
          reason: "merged",
          ledger: { mergeCommit: MERGE_SHA },
        };
      },
    );
    expect(puts.map((put) => (put.options as { lease: string }).lease)).toEqual(
      ["take", "release"],
    );
    expect(puts[1].value).toEqual({ v: 1, issue: null, pr: null, at: "t" });
    expect(outcome).toEqual({
      verdict: "MERGED",
      reason: "merged",
      ledger: { mergeCommit: MERGE_SHA, laneReleased: true },
    });
  });

  it("releases the lane when the merge step throws", async () => {
    const { archon, puts } = fakeArchon();
    await expect(
      withMergeLane(archon, { issue: 12, pr: 7, now: "t" }, async () => {
        throw new Error("GitHub down");
      }),
    ).rejects.toThrow("GitHub down");
    expect(puts.map((put) => (put.options as { lease: string }).lease)).toEqual(
      ["take", "release"],
    );
  });

  it("waits without running the merge when another merge holds the lane", async () => {
    const { archon } = fakeArchon({ conflict: true });
    const body = vi.fn();
    await expect(
      withMergeLane(archon, { issue: 12, pr: 7, now: "t" }, body),
    ).resolves.toMatchObject({
      verdict: "WAIT",
      reason: "Another merge holds the merge lane",
    });
    expect(body).not.toHaveBeenCalled();
  });
});

describe("closeout evidence (publication-merge#9) and merged_by (I3)", () => {
  const merged = {
    merged: true,
    merge_commit_sha: MERGE_SHA,
    base: { ref: "develop" },
    head: { sha: HEAD },
  };

  it("records MERGED only with the issue closed and the merge commit on the target", () => {
    expect(
      closeoutDecision({
        pr: merged,
        issue: { state: "closed" },
        compare: { status: "ahead" },
        targetBranch: "develop",
        issueNumber: 12,
        mergedBy: "factory",
      }),
    ).toEqual({
      verdict: "MERGED",
      reason: `Merged as ${MERGE_SHA} on develop; issue #12 is closed`,
      shouldClose: false,
      ledger: {
        mergeCommit: MERGE_SHA,
        merged_by: "factory",
        onTarget: true,
        issueClosed: true,
      },
    });
  });

  it("asks to close the issue only once the merge commit is on the target", () => {
    expect(
      closeoutDecision({
        pr: merged,
        issue: { state: "open" },
        compare: { status: "identical" },
        targetBranch: "develop",
        issueNumber: 12,
        mergedBy: "factory",
      }),
    ).toMatchObject({
      verdict: "WAIT",
      shouldClose: true,
      ledger: { closeout: { issueClosed: false, onTarget: true } },
    });
    expect(
      closeoutDecision({
        pr: merged,
        issue: { state: "open" },
        compare: { status: "diverged" },
        targetBranch: "develop",
        issueNumber: 12,
        mergedBy: "factory",
      }),
    ).toMatchObject({
      verdict: "WAIT",
      shouldClose: false,
      ledger: { closeout: { onTarget: false, recovery: expect.any(String) } },
    });
  });

  it("waits with a closeout recovery when the issue stays open", () => {
    expect(
      closeoutDecision({
        pr: merged,
        issue: { state: "open" },
        compare: { status: "ahead" },
        targetBranch: "develop",
        issueNumber: 12,
        mergedBy: "external",
      }),
    ).toMatchObject({
      verdict: "WAIT",
      ledger: { closeout: { recovery: expect.stringContaining("#12") } },
    });
  });

  it("blocks a PR that was merged into another branch", () => {
    expect(
      closeoutDecision({
        pr: { ...merged, base: { ref: "release" } },
        issue: { state: "closed" },
        compare: { status: "ahead" },
        targetBranch: "develop",
        issueNumber: 12,
        mergedBy: "external",
      }),
    ).toMatchObject({
      verdict: "BLOCKED",
      ledger: { blocked: { code: "merged-elsewhere" } },
    });
  });

  it("attributes a merge only with a matching confirmed receipt", () => {
    expect(
      mergedBy(
        {
          pr: {
            mergeRequest: {
              head: HEAD,
              status: "confirmed",
              mergeCommit: merged.merge_commit_sha,
            },
          },
        },
        merged,
      ),
    ).toBe("factory");
    expect(mergedBy({ pr: { mergeRequest: { head: HEAD } } }, merged)).toBe(
      "external",
    );
    expect(mergedBy({ pr: { mergeRequest: { head: OLD } } }, merged)).toBe(
      "external",
    );
    expect(mergedBy({ pr: { number: 7 } }, merged)).toBe("external");
  });
});

describe("decisionOutcome", () => {
  it("writes every readiness REPAIR with an I2 repair and fingerprint", () => {
    expect(
      decisionOutcome({
        verdict: "REPAIR",
        reasons: ["check smoke: failure"],
        pending: [],
        repair: {
          acceptance: [],
          implementation: ["check smoke: failure"],
          source: "readiness",
        },
      }),
    ).toEqual({
      verdict: "REPAIR",
      reason: "check smoke: failure",
      ledger: {
        repair: {
          acceptance: [],
          implementation: ["check smoke: failure"],
          source: "readiness",
        },
        pending: [],
        fingerprint: "readiness:check smoke: failure",
      },
    });
  });
});

describe("mergeDispositions", () => {
  it("adds this round's records to the stored dispositions", () => {
    expect(
      mergeDispositions(
        { a: { action: "rebut" } },
        { b: { action: "obsolete" } },
        { at: "t", run: "r" },
      ),
    ).toEqual({
      a: { action: "rebut" },
      b: { action: "obsolete", at: "t", run: "r" },
    });
  });
});

// publication-merge#8 / readiness.ts:211: the integration step runs only when
// the decision carries no work for an owner (the baseline behindOnly guard).
describe("shouldIntegrate", () => {
  const repair = (
    acceptance: string[] = [],
    implementation: string[] = [],
  ) => ({
    verdict: "REPAIR",
    reasons: ["Strict protection requires updating the branch with its base"],
    integrate: true,
    repair: { acceptance, implementation, source: "readiness" },
  });

  it("integrates when the only repair is the base itself", () => {
    expect(shouldIntegrate(repair())).toBe(true);
  });

  it("never integrates while implementation or acceptance work is pending", () => {
    expect(
      shouldIntegrate(
        repair(
          [],
          [
            "Review thread u1 was accepted as a defect and is not fixed on this head",
          ],
        ),
      ),
    ).toBe(false);
    expect(shouldIntegrate(repair(["Governing issue context changed"]))).toBe(
      false,
    );
  });

  it("never integrates for a decision that did not ask for it", () => {
    expect(shouldIntegrate({ ...repair(), integrate: false })).toBe(false);
    expect(
      shouldIntegrate({ verdict: "WAIT", reasons: [], integrate: true }),
    ).toBe(false);
  });
});

// publication-merge#8: GitHub recomputes mergeable_state after a thread is
// resolved; deciding in the same round can read a stale `blocked`.
describe("resolutionWait", () => {
  it("decides nothing when no thread was resolved this round", () => {
    expect(resolutionWait([])).toBeNull();
  });

  it("waits a round after resolving threads", () => {
    expect(resolutionWait(["PRRT_1", "PRRT_2"])).toEqual({
      verdict: "WAIT",
      reason: expect.stringContaining("Resolved 2 review thread(s)"),
      ledger: { resolved: ["PRRT_1", "PRRT_2"] },
    });
  });
});

describe("a carried base integration is not a fix (publication-merge#8)", () => {
  const live = {
    id: "PRRT_1",
    isResolved: false,
    isOutdated: false,
    comments: {
      nodes: [{ id: "C1", databaseId: 101, url: "u1", body: "Bug" }],
    },
  };

  it("does not reply 'Addressed in' or resolve when the head was only carried from the disposition head", () => {
    expect(
      threadsToResolve({
        threads: [live],
        dispositions: {
          PRRT_1: {
            action: "fix-implementation",
            head: OLD,
            lastComment: "C1",
          },
        },
        head: HEAD,
        carriedFrom: OLD,
      }),
    ).toEqual([]);
  });

  it("still resolves a fix published by a later build that was then carried", () => {
    expect(
      threadsToResolve({
        threads: [live],
        dispositions: {
          PRRT_1: {
            action: "fix-implementation",
            head: OLD,
            lastComment: "C1",
          },
        },
        head: HEAD,
        carriedFrom: MERGE_SHA,
      }),
    ).toEqual([
      {
        id: "PRRT_1",
        fixed: true,
        replyTo: 101,
        body: `Addressed in \`${HEAD}\`.\n\n${FACTORY_MARKER}`,
      },
    ]);
  });

  it("keeps the head that was actually reviewed across consecutive integrations", () => {
    const once = carryForward(
      {
        reviews: { micaiah: { decision: "CLEAR", candidate: HEAD } },
        final: { decision: "PASS", candidate: HEAD },
      },
      MERGE_SHA,
      HEAD,
    );
    expect(carryForward(once, BASE, MERGE_SHA)).toEqual({
      reviews: {
        micaiah: { decision: "CLEAR", candidate: BASE, carriedFrom: HEAD },
      },
      final: { decision: "PASS", candidate: BASE, carriedFrom: HEAD },
    });
  });
});

// publication-merge#7: a conflicting base merge stops the issue, and the
// recovery that works is an operator's resolution pushed on top of the
// recorded candidate, which readiness adopts and sends through review.
describe("operator conflict resolution (publication-merge#7)", () => {
  const output =
    "CONFLICT (content): Merge conflict in apps/admin/page.tsx\nAutomatic merge failed";
  const conflict = {
    head: HEAD,
    base: BASE,
    files: ["apps/admin/page.tsx"],
    at: "t0",
  };
  const value = (pr: Record<string, unknown> = {}) => ({
    head: HEAD,
    branch: "factory/12-x",
    pr: { number: 7, head: HEAD, ...pr },
  });

  it("records which candidate conflicted and tells the operator how to resolve it", () => {
    const outcome = baseIntegrationFailure({
      output,
      target: "develop",
      branch: "factory/12-x",
      head: HEAD,
      base: BASE,
    });
    expect(outcome.conflict).toEqual({
      head: HEAD,
      base: BASE,
      files: ["apps/admin/page.tsx"],
    });
    expect(outcome.ledger.blocked.recovery).toMatch(/push/i);
    expect(outcome.ledger.blocked.recovery).toContain("factory/12-x");
    expect(outcome.ledger.blocked.recovery).toContain(HEAD.slice(0, 12));
    expect(outcome.ledger.blocked.recovery).toMatch(/review/);
  });

  it("adopts a pushed resolution that builds on the conflicted candidate", () => {
    expect(
      reconcileHead({
        value: value({ conflict }),
        liveHead: MERGE_SHA,
        descends: true,
      }),
    ).toEqual({ action: "resolve", conflict });
  });

  it("never adopts a head that does not contain the conflicted candidate", () => {
    expect(
      reconcileHead({
        value: value({ conflict }),
        liveHead: MERGE_SHA,
        descends: false,
      }),
    ).toEqual({ action: "none" });
  });

  it("never adopts a foreign head without a recorded conflict for this candidate", () => {
    expect(
      reconcileHead({ value: value(), liveHead: MERGE_SHA, descends: true }),
    ).toEqual({ action: "none" });
    expect(
      reconcileHead({
        value: value({ conflict: { ...conflict, head: OLD } }),
        liveHead: MERGE_SHA,
        descends: true,
      }),
    ).toEqual({ action: "none" });
  });

  // GitHub's "Update branch" merges the target branch into the pull request.
  // On 13 November 2026 that was pressed on two factory pull requests.
  it("adopts an update from the target branch pushed on top of the candidate", () => {
    expect(
      reconcileHead({
        value: value(),
        liveHead: MERGE_SHA,
        descends: true,
        baseUpdate: true,
      }),
    ).toEqual({ action: "update" });
  });

  it("never adopts outside commits of their own, or an update that does not contain the candidate", () => {
    expect(
      reconcileHead({
        value: value(),
        liveHead: MERGE_SHA,
        descends: true,
        baseUpdate: false,
      }),
    ).toEqual({ action: "none" });
    expect(
      reconcileHead({
        value: value(),
        liveHead: MERGE_SHA,
        descends: false,
        baseUpdate: true,
      }),
    ).toEqual({ action: "none" });
  });

  // An outside head that is not adopted stops the stage before it answers
  // or resolves anything on the pull request.
  it("blocks on an outside head it does not adopt and says how to put the branch back", () => {
    const outcome = outsideHeadBlock({
      branch: "factory/12-x",
      liveHead: MERGE_SHA,
      head: HEAD,
      published: OLD,
    });
    expect(outcome.reason).toContain(MERGE_SHA.slice(0, 12));
    expect(outcome.ledger.blocked).toMatchObject({
      code: "outside-head",
      detail: expect.stringContaining(MERGE_SHA),
    });
    expect(outcome.ledger.blocked.recovery).toContain(
      `--force-with-lease=factory/12-x:${MERGE_SHA} origin ${OLD}:refs/heads/factory/12-x`,
    );
    expect(outcome.ledger.blocked.recovery).toMatch(/retry/);
    expect(outcome.ledger.fingerprint).toBe(`outside-head:${MERGE_SHA}`);
  });

  // An adoption records a base computed from the target branch as the clone
  // knows it. With a clone that could not be refreshed that can be an old
  // base, so nothing is adopted or blocked: the stage waits.
  it("waits before any adoption or block when the clone could not be refreshed", () => {
    const wait = { action: "wait" };
    expect([
      reconcileHead({
        value: value({ conflict }),
        liveHead: MERGE_SHA,
        descends: true,
        refreshed: false,
      }),
      reconcileHead({
        value: value(),
        liveHead: MERGE_SHA,
        descends: true,
        baseUpdate: true,
        refreshed: false,
      }),
      reconcileHead({ value: value(), liveHead: MERGE_SHA, refreshed: false }),
    ]).toEqual([wait, wait, wait]);
    // The factory's own heads need no fresh refs.
    expect(
      reconcileHead({ value: value(), liveHead: HEAD, refreshed: false }),
    ).toEqual({ action: "ok" });
  });

  // The stage fetches before it judges an outside head. When that fetch
  // failed, a head it could not adopt may only look foreign because the
  // clone's refs are old: it waits and looks again, and does not block.
  it("waits when the clone could not be refreshed, and blocks when it could", () => {
    const args = {
      branch: "factory/12-x",
      liveHead: MERGE_SHA,
      head: HEAD,
      published: HEAD,
    };
    const stale = outsideHeadDecision({ ...args, refreshed: false });
    const fresh = outsideHeadDecision({ ...args, refreshed: true });
    expect({
      stale: [stale.verdict, Object.keys(stale.ledger)],
      staleReason: stale.reason,
      fresh: [fresh.verdict, fresh.ledger.blocked.code],
    }).toEqual({
      stale: ["WAIT", []],
      staleReason: expect.stringMatching(/could not be refreshed.*next round/s),
      fresh: ["BLOCKED", "outside-head"],
    });
  });

  it("records the update as the candidate and sends it to the review-only route", () => {
    expect(
      adoptBaseUpdate({
        value: value({ pending: null }),
        liveHead: MERGE_SHA,
        base: BASE,
        now: "t1",
        target: "develop",
      }),
    ).toMatchObject({
      fields: {
        head: MERGE_SHA,
        base: BASE,
        reviews: null,
        final: null,
        pr: { number: 7, head: MERGE_SHA, pending: null, conflict: null },
      },
      outcome: {
        verdict: "REPAIR",
        reason: expect.stringMatching(
          /develop.*outside the factory.*reviewed again/s,
        ),
        ledger: {
          repair: { reviewOnly: true, source: "readiness" },
          fingerprint: `outside-base-update:${MERGE_SHA}`,
          adopted: { from: HEAD, head: MERGE_SHA, base: BASE },
        },
      },
    });
  });

  it("records the resolution as the candidate and sends it to the review-only route", () => {
    expect(
      adoptResolution({
        value: value({ conflict, pending: null }),
        liveHead: MERGE_SHA,
        base: BASE,
        now: "t1",
      }),
    ).toEqual({
      fields: {
        head: MERGE_SHA,
        base: BASE,
        reviews: null,
        final: null,
        pr: {
          number: 7,
          head: MERGE_SHA,
          publishedAt: "t1",
          pending: null,
          conflict: null,
        },
      },
      outcome: {
        verdict: "REPAIR",
        reason: expect.stringContaining("reviewed again"),
        ledger: {
          repair: {
            acceptance: [],
            implementation: [],
            reviewOnly: true,
            source: "readiness",
          },
          fingerprint: `conflict-resolution:${MERGE_SHA}`,
          adopted: {
            from: HEAD,
            head: MERGE_SHA,
            base: BASE,
            files: ["apps/admin/page.tsx"],
          },
        },
      },
    });
  });
});

describe("operator conflict resolution: waiting and fail-closed edges (publication-merge#7)", () => {
  const conflict = {
    head: HEAD,
    base: BASE,
    files: ["apps/admin/page.tsx"],
    at: "t0",
  };

  it("keeps deciding on the conflicted candidate until a resolution is pushed", () => {
    expect(
      reconcileHead({
        value: { head: HEAD, pr: { number: 7, head: HEAD, conflict } },
        liveHead: HEAD,
        descends: false,
      }),
    ).toEqual({ action: "ok" });
  });

  it("never treats a resolution as adoptable without proof that it contains the candidate", () => {
    expect(
      reconcileHead({
        value: { head: HEAD, pr: { number: 7, head: HEAD, conflict } },
        liveHead: MERGE_SHA,
      }),
    ).toEqual({ action: "none" });
  });

  it("keeps the generic recovery when the conflicted candidate is unknown", () => {
    const outcome = baseIntegrationFailure({
      output: "CONFLICT (content): Merge conflict in a.ts",
      target: "develop",
      branch: "factory/12-x",
    });
    expect(outcome).not.toHaveProperty("conflict");
    expect(outcome.ledger.blocked.code).toBe("base-conflict");
  });
});

// One repair constructor (repair-logic.mjs makeRepair) for every readiness repair.
describe("readiness repairs use the shared constructor", () => {
  it("builds review-only repairs with makeRepair", () => {
    const reviewOnly = makeRepair({ reviewOnly: true, source: "readiness" });
    expect(
      reviewAgain({ before: HEAD, after: MERGE_SHA, base: BASE }).ledger.repair,
    ).toEqual(reviewOnly);
    expect(
      adoptResolution({
        value: { head: HEAD, pr: { number: 7, head: HEAD } },
        liveHead: MERGE_SHA,
        base: BASE,
        now: "t1",
      }).outcome.ledger.repair,
    ).toEqual(reviewOnly);
  });

  it("normalizes the decision's repair, dropping empty items and naming readiness", () => {
    expect(
      decisionOutcome({
        verdict: "REPAIR",
        reasons: ["check smoke: failure"],
        pending: [],
        repair: {
          acceptance: [""],
          implementation: ["check smoke: failure", ""],
          source: "evaluator",
        },
      }).ledger.repair,
    ).toEqual(
      makeRepair({
        implementation: ["check smoke: failure"],
        source: "readiness",
      }),
    );
  });

  it("keeps a producer's own source and the review-only flag when converting", () => {
    expect(
      asRepair(
        { acceptance: [], implementation: ["guard failed"], source: "publish" },
        "readiness",
      ),
    ).toEqual(
      makeRepair({ implementation: ["guard failed"], source: "publish" }),
    );
    expect(
      asRepair(
        { acceptance: [], implementation: [], reviewOnly: true },
        "readiness",
      ),
    ).toEqual(makeRepair({ reviewOnly: true, source: "readiness" }));
    expect(asRepair(null, "readiness")).toBeNull();
  });
});

describe("threads a person reopened (human unresolve without reply)", () => {
  const live = {
    id: "PRRT_1",
    isResolved: false,
    isOutdated: false,
    comments: {
      nodes: [{ id: "C1", databaseId: 101, url: "u1", body: "Bug" }],
    },
  };

  it("never resolves again a thread the factory already resolved on this disposition", () => {
    expect(
      threadsToResolve({
        threads: [live],
        dispositions: {
          PRRT_1: {
            action: "rebut",
            head: OLD,
            lastComment: "C1",
            resolvedAt: "t0",
          },
        },
        head: HEAD,
      }),
    ).toEqual([]);
    expect(
      threadsToResolve({
        threads: [live],
        dispositions: {
          PRRT_1: {
            action: "fix-implementation",
            head: OLD,
            lastComment: "C1",
            status: "fixed",
            fixedIn: MERGE_SHA,
            resolvedAt: "t0",
          },
        },
        head: HEAD,
      }),
    ).toEqual([]);
  });

  it("records which threads the factory resolved, and which of them a head fixed", () => {
    expect(
      markResolved(
        {
          PRRT_1: { action: "rebut", lastComment: "C1" },
          PRRT_2: {
            action: "fix-implementation",
            head: OLD,
            lastComment: "C9",
          },
          PRRT_3: { action: "obsolete", lastComment: "C7" },
        },
        {
          resolved: ["PRRT_1", "PRRT_2", "PRRT_4"],
          fixed: ["PRRT_2"],
          head: HEAD,
          at: "t1",
        },
      ),
    ).toEqual({
      PRRT_1: { action: "rebut", lastComment: "C1", resolvedAt: "t1" },
      PRRT_2: {
        action: "fix-implementation",
        head: OLD,
        lastComment: "C9",
        status: "fixed",
        fixedIn: HEAD,
        resolvedAt: "t1",
      },
      PRRT_3: { action: "obsolete", lastComment: "C7" },
    });
  });
});
