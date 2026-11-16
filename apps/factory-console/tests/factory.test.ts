import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { harness } from "./fixtures/harness";
import { BackendError } from "../src/server/archon";
import { proposalId, requestIds } from "../src/server/control";
import { Factory, proposalRecord } from "../src/server/factory";

describe("factory snapshot", () => {
  it("composes durable state documents with engine runs and live round details", async () => {
    const { factory } = harness();
    const snapshot = await factory.snapshot();
    expect(snapshot.identity).toEqual({
      instance: "fixture-store",
      operator: "conrad",
      codebase: "fixture-core",
    });
    if (
      snapshot.factory.state !== "available" ||
      snapshot.engine.state !== "available"
    )
      throw new Error("expected both sections available");
    const issues = snapshot.factory.data.issues;
    expect(issues.map((issue) => `${issue.issue}:${issue.status}`)).toEqual([
      "101:active",
      "102:active",
      "103:PR_READY",
      "104:BLOCKED",
      "105:MERGED",
      "106:queued",
      "107:waiting",
    ]);
    const queued = issues.find((issue) => issue.issue === 106);
    expect(queued).toMatchObject({
      admitted: false,
      priority: 80,
      inScope: true,
      endState: "PR_READY",
    });
    expect(issues.find((issue) => issue.issue === 101)?.lease).toEqual({
      runId: RUN.repair,
      live: true,
    });
    expect(Object.keys(snapshot.engine.data.details).sort()).toEqual(
      [RUN.repair, RUN.review].sort(),
    );
    expect(
      snapshot.engine.data.details[RUN.repair].timings.build,
    ).toMatchObject({
      model: "claude-opus-fixture",
      effort: "medium",
      provider: "claude",
      attempts: 1,
      endedAt: null,
    });
    expect(snapshot.factory.data.selection.at(-1)?.issue).toBe(102);
    expect(snapshot.settings).toEqual({
      // Both read from the fixture core-factory.json (FACTORY_CONFIG_FILE).
      capacity: 2,
      owners: ["conrad"],
      configReason: null,
      repository: "Asymmetric-al/core",
      // No synthetic-fixture label unless the test-only flag is set.
      fixture: null,
    });
  });

  it("never forwards node outputs, structured outputs, profile digests or private paths", async () => {
    const { factory, state } = harness();
    state.set("core/issues/104", {
      ...(state.value("core/issues/104") ?? {}),
      blocker: {
        code: "x",
        detail:
          "see /srv/core-factory/runs/abc/guard.jsonl with ghp_abcdefghijklmnopqrstuv",
        recovery: null,
        at: null,
      },
    });
    const text = JSON.stringify(await factory.snapshot());
    expect(text).not.toContain("SECRET-NODE-OUTPUT");
    expect(text).not.toContain("SECRET-STRUCTURED-OUTPUT");
    expect(text).not.toContain("profileDigest");
    expect(text).not.toContain("/srv/core-factory");
    expect(text).not.toContain("ghp_abcdefghijklmnopqrstuv");
    expect(text).toContain("[private path]");
    const detail = JSON.stringify(await factory.runDetail(RUN.review));
    expect(detail).not.toContain("SECRET");
    const artifacts = JSON.stringify(await factory.runArtifacts(RUN.review));
    expect(artifacts).not.toContain("/srv/");
  });

  it("reports each section's availability independently", async () => {
    const stateDown = harness();
    stateDown.state.failure = "Factory state read failed (Archon CLI exit 1)";
    const first = await stateDown.factory.snapshot();
    expect(first.factory).toMatchObject({
      state: "unavailable",
      reason: "Factory state read failed (Archon CLI exit 1)",
    });
    expect(first.engine.state).toBe("available");

    const engineDown = harness();
    engineDown.engine.setHealthy(false);
    const second = await engineDown.factory.snapshot();
    expect(second.engine).toMatchObject({ state: "unavailable" });
    expect(second.factory.state).toBe("available");
  });

  it("lists a malformed work item instead of dropping or inventing it", async () => {
    const { factory, state } = harness();
    state.set("core/issues/108", { v: 1, issue: 108, status: "exploded" });
    const snapshot = await factory.snapshot();
    if (snapshot.factory.state !== "available")
      throw new Error("expected available");
    expect(snapshot.factory.data.malformed).toEqual([
      expect.objectContaining({ name: "core/issues/108" }),
    ]);
    expect(
      snapshot.factory.data.issues.some((issue) => issue.issue === 108),
    ).toBe(false);
  });

  it("reads issue detail with feedback dispositions and the request link", async () => {
    const { factory } = harness();
    const detail = await factory.issue(103);
    expect(detail.requestUrl).toBe(
      "https://github.com/Asymmetric-al/core/issues/103",
    );
    expect(detail.item?.final?.decision).toBe("PASS");
    expect(detail.item?.reviews?.luke).toMatchObject({
      decision: "CLEAR",
      findings: 1,
      cleared: true,
    });
    expect(Object.keys(detail.feedback?.dispositions ?? {})).toEqual([
      "thread-1",
      "comment-2",
    ]);
    const queued = await factory.issue(106);
    expect(queued).toMatchObject({ item: null, inScope: true, priority: 80 });
    await expect(factory.issue(999)).rejects.toThrow(BackendError);
  });
});

