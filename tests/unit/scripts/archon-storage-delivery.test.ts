import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAssignment } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

const state = vi.hoisted(() => ({
  round: null as any,
  document: null as any,
  github: null as any,
  output: null as any,
  guard: vi.fn(),
  run: vi.fn(),
  publish: vi.fn(),
  remoteHead: vi.fn(),
  decide: vi.fn(),
  remove: vi.fn(),
  events: [] as string[],
}));

vi.mock("node:fs", async (original) => ({
  ...(await original<Record<string, any>>()),
  lstatSync: () => ({ isSymbolicLink: () => false, isDirectory: () => true }),
  rmSync: (...args: unknown[]) => state.remove(...args),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs",
  () => ({
    checkFactoryStorage: (...args: unknown[]) => state.guard(...args),
  }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: () => state.round,
  input: () => null,
  policyRevision: () => ({ policyRevision: "c".repeat(64) }),
  workItem: async () => structuredClone(state.document),
  writeWorkItem: async (_round: unknown, plan: any) => {
    state.events.push(
      `checkpoint:${plan.value.pr?.mergeRequest?.status ?? "other"}`,
    );
    state.document = {
      ...state.document,
      value: plan.value,
      revision: state.document.revision + 1,
    };
  },
  runInIssueRepo: (...args: unknown[]) => state.run(...args),
  emit: (output: unknown) => {
    state.output = output;
  },
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/github.mjs", () => ({
  createGitHub: () => state.github,
  githubToken: async () => "fixture-token",
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/git.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    revParse: async () => "b".repeat(40),
    publishFromOutbox: (...args: unknown[]) => state.publish(...args),
    remoteHead: (...args: unknown[]) => state.remoteHead(...args),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/readiness.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    evaluateReadiness: (...args: unknown[]) => state.decide(...args),
  }),
);

const HEAD = "a".repeat(40);
const EXIT = new Error("readiness fixture exited");
const WRITER = new Error("base writer reached");
const refused = (code = "STORAGE_PROBE_FAILED") => ({
  ok: false,
  code,
  role: "effective-artifacts",
  targetIndex: 16,
});
const ready = () => ({ ok: true, code: "STORAGE_READY" });

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  state.events = [];
  state.output = null;
  state.guard.mockImplementation(async () => {
    state.events.push("storage");
    return ready();
  });
  state.run.mockImplementation(async () => {
    state.events.push("pre-push");
    return {
      status: "passed",
      exitCode: 0,
      cleanupConfirmed: true,
      stdout: "core-factory: pre-push hook passed\n==> PASS ci:preflight",
      stderr: "",
    };
  });
  state.publish.mockImplementation(async () => {
    state.events.push("host-push");
    return { code: 0, stderr: "" };
  });
  state.remoteHead.mockResolvedValue(HEAD);
  state.decide.mockReturnValue({ verdict: "MERGE", reasons: [] });
  const value = createAssignment({
    issue: 12,
    assignmentId: "a12",
    owner: "fixture",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: "c".repeat(64),
    endState: "MERGED",
    now: "2026-11-12T00:00:00Z",
  });
  Object.assign(value, {
    status: "active",
    run: { id: "round-12" },
    head: HEAD,
    base: "b".repeat(40),
    branch: "factory/12-fixture",
    pr: { number: 99, head: HEAD },
  });
  state.document = { revision: 1, lease: { runId: "round-12" }, value };
  const pr = {
    title: "Fixture",
    head: { sha: HEAD },
    base: { ref: "develop" },
    merged: false,
    mergeable: true,
    mergeable_state: "clean",
  };
  state.github = {
    pull: vi.fn(async () => structuredClone(pr)),
    reviewThreads: vi.fn(async () => []),
    reviews: vi.fn(async () => []),
    issueComments: vi.fn(async () => []),
    checkRuns: vi.fn(async () => []),
    statuses: vi.fn(async () => ({ statuses: [] })),
    branchProtection: vi.fn(async () => null),
    branchRules: vi.fn(async () => []),
    merge: vi.fn(async () => {
      state.events.push("github-merge");
      pr.merged = true;
      Object.assign(pr, {
        merge_commit_sha: "d".repeat(40),
        merged_at: "2026-11-12T00:00:01Z",
      });
      return { merged: true, sha: "d".repeat(40) };
    }),
    compare: vi.fn(async () => ({ status: "ahead" })),
    issue: vi.fn(async () => ({ state: "closed" })),
    closeIssue: vi.fn(),
  };
  state.round = {
    issue: 12,
    runId: "round-12",
    artifacts: "/external/artifacts/round-12",
    paths: { root: "/factory" },
    where: {
      root: "/checkouts/12",
      repo: "/checkouts/12/repo",
      outbox: "/checkouts/12/outbox.git",
    },
    config: {
      root: "/factory",
      repository: {
        slug: "fixture/core",
        targetBranch: "develop",
        remote: "fixture-remote",
        mergeMethod: "merge",
      },
      github: { executable: "/usr/bin/gh", configDir: "/no-auth" },
    },
    limits: {},
    now: () => "2026-11-12T00:00:00Z",
    git: { ok: vi.fn(), git: vi.fn() },
    ledger: { read: () => ({}), write: vi.fn() },
    archon: {
      get: vi.fn(async () => ({ revision: 1, value: {} })),
      put: vi.fn(async () => ({ revision: 2 })),
    },
  };
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw EXIT;
  });
});
afterEach(() => vi.restoreAllMocks());

