import { describe, expect, it } from "vitest";

import { RUN } from "./fixtures/factory-fixture";
import { harness } from "./fixtures/harness";
import { isRetryable, workItemSchema } from "../src/lib/factory";
import { Factory } from "../src/server/factory";
import { factoryConfiguration } from "../src/server/factory-config";

import type { ControlAction } from "../src/lib/factory";
import type { ControlRun } from "../src/server/control";

function controlHarness(result: ControlRun) {
  const fixture = harness();
  const calls: string[][] = [];
  const factory = new Factory({
    auth: fixture.auth,
    settings: factoryConfiguration({}),
    settingsError: null,
    reader: fixture.state,
    policy: fixture.policy,
    control: {
      async run(args) {
        calls.push([...args]);
        return result;
      },
    },
    engine: fixture.archon,
    ids: fixture.ids,
  });
  return { ...fixture, factory, calls };
}

describe("native safety-hold serialization", () => {
  it("keeps the owning run and typed fault diagnostics through issue detail", async () => {
    const { factory, state } = harness();
    const nativeFaults = {
      schema: "core-native-faults/v1",
      runId: RUN.repair,
      runStatus: "failed",
      action: "native-recovery",
      reason: "quota-reset-reported",
      preserveOwnership: true,
      automaticRetry: false,
      faults: [
        {
          nodeId: "build",
          eventId: "event-quota",
          failureKind: "fatal",
          providerClass: "quota_exhausted",
          resetAt: "2026-11-12T12:00:00.000Z",
          retryAfterMs: 60_000,
        },
      ],
      wait: null,
    };
    state.set("core/issues/101", {
      ...(state.value("core/issues/101") ?? {}),
      nativeFaults: {
        ...nativeFaults,
        profileDigest: "PRIVATE-PROFILE-DIGEST",
        profilePath: "/home/admin/.claude",
        output: "PRIVATE-NATIVE-OUTPUT",
        faults: [
          {
            ...nativeFaults.faults[0],
            error: "PRIVATE-PROVIDER-ERROR",
            evidence: "PRIVATE-PROVIDER-EVIDENCE",
            token: "ghp_abcdefghijklmnopqrstuv",
          },
        ],
      },
    });

    const detail = await factory.issue(101);

    expect(detail.item?.nativeFaults).toEqual(nativeFaults);
    const serialized = JSON.stringify(detail);
    expect(serialized).not.toContain("PRIVATE-");
    expect(serialized).not.toContain("/home/admin");
    expect(serialized).not.toContain("ghp_");
    expect(serialized).not.toContain("profileDigest");
    expect(state.value("core/issues/101")?.nativeFaults).toMatchObject({
      profileDigest: "PRIVATE-PROFILE-DIGEST",
    });
  });

  it.each(["time", "event", "quota", "attention"])(
    "keeps %s wait diagnostics without exporting native sessions or payloads",
    async (kind) => {
      const { factory, state } = harness();
      const wait = {
        owner: kind === "quota" ? "node" : "loop_group",
        nodeId: "wait-for-owner",
        kind,
        pauseId: "native-pause-1",
        waitingSince: "2026-11-12T11:00:00.000Z",
        ...(kind === "attention"
          ? {}
          : { resumeAt: "2026-11-12T12:00:00.000Z" }),
      };
      const nativeFaults = {
        schema: "core-native-faults/v1",
        runId: RUN.repair,
        runStatus: "paused",
        action: "native-wait",
        reason: "native-wait-persisted",
        preserveOwnership: true,
        automaticRetry: false,
        faults: [],
        wait,
      };
      state.set("core/issues/101", {
        ...(state.value("core/issues/101") ?? {}),
        nativeFaults: {
          ...nativeFaults,
          wait: {
            ...wait,
            sessionId: "PRIVATE-SESSION-ID",
            sessionProvider: "PRIVATE-SESSION-PROVIDER",
            message: "PRIVATE-ATTENTION-PAYLOAD",
            event: "PRIVATE-EVENT-PAYLOAD",
          },
        },
      });

      const detail = await factory.issue(101);

      expect(detail.item?.nativeFaults).toEqual(nativeFaults);
      expect(JSON.stringify(detail)).not.toContain("PRIVATE-");
    },
  );

  it("bounds and scrubs native diagnostic lists and text without changing the stored evidence", async () => {
    const { factory, state } = harness();
    const rawFault = {
      nodeId: "build ghp_abcdefghijklmnopqrstuv /srv/private/build",
      eventId: "event-1",
      failureKind: "fatal",
      providerClass: "auth",
      resetAt: null,
      retryAfterMs: null,
      output: "PRIVATE-NODE-OUTPUT",
    };
    const reason = "provider-auth ".repeat(1000);
    const nativeFaults = {
      schema: "core-native-faults/v1",
      runId: RUN.repair,
      runStatus: "failed",
      action: "owner-action",
      reason,
      preserveOwnership: true,
      automaticRetry: false,
      faults: Array.from({ length: 50 }, () => ({ ...rawFault })),
      wait: null,
    };
    state.set("core/issues/101", {
      ...(state.value("core/issues/101") ?? {}),
      nativeFaults,
    });

    const projected = workItemSchema.parse(state.value("core/issues/101"));
    const detail = await factory.issue(101);

    expect(projected.nativeFaults?.faults).toHaveLength(40);
    expect(detail.item?.nativeFaults?.faults).toHaveLength(40);
    expect(detail.item?.nativeFaults?.faults[0]).toEqual({
      nodeId: "build [redacted] [private path]",
      eventId: "event-1",
      failureKind: "fatal",
      providerClass: "auth",
      resetAt: null,
      retryAfterMs: null,
    });
    expect(detail.item?.nativeFaults?.reason).toBe(
      `${reason.slice(0, 1200)} [clipped]`,
    );
    const serialized = JSON.stringify(detail.item?.nativeFaults);
    expect(serialized.length).toBeLessThan(15_000);
    expect(serialized).not.toMatch(/PRIVATE-|ghp_|\/srv\/private/);
    expect(state.value("core/issues/101")?.nativeFaults).toEqual(nativeFaults);
  });

  it("keeps unavailable native run evidence explicitly unavailable", async () => {
    const { factory, state } = harness();
    const nativeFaults = {
      schema: "core-native-faults/v1",
      runId: null,
      runStatus: null,
      action: "reconcile",
      reason: "native-evidence-unavailable",
      preserveOwnership: true,
      automaticRetry: false,
      faults: [],
      wait: null,
    };
    state.set("core/issues/101", {
      ...(state.value("core/issues/101") ?? {}),
      nativeFaults,
    });

    expect((await factory.issue(101)).item?.nativeFaults).toEqual(nativeFaults);
  });

  it("keeps legacy and malformed diagnostic documents readable without modifying them", async () => {
    const { factory, state } = harness();
    expect((await factory.issue(101)).item?.nativeFaults).toBeUndefined();
    const malformed = { schema: "unsupported", output: "PRIVATE-OUTPUT" };
    state.set("core/issues/101", {
      ...(state.value("core/issues/101") ?? {}),
      nativeFaults: malformed,
    });

    const detail = await factory.issue(101);

    expect(detail.item?.issue).toBe(101);
    expect(detail.item?.nativeFaults).toBeNull();
    expect(JSON.stringify(detail)).not.toContain("PRIVATE-OUTPUT");
    expect(state.value("core/issues/101")?.nativeFaults).toEqual(malformed);
  });
});