describe("operator controls", () => {
  it("runs exactly one control.mjs command per click and reads the effect back", async () => {
    const { factory, control, ids } = harness();
    const requestId = ids.mint();
    const receipt = await factory.execute(
      { kind: "factory", action: "pause-intake", reason: "Pausing for review" },
      requestId,
    );
    expect(control.calls).toEqual([
      [
        "factory",
        "pause-intake",
        "--request",
        requestId,
        "--by",
        "conrad",
        "--reason",
        "Pausing for review",
      ],
    ]);
    expect(receipt).toMatchObject({
      requestId,
      label: "Pause intake",
      outcome: "applied",
      observed: {
        summary: "Intake paused · mode run · merges not held",
        recorded: true,
      },
    });
    const again = await factory.execute(
      { kind: "factory", action: "pause-intake", reason: "Pausing for review" },
      requestId,
    );
    expect(again.outcome).toBe("already-applied");
    expect(again.observed?.recorded).toBe(true);
  });

  it("refuses ids it did not mint and destructive controls without confirmation, before spawning", async () => {
    const { factory, control, ids } = harness();
    await expect(
      factory.execute(
        { kind: "factory", action: "hold-merge" },
        "cr-forged0-0000000000000000-0000000000000000",
      ),
    ).rejects.toThrow("not issued");
    await expect(
      factory.execute({ kind: "factory", action: "stop" }, ids.mint()),
    ).rejects.toThrow("confirmation");
    await expect(
      factory.execute(
        { kind: "issue", issue: 101, action: "stop" },
        ids.mint(),
      ),
    ).rejects.toThrow("confirmation");
    await expect(
      factory.execute(
        { kind: "scope", issues: [1], endState: "MERGED", owner: "mallory" },
        ids.mint(),
      ),
    ).rejects.toThrow("owner");
    expect(control.calls).toEqual([]);
    const stopped = await factory.execute(
      { kind: "factory", action: "stop" },
      ids.mint(),
      { confirmed: true },
    );
    expect(stopped.observed?.summary).toBe(
      "Intake paused · mode stop · merges not held",
    );
  });

  it("reports refusals from the pack as refused, not success", async () => {
    const { factory, ids } = harness();
    const receipt = await factory.execute(
      { kind: "issue", issue: 101, action: "release" },
      ids.mint(),
    );
    expect(receipt).toMatchObject({ outcome: "refused", code: "not-held" });
    expect(receipt.observed).toMatchObject({
      summary: "#101 control run · status active · route repair",
      recorded: false,
    });
    const retry = await factory.execute(
      { kind: "issue", issue: 104, action: "retry" },
      ids.mint(),
    );
    expect(retry).toMatchObject({
      outcome: "applied",
      observed: { recorded: true },
    });
  });

  it("treats a lost answer as unknown and lets the same id retry idempotently", async () => {
    const { factory, control, ids } = harness();
    const requestId = ids.mint();
    control.mode = "timeout";
    const lost = await factory.execute(
      { kind: "issue", issue: 102, action: "hold" },
      requestId,
    );
    expect(lost.outcome).toBe("unknown");
    expect(lost.message).toContain("same request id");
    control.mode = "normal";
    const first = await factory.execute(
      { kind: "issue", issue: 102, action: "hold" },
      requestId,
    );
    expect(first.outcome).toBe("applied");
    const second = await factory.execute(
      { kind: "issue", issue: 102, action: "hold" },
      requestId,
    );
    expect(second.outcome).toBe("already-applied");
    control.mode = "crash";
    const crashed = await factory.execute(
      { kind: "issue", issue: 102, action: "release" },
      ids.mint(),
    );
    expect(crashed.outcome).toBe("failed");
    control.mode = "killed";
    const killed = await factory.execute(
      { kind: "issue", issue: 102, action: "release" },
      ids.mint(),
    );
    expect(killed.outcome).toBe("unknown");
  });

  it("assigns scope and priorities through control.mjs with the configured owner", async () => {
    const { factory, control, ids, state } = harness();
    const requestId = ids.mint();
    const receipt = await factory.execute(
      {
        kind: "scope",
        issues: [12, 13, 12],
        endState: "MERGED",
        owner: "conrad",
        note: "Phase 5",
      },
      requestId,
    );
    expect(control.calls.at(-1)).toEqual([
      "scope",
      "--issues",
      "12,13",
      "--end-state",
      "MERGED",
      "--owner",
      "conrad",
      "--request",
      requestId,
      "--by",
      "conrad",
      "--note",
      "Phase 5",
    ]);
    expect(receipt.observed?.summary).toBe("2 issue(s) → MERGED for conrad");
    const prioritized = await factory.execute(
      { kind: "prioritize", issue: 13, priority: 90 },
      ids.mint(),
    );
    expect(prioritized.observed?.summary).toBe("#13 priority 90");
    expect(
      state.value<{ priorities: Record<string, number> }>("core/scope")
        ?.priorities["13"],
    ).toBe(90);
    const outside = await factory.execute(
      { kind: "prioritize", issue: 99, priority: 5 },
      ids.mint(),
    );
    expect(outside).toMatchObject({ outcome: "refused", code: "not-in-scope" });
  });

  it("cancels a run through the server API and reports the observed status", async () => {
    const { factory, control, ids } = harness();
    const receipt = await factory.execute(
      { kind: "cancel-run", runId: RUN.repair },
      ids.mint(),
      { confirmed: true },
    );
    expect(control.calls.at(-1)?.slice(0, 2)).toEqual([
      "cancel-run",
      RUN.repair,
    ]);
    // control.mjs holds the run's issue first, so the cancelled round is not
    // requeued; the receipt reads both the engine run and that issue back.
    expect(receipt).toMatchObject({
      outcome: "applied",
      observed: {
        summary: "Run is cancelled · #101 control hold · status active",
        recorded: true,
      },
    });
    expect(receipt.message).toContain("Issue #101 is held");
    expect(receipt.message).toContain("Removed 1 executor container");
    const again = await factory.execute(
      { kind: "cancel-run", runId: RUN.repair },
      ids.mint(),
      { confirmed: true },
    );
    expect(again.outcome).toBe("refused");
    expect(again.message).toContain("HTTP 409");
    expect(again.message).toContain("No executor containers remain");
  });

  it("reports executor containers a cancelled run left behind and retries with the same id", async () => {
    const { factory, control, ids } = harness();
    control.containers = () => ({
      removed: [],
      remaining: ["0123456789ab"],
    });
    const requestId = ids.mint();
    const first = await factory.execute(
      { kind: "cancel-run", runId: RUN.review },
      requestId,
      { confirmed: true },
    );
    expect(first.outcome).toBe("incomplete");
    expect(first.message).toContain("1 executor container remains");
    control.containers = undefined;
    const retried = await factory.execute(
      { kind: "cancel-run", runId: RUN.review },
      requestId,
      { confirmed: true },
    );
    // The engine refuses a second cancel; nothing is left and the hold is
    // already recorded under the same request id.
    expect(retried.outcome).toBe("refused");
    expect(retried.message).toContain("No executor containers remain");
    expect(retried.observed?.recorded).toBe(true);
  });

  it("starts an analysis and reports the latest recorded report", async () => {
    const { factory, control, ids } = harness();
    const requestId = ids.mint();
    const receipt = await factory.execute(
      { kind: "analyze", scope: "issue:101" },
      requestId,
    );
    expect(control.calls.at(-1)).toEqual([
      "analyze",
      "--scope",
      "issue:101",
      "--trigger",
      "operator",
      "--request",
      requestId,
    ]);
    expect(receipt.outcome).toBe("started");
    expect(receipt.observed?.summary).toContain(
      "Latest recorded report: completed",
    );
  });
});

