"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long the quiet freshness indicator stays visible (ADR-CD-022). */
const FRESHNESS_VISIBLE_MS = 8000;

/**
 * Shared freshness state for contribution surfaces (ADR-CD-022).
 *
 * Repeated successes restart the timer instead of stacking indicators, and
 * the pending timer is cleared when the owning surface unmounts.
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
 * Low-noise status shown after shared contribution data refreshes. Hub and CRM
 * use the same component so freshness feedback stays consistent.
 */
export function ContributionFreshnessIndicator({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <p role="status" className="mb-2 text-xs text-muted-foreground">
      Updated just now
    </p>
  );
}
