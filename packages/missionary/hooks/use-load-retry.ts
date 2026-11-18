"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function focusIsLost() {
  const active = document.activeElement;
  return !active || active === document.body;
}

function land(target: HTMLElement | null) {
  if (!target?.isConnected) return;
  if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
  target.focus();
}

export function pageHeading(from: Element | null): HTMLElement | null {
  return (from?.closest("main") ?? document).querySelector("h1");
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

type Held<E> = { error: E; landing: HTMLElement | null; settled: boolean };

// Keeps the error view and its focused Try again up while the retry runs; a
// failure leaves focus there, and loaded content moves it to `landing`.
// `failedRetries` is for keying the alert, so a repeat failure is announced.
// The caller owns `retryRef` (its Try again button), so the result holds only
// render values.
export function useLoadRetry<E>({
  error,
  loading,
  onRetry,
  landing,
  retryRef,
}: {
  error: E | null | undefined;
  loading: boolean;
  onRetry: (() => unknown) | undefined;
  landing: (button: HTMLButtonElement | null) => HTMLElement | null | undefined;
  retryRef: RefObject<HTMLButtonElement | null>;
}) {
  const [held, setHeld] = useState<Held<E> | null>(null);
  const [failedRetries, setFailedRetries] = useState(0);
  const started = useRef(false);
  // Set when a retry ends while the old error still shows: its result may
  // render a task later, replacing the focused button.
  const recovering = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!held) {
      const target = recovering.current;
      if (target && error == null) {
        recovering.current = null;
        if (focusIsLost()) land(target);
      }
      return;
    }
    if (loading) {
      started.current = true;
      return;
    }
    // The reload may begin a render after the click, or never show as
    // `loading` at all (a refetch over loaded data): then only its settling
    // ends the attempt.
    if (!held.settled && !started.current && error === held.error) return;
    started.current = false;
    const button = retryRef.current;
    const onButton = focusIsLost() || document.activeElement === button;
    setHeld(null);
    if (error != null) setFailedRetries((count) => count + 1);
    if (!onButton) return;
    if (error != null && button?.isConnected) {
      button.focus();
      recovering.current = held.landing;
    } else land(held.landing);
  }, [error, held, loading, retryRef]);

  const retry = useCallback(() => {
    if (held || error == null || !onRetry) return;
    started.current = false;
    recovering.current = null;
    const attempt: Held<E> = {
      error,
      landing: landing(retryRef.current) ?? null,
      settled: false,
    };
    setHeld(attempt);
    const result = onRetry();
    if (!isThenable(result)) return;
    // A query store renders a settled refetch a task later (TanStack's
    // notifier uses setTimeout 0), so read the outcome after that.
    const settle = () =>
      setTimeout(() =>
        setHeld((current) =>
          current === attempt ? { ...attempt, settled: true } : current,
        ),
      );
    result.then(settle, settle);
  }, [error, held, landing, onRetry, retryRef]);

  return {
    error: held ? held.error : (error ?? null),
    retrying: held !== null,
    failedRetries,
    retry,
  };
}