describe("Samson chat", () => {
  it("asks through control.mjs with a stable server-derived conversation for a first message", async () => {
    const { factory, control, ids } = harness();
    const requestId = ids.mint();
    const first = await factory.ask(requestId, null, "What is running?");
    expect(first.conversation).toBe(ids.conversation(requestId));
    expect(first.conversation).toMatch(/^op-[a-f0-9]{20}$/);
    expect(control.calls.at(-1)).toEqual([
      "ask",
      "--conversation",
      first.conversation,
      "--request",
      requestId,
      "--question",
      "What is running?",
    ]);
    expect(first.receipt).toMatchObject({
      outcome: "started",
      observed: { recorded: false },
    });
    const retry = await factory.ask(requestId, null, "What is running?");
    expect(retry.conversation).toBe(first.conversation);
    expect(retry.receipt.outcome).toBe("started");
    const changed = await factory.ask(
      requestId,
      first.conversation,
      "A different question",
    );
    expect(changed.receipt).toMatchObject({
      outcome: "refused",
      code: "conflict",
    });
  });

  it("lists conversations and marks proposals applied only from durable request ids", async () => {
    const { factory, control } = harness();
    const before = await factory.chat();
    const proposal = before.conversations[0].messages[1];
    expect(proposal.operation?.kind).toBe("hold");
    expect(proposal.applied).toMatchObject({ recorded: false });
    const message = proposal.request ?? "";
    const receipt = await factory.apply(
      "op-fixture-conversation",
      message,
      {},
      false,
    );
    expect(receipt).toMatchObject({
      outcome: "applied",
      label: "Apply Samson's proposal: Hold issue #102",
    });
    expect(control.calls.at(-1)?.slice(0, 3)).toEqual(["issue", "102", "hold"]);
    const after = await factory.chat();
    expect(after.conversations[0].messages[1].applied).toMatchObject({
      recorded: true,
    });
    const repeat = await factory.apply(
      "op-fixture-conversation",
      message,
      {},
      false,
    );
    expect(repeat.outcome).toBe("already-applied");
  });

  it("requires an operator-chosen priority before applying a reprioritize proposal", async () => {
    const { factory, state } = harness();
    const conversation = "op-fixture-priority";
    state.set(`core/chat/${conversation}`, {
      v: 1,
      messages: [
        {
          role: "samson",
          request: "cr-fixturepri-0000000000000000-0000000000000000",
          at: new Date().toISOString(),
          text: "Raise #106",
          operation: {
            kind: "reprioritize",
            issue: 106,
            issues: [],
            endState: "unchanged",
            reason: "Unblocks #102",
            status: "proposed",
          },
        },
      ],
    });
    await expect(
      factory.apply(
        conversation,
        "cr-fixturepri-0000000000000000-0000000000000000",
        {},
        false,
      ),
    ).rejects.toThrow("priority");
    const receipt = await factory.apply(
      conversation,
      "cr-fixturepri-0000000000000000-0000000000000000",
      { priority: 95 },
      false,
    );
    expect(receipt.observed?.summary).toBe("#106 priority 95");
  });

  it("never applies a destructive proposal without confirmation", async () => {
    const { factory, state, control } = harness();
    state.set("core/chat/op-fixture-stop", {
      v: 1,
      messages: [
        {
          role: "samson",
          request: "cr-fixturestp-0000000000000000-0000000000000000",
          at: new Date().toISOString(),
          text: "Stop everything",
          operation: {
            kind: "stop",
            issue: 0,
            issues: [],
            endState: "unchanged",
            reason: "Operator asked",
            status: "proposed",
          },
        },
      ],
    });
    await expect(
      factory.apply(
        "op-fixture-stop",
        "cr-fixturestp-0000000000000000-0000000000000000",
        {},
        false,
      ),
    ).rejects.toThrow("confirmation");
    expect(control.calls).toEqual([]);
  });
});

