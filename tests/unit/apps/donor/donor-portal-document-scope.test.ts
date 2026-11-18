import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * The donor portal renders inside a document scope taken from the person's
 * one live donor membership (WP2b, AL-2675; plan 12, WP2 "Interim rules until
 * WP3"), so the own-API wrapper, the browser client and the query cache read
 * the same scope as in Mission Control and the missionary workspace. The role
 * gate stays in the layout as defence in depth behind the proxy, which
 * remains the primary gate.
 *
 * The portal header reads the donor's own data (`useDonorPortalSnapshot`)
 * through the wrapper, so it renders inside the scoped document as the
 * workspace's chrome does: outside it, its call left before any scope was
 * fixed and carried no tenant or assignment.
 */
const layout = readFileSync(
  "apps/donor/app/(dashboard)/donor-dashboard/layout.tsx",
  "utf8",
);
const skeleton = readFileSync(
  "apps/donor/app/(dashboard)/donor-dashboard/donor-portal-frame-skeleton.tsx",
  "utf8",
);

/** The default export's body: the layout every portal page renders in. */
const layoutBody =
  /export default function DonorDashboardLayout\([\s\S]*?\n\}\n/.exec(
    layout,
  )?.[0] ?? "";

/** That body with its scoped document cut out: what renders outside it. */
const outsideTheDocument = layoutBody.replace(
  /<DonorPortalDocument>[\s\S]*<\/DonorPortalDocument>/,
  "",
);

describe("the donor portal layout", () => {
  it("renders the pages inside the portal document scope, behind the role gate", () => {
    expect(layout).toMatch(/readPortalDocumentScope\(authContext\)/);
    expect(layout).toMatch(/<PortalDocument scope=\{scope\}>/);
    // The pages are children of the scoped document, not siblings of a gate.
    expect(layout).toMatch(
      /<PortalDocument scope=\{scope\}>[\s\S]*\{children\}[\s\S]*<\/PortalDocument>/,
    );
    expect(layoutBody).toMatch(
      /<DonorPortalDocument>[\s\S]*\{children\}[\s\S]*<\/DonorPortalDocument>/,
    );
    expect(outsideTheDocument).not.toMatch(/\{children\}/);
    // Retained drafts read the same scope.
    expect(layout).toMatch(
      /<RetainedDraftPageTenant\s+userId=\{scope\.userId\}\s+tenantId=\{scope\.tenantId\}/,
    );
  });

  it("renders the portal header inside the scoped document, so its own-API calls carry the scope", () => {
    expect(layoutBody).toMatch(
      /<DonorPortalDocument>[\s\S]*<DonorPortalHeader \/>[\s\S]*<\/DonorPortalDocument>/,
    );
    expect(outsideTheDocument).not.toMatch(/<DonorPortalHeader\b/);
  });

  it("streams the scoped portal behind a skeleton frame, not a blank page", () => {
    expect(layoutBody).toMatch(
      /<Suspense fallback=\{<DonorPortalFrameSkeleton \/>\}>\s*<DonorPortalDocument>/,
    );
    // The frame holds the header's place and keeps the skip link's target,
    // and reads no portal data: a fallback that did would call unscoped.
    expect(skeleton).toMatch(/export function DonorPortalFrameSkeleton\(/);
    expect(skeleton).toMatch(/<main\b[^>]*\bid="main-content"/);
    expect(skeleton).not.toMatch(/@asym\/database|DonorPortalHeader/);
  });
});
