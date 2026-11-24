// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearPendingInviteFragment,
  getInviteSafeReplayOptions,
  getSentryCompatibilityOptions,
} from "../../../../packages/lib/monitoring/sentry-policy";

import type * as SentrySdk from "@sentry/nextjs";

const { browserSentry, capturedEnvelopes, spyState } = vi.hoisted(() => {
  const { readFileSync: readSync } = process.getBuiltinModule(
    "node:fs",
  ) as typeof import("node:fs");
  const { createRequire: makeReq } = process.getBuiltinModule(
    "node:module",
  ) as typeof import("node:module");
  const nodePath = process.getBuiltinModule(
    "node:path",
  ) as typeof import("node:path");
  const req = makeReq(nodePath.resolve("packages/lib/package.json"));
  const pkgJson = req.resolve("@sentry/nextjs/package.json");
  const exportsMap = JSON.parse(readSync(pkgJson, "utf8")).exports;
  const entry = nodePath.resolve(
    nodePath.dirname(pkgJson),
    exportsMap["."].browser.require,
  );
  return {
    browserSentry: req(entry) as typeof SentrySdk,
    capturedEnvelopes: [] as unknown[],
    spyState: { interceptInitWithSpy: false },
  };
});

// Exercise the installed public browser export used by instrumentation-client,
// independently of Vitest's default Node export condition.
const Sentry = browserSentry;

vi.mock("@sentry/nextjs", () => ({
  ...browserSentry,
  init: (options?: Parameters<typeof browserSentry.init>[0]) => {
    if (!spyState.interceptInitWithSpy) return browserSentry.init(options);
    return browserSentry.init({
      ...options,
      transport: () => ({
        send: async (envelope: unknown) => {
          capturedEnvelopes.push(envelope);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    });
  },
}));

const originalUrl = window.location.href;

afterEach(async () => {
  spyState.interceptInitWithSpy = false;
  capturedEnvelopes.length = 0;
  clearPendingInviteFragment();
  Sentry.getCurrentScope().clearBreadcrumbs();
  await Sentry.close(1_000);
  window.history.replaceState({}, "", originalUrl);
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("real Sentry browser HTTP context under Core's collection policy", () => {
  it("filters collected page queries and denies Referer before delivering a local envelope", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network disabled in the browser privacy fixture"),
    );
    vi.spyOn(document, "referrer", "get").mockReturnValue(
      "https://core.example.test/checkout?campaign=fall&jwt=referer-secret&remote-user=referer-user",
    );
    window.history.replaceState(
      {},
      "",
      "/reports?campaign=fall&jwt=page-secret&forwarded=page-ip",
    );
    const envelopes: unknown[] = [];
    Sentry.init({
      ...getSentryCompatibilityOptions(),
      dsn: "https://public@example.invalid/1",
      transport: () => ({
        send: async (envelope: unknown) => {
          envelopes.push(envelope);
          return { statusCode: 200 };
        },
        flush: async () => true,
      }),
    });

    Sentry.captureMessage("local browser privacy fixture");
    await Sentry.flush(1_000);
    const events = envelopes.flatMap((envelope) => {
      const [, items] = envelope as [
        unknown,
        [
          Record<string, string>,
          { request?: { url?: string; headers?: Record<string, string> } },
        ][],
      ];
      return items
        .filter(([header]) => header.type === "event")
        .map(([, payload]) => payload);
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.request?.url).toBe(
      `${window.location.origin}/reports?campaign=fall&jwt=[Filtered]&forwarded=[Filtered]`,
    );
    expect(events[0]?.request?.headers?.Referer).toBe("[Filtered]");
    expect(JSON.stringify(envelopes)).not.toMatch(
      /page-secret|page-ip|referer-secret|referer-user/,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "admin",
      load: () => import("../../../../apps/admin/instrumentation-client"),
    },
    {
      name: "missionary",
      load: () => import("../../../../apps/missionary/instrumentation-client"),
    },
    {
      name: "donor",
      load: () => import("../../../../apps/donor/instrumentation-client"),
    },
  ])(
    "R16 ($name): strips and scrubs /invite/ URL fragments before hydration so no event, breadcrumb, transaction, or replay leaks the verifier",
    async ({ load }) => {
      vi.resetModules();
      vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@example.invalid/1");
      vi.stubEnv("NODE_ENV", "development");
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Network disabled in R16 transport spy fixture"),
      );

      const initialVerifier = "r16-prehydration-verifier-secret-999";
      const navVerifier = "r16-navigation-verifier-secret-888";
      const routerVerifier = "r16-router-verifier-secret-777";
      const replayVerifier = "r16-replay-verifier-secret-666";
      window.history.replaceState(
        {},
        "",
        `/invite/selector-r16-test#${initialVerifier}`,
      );
      spyState.interceptInitWithSpy = true;

      const mod = await load();

      Sentry.addBreadcrumb({
        category: "navigation",
        data: {
          from: `/invite/selector-r16-test#${initialVerifier}`,
          to: `/invite/selector-r16-test#${navVerifier}`,
        },
        message: `Navigated to /invite/selector-r16-test#${navVerifier}`,
      });
      mod.onRouterTransitionStart(
        `/invite/selector-r16-test#${routerVerifier}`,
        "push",
      );

      Sentry.startSpan(
        {
          name: `GET /invite/selector-r16-test#${navVerifier}`,
          op: "navigation",
          forceTransaction: true,
          attributes: {
            "url.full": `${window.location.origin}/invite/selector-r16-test#${navVerifier}`,
          },
        },
        () => {
          try {
            throw new Error(
              `Pre-hydration crash on /invite/selector-r16-test#${initialVerifier}`,
            );
          } catch (error) {
            Sentry.captureException(error);
          }
        },
      );

      const replayOptions = getInviteSafeReplayOptions();
      const scrubbedRecordingEvent = replayOptions.beforeAddRecordingEvent?.({
        type: 5,
        timestamp: Date.now(),
        data: {
          tag: "breadcrumb",
          payload: {
            category: "navigation",
            data: {
              from: `${window.location.origin}/invite/selector-r16-test#${replayVerifier}`,
              to: `${window.location.origin}/invite/selector-r16-test#${replayVerifier}`,
            },
          },
        },
      });
      expect(JSON.stringify(scrubbedRecordingEvent)).not.toContain(
        replayVerifier,
      );

      const replay = Sentry.getReplay?.();
      if (replay && typeof replay.flush === "function") {
        await replay.flush();
      }
      await Sentry.flush(1_000);

      expect(capturedEnvelopes.length).toBeGreaterThan(0);
      const serialized = JSON.stringify(capturedEnvelopes);
      expect(serialized).toContain(
        "Pre-hydration crash on /invite/selector-r16-test",
      );
      expect(serialized).not.toContain(initialVerifier);
      expect(serialized).not.toContain(navVerifier);
      expect(serialized).not.toContain(routerVerifier);
      expect(serialized).not.toContain(replayVerifier);
      expect(window.location.hash).toBe("");
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