describe("edge cases", () => {
  it("refuses a malformed work item detail and invalid identifiers", async () => {
    const { factory, state } = harness();
    state.set("core/issues/101", { v: 1, issue: 101, status: "exploded" });
    await expect(factory.issue(101)).rejects.toThrow("malformed");
    await expect(factory.conversation("../etc")).rejects.toThrow(
      "Invalid conversation",
    );
    await expect(factory.report("../x")).rejects.toThrow("Invalid report");
    await expect(factory.report("missing-run")).rejects.toThrow("No report");
  });

  it("applies an assign-scope proposal keeping the current end state and owner", async () => {
    const { factory, state, control } = harness();
    state.set("core/chat/op-fixture-scope", {
      v: 1,
      messages: [
        {
          role: "samson",
          request: "cr-fixturescp-0000000000000000-0000000000000000",
          at: new Date().toISOString(),
          text: "Add #110",
          operation: {
            kind: "assign-scope",
            issue: 0,
            issues: [101, 110],
            endState: "unchanged",
            reason: "Next phase",
            status: "proposed",
          },
        },
      ],
    });
    const receipt = await factory.apply(
      "op-fixture-scope",
      "cr-fixturescp-0000000000000000-0000000000000000",
      {},
      false,
    );
    expect(control.calls.at(-1)?.slice(0, 7)).toEqual([
      "scope",
      "--issues",
      "101,110",
      "--end-state",
      "PR_READY",
      "--owner",
      "conrad",
    ]);
    expect(receipt.observed?.summary).toBe("2 issue(s) → PR_READY for conrad");
    state.docs.delete("core/scope");
    await expect(
      factory.apply(
        "op-fixture-scope",
        "cr-fixturescp-0000000000000000-0000000000000000",
        {},
        false,
      ),
    ).rejects.toThrow("Choose an end state");
  });

  it("refuses to apply a turn without a proposal", async () => {
    const { factory } = harness();
    await expect(
      factory.apply(
        "op-fixture-conversation",
        "cr-unknown000-0000000000000000-0000000000000000",
        {},
        false,
      ),
    ).rejects.toThrow("No proposed operation");
  });

  it("reports an unconfigured factory adapter as unavailable rather than failing", async () => {
    const { auth, archon, ids } = harness();
    const broken = new Factory({
      auth,
      settings: null,
      settingsError:
        "Factory adapter configuration is invalid (FACTORY_ARCHON_CLI)",
      reader: null,
      control: null,
      policy: null,
      engine: archon,
      ids,
    });
    const snapshot = await broken.snapshot();
    expect(snapshot.factory).toMatchObject({
      state: "unavailable",
      reason: "Factory adapter configuration is invalid (FACTORY_ARCHON_CLI)",
    });
    // No built-in owner or admission limit stands in for the unread file.
    expect(snapshot.settings).toMatchObject({
      capacity: null,
      owners: null,
      configReason:
        "Factory adapter configuration is invalid (FACTORY_ARCHON_CLI)",
    });
    expect(snapshot.engine.state).toBe("available");
    await expect(
      broken.execute({ kind: "factory", action: "hold-merge" }, ids.mint()),
    ).rejects.toThrow("FACTORY_ARCHON_CLI");
  });
});

