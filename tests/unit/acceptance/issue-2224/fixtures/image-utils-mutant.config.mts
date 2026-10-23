/**
 * #2224 acceptance fixture (criterion 8): the repo Vitest config plus a
 * plugin that serves packages/lib/image-utils.ts from the mutant file named in
 * ACC_2224_IMAGE_UTILS_MUTANT. Without that variable it is the repo config.
 * Owned by Acceptance; implementers must not edit this file.
 */
import { readFileSync } from "node:fs";

import { mergeConfig } from "vitest/config";

import base from "../../../../../vitest.config.mts";

const mutant = process.env.ACC_2224_IMAGE_UTILS_MUTANT;

export default mergeConfig(base, {
  plugins: [
    {
      name: "acc-2224-image-utils-mutant",
      enforce: "pre" as const,
      load(id: string) {
        const file = id.split("?")[0]!.replace(/\\/g, "/");
        if (mutant && file.endsWith("/packages/lib/image-utils.ts"))
          return readFileSync(mutant, "utf8");
        return undefined;
      },
    },
  ],
});
