"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long the quiet freshness indicator stays visible (ADR-CD-022). */
const FRESHNESS_VISIBLE_MS = 8000;

/**
 * Shared freshness state for contribution surfaces (ADR-CD-022).
 *
 * `markFreshness` shows the indicator and auto-hides it after eight seconds;
 * repeated successes restart the timer instead of stacking indicators. The
 * pending timer is cleared on unmount.
 */
export function useContributionFreshness() {
  const [showFreshness, setShowFreshness] = useState(false);
  const freshnessTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (freshnessTimerRef.current !== null) {
        window.clearTimeout(freshnessTimerRef.current);
      }
    };
  }, []);

  const markFreshness = useCallback(() => {
    setShowFreshness(true);
    if (freshnessTimerRef.current !== null) {
      window.clearTimeout(freshnessTimerRef.current);
    }
    freshnessTimerRef.current = window.setTimeout(() => {
      setShowFreshness(false);
    }, FRESHNESS_VISIBLE_MS);
  }, []);

  return { markFreshness, showFreshness };
}

/**
 * Quiet, low-noise "Updated just now" indicator shown after shared row data
 * refreshes (ADR-CD-022). The Contributions Hub and the CRM surface render
 * this same component so freshness reads identically on both surfaces.
 */
export function ContributionFreshnessIndicator({
  show,
  testId,
}: {
  show: boolean;
  testId: string;
}) {
  if (!show) {
    return null;
  }

  return (
    <p
      role="status"
      className="mb-2 text-xs text-muted-foreground"
      data-testid={testId}
    >
      Updated just now
    </p>
  );
}
