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
  state.idempotencyFingerprint === attempt.fingerprint &&
  state.step === "payment";

export const isOriginalPaymentAttemptStateActive = (
  attempt: PaymentAttempt,
  activeAttempt: PaymentAttempt | null,
  state: PaymentAttemptState,
) =>
  isOriginalPaymentAttemptActive(attempt, activeAttempt) &&
  isPaymentAttemptStateActive(attempt, state);

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

  const next = updater(current);
  refs.checkoutStateRef.current = next;
  refs.setCheckoutState((prev) =>
    isPaymentAttemptStateActive(attempt, prev) ? next : prev,
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

  const next = {
    ...current,
    donation,
    error: null,
    isProcessing: false,
    step: "success",
    successSnapshot: attempt.successSnapshot,
  };
  refs.activePaymentAttemptRef.current = null;
  refs.checkoutStateRef.current = next;
  refs.setCheckoutState((prev) => (prev === current ? next : prev));
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
  if (current.step === "success") {
    return false;
  }

  const next = {
    ...current,
    donation: null,
    error: STALE_PAYMENT_ATTEMPT_MESSAGE,
    isProcessing: false,
    step: "payment",
    successSnapshot: null,
  };
  refs.activePaymentAttemptRef.current = null;
  refs.checkoutStateRef.current = next;
  refs.setCheckoutState((prev) => {
    if (prev.step === "success") {
      return prev;
    }
    return prev === current ? next : prev;
  });
  return true;
};
