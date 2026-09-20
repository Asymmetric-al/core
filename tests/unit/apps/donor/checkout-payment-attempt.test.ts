import { describe, expect, it } from "vitest";

import {
  commitPaymentAttemptState,
  commitSuccessfulOriginalPaymentAttempt,
  exitStalePaymentAttempt,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-payment-attempt";

import type {
  PaymentAttempt,
  PaymentAttemptState,
} from "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-payment-attempt";

type TestState = PaymentAttemptState & {
  n: number;
};

const attemptA: PaymentAttempt = {
  fingerprint: "fp-stable",
  id: 1,
  successSnapshot: { id: "snap-a" },
};

const attemptB: PaymentAttempt = {
  fingerprint: "fp-stable",
  id: 2,
  successSnapshot: { id: "snap-b" },
};

const paymentState = (overrides: Partial<TestState> = {}): TestState => ({
  donation: null,
  error: null,
  idempotencyFingerprint: "fp-stable",
  isProcessing: true,
  n: 0,
  step: "payment",
  successSnapshot: null,
  ...overrides,
});

const createHarness = ({
  active = attemptA,
  currentRequestFingerprint = "fp-stable",
  state = paymentState(),
}: {
  active?: PaymentAttempt | null;
  currentRequestFingerprint?: string;
  state?: TestState;
} = {}) => {
  const activePaymentAttemptRef = { current: active };
  const checkoutStateRef = { current: state };
  let reactState = state;
  const appliedUpdaters: Array<(prev: TestState) => TestState> = [];

  const setCheckoutState = (updater: (prev: TestState) => TestState) => {
    appliedUpdaters.push(updater);
    reactState = updater(reactState);
  };

  const replayQueuedUpdaters = () => {
    for (const updater of appliedUpdaters) {
      reactState = updater(reactState);
    }
  };

  return {
    activePaymentAttemptRef,
    checkoutStateRef,
    currentRequestFingerprintRef: { current: currentRequestFingerprint },
    getReactState: () => reactState,
    replayQueuedUpdaters,
    setCheckoutState,
    setReactState: (next: TestState) => {
      reactState = next;
    },
  };
};

describe("commitPaymentAttemptState", () => {
  it("applies the updater once so a ref-ahead snapshot stays in agreement with React", () => {
    const current = paymentState({ n: 1 });
    const reactBehind = paymentState({ n: 0 });
    const harness = createHarness({ state: current });
    harness.setReactState(reactBehind);

    const didCommit = commitPaymentAttemptState(
      attemptA,
      (prev) => ({
        ...prev,
        error: "retryable",
        isProcessing: false,
        n: prev.n + 1,
      }),
      harness,
    );

    expect(didCommit).toBe(true);
    expect(harness.checkoutStateRef.current.n).toBe(2);
    expect(harness.getReactState().n).toBe(2);
    expect(harness.checkoutStateRef.current).toEqual(harness.getReactState());
  });

  it("does not re-apply a queued updater when React replays it", () => {
    const harness = createHarness({ state: paymentState({ n: 1 }) });
    let updaterCalls = 0;

    const didCommit = commitPaymentAttemptState(
      attemptA,
      (prev) => {
        updaterCalls += 1;
        return { ...prev, error: "retryable", n: prev.n + 1 };
      },
      harness,
    );

    harness.replayQueuedUpdaters();

    expect(didCommit).toBe(true);
    expect(updaterCalls).toBe(1);
    expect(harness.checkoutStateRef.current.n).toBe(2);
    expect(harness.getReactState().n).toBe(2);
  });

  it("returns false without applying when the live request fingerprint has moved on", () => {
    const harness = createHarness({ currentRequestFingerprint: "fp-new" });

    const didCommit = commitPaymentAttemptState(
      attemptA,
      (prev) => ({ ...prev, error: "should-not-apply", n: prev.n + 1 }),
      harness,
    );

    expect(didCommit).toBe(false);
    expect(harness.getReactState().error).toBeNull();
    expect(harness.getReactState().n).toBe(0);
    expect(harness.activePaymentAttemptRef.current).toEqual(attemptA);
  });

  it("returns false without applying when the checkout snapshot is no longer the payment attempt", () => {
    const harness = createHarness({
      state: paymentState({ step: "success", n: 4 }),
    });

    const didCommit = commitPaymentAttemptState(
      attemptA,
      (prev) => ({ ...prev, error: "should-not-apply", n: prev.n + 1 }),
      harness,
    );

    expect(didCommit).toBe(false);
    expect(harness.checkoutStateRef.current.n).toBe(4);
    expect(harness.getReactState().error).toBeNull();
  });
});

describe("commitSuccessfulOriginalPaymentAttempt", () => {
  it("applies success when the original attempt still owns the payment snapshot", () => {
    const harness = createHarness();

    const didCommit = commitSuccessfulOriginalPaymentAttempt(
      attemptA,
      { id: "don-a" },
      harness,
    );

    expect(didCommit).toBe(true);
    expect(harness.checkoutStateRef.current).toMatchObject({
      donation: { id: "don-a" },
      error: null,
      isProcessing: false,
      step: "success",
      successSnapshot: attemptA.successSnapshot,
    });
    expect(harness.getReactState()).toEqual(harness.checkoutStateRef.current);
    expect(harness.activePaymentAttemptRef.current).toBeNull();
  });

  it("keeps the same receipt when React replays the queued success apply", () => {
    const harness = createHarness();

    commitSuccessfulOriginalPaymentAttempt(attemptA, { id: "don-a" }, harness);
    harness.replayQueuedUpdaters();

    expect(harness.getReactState()).toMatchObject({
      donation: { id: "don-a" },
      step: "success",
    });
  });

  it("does not attach an older receipt to a newer same-fingerprint payment snapshot", () => {
    const olderSnapshot = paymentState({ n: 1 });
    const newerSnapshot = paymentState({ n: 2, donation: { id: "don-b" } });
    const harness = createHarness({
      active: attemptA,
      state: olderSnapshot,
    });
    harness.setReactState(newerSnapshot);

    const didCommit = commitSuccessfulOriginalPaymentAttempt(
      attemptA,
      { id: "don-a" },
      harness,
    );

    expect(didCommit).toBe(true);
    expect(harness.checkoutStateRef.current).toMatchObject({
      donation: { id: "don-a" },
      step: "success",
    });
    expect(harness.getReactState()).toEqual(newerSnapshot);
  });

  it("returns false for a fingerprint-stable newer active attempt", () => {
    const harness = createHarness({
      active: attemptB,
      state: paymentState({ donation: { id: "don-b" } }),
    });

    const didCommit = commitSuccessfulOriginalPaymentAttempt(
      attemptA,
      { id: "don-a" },
      harness,
    );

    expect(didCommit).toBe(false);
    expect(harness.checkoutStateRef.current.step).toBe("payment");
    expect(harness.checkoutStateRef.current.donation).toEqual({ id: "don-b" });
    expect(harness.getReactState().donation).toEqual({ id: "don-b" });
    expect(harness.activePaymentAttemptRef.current).toEqual(attemptB);
  });
});

describe("exitStalePaymentAttempt", () => {
  it("applies the stale overlay while the original attempt is still active", () => {
    const harness = createHarness();

    const didExit = exitStalePaymentAttempt(attemptA, harness);

    expect(didExit).toBe(true);
    expect(harness.getReactState().error).toMatch(/details changed/i);
    expect(harness.getReactState().isProcessing).toBe(false);
    expect(harness.getReactState().step).toBe("payment");
    expect(harness.activePaymentAttemptRef.current).toBeNull();
  });

  it("still exits the original attempt after the live request fingerprint has moved on", () => {
    const harness = createHarness({ currentRequestFingerprint: "fp-new" });

    const didExit = exitStalePaymentAttempt(attemptA, harness);

    expect(didExit).toBe(true);
    expect(harness.getReactState().error).toMatch(/details changed/i);
    expect(harness.activePaymentAttemptRef.current).toBeNull();
  });

  it("does not apply a stale overlay over a successful receipt", () => {
    const success = paymentState({
      donation: { id: "don-a" },
      n: 3,
      step: "success",
      successSnapshot: attemptA.successSnapshot,
    });
    const harness = createHarness({ state: success });

    const didExit = exitStalePaymentAttempt(attemptA, harness);

    expect(didExit).toBe(false);
    expect(harness.checkoutStateRef.current.step).toBe("success");
    expect(harness.checkoutStateRef.current.donation).toEqual({ id: "don-a" });
    expect(harness.getReactState().error).toBeNull();
  });

  it("returns false for a newer same-fingerprint attempt and leaves it active", () => {
    const harness = createHarness({
      active: attemptB,
      state: paymentState({ n: 8 }),
    });

    const didExit = exitStalePaymentAttempt(attemptA, harness);

    expect(didExit).toBe(false);
    expect(harness.activePaymentAttemptRef.current).toEqual(attemptB);
    expect(harness.getReactState().error).toBeNull();
    expect(harness.getReactState().isProcessing).toBe(true);
  });
});
