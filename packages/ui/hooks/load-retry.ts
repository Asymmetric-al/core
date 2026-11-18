"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

/** Nothing holds focus: it is on the page body, or nowhere. */
export function focusIsLost(): boolean {
  const active = document.activeElement;
  return !active || active === document.body;
}

// Focuses `target`, made focusable from script if it is not already. True
// once something holds focus.
function focusOn(target: HTMLElement | null | undefined): boolean {
  if (!target?.isConnected) return false;
  if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
  target.focus();
  return !focusIsLost();
}

/**
 * For a control that removes itself (a retry that worked): the page heading
 * is the stable place to land when nothing better took focus. Returns false
 * while focus is still lost: the page has no heading that takes it yet.
 */
export function focusHeadingIfLost(
  container: HTMLElement | null | undefined,
): boolean {
  if (!focusIsLost()) return true;
  return focusOn(container?.querySelector("h1"));
}

/**
 * The h1 of the `main` that `from` is in. Outside one, as once `from` has
 * left the page (its container was replaced), the document's first h1.
 */
export function pageHeading(from: Element | null): HTMLElement | null {
  return (from?.closest("main") ?? document).querySelector("h1");
}

/**
 * For a view that can be removed while it has focus, such as an error view
 * whose load recovered, whoever caused that. Pass the returned ref to the
 * view, and call this in the component that renders it. If focus was inside
 * the view when it went, `land` runs once the page has rendered without it,
 * with the element the view was removed from. It returns true once it has
 * moved focus or queued where focus goes, and false while the page has
 * nowhere to land yet, to run again after the next render while focus is
 * still lost. Focus that was elsewhere, including nowhere (a tap that
 * focused nothing), stays put. It lands in a layout effect, before the
 * page's own effects run. useLoadRetry hands focus off on its own.
 */
export function useFocusHandoff(land: (from: HTMLElement) => boolean) {
  const removedFrom = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const from = removedFrom.current;
    if (!from) return;
    if (focusIsLost() && !land(from)) return;
    removedFrom.current = null;
  });
  return useCallback((view: HTMLElement | null) => {
    if (!view) return;
    // React detaches the ref before it removes the view, so focus is still
    // inside it here.
    return () => {
      if (view.contains(document.activeElement))
        removedFrom.current = view.parentElement;
    };
  }, []);
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

// Whether a settled refetch says the load failed: a TanStack Query result,
// or a query collection's list of them, carries `isError`. A failure only
// ends the retry without waiting a task; the page's own `error` decides how
// it went.
function refetchFailed(result: unknown): boolean {
  if (Array.isArray(result)) return result.some(refetchFailed);
  return (
    typeof result === "object" &&
    result !== null &&
    "isError" in result &&
    result.isError === true
  );
}

type Press<E> = {
  /** The failure Try again was pressed on, shown until the retry ends. */
  error: E;
  /** The pressed Try again, when the hook knows it. */
  button: HTMLElement | null;
  /** onRetry returned a promise, which ends the retry once it settles. */
  awaited: boolean;
};

type Attempt<E> = {
  press: Press<E>;
  /**
   * Set once onRetry's promise settles: whether its result says the load
   * failed, and whether a task has passed since, so the page shows the
   * outcome (TanStack Query notifies in a setTimeout 0).
   */
  settled?: { failed: boolean; rendered: boolean };
};

/**
 * Try again for a load that failed, and where focus goes when it recovers.
 *
 * While a retry runs, `error` holds the failure it was pressed on and
 * `retrying` is set, so the failure view and its focused Try again stay up
 * even if the reload clears the page's error; a second press does nothing.
 * The retry ends once the page's error clears, `loading` has come and gone,
 * or its promise settles: at once when the result says it failed (a
 * TanStack refetch, or a query collection's list of them), and otherwise a
 * task later, once the page shows the outcome. An `onRetry` that returns
 * nothing also ends once its error changes. Either way the page's `error`
 * decides: one still there is a failure. `failedRetries` then grows, for
 * keying the alert so it is announced again, and focus stays on Try again
 * (back on it from nowhere when `retryRef` is given). A retry that worked
 * moves focus that was on Try again, or nowhere, to `landing`.
 *
 * `error` is the failure, or `false`, `null` or `undefined` for none, so a
 * page that knows only whether its load failed can pass that boolean.
 *
 * Give the failure view `failureView`: however the load recovers, focus it
 * holds when it is removed moves to `landing` once the page has rendered.
 * Pass it to `ref` as it is, not wrapped in a new callback each render, which
 * would detach it each render. Destructure it from the result first: the
 * React Compiler takes an object with a field used as a ref for a ref, and
 * its other fields as unreadable.
 * `landing` gets the element the view was removed from (or the pressed Try
 * again), which may have left the page with it; returning nothing means
 * nowhere yet, to try again after the next render while focus is still
 * lost. Pass `retry` to Try again's onClick, so a press knows its button.
 * The page owns `retryRef`; besides `failureView`, the result holds only
 * render values.
 */