describe("native safety-hold controls", () => {
  it.each([
    ["cleanup-unconfirmed", "retry"],
    ["cleanup-unconfirmed", "reopen"],
    ["cleanup-unconfirmed", "release"],
    ["native-fault-held", "retry"],
    ["native-fault-held", "reopen"],
    ["native-fault-held", "release"],
    ["native-fault-held", "reconcile"],
    ["identity-drift", "retry"],
    ["identity-drift", "reopen"],
    ["identity-drift", "release"],
    ["policy-unavailable", "retry"],
    ["policy-unavailable", "reopen"],
    ["policy-unavailable", "release"],
    ["policy-transition-required", "retry"],
    ["policy-transition-required", "reopen"],
    ["policy-transition-required", "release"],
    ["identity-proof-unavailable", "retry"],
    ["identity-proof-unavailable", "reopen"],
    ["identity-proof-unavailable", "release"],
  ] as const)(
    "reports %s on %s as a refusal, not a same-id retry",
    async (code, action) => {
      const { factory, ids, state, calls } = controlHarness({
        exit: 1,
        json: { ok: false, code, message: "PRIVATE-SAFETY-DETAIL" },
        timedOut: false,
        overflow: false,
      });
      state.set("core/issues/104", {
        ...(state.value("core/issues/104") ?? {}),
        nativeFaults: {
          schema: "core-native-faults/v1",
          runId: RUN.blocked104,
          runStatus: "failed",
          action: "owner-action",
          reason: "provider-auth",
          faults: [],
          wait: null,
          preserveOwnership: true,
          automaticRetry: false,
        },
      });
      const before = structuredClone(state.value("core/issues/104"));
      const requestId = ids.mint();

      const receipt = await factory.execute(
        { kind: "issue", issue: 104, action },
        requestId,
      );

      expect(receipt).toMatchObject({
        requestId,
        outcome: "refused",
        code,
        observed: { recorded: false },
      });
      expect(isRetryable(receipt.outcome)).toBe(false);
      expect(receipt.message).not.toMatch(/effect is unknown|same request id/i);
      expect(receipt.message).toMatch(/hold|identity|cleanup/i);
      expect(receipt.message).not.toContain("PRIVATE-SAFETY-DETAIL");
      expect(state.value("core/issues/104")).toEqual(before);
      expect(calls).toHaveLength(1);
    },
  );

  it.each([
    { timedOut: true, overflow: false },
    { timedOut: false, overflow: true },
  ])(
    "does not treat an incomplete control capture as a confirmed refusal: %j",
    async (capture) => {
      const { factory, ids } = controlHarness({
        exit: null,
        json: { ok: false, code: "native-fault-held" },
        ...capture,
      });
      const action: ControlAction = {
        kind: "issue",
        issue: 104,
        action: "retry",
      };

      const receipt = await factory.execute(action, ids.mint());

      expect(receipt.outcome).toBe("unknown");
      expect(receipt.code).toBeNull();
      expect(isRetryable(receipt.outcome)).toBe(true);
    },
  );

  it("does not present cancellation or an issue hold as permission to release a native hold", async () => {
    const { factory, ids, state, calls } = controlHarness({
      exit: 0,
      json: {
        ok: true,
        status: 200,
        observed: "cancelled",
        containers: { removed: [], remaining: [] },
        held: { issue: 101, ok: true },
      },
      timedOut: false,
      overflow: false,
    });
    state.set("core/issues/101", {
      ...(state.value("core/issues/101") ?? {}),
      control: "hold",
      nativeFaults: {
        schema: "core-native-faults/v1",
        runId: RUN.repair,
        runStatus: "failed",
        action: "owner-action",
        reason: "provider-auth",
        faults: [],
        wait: null,
        preserveOwnership: true,
        automaticRetry: false,
      },
    });
    const before = structuredClone(state.value("core/issues/101"));

    const receipt = await factory.execute(
      { kind: "cancel-run", runId: RUN.repair },
      ids.mint(),
      { confirmed: true },
    );

    expect(receipt.outcome).toBe("applied");
    expect(isRetryable(receipt.outcome)).toBe(false);
    expect(receipt.message).toContain("Issue #101 is held");
    expect(receipt.message).not.toContain("release it to resume");
    expect(receipt.message).toContain("safety holds still apply");
    expect(state.value("core/issues/101")).toEqual(before);
    expect(calls).toHaveLength(1);
  });
});
