"use client";

import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from "web-vitals";

const LCP_THRESHOLD = 2500;
const FCP_THRESHOLD = 1800;
const CLS_THRESHOLD = 0.1;
const INP_THRESHOLD = 200;
const TTFB_THRESHOLD = 500;

interface WebVitalsOptions {
  analyticsEndpoint?: string;
  onViolation?: (metric: Metric, threshold: number) => void;
  debug?: boolean;
}

function getThreshold(name: string): number {
  switch (name) {
    case "LCP":
      return LCP_THRESHOLD;
    case "FCP":
      return FCP_THRESHOLD;
    case "CLS":
      return CLS_THRESHOLD;
    case "INP":
      return INP_THRESHOLD;
    case "TTFB":
      return TTFB_THRESHOLD;
    default:
      return Infinity;
  }
}

function sendToAnalytics(metric: Metric, endpoint: string) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body);
  } else {
    fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  }
}

export function initWebVitals(options: WebVitalsOptions = {}) {
  const { analyticsEndpoint, onViolation, debug } = options;

  const handleMetric = (metric: Metric) => {
    const threshold = getThreshold(metric.name);
    const isViolation =
      metric.name === "CLS"
        ? metric.value > threshold
        : metric.value > threshold;

    if (debug) {
      const status = isViolation ? "❌ VIOLATION" : "✅ OK";
      console.log(
        `[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating}) ${status}`,
      );
    }

    if (isViolation && onViolation) {
      onViolation(metric, threshold);
    }

    if (analyticsEndpoint) {
      sendToAnalytics(metric, analyticsEndpoint);
    }
  };

  onLCP(handleMetric);
  onFCP(handleMetric);
  onCLS(handleMetric);
  onINP(handleMetric);
  onTTFB(handleMetric);
}

export function reportWebVitalsToConsole() {
  initWebVitals({ debug: true });
}

export function reportWebVitalsToEndpoint(endpoint: string) {
  initWebVitals({ analyticsEndpoint: endpoint });
}

export { type Metric };