describe("review regressions", () => {
  const turn = "cr-fixtureask-0000000000000000-0000000000000000";

  it("pre-checks durable state: an applied proposal is not run again, whatever variant is chosen", async () => {
    const { factory, control } = harness();
    await factory.apply("op-fixture-conversation", turn, {}, false);
    const calls = control.calls.length;
    const again = await factory.apply(
      "op-fixture-conversation",
      turn,
      {},
      false,
    );
    expect(again.outcome).toBe("already-applied");
    expect(control.calls).toHaveLength(calls);
  });

  it("reports a proposal older than the retained request window as unknown and needs confirmation", async () => {
    const { factory, state, control } = harness();
    const item = state.value<Record<string, unknown>>("core/issues/102") ?? {};
    const later = new Date().toISOString();
    state.set("core/issues/102", {
      ...item,
      requests: Array.from({ length: 20 }, (_, index) => ({
        id: `cr-filler${index}-0000000000000000-0000000000000000`,
        action: "hold",
        by: "conrad",
        at: later,
      })),
    });
    const chat = await factory.chat();
    expect(chat.conversations[0].messages[1].applied).toMatchObject({
      recorded: null,
    });
    await expect(
      factory.apply("op-fixture-conversation", turn, {}, false),
    ).rejects.toThrow("older than the request history");
    expect(control.calls).toEqual([]);
    const confirmed = await factory.apply(
      "op-fixture-conversation",
      turn,
      {},
      true,
    );
    expect(confirmed.outcome).not.toBe("already-applied");
    expect(control.calls).toHaveLength(1);
  });

  it("derives proposal ids without the Console password", () => {
    const first = harness();
    expect(first.ids.proposal("op-a", "m1")).toBe(proposalId("op-a", "m1"));
    expect(
      requestIds("a-completely-different-password-value").proposal(
        "op-a",
        "m1",
      ),
    ).toBe(proposalId("op-a", "m1"));
  });

  it("clips oversized agent text instead of hiding the work item", async () => {
    const { factory, state } = harness();
    const item = state.value<
      Record<string, unknown> & { brief: Record<string, unknown> }
    >("core/issues/101");
    state.set("core/issues/101", {
      ...item,
      brief: {
        ...item?.brief,
        repair: { kind: "implementation", items: ["x".repeat(9000)] },
      },
    });
    const detail = await factory.issue(101);
    // Legacy {kind, items} repairs read as the two-list shape (I2).
    const repaired = detail.item?.brief?.repair?.implementation[0] ?? "";
    expect(repaired.length).toBeLessThan(4100);
    expect(repaired.endsWith("[clipped]")).toBe(true);
  });

  it("keeps a conversation readable when a proposal carries a non-positive issue", async () => {
    const { factory, state } = harness();
    state.set("core/chat/op-fixture-negative", {
      v: 1,
      messages: [
        {
          role: "samson",
          request: "cr-fixtureneg-0000000000000000-0000000000000000",
          at: new Date().toISOString(),
          text: "Assign",
          operation: {
            kind: "assign-scope",
            issue: -1,
            issues: [0, 5],
            endState: "MERGED",
            reason: "x",
            status: "proposed",
          },
        },
      ],
    });
    const chat = await factory.chat();
    expect(chat.malformed).toEqual([]);
    expect(
      chat.conversations.some(
        (conversation) => conversation.id === "op-fixture-negative",
      ),
    ).toBe(true);
    await expect(
      factory.apply(
        "op-fixture-negative",
        "cr-fixtureneg-0000000000000000-0000000000000000",
        {},
        false,
      ),
    ).rejects.toThrow("invalid issue number");
  });

  it("never forwards unbounded node errors in run rows", async () => {
    const { factory, engine } = harness();
    const run = engine.runs.get(RUN.review);
    if (!run) throw new Error("fixture run missing");
    run.nodes = [
      ...run.nodes,
      { node_id: "freeze", state: "failed", error: "E".repeat(5000) },
    ];
    const snapshot = JSON.stringify(await factory.snapshot());
    expect(snapshot).not.toContain("E".repeat(700));
    const detail = await factory.runDetail(RUN.review);
    expect(JSON.stringify(detail)).not.toContain("E".repeat(700));
    expect("nodes" in detail.run).toBe(false);
  });
});

