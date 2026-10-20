import { describe, expect, it } from "vitest";

import { e2eIntegrationBuildExperimental } from "../../../scripts/github/e2e-integration-next-experimental.mjs";

describe("e2eIntegrationBuildExperimental", () => {
  it("returns empty experimental overrides outside integration builds", () => {
    delete process.env.ASYM_E2E_INTEGRATION_BUILD;
    expect(e2eIntegrationBuildExperimental()).toEqual({});
  });

  it("limits static generation concurrency during integration builds", () => {
    process.env.ASYM_E2E_INTEGRATION_BUILD = "1";
    expect(e2eIntegrationBuildExperimental()).toMatchObject({
      staticGenerationMaxConcurrency: 1,
      turbopackPluginRuntimeStrategy: "workerThreads",
    });
  });
});
