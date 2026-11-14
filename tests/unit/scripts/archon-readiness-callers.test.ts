import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAssignment } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import {
  afterDefinePlan,
  briefAfterDefine,
} from "../../../scripts/archon-factory/pack/deliver/scripts/define-logic.mjs";
import { publicationGate } from "../../../scripts/archon-factory/pack/deliver/scripts/publish-logic.mjs";
import { repairRoute } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import { sealReview } from "../../../scripts/archon-factory/pack/deliver/scripts/review-logic.mjs";

import type * as FileSystem from "node:fs";

const state = vi.hoisted(() => ({
  round: null as any,
  document: null as any,
  github: null as any,
  dispose: null as any,
  output: null as any,
  files: new Map<string, string>(),
}));

vi.mock(
  "../../../scripts/archon-factory/pack/.shared/round.mjs",
  async (original) => {
    const actual = await original<Record<string, any>>();
    return {
      ...actual,
      openRound: () => state.round,
      input: () => state.dispose,
      workItem: async () => structuredClone(state.document),
      writeWorkItem: async (_round: unknown, plan: any) => {
        state.document = {
          ...state.document,
          value: plan.value,
          revision: state.document.revision + 1,
        };
      },
      policyRevision: () => ({ policyRevision: "c".repeat(64) }),
      runInIssueRepo: () => {
        throw new Error("Unexpected candidate command");
      },
      emit: (output: unknown) => {
        state.output = output;
      },
    };
  },
);

vi.mock("../../../scripts/archon-factory/pack/.shared/github.mjs", () => ({
  createGitHub: () => state.github,
  githubToken: async () => "fixture-token",
}));

vi.mock(
  "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs",
  () => ({
    checkFactoryStorage: async () => ({ ok: true, code: "STORAGE_READY" }),
  }),
);

vi.mock("node:fs", async (original) => {
  const actual = await original<typeof FileSystem>();
  return {
    ...actual,
    readFileSync: (file: any, ...args: any[]) =>
      state.files.has(String(file))
        ? state.files.get(String(file))
        : (actual.readFileSync as any)(file, ...args),
    writeFileSync: (file: any, data: any, ...args: any[]) => {
      if (String(file).startsWith("/materials/"))
        state.files.set(String(file), String(data));
      else (actual.writeFileSync as any)(file, data, ...args);
    },
  };
});

const HEAD = "1".repeat(40);
const BASE = "3".repeat(40);
const MERGE = "2".repeat(40);
const BEFORE = "acceptance-before";
const AFTER = "acceptance-corrected";
const EXIT = new Error("script exited");
let entries: Record<string, any>;
let documents: Map<string, any>;
let threads: any[];
let pr: any;

function reviews(revision: string) {
  const raw = {
    task_status: "DONE",
    candidate_sha: HEAD,
    acceptance_revision: revision,
    decision: "CLEAR",
    scope: "Candidate verified",
    findings: [],
    checks_run: [],
    limitations: [],
  };
  return Object.fromEntries(
    ["micaiah", "luke"].map((name) => [
      name,
      {
        ...sealReview(name, raw, {
          candidate: HEAD,
          acceptanceRevision: revision,
        }),
        candidate: HEAD,
        acceptance: revision,
      },
    ]),
  );
}

