export type PaymentAttempt = {
  fingerprint: string;
  id: number;
  successSnapshot: unknown;
};

export type PaymentAttemptState = {
  donation: unknown;
  error: string | null;
  idempotencyFingerprint: string | null;
  isProcessing: boolean;
  paymentAttemptId: number | null;
  step: string;
  successSnapshot: unknown;
};

export type PaymentAttemptRefs<TState extends PaymentAttemptState> = {
  activePaymentAttemptRef: { current: PaymentAttempt | null };
  checkoutStateRef: { current: TState };
  currentRequestFingerprintRef: { current: string };
  setCheckoutState: (updater: (prev: TState) => TState) => void;
};

export const STALE_PAYMENT_ATTEMPT_MESSAGE =
  "Checkout details changed while payment was processing. Please review your details and try again.";

export const isPaymentAttemptActive = (
  attempt: PaymentAttempt,
  activeAttempt: PaymentAttempt | null,
  currentRequestFingerprint: string,
) =>
  activeAttempt?.id === attempt.id &&
  activeAttempt.fingerprint === attempt.fingerprint &&
  currentRequestFingerprint === attempt.fingerprint;

export const isOriginalPaymentAttemptActive = (
  attempt: PaymentAttempt,
  activeAttempt: PaymentAttempt | null,
) =>
  activeAttempt?.id === attempt.id &&
  activeAttempt.fingerprint === attempt.fingerprint;

export const isPaymentAttemptStateActive = (
  attempt: PaymentAttempt,
  state: PaymentAttemptState,
) =>
  state.paymentAttemptId === attempt.id &&
  state.idempotencyFingerprint === attempt.fingerprint &&
  state.step === "payment";

export const isOriginalPaymentAttemptStateActive = (
  attempt: PaymentAttempt,
  activeAttempt: PaymentAttempt | null,
  state: PaymentAttemptState,
) =>
  isOriginalPaymentAttemptActive(attempt, activeAttempt) &&
  isPaymentAttemptStateActive(attempt, state);

// These helpers report eligible scheduling; refs change only after a React commit.
export const commitPaymentAttemptState = <TState extends PaymentAttemptState>(
  attempt: PaymentAttempt,
  updater: (prev: TState) => TState,
  refs: PaymentAttemptRefs<TState>,
): boolean => {
  if (
    !isPaymentAttemptActive(
      attempt,
      refs.activePaymentAttemptRef.current,
      refs.currentRequestFingerprintRef.current,
    )
  ) {
    return false;
  }

  const current = refs.checkoutStateRef.current;
  if (!isPaymentAttemptStateActive(attempt, current)) {
    return false;
  }

  refs.setCheckoutState((prev) =>
    isPaymentAttemptStateActive(attempt, prev) ? updater(prev) : prev,
  );
  return true;
};

export const commitSuccessfulOriginalPaymentAttempt = <
  TState extends PaymentAttemptState,
>(
  attempt: PaymentAttempt,
  donation: TState["donation"],
  refs: PaymentAttemptRefs<TState>,
): boolean => {
  const current = refs.checkoutStateRef.current;
  if (
    !isOriginalPaymentAttemptStateActive(
      attempt,
      refs.activePaymentAttemptRef.current,
      current,
    )
  ) {
    return false;
  }

  refs.setCheckoutState((prev) =>
    isPaymentAttemptStateActive(attempt, prev)
      ? {
          ...prev,
          donation,
          error: null,
          isProcessing: false,
          step: "success",
          successSnapshot: attempt.successSnapshot,
        }
      : prev,
  );
  return true;
};

export const exitStalePaymentAttempt = <TState extends PaymentAttemptState>(
  attempt: PaymentAttempt,
  refs: Omit<PaymentAttemptRefs<TState>, "currentRequestFingerprintRef">,
): boolean => {
  if (
    !isOriginalPaymentAttemptActive(
      attempt,
      refs.activePaymentAttemptRef.current,
    )
  ) {
    return false;
  }

  const current = refs.checkoutStateRef.current;
  if (current.paymentAttemptId !== attempt.id || current.step === "success") {
    return false;
  }

  refs.setCheckoutState((prev) =>
    prev.paymentAttemptId === attempt.id && prev.step !== "success"
      ? {
          ...prev,
          donation: null,
          error: STALE_PAYMENT_ATTEMPT_MESSAGE,
          isProcessing: false,
          step: "payment",
          successSnapshot: null,
        }
      : prev,
  );
  return true;
};

// Called after React commits. Scheduling a transition does not clear its owner.
export const synchronizePaymentAttemptState = <
  TState extends PaymentAttemptState,
>(
  state: TState,
  refs: Pick<
    PaymentAttemptRefs<TState>,
    "activePaymentAttemptRef" | "checkoutStateRef"
  >,
): void => {
  refs.checkoutStateRef.current = state;
  if (
    refs.activePaymentAttemptRef.current?.id === state.paymentAttemptId &&
    !state.isProcessing
  ) {
    refs.activePaymentAttemptRef.current = null;
  }
};
