/**
 * Regression fixture for the internal `@/` alias inside `packages/ui`.
 *
 * `docs/ai/rules/frontend.md` (Imports) prefers `@/` for new or touched
 * `packages/ui` files, and this package's tsconfig maps `@/*` to the package
 * root. Unit tests live outside the package, so this import only resolves when
 * the root `vitest.config.ts` maps `@/` per importer. Keep the `@/` import:
 * rewriting it as a relative path would defeat
 * `tests/unit/packages/ui/internal-alias.test.ts`.
 */
import { cn } from "@/lib/utils";

export function mergeClassesViaInternalAlias(
  ...inputs: Parameters<typeof cn>
): string {
  return cn(...inputs);
}
