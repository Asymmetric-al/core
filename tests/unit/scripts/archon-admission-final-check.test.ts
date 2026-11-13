import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  ledger: null as any,
  fresh: null as any,
  config: {
    root: "/factory",
    repository: { slug: "Asymmetric-al/core" },
    github: { executable: "gh" },
    owners: { conrad: { profile: "/home/admin/.claude" } },
  },
  observe: vi.fn(),
  put: vi.fn(),
  write: vi.fn(),
  verify: vi.fn(),
  storage: vi.fn(),
}));
vi.mock("node:fs", async (original) => ({
  ...(await original<Record<string, any>>()),
  readFileSync: () => JSON.stringify(state.ledger),
  writeFileSync: (...args: unknown[]) => state.write(...args),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/config.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    loadConfig: () => state.config,
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/identity.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    readRunIdentity: () => ({ owner: "conrad", profileDigest: "a".repeat(64) }),
    verifyNativeIdentity: (...args: unknown[]) => state.verify(...args),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/archon.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    createArchon: () => ({
      get: async (name: string) => ({
        value: name === "core/issues/12" ? null : { owner: "conrad" },
        revision: 1,
      }),
      put: state.put,
    }),
  }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  policyRevision: () => ({ policyRevision: "c".repeat(64) }),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/github.mjs", () => ({
  githubToken: async () => "synthetic-fixture",
  createGitHub: () => ({}),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs",
  () => ({
    checkFactoryStorage: (...args: unknown[]) => state.storage(...args),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/intake-logic.mjs",
  () => ({ admissionCheck: () => ({ ok: true, endState: "PR_READY" }) }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/admission-observations.mjs",
  () => ({ observeAdmission: (...args: unknown[]) => state.observe(...args) }),
);
const stopped = new Error("final admission fixture stopped");
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("WORKFLOW_ID", "select-final-check");
  const candidate = {
    id: "#12",
    contextRevision: "context-v1",
    eligibleSinceMs: 1,
    dependenciesReconciled: true,
    dependencies: [],
    evidence: [],
    admission: {
      hold: "clear",
      owner: "clear",
      sharedArea: "clear",
      resources: "clear",
    },
  };
  const input = {
    scope: { revision: "b".repeat(64), approvedIssueIds: ["#12"] },
    items: { "#12": { status: "found", value: candidate } },
  };
  state.ledger = {
    frontier: ["#12"],
    scopeRevision: "b".repeat(64),
    scopeDocumentRevision: 1,
    input,
  };
  state.fresh = {
    scopeRevision: "b".repeat(64),
    scopeDocumentRevision: 1,
    capacity: 1,
    input: structuredClone(input),
  };
  state.observe.mockImplementation(async () => state.fresh);
  state.verify.mockResolvedValue({ profileDigest: "a".repeat(64) });
  state.storage.mockResolvedValue({ ok: true, code: "STORAGE_READY" });
  state.put.mockRejectedValue(stopped);
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw stopped;
  });
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
const run = async () =>
  expect(
    import("../../../scripts/archon-factory/pack/select/scripts/admit.ts"),
  ).rejects.toThrow(stopped);

describe("final admission fresh observation barrier", () => {
  it.each(["owner", "sharedArea", "resources", "hold"])(
    "refuses a fresh %s conflict despite the earlier frontier",
    async (gate) => {
      state.fresh.input.items["#12"].value.admission[gate] = "conflict";
      await run();
      expect(state.put).not.toHaveBeenCalled();
      expect(state.write).toHaveBeenCalledWith(
        expect.stringContaining("admission.json"),
        expect.stringContaining("admission-changed"),
      );
    },
  );
  it("refuses newly unsatisfied integration dependencies", async () => {
    state.fresh.input.items["#12"].value.dependencies = [
      { kind: "implementation", targetId: "#50", requires: "integrated" },
    ];
    state.fresh.input.items["#50"] = { status: "missing" };
    await run();
    expect(state.put).not.toHaveBeenCalled();
  });
  it("refuses material context drift even when the selected issue remains eligible", async () => {
    state.fresh.input.items["#12"].value.contextRevision = "context-v2";
    await run();
    expect(state.put).not.toHaveBeenCalled();
  });
  it("refuses a full capacity observation", async () => {
    state.fresh.capacity = 0;
    await run();
    expect(state.put).not.toHaveBeenCalled();
  });
  it("refuses unavailable fresh evidence", async () => {
    state.observe.mockRejectedValue(new Error("synthetic unavailable"));
    await run();
    expect(state.put).not.toHaveBeenCalled();
  });
  it.each(["scopeRevision", "scopeDocumentRevision"])(
    "refuses changed %s",
    async (field) => {
      state.fresh[field] = field === "scopeRevision" ? "d".repeat(64) : 2;
      await run();
      expect(state.put).not.toHaveBeenCalled();
    },
  );
  it("refuses a missing historical context baseline", async () => {
    delete state.ledger.input;
    await run();
    expect(state.put).not.toHaveBeenCalled();
  });
  it("durably refuses malformed fresh input", async () => {
    state.fresh.input = null;
    await run();
    expect(state.put).not.toHaveBeenCalled();
    expect(state.write).toHaveBeenCalledWith(
      expect.stringContaining("admission.json"),
      expect.stringContaining("admission-observations-unavailable"),
    );
  });
  it("writes an unchanged eligible choice only after the awaited identity and fresh checks", async () => {
    await run();
    expect(state.observe).toHaveBeenCalledOnce();
    expect(state.verify.mock.invocationCallOrder[0]).toBeLessThan(
      state.observe.mock.invocationCallOrder[0],
    );
    expect(state.observe.mock.invocationCallOrder[0]).toBeLessThan(
      state.put.mock.invocationCallOrder[0],
    );
    expect(state.storage.mock.invocationCallOrder[0]).toBeLessThan(
      state.put.mock.invocationCallOrder[0],
    );
    expect(state.put).toHaveBeenCalledWith(
      "core/issues/12",
      expect.objectContaining({
        assignment: expect.objectContaining({ profileDigest: "a".repeat(64) }),
      }),
      { ifRevision: 1 },
    );
  });
});
