"use client";

import { useEffect, useCallback, useRef } from "react";
import { initWebVitals, type Metric } from "@/lib/monitoring/web-vitals";

interface WebVitalsReporterProps {
  analyticsEndpoint?: string;
  debug?: boolean;
}

export function WebVitalsReporter({
  analyticsEndpoint,
  debug,
}: WebVitalsReporterProps) {
  const initializedRef = useRef(false);

  const onViolation = useCallback((metric: Metric, threshold: number) => {
    console.warn(
      `[Performance Budget Violation] ${metric.name}: ${metric.value.toFixed(2)} exceeds threshold of ${threshold}`,
    );

    if (typeof window !== "undefined" && "Sentry" in window) {
      const Sentry = window.Sentry as {
        captureMessage: (msg: string, level: string) => void;
      };
      Sentry.captureMessage(
        `Performance budget violation: ${metric.name} = ${metric.value.toFixed(2)} (threshold: ${threshold})`,
        "warning",
      );
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    initWebVitals({
      analyticsEndpoint: analyticsEndpoint || "/api/analytics/web-vitals",
      onViolation,
      debug: debug ?? process.env.NODE_ENV === "development",
    });
  }, [analyticsEndpoint, debug, onViolation]);

  return null;
}

declare global {
  interface Window {
    Sentry?: {
      captureMessage: (message: string, level: string) => void;
    };
  }
}
