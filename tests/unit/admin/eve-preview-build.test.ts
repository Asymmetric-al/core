import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ withEve: vi.fn((config) => config) }));

vi.mock("@next/env", () => ({ loadEnvConfig: vi.fn() }));
vi.mock("@payloadcms/next/withPayload", () => ({
  withPayload: (config: unknown) => config,
}));
vi.mock("@sentry/nextjs", () => ({
  withSentryConfig: (config: unknown) => config,
}));
vi.mock(
  "../../../apps/admin/node_modules/eve/dist/src/public/next/index.js",
  () => ({
    withEve: mocks.withEve,
  }),
);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("admin Eve service builds", () => {
  it("uses the target-aware service dispatcher for a hosted preview", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_TARGET_ENV", "preview");

    await import("../../../apps/admin/next.config");

    expect(mocks.withEve).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ eveBuildCommand: "bun run build:service" }),
    );
  });

  it.each([
    { VERCEL: "1", VERCEL_ENV: "production" },
    {
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_TARGET_ENV: "production",
    },
    { VERCEL_ENV: "preview" },
    {},
  ])(
    "keeps the same service dispatcher for a later target (%j)",
    async (environment) => {
      vi.stubEnv("VERCEL", environment.VERCEL);
      vi.stubEnv("VERCEL_ENV", environment.VERCEL_ENV);
      vi.stubEnv("VERCEL_TARGET_ENV", environment.VERCEL_TARGET_ENV);
      vi.stubEnv("CORE_EVE_BUILD_MODE", "artifacts");

      await import("../../../apps/admin/next.config");

      expect(mocks.withEve).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ eveBuildCommand: "bun run build:service" }),
      );
    },
  );
});
