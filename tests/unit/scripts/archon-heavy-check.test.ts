import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runHeavyCheck } from "../../../scripts/archon-factory/pack/.shared/heavy-check.mjs";

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});
const setup = () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "archon-heavy-"));
  roots.push(root);
  return {
    locks: root.replace(/\\/g, "/"),
    config: {
      executor: { docker: "/usr/bin/docker" },
      limits: { heavyCheckSlots: 1, checkQueueMs: 20 },
    },
    runId: "run-0123456789",
    issue: 12,
  };
};
const receipt = (attempt: string, extra = {}) => ({
  status: "passed",
  cleanupConfirmed: true,
  reusable: true,
  labels: {
    "core.archon.executor": "candidate-check",
    "core.archon.attempt": attempt,
    "core.archon.run": "run-0123456789",
    "core.archon.issue": "12",
  },
  ...extra,
});

describe("shared heavy executor capacity", () => {
  it("does not overlap trusted commands when the common slot is occupied", async () => {
    const options = setup();
    options.config.limits.checkQueueMs = 0;
    let finish!: () => void;
    let entered!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const release = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const first = runHeavyCheck(options, async (attempt: string) => {
      entered();
      await release;
      return receipt(attempt);
    });
    await started;
    const second = vi.fn();
    await expect(runHeavyCheck(options, second)).rejects.toMatchObject({
      code: "check-capacity",
    });
    expect(second).not.toHaveBeenCalled();
    finish();
    await first;
    await runHeavyCheck(options, async (attempt: string) => receipt(attempt));
    expect(readdirSync(options.locks)).toEqual([]);
  });
  it("retains uncertain ownership when executor transport throws without a receipt", async () => {
    const options = setup();
    const original = new Error("transport interrupted");
    await expect(
      runHeavyCheck(options, async () => {
        throw original;
      }),
    ).rejects.toBe(original);
    expect(
      JSON.parse(readFileSync(`${options.locks}/check-slot-0/owner`, "utf8"))
        .state,
    ).toBe("unconfirmed");
  });

  it("owns the common slot before entering candidate code and releases only after confirmed cleanup", async () => {
    const options = setup();
    await runHeavyCheck(options, async (attempt: string) => {
      const owner = JSON.parse(
        readFileSync(`${options.locks}/check-slot-0/owner`, "utf8"),
      );
      expect(owner).toMatchObject({
        attempt,
        runId: options.runId,
        issue: 12,
        state: "running",
      });
      return receipt(attempt);
    });
    expect(readdirSync(options.locks)).toEqual([]);
  });
  it.each([
    { cleanupConfirmed: false },
    { reusable: false },
    { cleanupConfirmed: undefined },
    { reusable: undefined },
  ])("retains ownership for incomplete cleanup: %j", async (flags) => {
    const options = setup();
    let original: any;
    const error = await runHeavyCheck(options, async (attempt: string) => {
      original = receipt(attempt, flags);
      return original;
    }).catch((error: any) => error);
    expect(error.name).toBe("CheckCleanupError");
    expect(error.receipt).toBe(original);
    expect(
      JSON.parse(readFileSync(`${options.locks}/check-slot-0/owner`, "utf8"))
        .state,
    ).toBe("unconfirmed");
  });
  it("does not execute or reclaim another check without positive empty-workload proof", async () => {
    const options = setup();
    await runHeavyCheck(options, async (attempt: string) =>
      receipt(attempt, { cleanupConfirmed: false }),
    ).catch(() => {});
    const execute = vi.fn();
    const reconcile = vi.fn(async () => ({
      ok: true,
      remaining: ["container"],
    }));
    let now = 0;
    await expect(
      runHeavyCheck(options, execute, {
        reconcile,
        clock: {
          now: () => now,
          sleep: async (ms: number) => {
            now += ms;
          },
          pollMs: 5,
        },
      }),
    ).rejects.toMatchObject({ code: "check-capacity" });
    expect(execute).not.toHaveBeenCalled();
    expect(reconcile).toHaveBeenCalled();
    expect(existsSync(`${options.locks}/check-slot-0/owner`)).toBe(true);
  });
  it("reconciles an uncertain prior attempt before reuse", async () => {
    const options = setup();
    let original = "";
    await runHeavyCheck(options, async (attempt: string) => {
      original = attempt;
      return receipt(attempt, { reusable: false });
    }).catch(() => {});
    const reconcile = vi.fn(async () => ({ ok: true, remaining: [] }));
    await runHeavyCheck(
      options,
      async (attempt: string) => {
        expect(attempt).not.toBe(original);
        return receipt(attempt);
      },
      { reconcile },
    );
    expect(reconcile).toHaveBeenCalledWith(
      expect.objectContaining({ attempt: original }),
    );
    expect(readdirSync(options.locks)).toEqual([]);
  });
  it("cancels before acquiring any capacity or running candidate code", async () => {
    const options = setup();
    const controller = new AbortController();
    controller.abort();
    const execute = vi.fn();
    await expect(
      runHeavyCheck(options, execute, { signal: controller.signal }),
    ).rejects.toMatchObject({ code: "check-cancelled" });
    expect(execute).not.toHaveBeenCalled();
    expect(readdirSync(options.locks)).toEqual([]);
  });
});
