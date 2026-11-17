import * as React from "react";

interface ReportStatus {
  isError?: boolean;
  isLoading?: boolean;
  isReady?: boolean;
  refetch?: () => unknown;
}
export function useReportStatus(states: ReportStatus[]) {
  const isError = states.some((state) => state.isError);
  const isLoading = states.some(
    (state) => state.isLoading || state.isReady === false,
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const retryFocusRef = React.useRef(false);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [failedRetries, setFailedRetries] = React.useState(0);

  const retry = () => {
    if (isRetrying) return;
    retryFocusRef.current = true;
    setIsRetrying(true);
    void Promise.allSettled(
      states.filter((state) => state.isError).map((state) => state.refetch?.()),
    ).then((results) => {
      setIsRetrying(false);
      if (!results.some(refetchFailed)) return;
      // Still failing: Try again stays, so a later recovery must not move focus.
      retryFocusRef.current = false;
      setFailedRetries((count) => count + 1);
    });
  };

  React.useLayoutEffect(() => {
    if (isError || isLoading || !retryFocusRef.current) return;
    retryFocusRef.current = false;
    // Try again went with the alert; focus the person moved stays where it is.
    if (document.activeElement === document.body) {
      focusReportStart(rootRef.current);
    }
  }, [isError, isLoading]);

  return { isError, isLoading, isRetrying, failedRetries, retry, rootRef };
}

function focusReportStart(root: HTMLElement | null) {
  if (!root) return;
  const target =
    root.querySelector<HTMLElement>(
      "h1, h2, h3, h4, h5, h6, [role='heading']",
    ) ?? root;
  // A heading takes focus only with a tabindex; drop it once focus leaves.
  if (!target.hasAttribute("tabindex")) {
    target.tabIndex = -1;
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), {
      once: true,
    });
  }
  target.focus();
}

// useSupportReport's refetch resolves an array of query results;
// useSupportTeams' resolves a single one.
function isFailedResult(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(isFailedResult);
  return (
    typeof value === "object" &&
    value !== null &&
    "isError" in value &&
    value.isError === true
  );
}

function refetchFailed(result: PromiseSettledResult<unknown>): boolean {
  return result.status === "rejected" || isFailedResult(result.value);
}