beforeEach(() => {
  state.dispose = null;
  state.output = null;
  state.files.clear();
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw EXIT;
  });
  const value = createAssignment({
    issue: 7,
    assignmentId: "A-7",
    owner: "fixture",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: "c".repeat(64),
    endState: "PR_READY",
    now: "2026-11-12T00:00:00Z",
  });
  Object.assign(value, {
    status: "active",
    run: { id: "round-1", head: HEAD },
    head: HEAD,
    base: BASE,
    branch: "factory/issue-7",
    brief: {
      summary: "Correct an acceptance criterion",
      repair: null,
      contextFingerprint: "context-1",
    },
    acceptance: { revision: BEFORE, criteria: [] },
    reviews: reviews(BEFORE),
    final: {
      taskStatus: "DONE",
      decision: "PASS",
      candidate: HEAD,
      acceptanceRevision: BEFORE,
    },
    pr: { number: 42, head: HEAD, publishedAt: "2026-11-11T10:00:00Z" },
  });
  state.document = { revision: 1, lease: { runId: "round-1" }, value };
  entries = { context: { fingerprint: "context-1" } };
  documents = new Map([
    [
      "core/issues/7/feedback",
      { revision: 1, value: { v: 1, dispositions: {} } },
    ],
    ["core/factory", { revision: 1, value: { mode: "run", mergeHold: false } }],
    [
      "core/scope",
      { revision: 1, value: { issues: [7], endState: "PR_READY" } },
    ],
    ["core/merge-lane", { revision: 1, value: null }],
  ]);
  threads = [
    {
      id: "PRRT_1",
      isResolved: false,
      isOutdated: false,
      comments: {
        nodes: [
          {
            id: "C1",
            databaseId: 101,
            author: { login: "reviewer" },
            body: "The acceptance criterion is wrong",
            url: "https://example.test/thread/1",
          },
        ],
      },
    },
  ];
  pr = {
    number: 42,
    title: "Candidate",
    html_url: "https://example.test/pr/42",
    state: "open",
    merged: false,
    head: { sha: HEAD, ref: "factory/issue-7" },
    base: { ref: "develop" },
    mergeable: true,
    mergeable_state: "clean",
  };
  state.github = {
    pull: vi.fn(async () => structuredClone(pr)),
    reviewThreads: vi.fn(async () => structuredClone(threads)),
    reviews: vi.fn(async () => []),
    issueComments: vi.fn(async () => []),
    checkRuns: vi.fn(async () => []),
    statuses: vi.fn(async () => ({ sha: HEAD, statuses: [] })),
    branchProtection: vi.fn(async () => null),
    branchRules: vi.fn(async () => []),
    resolveThread: vi.fn(async (id: string) => {
      threads.find((thread) => thread.id === id).isResolved = true;
    }),
    replyToReviewComment: vi.fn(
      async (_number: number, _replyTo: number, body: string) => {
        threads[0].comments.nodes.push({ id: "FACTORY", body });
      },
    ),
    comment: vi.fn(async () => ({})),
    merge: vi.fn(),
    compare: vi.fn(async () => ({ status: "ahead" })),
    issue: vi.fn(async () => ({ state: "closed" })),
    closeIssue: vi.fn(),
  };
  state.round = {
    issue: 7,
    assignment: "A-7",
    runId: "round-1",
    paths: {},
    where: { repo: "/candidate" },
    config: {
      github: { executable: "gh", configDir: "/no-auth" },
      repository: {
        slug: "fixture/core",
        targetBranch: "develop",
        mergeMethod: "squash",
      },
    },
    limits: { maxFeedbackRounds: 3 },
    materials: () => "/materials/dispose",
    now: () => "2026-11-12T10:00:00Z",
    git: {
      ok: vi.fn(() => {
        throw new Error("Unexpected git execution");
      }),
    },
    ledger: {
      read: (name: string) => entries[name] ?? null,
      write: (name: string, entry: any) => {
        entries[name] = structuredClone(entry);
      },
    },
    archon: {
      get: vi.fn(async (name: string) =>
        structuredClone(documents.get(name) ?? { revision: 0, value: null }),
      ),
      put: vi.fn(async (name: string, next: any) => {
        documents.set(name, {
          revision: (documents.get(name)?.revision ?? 0) + 1,
          value: structuredClone(next),
        });
      }),
    },
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function runScript(script: "feedback-facts" | "readiness") {
  vi.resetModules();
  state.output = null;
  try {
    if (script === "feedback-facts")
      await import("../../../scripts/archon-factory/pack/deliver/scripts/feedback-facts.ts");
    else
      await import("../../../scripts/archon-factory/pack/deliver/scripts/readiness.ts");
  } catch (error) {
    if (error !== EXIT) throw error;
  }
  expect(state.output).not.toBeNull();
  return state.output;
}

function authorizeMerge() {
  threads = [];
  state.document.value.assignment.endState = "MERGED";
  documents.get("core/scope").value.endState = "MERGED";
}

function mergedPull() {
  Object.assign(pr, {
    merged: true,
    state: "closed",
    merge_commit_sha: MERGE,
    merged_at: "2026-11-12T10:00:00Z",
    merged_by: { login: "human-maintainer" },
  });
}

describe("readiness callers at local GitHub and Archon boundaries", () => {
  it.each(["throw", "false-response"])(
    "does not claim a later human merge after a known %s refusal (F3)",
    async (refusal) => {
      authorizeMerge();
      if (refusal === "throw")
        state.github.merge.mockRejectedValue(
          Object.assign(new Error("Protection refused merge"), {
            outcome: "refused",
          }),
        );
      else
        state.github.merge.mockResolvedValue({
          merged: false,
          message: "Protection refused merge",
        });
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "BLOCKED",
      });
      expect(state.document.value.pr.mergeRequest).toMatchObject({
        head: HEAD,
        status: "refused",
      });
      mergedPull();
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "MERGED",
        merged_by: "external",
      });
      expect(state.document.value.pr.mergedBy).toBe("external");
      expect(state.github.merge).toHaveBeenCalledOnce();
    },
  );

  it("attributes a positive exact-head/merge-commit receipt to the factory (F3)", async () => {
    authorizeMerge();
    state.github.merge.mockImplementation(async () => {
      mergedPull();
      return { merged: true, sha: MERGE };
    });
    await runScript("feedback-facts");
    expect(await runScript("readiness")).toMatchObject({
      verdict: "MERGED",
      merged_by: "factory",
    });
    expect(state.document.value.pr.mergeRequest).toMatchObject({
      head: HEAD,
      status: "confirmed",
      mergeCommit: MERGE,
    });
    expect(documents.get("core/merge-lane").value.issue).toBeNull();
  });

  it.each(["unknown", undefined])(
    "reconciles a lost merge response %s without blind retries or attribution (F3)",
    async (outcome) => {
      authorizeMerge();
      state.github.merge.mockRejectedValue(
        Object.assign(new Error("Merge response lost"), { outcome }),
      );
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "BLOCKED",
      });
      expect(state.document.value.pr.mergeRequest.status).toBe("unknown");
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "BLOCKED",
      });
      expect(state.github.merge).toHaveBeenCalledOnce();
      mergedPull();
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "MERGED",
        merged_by: "external",
      });
      expect(state.github.merge).toHaveBeenCalledOnce();
    },
  );

  it("retains a confirmed receipt when its readback fails and closes out next round (F3)", async () => {
    authorizeMerge();
    state.github.merge.mockImplementation(async () => {
      mergedPull();
      state.github.pull.mockRejectedValueOnce(
        new Error("Readback temporarily failed"),
      );
      return { merged: true, sha: MERGE };
    });
    await runScript("feedback-facts");
    await expect(runScript("readiness")).rejects.toThrow(
      "Readback temporarily failed",
    );
    expect(state.document.value.pr.mergeRequest).toMatchObject({
      status: "confirmed",
      mergeCommit: MERGE,
    });
    await runScript("feedback-facts");
    expect(await runScript("readiness")).toMatchObject({
      verdict: "MERGED",
      merged_by: "factory",
    });
    expect(state.github.merge).toHaveBeenCalledOnce();
  });

  it.each([undefined, "requested", "unknown", "confirmed"])(
    "does not retry an unresolved %s same-head receipt (F3)",
    async (status) => {
      authorizeMerge();
      state.document.value.pr.mergeRequest = {
        head: HEAD,
        status,
        ...(status === "confirmed" ? { mergeCommit: MERGE } : {}),
      };
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "BLOCKED",
      });
      expect(entries.readiness.blocked.code).toBe("merge-unconfirmed");
      expect(state.github.merge).not.toHaveBeenCalled();
      expect(documents.get("core/merge-lane").value.issue).toBeNull();
    },
  );

  it("records the request before calling GitHub and reconciles a lost response already merged (F3)", async () => {
    authorizeMerge();
    state.github.merge.mockImplementation(async () => {
      expect(state.document.value.pr.mergeRequest).toMatchObject({
        head: HEAD,
        status: "requested",
      });
      mergedPull();
      throw Object.assign(new Error("Merge response lost"), {
        outcome: "unknown",
      });
    });
    await runScript("feedback-facts");
    expect(await runScript("readiness")).toMatchObject({
      verdict: "MERGED",
      merged_by: "external",
    });
    expect(state.document.value.pr.mergeRequest.status).toBe("unknown");
    expect(state.github.merge).toHaveBeenCalledOnce();
  });

  it.each([{}, { merged: true }, { merged: true, sha: "short" }])(
    "does not treat a non-confirming response as a receipt %# (F3)",
    async (response) => {
      authorizeMerge();
      state.github.merge.mockImplementation(async () => {
        mergedPull();
        return response;
      });
      await runScript("feedback-facts");
      expect(await runScript("readiness")).toMatchObject({
        verdict: "MERGED",
        merged_by: "external",
      });
      expect(state.document.value.pr.mergeRequest.status).toBe("unknown");
    },
  );

  it("does not attribute a different actual merge commit to a confirmed request (F3)", async () => {
    authorizeMerge();
    state.github.merge.mockImplementation(async () => {
      mergedPull();
      pr.merge_commit_sha = "4".repeat(40);
      return { merged: true, sha: MERGE };
    });
    await runScript("feedback-facts");
    expect(await runScript("readiness")).toMatchObject({
      verdict: "MERGED",
      merged_by: "external",
    });
  });

  it.each(["missing", "new-reply", "edited-reply"])(
    "does not apply a disposition after current thread content becomes %s (F2)",
    async (scenario) => {
      await runScript("feedback-facts");
      threads[0].recent = {
        nodes: [
          scenario === "missing"
            ? { id: "C51" }
            : {
                id: scenario === "edited-reply" ? "C1" : "C51",
                body: "Fresh safety objection Samson has not read",
              },
        ],
      };
      state.dispose = {
        task_status: "DONE",
        items: [
          {
            id: "PRRT_1",
            action: "rebut",
            reason: "Judged earlier content",
            reply: "Earlier evidence",
          },
        ],
      };
      const output = await runScript("readiness");
      expect(output.verdict).toBe(scenario === "missing" ? "BLOCKED" : "WAIT");
      expect(state.github.resolveThread).not.toHaveBeenCalled();
      expect(state.github.replyToReviewComment).not.toHaveBeenCalled();
      expect(
        documents.get("core/issues/7/feedback").value.dispositions,
      ).toEqual({});
    },
  );

  it("carries the exact current reply into the implementation repair, not old context (F2)", async () => {
    threads[0].comments.nodes[0].body = "Obsolete allegation ".repeat(400);
    const current =
      "Fix the current tenant authorization bypass, not the earlier resolved claim.";
    threads[0].recent = {
      nodes: [{ id: "C51", author: { login: "reviewer" }, body: current }],
    };
    await runScript("feedback-facts");
    state.dispose = {
      task_status: "DONE",
      items: [
        {
          id: "PRRT_1",
          action: "fix-implementation",
          reason: "Confirmed defect",
        },
      ],
    };
    expect(await runScript("readiness")).toMatchObject({ verdict: "REPAIR" });
    expect(entries.readiness.repair.implementation[0]).toContain(current);
    expect(entries.readiness.repair.implementation[0]).not.toContain(
      "Obsolete allegation",
    );
  });

  it("blocks a factory-only page gap instead of reusing an older disposition (F2)", async () => {
    threads[0].comments.nodes = Array.from({ length: 50 }, (_, index) => ({
      id: `C${index + 1}`,
      body: "Old context",
    }));
    threads[0].recent = {
      nodes: Array.from({ length: 20 }, (_, index) => ({
        id: `C${index + 80}`,
        body: "Factory response <!-- core-factory -->",
      })),
    };
    documents.get("core/issues/7/feedback").value.dispositions = {
      PRRT_1: { action: "rebut", head: HEAD, lastComment: "C50" },
    };
    expect(await runScript("feedback-facts")).toMatchObject({
      dispose: "no",
      samson_assignment: "",
    });
    expect(entries["feedback-facts"]).toMatchObject({
      blocked: { code: "feedback-content-unavailable" },
    });
    expect(await runScript("readiness")).toMatchObject({ verdict: "BLOCKED" });
    expect(state.github.resolveThread).not.toHaveBeenCalled();
    expect(state.github.merge).not.toHaveBeenCalled();
  });

  it("sends the exact page-51 reply to Samson and records only that current identity (F2)", async () => {
    const body = `CURRENT-BEGIN ${"authorization detail ".repeat(320)} CURRENT-END`;
    threads[0].comments.nodes = Array.from({ length: 50 }, (_, index) => ({
      id: `C${index + 1}`,
      databaseId: index + 1,
      body: "obsolete suspicion ".repeat(500),
    }));
    threads[0].recent = { nodes: [{ id: "C51", databaseId: 51, body }] };
    const output = await runScript("feedback-facts");
    expect(output.dispose).toBe("yes");
    expect(output.samson_assignment).toContain(body);
    expect(output.samson_assignment).toContain("CURRENT-END");
    state.dispose = {
      task_status: "DONE",
      items: [
        {
          id: "PRRT_1",
          action: "rebut",
          reason: "Investigated the current reply",
          reply: "Current evidence",
        },
      ],
    };
    expect(await runScript("readiness")).toMatchObject({ verdict: "WAIT" });
    expect(
      documents.get("core/issues/7/feedback").value.dispositions.PRRT_1
        .lastComment,
    ).toBe("C51");
    expect(state.github.resolveThread).toHaveBeenCalledOnce();
  });

  it("preserves every current reply when the combined surrounding context must be dropped (F2)", async () => {
    threads = Array.from({ length: 12 }, (_, index) => ({
      id: `T${index}`,
      isResolved: false,
      comments: {
        nodes: [
          { id: `old-${index}`, body: "old ".repeat(2000) },
          {
            id: `new-${index}`,
            body: `EXACT-CURRENT-${index} ${"detail ".repeat(200)}`,
          },
        ],
      },
    }));
    const output = await runScript("feedback-facts");
    expect(output.dispose).toBe("yes");
    for (const live of threads)
      expect(output.samson_assignment).toContain(live.comments.nodes[1].body);
    expect(output.samson_assignment).not.toContain(
      "characters omitted; read the full file",
    );
  });

  it.each(["missing", "oversized"])(
    "blocks %s current feedback rather than certifying unread content (F2)",
    async (scenario) => {
      threads[0].recent = {
        nodes: [
          {
            id: "C51",
            ...(scenario === "oversized"
              ? { body: "Exact reply ".repeat(5000) }
              : {}),
          },
        ],
      };
      documents.get("core/issues/7/feedback").value.dispositions.PRRT_1 = {
        action: "rebut",
        head: HEAD,
        lastComment: "C51",
      };
      if (scenario === "oversized")
        documents.get("core/issues/7/feedback").value.dispositions = {};
      const output = await runScript("feedback-facts");
      expect(output).toMatchObject({ dispose: "no", samson_assignment: "" });
      expect(entries["feedback-facts"].blocked.code).toBe(
        scenario === "missing"
          ? "feedback-content-unavailable"
          : "feedback-context-limit",
      );
      state.dispose = {
        task_status: "DONE",
        items: [{ id: "PRRT_1", action: "rebut", reason: "Unread", reply: "" }],
      };
      expect(await runScript("readiness")).toMatchObject({
        verdict: "BLOCKED",
      });
      expect(state.github.resolveThread).not.toHaveBeenCalled();
      expect(state.github.replyToReviewComment).not.toHaveBeenCalled();
    },
  );

  it.each([
    "same-revision",
    "stale-micaiah",
    "stale-luke",
    "incomplete-final",
    "missing-original",
    "unchanged-implementation",
    "carried-implementation",
  ])(
    "leaves %s feedback unresolved at the caller boundary (F1)",
    async (scenario) => {
      const value = state.document.value;
      value.acceptance.revision = AFTER;
      value.reviews = reviews(AFTER);
      value.final.acceptanceRevision = AFTER;
      const disposition: any = {
        action: "fix-acceptance",
        head: HEAD,
        acceptanceRevision: BEFORE,
        lastComment: "C1",
      };
      if (scenario === "same-revision") disposition.acceptanceRevision = AFTER;
      if (scenario === "stale-micaiah")
        value.reviews.micaiah.acceptance = BEFORE;
      if (scenario === "stale-luke") value.reviews.luke.acceptance = BEFORE;
      if (scenario === "incomplete-final") value.final.taskStatus = "BLOCKED";
      if (scenario === "missing-original")
        delete disposition.acceptanceRevision;
      if (scenario === "unchanged-implementation")
        disposition.action = "fix-implementation";
      if (scenario === "carried-implementation") {
        disposition.action = "fix-implementation";
        disposition.head = BASE;
        value.final.carriedFrom = BASE;
      }
      documents.get("core/issues/7/feedback").value.dispositions.PRRT_1 =
        disposition;
      await runScript("feedback-facts");
      const output = await runScript("readiness");
      expect(["REPAIR", "BLOCKED"]).toContain(output.verdict);
      expect(state.github.resolveThread).not.toHaveBeenCalled();
      expect(state.github.merge).not.toHaveBeenCalled();
    },
  );

  it("completes feedback -> oracle -> same-head review -> resolution -> PR_READY (F1)", async () => {
    expect(await runScript("feedback-facts")).toMatchObject({ dispose: "yes" });
    expect(entries["feedback-facts"].acceptanceRevision).toBe(BEFORE);
    state.dispose = {
      task_status: "DONE",
      items: [
        {
          id: "PRRT_1",
          action: "fix-acceptance",
          reason: "Oracle criterion was incorrect",
        },
      ],
    };
    expect(await runScript("readiness")).toMatchObject({ verdict: "REPAIR" });
    const disposition = documents.get("core/issues/7/feedback").value
      .dispositions.PRRT_1;
    expect(disposition).toMatchObject({
      head: HEAD,
      acceptanceRevision: BEFORE,
    });
    expect(repairRoute(entries.readiness.repair)).toBe("oracle");
    const oracle = afterDefinePlan({
      route: "oracle",
      planned: "yes",
      hasAcceptance: true,
      scopeStopped: false,
      defined: true,
      hasHead: true,
      testsChanged: false,
      implementationRepairs: 0,
    });
    expect(oracle).toMatchObject({ build: false, freeze: false });
    expect(repairRoute(oracle.repair)).toBe("review");
    const value = state.document.value;
    value.brief = briefAfterDefine({
      ...value.brief,
      repair: entries.readiness.repair,
    });
    value.acceptance.revision = AFTER;
    value.reviews = reviews(AFTER);
    value.final = {
      taskStatus: "DONE",
      decision: "PASS",
      candidate: HEAD,
      acceptanceRevision: AFTER,
    };
    expect(publicationGate({ value, candidate: HEAD })).toEqual([]);
    state.dispose = null;
    expect(await runScript("feedback-facts")).toMatchObject({ dispose: "no" });
    expect(await runScript("readiness")).toMatchObject({ verdict: "WAIT" });
    expect(state.github.resolveThread).toHaveBeenCalledWith("PRRT_1");
    expect(
      documents.get("core/issues/7/feedback").value.dispositions.PRRT_1,
    ).toMatchObject({
      fixedAcceptanceRevision: AFTER,
      fixedIn: HEAD,
      status: "fixed",
    });
    expect(await runScript("feedback-facts")).toMatchObject({ dispose: "no" });
    expect(await runScript("readiness")).toMatchObject({ verdict: "PR_READY" });
    expect(state.document.value.head).toBe(HEAD);
    expect(state.github.merge).not.toHaveBeenCalled();
    expect(state.round.git.ok).not.toHaveBeenCalled();
  });
});
