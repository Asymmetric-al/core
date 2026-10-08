import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  init,
  replayIntegration,
  browserSessionIntegration,
  clientEnv,
  runtimeEnvFlags,
} = vi.hoisted(() => ({
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({ name: "Replay" })),
  browserSessionIntegration: vi.fn(() => ({ name: "BrowserSession" })),
  clientEnv: { NEXT_PUBLIC_SENTRY_DSN: "https://public@example.invalid/1" },
  runtimeEnvFlags: { NODE_ENV: "production" },
}));

vi.mock("@asym/env", () => ({ clientEnv, runtimeEnvFlags }));
vi.mock("@sentry/nextjs", () => ({
  init,
  replayIntegration,
  browserSessionIntegration,
  captureRouterTransitionStart: vi.fn(),
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SENTRY_DSN", "https://public@example.invalid/1");
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@example.invalid/1");
  clientEnv.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.invalid/1";
  init.mockClear();
  replayIntegration.mockClear();
  browserSessionIntegration.mockClear();
});

afterEach(() => vi.unstubAllEnvs());

const appInitializers = [
  {
    name: "admin browser",
    load: () => import("../../../../apps/admin/instrumentation-client"),
  },
  {
    name: "donor browser",
    load: () => import("../../../../apps/donor/instrumentation-client"),
  },
  {
    name: "missionary browser",
    load: () => import("../../../../apps/missionary/instrumentation-client"),
  },
  {
    name: "admin server",
    load: () => import("../../../../apps/admin/sentry.server.config"),
  },
  {
    name: "donor server",
    load: () => import("../../../../apps/donor/sentry.server.config"),
  },
  {
    name: "missionary server",
    load: () => import("../../../../apps/missionary/sentry.server.config"),
  },
  {
    name: "admin edge",
    load: () => import("../../../../apps/admin/sentry.edge.config"),
  },
  {
    name: "donor edge",
    load: () => import("../../../../apps/donor/sentry.edge.config"),
  },
  {
    name: "missionary edge",
    load: () => import("../../../../apps/missionary/sentry.edge.config"),
  },
  {
    name: "shared monitoring",
    load: async () => {
      const { initSentry } =
        await import("../../../../packages/lib/monitoring/sentry");
      initSentry();
    },
  },
];

describe("Sentry collection and compatibility policy", () => {
  it.each(appInitializers)(
    "keeps $name from enabling new sensitive collection",
    async ({ name, load }) => {
      await load();
      expect(init).toHaveBeenCalledTimes(1);
      const options = init.mock.calls[0]?.[0];
      expect(options?.dataCollection).toMatchObject({
        userInfo: false,
        cookies: false,
        httpBodies: [],
        genAI: { inputs: false, outputs: false },
        databaseQueryData: false,
        graphQL: { document: false, variables: false },
      });
      expect(options?.dataCollection.httpHeaders.request.deny).toContain("-ip");
      expect(options?.dataCollection.httpHeaders.response.deny).toContain(
        "-user",
      );
      expect(options?.dataCollection.urlQueryParams.deny).toContain(
        "forwarded",
      );
      expect(options?.traceLifecycle).toBe("static");
      expect(options?.attachStacktrace).toBe(false);
      expect(options?.profileSessionSampleRate).toBe(0);
      expect(options).not.toHaveProperty("sendDefaultPii");
      expect(options).not.toHaveProperty("profilesSampleRate");
      if (name.endsWith("browser")) {
        expect(replayIntegration).toHaveBeenCalledTimes(1);
        expect(browserSessionIntegration).toHaveBeenCalledWith({
          lifecycle: "route",
        });
        expect(options?.replaysOnErrorSampleRate).toBe(1);
        expect(options?.replaysSessionSampleRate).toBe(0.1);
      }
      expect(options?.tracesSampleRate).toBe(0.1);
    },
  );

  it("does not initialize application telemetry when DSNs are absent", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    for (const { name, load } of appInitializers) {
      if (name !== "shared monitoring") await load();
    }
    expect(init).not.toHaveBeenCalled();
    expect(replayIntegration).not.toHaveBeenCalled();
  });
});
