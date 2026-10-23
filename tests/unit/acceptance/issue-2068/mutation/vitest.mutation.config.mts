/**
 * Vitest config for the issue #2068 criterion-1 mutation runs.
 * Spec (rev 1, Blake-approved 2026-10-22 9:28 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2068#issuecomment-6357332555}
 *
 * The root config plus one resolver hook: when `ACC_2068_MUTANT_MODULE` is
 * `./catalog` or `./serialization`, a module inside the purpose-catalog
 * directory that imports that specifier gets the matching mutant in this
 * directory instead. The mutant imports the real module by a different
 * specifier, so it is never redirected to itself. With the variable unset this
 * is the root config (the control run).
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { mergeConfig } from "vitest/config";

import rootConfig from "../../../../../vitest.config.mts";

const here = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.resolve(
  here,
  "../../../../../packages/api/src/generated-documents/purpose-catalog",
);
const mutants: Record<string, string> = {
  "./catalog": path.join(here, "catalog-mutant.ts"),
  "./serialization": path.join(here, "serialization-mutant.ts"),
};
const target = process.env.ACC_2068_MUTANT_MODULE ?? "";

export default mergeConfig(rootConfig, {
  test: { fsModuleCache: false },
  plugins: [
    {
      name: "acceptance-2068-mutant",
      enforce: "pre" as const,
      resolveId(source: string, importer?: string) {
        if (!target || source !== target || !importer) return null;
        const importerFile = importer.split("?")[0] as string;
        if (path.dirname(importerFile) !== catalogDir) return null;
        return mutants[target] ?? null;
      },
    },
  ],
});
