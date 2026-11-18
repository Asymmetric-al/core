import { render } from "@testing-library/react";
import { createElement } from "react";

import type { DocumentScope } from "../../../../packages/database/document-scope";

/**
 * Gives the current (freshly loaded) document a scope the way a page does: by
 * rendering the scope provider, which stays mounted until the test's cleanup.
 * Tests load `document-scope` through `vi.resetModules()` first, so each one
 * starts with no scope.
 */
export async function renderDocumentScope(scope: DocumentScope) {
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  return render(createElement(DocumentScopeProvider, { scope }, null));
}
