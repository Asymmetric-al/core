import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function focusIsLost(): boolean {
  const active = document.activeElement;
  return !active || active === document.body;
}

// For a control that removes itself (a retry that worked): the page heading
// is the stable place to land when nothing better took focus. Returns false
// while focus is still lost: the page has no heading that takes it yet.
export function focusHeadingIfLost(
  container: HTMLElement | null | undefined,
): boolean {
  if (!focusIsLost()) return true;
  const heading = container?.querySelector("h1");
  if (!heading) return false;
  heading.tabIndex = -1;
  heading.focus();
  return !focusIsLost();
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
 * focused nothing), stays put.
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

// A TanStack Query refetch resolves with its result, a query collection's
// with a list of them; either may also reject.
function refetchFailed(result: unknown): boolean {
  if (Array.isArray(result)) return result.some(refetchFailed);
  return (
    typeof result === "object" &&
    result !== null &&
    "isError" in result &&
    result.isError === true
  );
}

// Try again for a load that failed. The error view must stay mounted while
// `retrying`, so its button keeps focus; `failedRetries` keys its alert so a
// retry that fails again is announced again. Once `failed` clears after a
// retry, a lost focus (a tap that focused nothing) moves to the heading
// inside `pageRef`. This covers only the donor's own press: give the error
// view a useFocusHandoff ref too, so focus it holds when a load recovers on
// its own still lands. The page owns `pageRef`, so the result holds only
// render values.
export function useLoadRetry(
  pageRef: RefObject<HTMLElement | null>,
  failed: boolean,
  refetch: () => Promise<unknown>,
) {
  const [retrying, setRetrying] = useState(false);
  const [failedRetries, setFailedRetries] = useState(0);
  const recovering = useRef(false);

  useEffect(() => {
    if (!recovering.current || retrying || failed) return;
    recovering.current = false;
    focusHeadingIfLost(pageRef.current);
  }, [pageRef, retrying, failed]);

  const retry = () => {
    if (retrying) return;
    recovering.current = true;
    setRetrying(true);
    void refetch()
      .then(refetchFailed, () => true)
      .then((stillFailing) => {
        setRetrying(false);
        if (!stillFailing) return;
        // The press is spent: a later recovery it did not cause (a refetch
        // on reconnect) leaves focus where the donor has it.
        recovering.current = false;
        setFailedRetries((count) => count + 1);
      });
  };

  return { retrying, failedRetries, retry };
}
