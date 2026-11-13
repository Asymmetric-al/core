import { describe, expect, it, vi } from "vitest";
import { inheritRoundIdentity } from "../../../scripts/archon-factory/pack/.shared/round.mjs";
const digest = "a".repeat(64);
const binding = {
  owner: "fixture",
  profile: "/home/fixture/.claude",
  provider: "claude",
  profileDigest: digest,
};
const fixture = (parent: string | null = "parent-run000") => ({
  runId: "child-run000",
  config: { nativeIdentity: binding },
  archon: {
    raw: vi.fn(async () => ({
      code: 0,
      json: { id: "child-run000", parent_run_id: parent },
    })),
  },
});
describe("round native identity inheritance", () => {
  it("creates an initial child binding only from its immutable parent and matching current invocation", async () => {
    const round = fixture();
    const invocation = { id: "inv-1", loopPath: [] };
    const attempt = { id: "attempt-1" };
    round.archon.raw.mockResolvedValue({
      code: 0,
      json: {
        id: round.runId,
        parent_run_id: "parent-run000",
        status: "running",
        adopted_from_run_id: null,
        workflow_name: "core-deliver",
        events: [
          { event_type: "workflow_started", workflow_run_id: round.runId },
          {
            event_type: "node_started",
            workflow_run_id: round.runId,
            step_name: "claim",
            data: { invocation, attempt },
          },
        ],
      },
    } as any);
    const read = vi.fn(({ runId }: any) => {
      if (runId === round.runId)
        throw Object.assign(new Error("missing"), {
          code: "identity-run-binding-missing",
        });
      return { ...binding, v: 1, runId };
    });
    const bind = vi.fn((input: any) => input.binding);
    await inheritRoundIdentity(round, binding, {
      readIdentity: read,
      bindIdentity: bind,
      verifyIdentity: async () => binding,
      env: {
        ARCHON_NODE_EXECUTION: JSON.stringify({
          runId: round.runId,
          path: "claim",
          invocation,
          attempt,
        }),
      },
    });
    expect(bind).toHaveBeenCalledWith(
      expect.objectContaining({
        binding: expect.objectContaining({
          runId: "parent-run000",
          profileDigest: digest,
        }),
      }),
    );
  });

  // Observed on the pinned engine (delivery run 10e8844c, 12 November 2026):
  // the engine records its undecided native credential preflight before the
  // workflow starts, so a genuinely first claim sees three events, not two.
  const initialRoot = (extra: Record<string, unknown>[] = []) => {
    const round = fixture(null);
    const invocation = { id: "inv-1", loopPath: [] };
    const attempt = { id: "attempt-1" };
    round.archon.raw.mockResolvedValue({
      code: 0,
      json: {
        id: round.runId,
        parent_run_id: null,
        status: "running",
        adopted_from_run_id: null,
        workflow_name: "core-deliver",
        events: [
          {
            event_type: "credential_check_inconclusive",
            workflow_run_id: round.runId,
            data: { provider: "claude", source: "native" },
          },
          { event_type: "workflow_started", workflow_run_id: round.runId },
          {
            event_type: "node_started",
            workflow_run_id: round.runId,
            step_name: "claim",
            data: { invocation, attempt },
          },
          ...extra.map((event) => ({
            workflow_run_id: round.runId,
            data: { invocation, attempt },
            ...event,
          })),
        ],
      },
    } as any);
    const read = () => {
      throw Object.assign(new Error("missing"), {
        code: "identity-run-binding-missing",
      });
    };
    const bind = vi.fn((input: any) => input.binding);
    const verify = vi.fn(async () => binding);
    const run = () =>
      inheritRoundIdentity(round, binding, {
        readIdentity: read,
        bindIdentity: bind,
        verifyIdentity: verify,
        env: {
          ARCHON_NODE_EXECUTION: JSON.stringify({
            runId: round.runId,
            path: "claim",
            invocation,
            attempt,
          }),
        },
      });
    return { round, bind, verify, run };
  };

  it("binds a first claim whose engine credential preflight was inconclusive", async () => {
    const { round, bind, verify, run } = initialRoot();
    await run();
    // A resumed round's event record is far larger than the default bound.
    expect(round.archon.raw).toHaveBeenCalledWith(
      ["workflow", "get", round.runId, "--json", "--verbose", "--events"],
      undefined,
      { maxOutput: 64 * 1024 * 1024 },
    );
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ expectedDigest: digest }),
    );
    expect(bind).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: round.runId,
        binding: expect.objectContaining({ profileDigest: digest }),
      }),
    );
  });

  it.each([
    ["a finished node", { event_type: "node_completed", step_name: "claim" }],
    [
      "a second claim start",
      { event_type: "node_started", step_name: "claim" },
    ],
    ["a resume", { event_type: "workflow_resumed" }],
    ["an unknown engine event", { event_type: "state_written" }],
    [
      "a preflight event from another run",
      {
        event_type: "credential_check_inconclusive",
        workflow_run_id: "other-run000",
      },
    ],
  ])("does not bind a claim after %s", async (_label, extra) => {
    const { bind, verify, run } = initialRoot([extra]);
    await expect(run()).rejects.toThrow(/^identity-initial-run-required$/);
    expect(verify).not.toHaveBeenCalled();
    expect(bind).not.toHaveBeenCalled();
  });

  it("refuses to recreate a resumed root binding from ambient identity", async () => {
    const round = fixture(null);
    const verify = vi.fn();
    const read = () => {
      throw Object.assign(new Error("missing"), {
        code: "identity-run-binding-missing",
      });
    };
    await expect(
      inheritRoundIdentity(round, binding, {
        readIdentity: read,
        verifyIdentity: verify,
      }),
    ).rejects.toMatchObject({ code: "identity-initial-run-required" });
    expect(verify).not.toHaveBeenCalled();
  });

  it("copies immutable parent binding and verifies the same digest before binding child", async () => {
    const round = fixture();
    const read = vi.fn(() => ({ ...binding, runId: "parent-run000", v: 1 }));
    const bind = vi.fn((input: any) => input.binding);
    const verify = vi.fn(async () => binding);
    await inheritRoundIdentity(round, binding, {
      readIdentity: read,
      bindIdentity: bind,
      verifyIdentity: verify,
    });
    expect(read).toHaveBeenCalledWith({
      config: round.config,
      runId: "parent-run000",
    });
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "fixture", expectedDigest: digest }),
    );
    expect(bind).toHaveBeenCalledWith(
      expect.objectContaining({
        runId: round.runId,
        binding: expect.objectContaining(binding),
      }),
    );
  });
  it("binds a root only to the explicit assignment digest", async () => {
    const round = fixture(null);
    const read = () => ({ ...binding, runId: round.runId, v: 1 });
    const bind = vi.fn((input: any) => input.binding);
    const verify = vi.fn(async () => binding);
    await inheritRoundIdentity(round, binding, {
      readIdentity: read,
      bindIdentity: bind,
      verifyIdentity: verify,
    });
    expect(verify).toHaveBeenCalledWith(
      expect.objectContaining({ expectedDigest: digest }),
    );
    expect(bind).toHaveBeenCalledOnce();
  });
  it.each([
    {},
    { owner: "other", profileDigest: digest },
    { owner: "fixture", profileDigest: "b".repeat(64) },
  ])("refuses absent or drifted assignment evidence %j", async (expected) => {
    const bind = vi.fn();
    await expect(
      inheritRoundIdentity(fixture(), expected, {
        readIdentity: () => binding,
        bindIdentity: bind,
        verifyIdentity: vi.fn(),
      }),
    ).rejects.toThrow();
    expect(bind).not.toHaveBeenCalled();
  });
  it("refuses unavailable metadata without selecting ambient identity", async () => {
    const round = fixture();
    round.archon.raw.mockResolvedValue({ code: 1, json: null } as any);
    const verify = vi.fn();
    await expect(
      inheritRoundIdentity(round, binding, { verifyIdentity: verify }),
    ).rejects.toThrow();
    expect(verify).not.toHaveBeenCalled();
  });
});
