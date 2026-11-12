import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  round: null as any,
  inherit: vi.fn(),
  write: vi.fn(),
  emit: vi.fn(),
  planClaim: vi.fn(),
}));

vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: () => state.round,
  policyRevision: () => ({ policyRevision: "c".repeat(64) }),
  inheritRoundIdentity: (...args: unknown[]) => state.inherit(...args),
  writeWorkItem: (...args: unknown[]) => state.write(...args),
  emit: (...args: unknown[]) => state.emit(...args),
  ensureInstall: vi.fn(),
}));

vi.mock(
  "../../../scripts/archon-factory/pack/.shared/workitem.mjs",
  async (original) => ({
    ...(await original<Record<string, any>>()),
    planClaim: (...args: unknown[]) => state.planClaim(...args),
    factoryPermitsRound: () => ({ ok: true }),
  }),
);

const stopped = new Error("claim fixture stopped");
const assignment = { owner: "conrad", profileDigest: "a".repeat(64) };

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  state.round = {
    runId: "run-claim-identity",
    issue: 12,
    assignment: "assignment-12",
    paths: {},
    now: () => "2026-11-12T00:00:00.000Z",
    ledger: { write: vi.fn() },
    archon: { get: vi.fn(async () => ({ value: { assignment } })) },
  };
  state.planClaim.mockReturnValue({ value: { assignment }, lease: "take" });
  state.write.mockRejectedValue(stopped);
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw stopped;
  });
});

afterEach(() => vi.restoreAllMocks());

describe("delivery claim identity barrier", () => {
  it("refuses inherited identity drift before taking the lease or preparing a workspace", async () => {
    const { NativeIdentityRefusal } =
      await import("../../../scripts/archon-factory/pack/.shared/identity.mjs");
    state.inherit.mockRejectedValue(
      new NativeIdentityRefusal("identity-run-binding-drift"),
    );
    await expect(
      import("../../../scripts/archon-factory/pack/deliver/scripts/claim.ts"),
    ).rejects.toThrow(stopped);
    expect(state.inherit).toHaveBeenCalledWith(state.round, assignment);
    expect(state.write).not.toHaveBeenCalled();
    expect(state.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        proceed: "no",
        reason: expect.stringContaining("identity-run-binding-drift"),
      }),
    );
    expect(state.round.ledger.write).toHaveBeenCalledWith(
      "claim",
      expect.objectContaining({
        leaseTaken: false,
        code: "identity-run-binding-drift",
      }),
    );
  });

  it("awaits verified assignment inheritance before the first lease write", async () => {
    let release: () => void = () => {};
    state.inherit.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const claimed =
      import("../../../scripts/archon-factory/pack/deliver/scripts/claim.ts").catch(
        (error) => error,
      );
    await vi.waitFor(() =>
      expect(state.inherit).toHaveBeenCalledWith(state.round, assignment),
    );
    expect(state.round.archon.get).toHaveBeenCalledWith("core/issues/12");
    expect(state.write).not.toHaveBeenCalled();
    release();
    expect(await claimed).toBe(stopped);
    expect(state.write).toHaveBeenCalledOnce();
  });
});
