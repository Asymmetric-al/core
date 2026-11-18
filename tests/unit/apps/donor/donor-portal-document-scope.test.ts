import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The donor portal's pages render inside a document scope taken from the
 * person's one live donor membership (WP2b, AL-2675; plan 12, WP2 "Interim
 * rules until WP3"), so the own-API wrapper, the browser client and the query
 * cache read the same scope as in Mission Control and the missionary
 * workspace. The role gate stays in the layout as defence in depth behind the
 * proxy, which remains the primary gate.
 */
const layout = readFileSync(
  "apps/donor/app/(dashboard)/donor-dashboard/layout.tsx",
  "utf8",
);

describe("the donor portal layout", () => {
  it("renders the pages inside the portal document scope, behind the role gate", () => {
    expect(layout).toMatch(/readPortalDocumentScope\(authContext\)/);
    expect(layout).toMatch(/<PortalDocument scope=\{scope\}>/);
    // The pages are children of the scoped document, not siblings of a gate.
    expect(layout).toMatch(
      /<PortalDocument scope=\{scope\}>[\s\S]*\{children\}[\s\S]*<\/PortalDocument>/,
    );
    expect(layout).toMatch(
      /<DonorPortalDocument>\{children\}<\/DonorPortalDocument>/,
    );
    // Retained drafts read the same scope.
    expect(layout).toMatch(
      /<RetainedDraftPageTenant\s+userId=\{scope\.userId\}\s+tenantId=\{scope\.tenantId\}/,
    );
  });

  it("streams the scoped pages behind a skeleton, not a blank page", () => {
    expect(layout).toMatch(
      /<Suspense fallback=\{<DonorPortalContentSkeleton \/>\}>\s*<DonorPortalDocument>/,
    );
  });
});
