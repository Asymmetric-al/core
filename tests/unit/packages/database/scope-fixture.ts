import { render } from "@testing-library/react";
import { createElement } from "react";

import type { DocumentScope } from "../../../../packages/database/document-scope";

/**
 * Gives the current (freshly loaded) document a scope the way a page does: by
 * rendering the scope provider, which stays mounted until the test's cleanup.
 * Tests load `document-scope` through `vi.resetModules()` first, so each one
 * starts with no scope. A scope is valid only inside its segment (council
 * round 1, A8 and SB2), so the page is put at an address in it first, as a
 * signed-in page is.
 */
export async function renderDocumentScope(scope: DocumentScope) {
  window.history.replaceState(null, "", scope.addressPrefix || "/");
  const { DocumentScopeProvider } =
    await import("../../../../packages/database/document-scope");
  return render(createElement(DocumentScopeProvider, { scope }, null));
}