describe("proposal history window", () => {
  const full = (at: string) =>
    Array.from({ length: 20 }, (_, index) => ({ id: `cr-x${index}`, at }));
  it("is applied only when the id is recorded, unknown when the window may have evicted it", () => {
    expect(
      proposalRecord(
        [{ id: "ap-abc-x", at: "2026-11-11T00:00:00Z" }],
        "ap-abc-",
        "2026-11-10T00:00:00Z",
      ),
    ).toEqual({ requestId: "ap-abc-x", recorded: true });
    expect(
      proposalRecord(
        full("2026-11-09T00:00:00Z"),
        "ap-abc-",
        "2026-11-10T00:00:00Z",
      ).recorded,
    ).toBe(false);
    expect(
      proposalRecord(
        full("2026-11-11T00:00:00Z"),
        "ap-abc-",
        "2026-11-10T00:00:00Z",
      ).recorded,
    ).toBeNull();
    expect(
      proposalRecord(full("not a time"), "ap-abc-", "2026-11-10T00:00:00Z")
        .recorded,
    ).toBeNull();
    expect(
      proposalRecord(
        full("2026-11-11T00:00:00Z").slice(0, 19),
        "ap-abc-",
        "2026-11-10T00:00:00Z",
      ).recorded,
    ).toBe(false);
  });
});

