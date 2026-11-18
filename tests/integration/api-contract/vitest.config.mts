/**
 * Vitest project for the API contract check (#2708). It reuses the root
 * configuration (workspace resolution, aliases, unit environment) and runs
 * only this directory: the root `include` does not reach `tests/integration`,
 * so `bun run test:unit` never starts these tests.
 *
 * Pure tests (`*.test.ts`) run anywhere. The live ones (`*.live.test.ts`) need
 * the stack that `scripts/api-contract/stack.mjs` starts and skip without it,
 * unless API_CONTRACT_REQUIRE_STACK=1 (CI) makes a missing stack a failure.
 */
import { defineConfig } from "vitest/config";

import rootConfig from "../../../vitest.config.mts";

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: ["tests/integration/api-contract/**/*.test.ts"],
    /** Live tests share one database and one PostgREST; keep them serial. */
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 120_000,
    hookTimeout: 180_000,
  },
});