const publish = async (branch = "factory/12-fixture") => {
  const { publishCandidate } =
    await import("../../../scripts/archon-factory/pack/.shared/publication.mjs");
  return publishCandidate(state.round, { branch, candidate: HEAD });
};
const readiness = () =>
  import("../../../scripts/archon-factory/pack/deliver/scripts/readiness.ts");

describe("fresh storage on the actual publication caller", () => {
  it.each([
    "STORAGE_POLICY_MISSING",
    "STORAGE_INODES_LOW",
    "STORAGE_PROBE_FAILED",
    "STORAGE_PROBE_MISMATCH",
  ])("refuses %s before hook rewrites, checks or host push", async (code) => {
    state.guard.mockResolvedValue(refused(code));
    expect(await publish()).toMatchObject({ ok: false, blocked: { code } });
    expect(state.remove).not.toHaveBeenCalled();
    expect(state.run).not.toHaveBeenCalled();
    expect(state.publish).not.toHaveBeenCalled();
  });

  it("checks again after the potentially long pre-push gate and before host publication", async () => {
    state.guard
      .mockResolvedValueOnce(ready())
      .mockResolvedValueOnce(refused("STORAGE_BYTES_LOW"));
    expect(await publish()).toMatchObject({
      ok: false,
      blocked: { code: "STORAGE_BYTES_LOW" },
    });
    expect(state.run).toHaveBeenCalledOnce();
    expect(state.publish).not.toHaveBeenCalled();
    expect(state.guard).toHaveBeenCalledTimes(2);
    expect(state.guard).toHaveBeenLastCalledWith(
      expect.objectContaining({
        config: state.round.config,
        operation: "publish",
        artifacts: state.round.artifacts,
        where: state.round.where,
      }),
    );
  });

  it("keeps hook evidence and target restrictions mandatory despite storage readiness", async () => {
    expect(await publish("develop")).toMatchObject({
      ok: false,
      blocked: { code: "forbidden-target" },
    });
    expect(state.guard).not.toHaveBeenCalled();
    state.run.mockResolvedValue({
      status: "passed",
      stdout: "no hook evidence",
      stderr: "",
    });
    expect(await publish()).toMatchObject({
      ok: false,
      blocked: { code: "hooks-unverified" },
    });
    expect(state.publish).not.toHaveBeenCalled();
  });

  it("awaits the final re-probe then performs the existing verified outbox publication", async () => {
    let release: (value: unknown) => void = () => {};
    state.guard.mockResolvedValueOnce(ready()).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const running = publish();
    await vi.waitFor(() => expect(state.guard).toHaveBeenCalledTimes(2));
    expect(state.publish).not.toHaveBeenCalled();
    release(ready());
    expect(await running).toMatchObject({ ok: true, hooks: { prePush: true } });
    expect(state.publish).toHaveBeenCalledWith(
      expect.objectContaining({ expected: HEAD, branch: "factory/12-fixture" }),
    );
    expect(state.remoteHead).toHaveBeenCalledOnce();
  });
});

