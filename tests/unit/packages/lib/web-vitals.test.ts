// @vitest-environment jsdom

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import type { Metric } from "web-vitals";

const observers = vi.hoisted(() => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
}));
vi.mock("web-vitals", () => observers);

import { initWebVitals } from "../../../../packages/lib/monitoring/web-vitals";

beforeEach(() => {
  Object.values(observers).forEach((observer) => observer.mockReset());
});

afterEach(() => vi.unstubAllGlobals());

const metric = (overrides: Partial<Metric> = {}): Metric => ({
  name: "LCP",
  value: 2700,
  rating: "needs-improvement",
  delta: 2700,
  id: "metric-load",
  entries: [],
  navigationType: "navigate",
  navigationId: 1,
  ...overrides,
});

function report(name: keyof typeof observers, value: Metric) {
  const handler = observers[name].mock.calls[0]?.[0] as (
    metric: Metric,
  ) => void;
  handler(value);
}

describe("web-vitals analytics adapter", () => {
  it("preserves each metric identity and delta across load, SPA and BFCache reports", () => {
    const sendBeacon = vi.fn((_url: string, _body: string) => true);
    vi.stubGlobal("navigator", { sendBeacon, userAgent: "fixture-browser" });
    const violation = vi.fn();
    initWebVitals({
      analyticsEndpoint: "/metrics-fixture",
      onViolation: violation,
    });
    const values = [
      metric(),
      metric({ id: "metric-load", value: 2800, delta: 100 }),
      metric({
        id: "metric-spa",
        value: 1500,
        delta: 1500,
        navigationType: "soft-navigation",
        navigationId: 2,
      }),
      metric({
        id: "metric-bfcache",
        value: 100,
        delta: 100,
        navigationType: "back-forward-cache",
        navigationId: 3,
      }),
    ];
    values.forEach((value) => report("onLCP", value));
    expect(sendBeacon).toHaveBeenCalledTimes(4);
    const payloads = sendBeacon.mock.calls.map(([, body]) => JSON.parse(body));
    expect(
      payloads.map(({ id, delta, navigationType }) => ({
        id,
        delta,
        navigationType,
      })),
    ).toEqual(
      values.map(({ id, delta, navigationType }) => ({
        id,
        delta,
        navigationType,
      })),
    );
    expect(violation).toHaveBeenCalledTimes(2);
    expect(violation).toHaveBeenNthCalledWith(1, values[0], 2500);
    expect(violation).toHaveBeenNthCalledWith(2, values[1], 2500);
    expect(observers.onLCP).toHaveBeenCalledWith(expect.any(Function));
  });

  it("uses a keepalive fetch when sendBeacon is unavailable", () => {
    const fakeFetch = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(null, { status: 204 }),
    );
    vi.stubGlobal("navigator", { userAgent: "fixture-browser" });
    vi.stubGlobal("fetch", fakeFetch);
    initWebVitals({ analyticsEndpoint: "/metrics-fixture" });
    report("onCLS", metric({ name: "CLS", value: 0.12, delta: 0.12 }));
    expect(fakeFetch).toHaveBeenCalledWith("/metrics-fixture", {
      method: "POST",
      body: expect.any(String),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
    const payload = JSON.parse(fakeFetch.mock.calls[0]?.[1].body ?? "{}");
    expect(payload).toMatchObject({
      name: "CLS",
      value: 0.12,
      delta: 0.12,
      id: "metric-load",
    });
  });

  it("registers current metrics without sending analytics when no endpoint is configured", () => {
    const fakeFetch = vi.fn();
    const sendBeacon = vi.fn();
    vi.stubGlobal("fetch", fakeFetch);
    vi.stubGlobal("navigator", { sendBeacon, userAgent: "fixture-browser" });
    initWebVitals();
    for (const observer of Object.values(observers))
      expect(observer).toHaveBeenCalledTimes(1);
    report("onINP", metric({ name: "INP", value: 200, delta: 200 }));
    expect(fakeFetch).not.toHaveBeenCalled();
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
