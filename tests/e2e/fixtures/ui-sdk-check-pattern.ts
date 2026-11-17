// Exposes UI SDK's `checkPattern` on `window` so a spec can inject it into a
// real app page with `page.addScriptTag` and check a widget the app rendered.
// `tests/e2e/ui-sdk-real-apps.spec.ts` bundles this file with `bun build`.

// Only `packages/ui` installs UI SDK, so its testing kit is reached by file.
import { checkPattern } from "../../../packages/ui/node_modules/@ui-sdk/core/dist/testing.js";

// A local type, not a `declare global`, so this file never has to agree with
// the conformance fixture's own global declaration of `window.__checkPattern`.
type CheckPatternWindow = Window & {
  __checkPattern?: (selector: string, pattern: string) => Promise<string[]>;
};

// Resolves to the problems `checkPattern` lists, one per entry, with the
// generated ids removed so they compare across runs, the same reading as
// `tests/e2e/fixtures/ui-sdk-pattern-conformance.tsx`.
(window as CheckPatternWindow).__checkPattern = async (selector, pattern) => {
  const root = document.querySelector(selector);
  if (!root) return [`No element matches ${selector}`];
  try {
    await checkPattern(root, pattern as Parameters<typeof checkPattern>[1]);
    return [];
  } catch (error) {
    return String(error instanceof Error ? error.message : error)
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).replace(/#[\w:-]+/g, ""));
  }
};
