import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  config: {
    root: "/srv/core-factory",
    archon: {},
    repository: { slug: "Asymmetric-al/core" },
    github: { executable: "gh" },
    owners: { conrad: { profile: "/home/admin/.claude" } },
  },
  binding: {
    owner: "conrad",
    profile: "/home/admin/.claude",
    provider: "claude",
    profileDigest: "a".repeat(64),
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
  read: vi.fn(),
  verify: vi.fn(),
  observe: vi.fn(),
  storage: vi.fn(),
  put: vi.fn(),
  write: vi.fn(),
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
    readRunIdentity: (...args: unknown[]) => state.read(...args),
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
  sha256: () => "d".repeat(64),
}));
vi.mock("../../../scripts/archon-factory/pack/.shared/github.mjs", () => ({
  githubToken: async () => "fixture-token",
  createGitHub: () => ({}),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/admission-observations.mjs",
  () => ({ observeAdmission: (...args: unknown[]) => state.observe(...args) }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs",
  () => ({
    checkFactoryStorage: (...args: unknown[]) => state.storage(...args),
  }),
);
vi.mock("../../../scripts/archon-factory/pack/.shared/proc.mjs", () => ({
  cleanEnvironment: () => ({}),
  runProcess: async () => ({
    code: 0,
    stdout: JSON.stringify({
      loggedIn: true,
      authMethod: "claude.ai",
      email: "synthetic@example.invalid",
    }),
  }),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/select/scripts/intake-logic.mjs",
  () => ({
    admissionCheck: () => ({ ok: true, endState: "PR_READY" }),
  }),
);

const stopped = new Error("admission fixture stopped");

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("WORKFLOW_ID", "run-select-identity");
  state.read.mockReturnValue(state.binding);
  state.verify.mockResolvedValue(state.binding);
  state.observe.mockResolvedValue({
    scopeRevision: "b".repeat(64),
    scopeDocumentRevision: 1,
    capacity: 1,
    input: structuredClone(state.input),
  });
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

describe("selector admission binding", () => {
  it("keeps the selector's bound digest instead of calculating a new ambient identity", async () => {
    await expect(
      import("../../../scripts/archon-factory/pack/select/scripts/admit.ts"),
    ).rejects.toThrow(stopped);
    expect(state.verify).toHaveBeenCalledWith({
      config: state.config,
      owner: "conrad",
      expectedDigest: state.binding.profileDigest,
    });
    expect(state.put).toHaveBeenCalledWith(
      "core/issues/12",
      expect.objectContaining({
        assignment: expect.objectContaining({
          profileDigest: state.binding.profileDigest,
        }),
      }),
      expect.anything(),
    );
  });

  it.each(["identity-drift", "identity-run-binding-missing"])(
    "refuses %s before recording any assignment",
    async (code) => {
      const { NativeIdentityRefusal } =
        await import("../../../scripts/archon-factory/pack/.shared/identity.mjs");
      if (code === "identity-run-binding-missing")
        state.read.mockImplementation(() => {
          throw new NativeIdentityRefusal(code);
        });
      else state.verify.mockRejectedValue(new NativeIdentityRefusal(code));
      await expect(
        import("../../../scripts/archon-factory/pack/select/scripts/admit.ts"),
      ).rejects.toThrow(stopped);
      expect(state.observe).not.toHaveBeenCalled();
      expect(state.storage).not.toHaveBeenCalled();
      expect(state.put).not.toHaveBeenCalled();
      expect(state.write).toHaveBeenCalledWith(
        expect.stringContaining("admission.json"),
        expect.stringContaining(code),
      );
    },
  );
});
