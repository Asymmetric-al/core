import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Check of the fix lists, JR14: a Web Studio scope that is refused or
 * retired shows the reload notice in the app's own view, as Mission
 * Control's pages do, not the unstyled fallback. The view comes from
 * `ScopeReloadNotices` above the scope's provider; Payload's root layout is
 * a server component that renders Payload itself, so the structure is read
 * from its source.
 */
describe("Web Studio's reload notice", () => {
  it("is rendered in the app's view: Payload's layout puts ScopeReloadNotices around Web Studio's document", () => {
    const source = readFileSync("apps/admin/app/(payload)/layout.tsx", "utf8");
    const open = source.indexOf("<ScopeReloadNotices>");
    const document = source.indexOf("<WebStudioDocument");
    const documentEnd = source.indexOf("</WebStudioDocument>");
    const close = source.indexOf("</ScopeReloadNotices>");
    expect(open, "ScopeReloadNotices opens").toBeGreaterThanOrEqual(0);
    expect(document).toBeGreaterThan(open);
    expect(close).toBeGreaterThan(documentEnd);
    expect(source).toContain(
      'import { ScopeReloadNotices } from "@asym/ui/components/scope-reload-notices";',
    );
  });
});