export function useLoadRetry<E>({
  error,
  loading,
  onRetry,
  landing,
  retryRef,
}: {
  error: E | false | null | undefined;
  loading: boolean;
  onRetry: (() => unknown) | undefined;
  landing: (from: HTMLElement | null) => HTMLElement | null | undefined;
  retryRef?: RefObject<HTMLButtonElement | null>;
}) {
  const failure = error === false ? null : (error ?? null);
  const [attempt, setAttempt] = useState<Attempt<E> | null>(null);
  const [failedRetries, setFailedRetries] = useState(0);
  const started = useRef(false);
  // Where focus waits to land from: the failure view was removed while it
  // held focus, or a retry worked before the page had a landing.
  const landFrom = useRef<{ from: HTMLElement | null } | null>(null);
  // A removed failure view may be all that changed; render this component
  // again so the effect below lands.
  const [, removed] = useReducer((count: number) => count + 1, 0);

  // A passive effect, so the page's own earlier effects can move focus first.
  useEffect(() => {
    const pending = landFrom.current;
    if (!pending) return;
    if (focusIsLost() && !focusOn(landing(pending.from))) return;
    landFrom.current = null;
  });

  useEffect(() => {
    if (!attempt) return;
    if (loading) {
      started.current = true;
      return;
    }
    const failed = failure !== null;
    const { press, settled } = attempt;
    const answered =
      !failed ||
      started.current ||
      (press.awaited
        ? settled !== undefined && (settled.failed || settled.rendered)
        : failure !== press.error);
    if (!answered) return;
    started.current = false;
    const button = retryRef?.current ?? press.button;
    const onButton =
      focusIsLost() || (button !== null && document.activeElement === button);
    setAttempt(null);
    if (failed) {
      setFailedRetries((count) => count + 1);
      const retryButton = retryRef?.current;
      if (onButton && retryButton?.isConnected) retryButton.focus();
      return;
    }
    if (onButton && !focusOn(landing(button)))
      landFrom.current = { from: button };
  }, [attempt, failure, landing, loading, retryRef]);

  const retry = useCallback(
    (event?: { currentTarget?: unknown }) => {
      if (attempt || failure === null || !onRetry) return;
      started.current = false;
      landFrom.current = null;
      const result = onRetry();
      const press: Press<E> = {
        error: failure,
        button:
          retryRef?.current ??
          (event?.currentTarget instanceof HTMLElement
            ? event.currentTarget
            : null),
        awaited: isThenable(result),
      };
      setAttempt({ press });
      if (!isThenable(result)) return;
      const settle = (failed: boolean) => {
        const update = (rendered: boolean) =>
          setAttempt((current) =>
            current?.press === press
              ? { press, settled: { failed, rendered } }
              : current,
          );
        update(false);
        setTimeout(() => update(true));
      };
      result.then(
        (value) => settle(refetchFailed(value)),
        () => settle(true),
      );
    },
    [attempt, failure, onRetry, retryRef],
  );

  const failureView = useCallback((view: HTMLElement | null) => {
    if (!view) return;
    // React detaches the ref before it removes the view, so focus is still
    // inside it here.
    return () => {
      if (!view.contains(document.activeElement)) return;
      landFrom.current = { from: view.parentElement };
      removed();
    };
  }, []);

  return {
    error: attempt ? attempt.press.error : failure,
    retrying: attempt !== null,
    failedRetries,
    retry,
    failureView,
  };
}