describe("storage immediately before readiness writer effects", () => {
  it("blocks the base-writer command on an inode or persistence refusal", async () => {
    state.decide.mockReturnValue({
      verdict: "REPAIR",
      integrate: true,
      reasons: ["base behind"],
    });
    state.guard.mockResolvedValue(refused("STORAGE_INODES_LOW"));
    await expect(readiness()).rejects.toBe(EXIT);
    expect(state.output).toMatchObject({
      verdict: "BLOCKED",
      reason: expect.stringContaining("STORAGE_INODES_LOW"),
    });
    expect(state.run).not.toHaveBeenCalled();
    expect(state.round.ledger.write).toHaveBeenCalledWith(
      "readiness",
      expect.objectContaining({
        storage: expect.objectContaining({ code: "STORAGE_INODES_LOW" }),
      }),
    );
  });

  it("awaits a fresh merge-operation probe immediately before the base writer", async () => {
    state.decide.mockReturnValue({
      verdict: "REPAIR",
      integrate: true,
      reasons: ["base behind"],
    });
    state.run.mockRejectedValue(WRITER);
    let release: (value: unknown) => void = () => {};
    state.guard.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const running = readiness().catch((error) => error);
    await vi.waitFor(() => expect(state.guard).toHaveBeenCalledOnce());
    expect(state.run).not.toHaveBeenCalled();
    expect(state.guard).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "merge",
        artifacts: state.round.artifacts,
        where: state.round.where,
      }),
    );
    release(ready());
    expect(await running).toBe(WRITER);
    expect(state.run).toHaveBeenCalledWith(
      state.round,
      expect.objectContaining({
        command: ["git", "merge", "--no-edit", "origin/develop"],
      }),
    );
  });

  it.each([
    "STORAGE_POLICY_MISSING",
    "STORAGE_CAPACITY_INVALID",
    "STORAGE_PROBE_MISMATCH",
  ])("refuses %s inside the final merge lane and releases it", async (code) => {
    state.guard.mockResolvedValue(refused(code));
    await expect(readiness()).rejects.toBe(EXIT);
    expect(state.output).toMatchObject({
      verdict: "BLOCKED",
      reason: expect.stringContaining(code),
    });
    expect(state.github.merge).not.toHaveBeenCalled();
    expect(state.round.archon.put).toHaveBeenLastCalledWith(
      "core/merge-lane",
      expect.anything(),
      expect.objectContaining({ lease: "release" }),
    );
  });

  it("checks storage after recording intent, just before expected-head merge", async () => {
    await expect(readiness()).rejects.toBe(EXIT);
    expect(state.events).toContain("storage");
    expect(state.events.indexOf("storage")).toBeGreaterThan(
      state.events.indexOf("checkpoint:requested"),
    );
    expect(state.events[state.events.indexOf("github-merge") - 1]).toBe(
      "storage",
    );
    expect(state.github.merge).toHaveBeenCalledWith(
      99,
      expect.objectContaining({ sha: HEAD, method: "merge" }),
    );
    expect(state.output).toMatchObject({ verdict: "MERGED" });
  });

  it("does not bypass a changed readiness decision", async () => {
    state.decide
      .mockReturnValueOnce({ verdict: "MERGE", reasons: [] })
      .mockReturnValue({ verdict: "WAIT", reasons: ["held"] });
    await expect(readiness()).rejects.toBe(EXIT);
    expect(state.guard).not.toHaveBeenCalled();
    expect(state.github.merge).not.toHaveBeenCalled();
  });

  it.each(["requested", "unknown", "confirmed"])(
    "does not bypass a prior %s merge request",
    async (status) => {
      state.document.value.pr.mergeRequest = { head: HEAD, status };
      await expect(readiness()).rejects.toBe(EXIT);
      expect(state.output).toMatchObject({
        verdict: "BLOCKED",
        reason: expect.stringContaining("reconciliation"),
      });
      expect(state.guard).not.toHaveBeenCalled();
      expect(state.github.merge).not.toHaveBeenCalled();
      expect(state.round.archon.put).toHaveBeenLastCalledWith(
        "core/merge-lane",
        expect.anything(),
        expect.objectContaining({ lease: "release" }),
      );
    },
  );
});
