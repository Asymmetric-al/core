/**
 * Vitest config for the issue #2206 locale probe: the root config plus the
 * probe file, which is deliberately not named `*.test.ts` so the normal unit
 * run never collects it on its own.
 * Issue: {@link https://github.com/Asymmetric-al/core/issues/2206}
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import { mergeConfig } from "vitest/config";

import rootConfig from "../../../../../vitest.config.mts";

export default mergeConfig(rootConfig, {
  test: {
    fsModuleCache: false,
    include: ["tests/unit/acceptance/issue-2206/probe/*.probe.ts"],
  },
});
