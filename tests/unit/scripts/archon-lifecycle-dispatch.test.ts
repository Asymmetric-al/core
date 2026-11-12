import { createHmac } from "node:crypto";

import { describe, expect, it, vi } from "vitest";

import { fireRound } from "../../../scripts/archon-factory/pack/.shared/webhook.mjs";
import {
  createAssignment,
  deliveryKey,
  planClaim,
  planClaimRefusal,
  planControl,
  planFinish,
  planSweep,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// Interface I6: every round start (admit's r1, record's successor, the sweep's
// re-fire) is keyed `${assignment}:r${round+1}:v${revision}`. Archon's webhook
// dedup is durable, so a refused or failed claim must leave the item in a state
// whose next fire gets a NEW key.

type Doc = {
  name: string;
  revision: number;
  value: Record<string, any>;
  lease: { runId: string; live: boolean } | null;
};

const T0 = "2026-11-11T09:00:00.000Z";
const T1 = "2026-11-11T10:00:00.000Z";
const ASSIGNMENT = "a12-0123456789ab";
const POLICY = "c".repeat(64);
const RUNNING = { v: 1, intake: "open", mode: "run", mergeHold: false };

function assign(overrides: Record<string, unknown> = {}) {
  return createAssignment({
    issue: 12,
    assignmentId: ASSIGNMENT,
    owner: "conrad",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
    endState: "PR_READY",
    reason: "Only eligible issue",
    by: "selector:run-0",
    now: T0,
    ...overrides,
  });
}

const doc = (
  value: Record<string, any>,
  revision = 1,
  lease: Doc["lease"] = null,
): Doc => ({ name: "core/issues/12", revision, value, lease });

// Round 3 recorded `continue`: the item waits on round 3 at revision 10.
function waitingAfterRound3(): Doc {
  return doc(
    { ...assign(), status: "waiting", route: "repair", round: 3 },
    10,
    { runId: "run-3", live: false },
  );
}

describe("deliveryKey", () => {
  it("keys a round start by assignment, next round and the item's revision", () => {
    const item = waitingAfterRound3();
    expect(deliveryKey(item.value, item.revision)).toBe(
      "a12-0123456789ab:r4:v10",
    );
  });

  it("keys admission's first round on the assignment write's revision", () => {
    expect(deliveryKey(assign(), 1)).toBe("a12-0123456789ab:r1:v1");
  });

  it.each([undefined, -1, 1.5, "10"])("refuses the revision %j", (revision) => {
    expect(() => deliveryKey(assign(), revision as unknown as number)).toThrow(
      /revision/,
    );
  });

  it("keys record's successor on the revision its finish write produced", () => {
    const active = planClaim(waitingAfterRound3(), {
      runId: "run-4",
      assignmentId: ASSIGNMENT,
      policyRevision: POLICY,
      now: T1,
    });
    const claimed = doc(active.value, 11, { runId: "run-4", live: true });
    const finish = planFinish(claimed, {
      runId: "run-4",
      now: T1,
      outcome: "continue",
      route: "repair",
    });
    expect(deliveryKey(finish.value, finish.ifRevision + 1)).toBe(
      "a12-0123456789ab:r5:v12",
    );
  });
});

describe("a refused claim leaves the item with a new dispatch key", () => {
  const refuse = (
    item: Doc,
    code: string,
    extra: Record<string, unknown> = {},
  ) =>
    planClaimRefusal(item, {
      runId: "run-4",
      assignmentId: ASSIGNMENT,
      code,
      detail: `Claim refused: ${code}`,
      now: T1,
      ...extra,
    });

  it("writes an idle-only refusal marker so the sweep's next fire is not deduplicated", () => {
    const item = waitingAfterRound3();
    const burned = deliveryKey(item.value, item.revision);
    const plan = refuse(item, "factory-stopped");
    const after = doc(plan.value, plan.ifRevision + 1, item.lease);
    expect({
      ifRevision: plan.ifRevision,
      status: plan.value.status,
      route: plan.value.route,
      round: plan.value.round,
      marker: plan.value.lastRefusal,
      nextKey: deliveryKey(after.value, after.revision),
    }).toEqual({
      ifRevision: 10,
      status: "waiting",
      route: "repair",
      round: 3,
      marker: { run: "run-4", code: "factory-stopped", at: T1 },
      nextKey: "a12-0123456789ab:r4:v11",
    });
    expect(deliveryKey(after.value, after.revision)).not.toBe(burned);
  });

  it("marks a pending item whose first round was refused", () => {
    const pending = doc(assign(), 1);
    const plan = refuse(pending, "conflict");
    expect(deliveryKey(plan.value, plan.ifRevision + 1)).toBe(
      "a12-0123456789ab:r1:v2",
    );
  });

  it("writes nothing while another run's live lease holds the item", () => {
    const active = doc(
      { ...assign(), status: "active", run: { id: "run-9", route: "repair" } },
      11,
      { runId: "run-9", live: true },
    );
    expect(refuse(active, "lease-held")).toMatchObject({ noop: true });
  });

  it("writes nothing for an item that is active, terminal or controlled by an operator", () => {
    const cases = [
      doc({ ...assign(), status: "active", run: { id: "run-9" } }, 5),
      doc({ ...assign(), status: "PR_READY", route: null }, 5),
      doc({ ...assign(), status: "waiting", control: "hold" }, 5),
    ];
    expect(cases.map((item) => refuse(item, "held").noop)).toEqual([
      true,
      true,
      true,
    ]);
  });

  it("writes nothing for a stale fire of another assignment", () => {
    const item = waitingAfterRound3();
    expect(
      refuse(item, "assignment-mismatch", { assignmentId: "a12-ffffffffffff" }),
    ).toMatchObject({ noop: true });
  });

  it("blocks an idle item whose claim refused for a changed policy, requiring an explicit transition", () => {
    const item = waitingAfterRound3();
    const plan = refuse(item, "policy-changed");
    expect({
      status: plan.value.status,
      route: plan.value.route,
      blocker: plan.value.blocker,
      history: plan.value.history.at(-1),
    }).toEqual({
      status: "BLOCKED",
      route: null,
      blocker: {
        code: "policy-changed",
        detail: "Claim refused: policy-changed",
        recovery:
          "The installed factory release changed; the retained assignment requires an explicit policy transition (issue <n> adopt-policy, then retry), not retry, reopen or release alone",
        route: "repair",
        at: T1,
      },
      history: {
        round: 3,
        run: "run-4",
        route: "repair",
        outcome: "BLOCKED",
        next: null,
        at: T1,
        summary: "Claim refused: policy-changed",
      },
    });
  });
});

describe("planSweep", () => {
  it("fires an idle, runnable item under its revision key", () => {
    const item = waitingAfterRound3();
    expect(planSweep(item, { factory: RUNNING, reservations: {} })).toEqual({
      action: "fire",
      deliveryId: "a12-0123456789ab:r4:v10",
    });
  });

  it("re-fires under a new key after a refused claim (factory stop, then resume)", () => {
    const item = waitingAfterRound3();
    const first = planSweep(item, { factory: RUNNING, reservations: {} });
    const marker = planClaimRefusal(item, {
      runId: "run-4",
      assignmentId: ASSIGNMENT,
      code: "factory-stopped",
      detail: "Factory does not permit rounds: factory-stopped",
      now: T1,
    });
    const after = doc(marker.value, marker.ifRevision + 1, item.lease);
    const second = planSweep(after, { factory: RUNNING, reservations: {} });
    expect([first.deliveryId, second.deliveryId]).toEqual([
      "a12-0123456789ab:r4:v10",
      "a12-0123456789ab:r4:v11",
    ]);
  });

  it("re-fires under a new key after a hold is released", () => {
    const item = waitingAfterRound3();
    const held = planControl(item, {
      action: "hold",
      requestId: "req-hold-0001",
      by: "ops",
      now: T1,
    });
    const heldDoc = doc(held.value, 11, item.lease);
    const released = planControl(heldDoc, {
      action: "release",
      requestId: "req-release-0001",
      by: "ops",
      now: T1,
      installed: { policyRevision: heldDoc.value.assignment.policyRevision },
    });
    const after = doc(released.value, 12, item.lease);
    expect(planSweep(after, { factory: RUNNING, reservations: {} })).toEqual({
      action: "fire",
      deliveryId: "a12-0123456789ab:r4:v12",
    });
  });

  it.each([
    ["the factory is stopped", { factory: { ...RUNNING, mode: "stop" } }, {}],
    ["the item is held", { factory: RUNNING }, { control: "hold" }],
    ["the item is stopped", { factory: RUNNING }, { control: "stop" }],
    ["the item is terminal", { factory: RUNNING }, { status: "PR_READY" }],
  ])("does not fire while %s", (_label, options, overrides) => {
    const item = waitingAfterRound3();
    const observed = doc({ ...item.value, ...overrides }, 10, item.lease);
    expect(planSweep(observed, { reservations: {}, ...options }).action).toBe(
      "skip",
    );
  });

  it("does not fire an item whose lease a live run holds", () => {
    const item = waitingAfterRound3();
    const live = { ...item, lease: { runId: "run-4", live: true } };
    expect(
      planSweep(live, { factory: RUNNING, reservations: {} }),
    ).toMatchObject({ action: "skip" });
  });

  it("fires under drain, which lets admitted lineages continue", () => {
    const item = waitingAfterRound3();
    expect(
      planSweep(item, {
        factory: { ...RUNNING, mode: "drain", intake: "paused" },
        reservations: {},
      }).action,
    ).toBe("fire");
  });
});

describe("fireRound", () => {
  const SIGNING_KEY = Buffer.alloc(32, 9);
  const SECRET = `whsec_${SIGNING_KEY.toString("base64")}`;
  const config = {
    archon: { port: 3190 },
    webhooks: { secretFile: "/unused" },
  };

  it("delivers the round to the deliver source keyed by assignment, round and revision", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ receiptId: "r-1" }));
    const item = waitingAfterRound3();
    const verifyIdentity = vi.fn(async () => ({
      profileDigest: item.value.assignment.profileDigest,
    }));
    const fired = await fireRound({
      config,
      value: item.value,
      revision: item.revision,
      fetchImpl,
      secret: SECRET,
      now: () => Date.parse(T1),
      verifyIdentity,
    });
    expect(verifyIdentity).toHaveBeenCalledWith({
      config,
      owner: item.value.assignment.owner,
      expectedDigest: item.value.assignment.profileDigest,
    });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit & { headers: Record<string, string> },
    ];
    const timestamp = init.headers["webhook-timestamp"];
    const expected = createHmac("sha256", SIGNING_KEY)
      .update(`a12-0123456789ab:r4:v10.${timestamp}.${init.body}`)
      .digest("base64");
    expect({
      ok: fired.ok,
      deliveryId: fired.deliveryId,
      url,
      id: init.headers["webhook-id"],
      body: JSON.parse(String(init.body)),
      signature: init.headers["webhook-signature"],
    }).toEqual({
      ok: true,
      deliveryId: "a12-0123456789ab:r4:v10",
      url: "http://127.0.0.1:3190/webhooks/sources/core-factory-deliver",
      id: "a12-0123456789ab:r4:v10",
      body: { issue: "12", assignment: "a12-0123456789ab" },
      signature: `v1,${expected}`,
    });
  });
});