describe("owners and admission limit come from core-factory.json", () => {
  const folders: string[] = [];
  afterEach(() => {
    for (const folder of folders.splice(0))
      rmSync(folder, { recursive: true, force: true });
  });
  function configured(content: unknown) {
    const folder = mkdtempSync(path.join(os.tmpdir(), "factory-console-"));
    folders.push(folder);
    const file = path.join(folder, "core-factory.json");
    if (content !== undefined) writeFileSync(file, JSON.stringify(content));
    return { file, ...harness({ env: { FACTORY_CONFIG_FILE: file } }) };
  }
  const owner = (login: string) => ({
    profile: `/srv/profiles/private-${login}`,
    githubLogin: `${login}-private-login`,
  });
  const turn = "cr-fixturescp-0000000000000000-0000000000000000";
  function proposeScope(
    state: ReturnType<typeof harness>["state"],
    endState: "unchanged" | "MERGED",
  ) {
    state.set("core/chat/op-fixture-scope", {
      v: 1,
      messages: [
        {
          role: "samson",
          request: turn,
          at: new Date().toISOString(),
          text: "Add #110",
          operation: {
            kind: "assign-scope",
            issue: 0,
            issues: [101, 110],
            endState,
            reason: "Next phase",
            status: "proposed",
          },
        },
      ],
    });
  }

  it("shows the file's owners and limits.admittedIssues, read fresh and never its private fields", async () => {
    const { file, factory } = configured({
      owners: { ops: owner("ops"), conrad: owner("conrad") },
      limits: { admittedIssues: 3 },
    });
    const snapshot = await factory.snapshot();
    expect(snapshot.settings).toMatchObject({
      owners: ["ops", "conrad"],
      capacity: 3,
      configReason: null,
    });
    const text = JSON.stringify(snapshot);
    expect(text).not.toContain("private-ops");
    expect(text).not.toContain("private-login");
    expect(text).not.toContain(file);
    writeFileSync(
      file,
      JSON.stringify({
        owners: { conrad: owner("conrad") },
        limits: { admittedIssues: 1 },
      }),
    );
    expect((await factory.snapshot()).settings).toMatchObject({
      owners: ["conrad"],
      capacity: 1,
    });
  });

  it("assigns scope to an owner the file lists and refuses one it does not", async () => {
    const { factory, control, ids } = configured({
      owners: { ops: owner("ops") },
      limits: { admittedIssues: 2 },
    });
    await factory.execute(
      { kind: "scope", issues: [12], endState: "PR_READY", owner: "ops" },
      ids.mint(),
    );
    expect(control.calls.at(-1)?.slice(5, 7)).toEqual(["--owner", "ops"]);
    const calls = control.calls.length;
    await expect(
      factory.execute(
        { kind: "scope", issues: [12], endState: "PR_READY", owner: "conrad" },
        ids.mint(),
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(control.calls).toHaveLength(calls);
  });

  it("reports owners and the limit as unavailable when the file cannot be read, and refuses scope", async () => {
    const { factory, control, ids } = configured(undefined);
    const snapshot = await factory.snapshot();
    expect(snapshot.settings.owners).toBeNull();
    expect(snapshot.settings.capacity).toBeNull();
    expect(snapshot.settings.configReason).toMatch(/could not be read/);
    expect(snapshot.factory.state).toBe("available");
    await expect(
      factory.execute(
        { kind: "scope", issues: [12], endState: "PR_READY", owner: "conrad" },
        ids.mint(),
      ),
    ).rejects.toMatchObject({ status: 503 });
    expect(control.calls).toEqual([]);
    // Controls that name no owner still run.
    const held = await factory.execute(
      { kind: "factory", action: "hold-merge" },
      ids.mint(),
    );
    expect(held.outcome).not.toBe("refused");
  });

  it("chat apply keeps the current scope owner and never substitutes another for an unlisted one", async () => {
    const { factory, control, state } = configured({
      owners: { conrad: owner("conrad") },
      limits: { admittedIssues: 2 },
    });
    proposeScope(state, "unchanged");
    state.set("core/scope", {
      ...(state.value("core/scope") ?? {}),
      owner: "mallory",
    });
    await expect(
      factory.apply("op-fixture-scope", turn, {}, false),
    ).rejects.toThrow(/mallory|owner/);
    expect(control.calls).toEqual([]);
  });

  it("chat apply with no current scope uses the only listed owner and refuses to pick among several", async () => {
    const single = configured({
      owners: { ops: owner("ops") },
      limits: { admittedIssues: 2 },
    });
    proposeScope(single.state, "MERGED");
    single.state.docs.delete("core/scope");
    await single.factory.apply("op-fixture-scope", turn, {}, false);
    expect(single.control.calls.at(-1)?.slice(5, 7)).toEqual([
      "--owner",
      "ops",
    ]);
    const several = configured({
      owners: { ops: owner("ops"), conrad: owner("conrad") },
      limits: { admittedIssues: 2 },
    });
    proposeScope(several.state, "MERGED");
    several.state.docs.delete("core/scope");
    await expect(
      several.factory.apply("op-fixture-scope", turn, {}, false),
    ).rejects.toMatchObject({ status: 409 });
    expect(several.control.calls).toEqual([]);
    const missing = configured(undefined);
    proposeScope(missing.state, "unchanged");
    await expect(
      missing.factory.apply("op-fixture-scope", turn, {}, false),
    ).rejects.toMatchObject({ status: 503 });
    expect(missing.control.calls).toEqual([]);
  });
});
