import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  config: {
    root: "/factory",
    archon: { home: "/native" },
    repository: { slug: "Asymmetric-al/core" },
    github: { executable: "gh" },
  },
  input: {
    scope: { revision: "b".repeat(64), approvedIssueIds: ["#12"] },
    items: {
      "#12": {
        status: "found",
        value: {
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
        },
      },
    },
  },
  observe: vi.fn(),
  guard: vi.fn(),
  put: vi.fn(),
  fire: vi.fn(),
  identity: vi.fn(),
  writes: [] as string[],
  events: [] as string[],
}));

vi.mock("node:fs", async (original) => ({
  ...(await original<Record<string, any>>()),
  readFileSync: () =>
    JSON.stringify({
      frontier: ["#12"],
      scopeRevision: "b".repeat(64),
      scopeDocumentRevision: 1,
      input: state.input,
    }),
  writeFileSync: (_file: string, data: string) => state.writes.push(data),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/config.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    loadConfig: () => state.config,
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs",
  () => ({
    checkFactoryStorage: (...args: unknown[]) => state.guard(...args),
  }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/identity.mjs", () => ({
  NativeIdentityRefusal: class extends Error {},
  readRunIdentity: () => ({ owner: "conrad", profileDigest: "a".repeat(64) }),
  verifyNativeIdentity: (...args: unknown[]) => state.identity(...args),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/archon.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    createArchon: () => ({
      get: async (name: string) => ({
        value: name === "core/issues/12" ? null : { owner: "conrad" },
        revision: 1,
      }),
      put: (...args: unknown[]) => state.put(...args),
    }),
  }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  policyRevision: () => ({ policyRevision: "c".repeat(64) }),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/github.mjs", () => ({
  githubToken: async () => "fixture-token",
  createGitHub: () => ({}),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/admission-observations.mjs",
  () => ({ observeAdmission: (...args: unknown[]) => state.observe(...args) }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/webhook.mjs", () => ({
  fireRound: (...args: unknown[]) => state.fire(...args),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/intake-logic.mjs",
  () => ({
    admissionCheck: () => ({ ok: true, endState: "PR_READY" }),
  }),
);

const EXIT = new Error("admission stopped");
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  state.writes = [];
  state.events = [];
  vi.stubEnv("WORKFLOW_ID", "select-12");
  vi.stubEnv("ARTIFACTS_DIR", "/artifacts/select-12");
  state.observe.mockResolvedValue({
    scopeRevision: "b".repeat(64),
    scopeDocumentRevision: 1,
    capacity: 1,
    input: structuredClone(state.input),
  });
  state.guard.mockImplementation(async () => {
    state.events.push("storage");
    return { ok: true, code: "STORAGE_READY" };
  });
  state.identity.mockImplementation(async () => {
    state.events.push("identity");
    return { profileDigest: "a".repeat(64) };
  });
  state.put.mockImplementation(async () => {
    state.events.push("put");
    throw EXIT;
  });
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw EXIT;
  });
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

const admit = () =>
  import("../../../scripts/archon-factory/pack/select/scripts/admit.ts");

describe("storage at the actual selector assignment boundary", () => {
  it("awaits storage after native identity and immediately before assignment", async () => {
    let release: (value: unknown) => void = () => {};
    state.guard.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const running = admit().catch((error) => error);
    await vi.waitFor(() => expect(state.guard).toHaveBeenCalledOnce());
    expect(state.put).not.toHaveBeenCalled();
    expect(state.fire).not.toHaveBeenCalled();
    expect(state.identity.mock.invocationCallOrder[0]).toBeLessThan(
      state.observe.mock.invocationCallOrder[0],
    );
    expect(state.observe.mock.invocationCallOrder[0]).toBeLessThan(
      state.guard.mock.invocationCallOrder[0],
    );
    expect(state.guard).toHaveBeenCalledWith({
      config: state.config,
      operation: "admission",
      runId: "select-12",
      artifacts: "/artifacts/select-12",
    });
    release({ ok: true, code: "STORAGE_READY" });
    expect(await running).toBe(EXIT);
    expect(state.put).toHaveBeenCalledOnce();
    expect(state.guard.mock.invocationCallOrder[0]).toBeLessThan(
      state.put.mock.invocationCallOrder[0],
    );
    expect(state.events).toEqual(["identity", "put"]);
  });

  it.each([
    "STORAGE_POLICY_MISSING",
    "STORAGE_INODES_LOW",
    "STORAGE_PROBE_MISMATCH",
    "STORAGE_PROBE_FAILED",
  ])("refuses %s without assignment or dispatch", async (code) => {
    state.guard.mockResolvedValue({
      ok: false,
      code,
      targetIndex: 2,
      role: "native-state",
    });
    await expect(admit()).rejects.toBe(EXIT);
    expect(state.put).not.toHaveBeenCalled();
    expect(state.fire).not.toHaveBeenCalled();
    expect(state.writes.map((data) => JSON.parse(data))).toContainEqual(
      expect.objectContaining({
        admitted: "",
        code,
        storage: expect.objectContaining({ code }),
      }),
    );
  });

  it("preserves the native identity refusal before any storage probe", async () => {
    state.identity.mockRejectedValue(new Error("identity fixture refusal"));
    await expect(admit()).rejects.toThrow("identity fixture refusal");
    expect(state.observe).not.toHaveBeenCalled();
    expect(state.guard).not.toHaveBeenCalled();
    expect(state.put).not.toHaveBeenCalled();
  });
});
