import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  config: {
    root: "/srv/core-factory",
    archon: { serviceHome: "/home/admin" },
    nativeIdentity: {
      owner: "conrad",
      profile: "/home/admin/.claude",
      provider: "claude",
    },
    owners: {
      conrad: { profile: "/home/admin/.claude" },
      other: { profile: "/home/admin/.claude-other" },
    },
  },
  owner: "conrad",
  bind: vi.fn(),
  get: vi.fn(),
  list: vi.fn(),
  mkdir: vi.fn(),
  write: vi.fn(),
}));

vi.mock("node:fs", async (original) => ({
  ...(await original<Record<string, any>>()),
  mkdirSync: (...args: unknown[]) => state.mkdir(...args),
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
  "../../../scripts/archon-factory/pack/.shared/archon.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    createArchon: () => ({ get: state.get, list: state.list }),
  }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/identity.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    ensureInitialRunIdentity: (...args: unknown[]) => state.bind(...args),
  }),
);

const stopped = new Error("initial binding fixture stopped");

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("WORKFLOW_ID", "run-initial-binding");
  vi.stubEnv("INPUTS_MODE", "boundary");
  vi.stubEnv("INPUTS_CONVERSATION", "conversation-fixture");
  state.owner = "conrad";
  state.bind.mockRejectedValue(stopped);
  state.get.mockImplementation(async (name: string) => ({
    value: name === "core/scope" ? { owner: state.owner } : null,
  }));
  state.list.mockRejectedValue(stopped);
  state.mkdir.mockImplementation(() => {
    throw stopped;
  });
  state.write.mockImplementation(() => {
    throw stopped;
  });
});

afterEach(() => vi.unstubAllEnvs());

describe("initial model entry bindings", () => {
  it.each([
    [
      "select/facts",
      () =>
        import("../../../scripts/archon-factory/pack/select/scripts/facts.ts"),
    ],
    [
      "answer/facts",
      () =>
        import("../../../scripts/archon-factory/pack/answer/scripts/facts.ts"),
    ],
    [
      "analyze/collect",
      () =>
        import("../../../scripts/archon-factory/pack/analyze/scripts/collect.ts"),
    ],
    [
      "probe/identity",
      () =>
        import("../../../scripts/archon-factory/pack/probe/scripts/identity.ts"),
    ],
  ] as const)(
    "binds %s before model-facing context or side effects",
    async (_name, load) => {
      await expect(load()).rejects.toThrow(stopped);
      expect(state.bind).toHaveBeenCalledWith({
        config: state.config,
        runId: "run-initial-binding",
      });
      expect(state.mkdir).not.toHaveBeenCalled();
      expect(state.write).not.toHaveBeenCalled();
      expect(state.list).not.toHaveBeenCalled();
    },
  );

  it("refuses another selector scope owner before binding or ranking", async () => {
    state.owner = "other";
    await expect(
      import("../../../scripts/archon-factory/pack/select/scripts/facts.ts"),
    ).rejects.toThrow(/^identity-owner-mismatch$/);
    expect(state.bind).not.toHaveBeenCalled();
    expect(state.list).not.toHaveBeenCalled();
  });
});
