import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ round: null as any, result: null as any }));
vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: () => state.round,
  emit: vi.fn(),
}));
vi.mock(
  "../../../scripts/archon-factory/pack/.shared/native-faults.mjs",
  () => ({ readNativeFaults: async () => ({ action: "none" }) }),
);
vi.mock(
  "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs",
  () => ({ settleRound: async () => state.result }),
);
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

it.each(["pending", "stored", "unavailable", "clear"])(
  "retains mount-owned views unless cleanup is confirmed: %s",
  async (mode) => {
    vi.resetModules();
    const root = mkdtempSync(path.join(os.tmpdir(), "archon-record-views-"));
    roots.push(root);
    const views = path.join(root, "views").replace(/\\/g, "/");
    const runId = "run-view-123";
    mkdirSync(`${views}/${runId}`, { recursive: true });
    writeFileSync(`${views}/${runId}/candidate.txt`, "mounted candidate");
    state.result = {
      outcome: "continue",
      next: "review",
      cleanupPending: mode === "pending",
    };
    state.round = {
      runId,
      issue: 12,
      assignment: "a12",
      runDir: root,
      artifacts: root,
      paths: { views },
      limits: {},
      config: { executor: { docker: path.join(root, "docker") } },
      now: () => "2026-11-12T00:00:00Z",
      ledger: { all: () => ({}), write: vi.fn() },
      archon: {
        get: async () => {
          if (mode === "unavailable") throw new Error("transport unavailable");
          return {
            value: mode === "stored" ? { cleanup: { receipt: {} } } : {},
          };
        },
      },
    };
    await import("../../../scripts/archon-factory/pack/deliver/scripts/record.ts");
    expect(existsSync(`${views}/${runId}/candidate.txt`)).toBe(
      mode !== "clear",
    );
  },
);
