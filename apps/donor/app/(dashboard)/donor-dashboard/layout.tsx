import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { PortalDocument } from "@asym/auth/portal-document";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { TenantLink as Link } from "@asym/auth/tenant-navigation";
import { readPortalDocumentScope } from "@asym/auth/tenant-server";
import { siteConfig } from "@asym/config/site-client";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { RetainedDraftPageTenant } from "@asym/ui/hooks";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DonorPortalFrameSkeleton } from "./donor-portal-frame-skeleton";
import { DonorPortalHeader } from "../../../features/donor/components/donor-portal-header";

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const DONOR_ALLOWED_ROLES = ["donor"] as const;

export default function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/*
       * The header and the pages render inside the portal's document scope
       * (WP2b, AL-2675), as the workspace's chrome renders inside its
       * `TenantDocument`: the header reads the donor's own data through the
       * own-API wrapper, and a call made outside the scope would leave with
       * no tenant or assignment. Both wait for the request's donor
       * membership behind a skeleton frame, never `null`, and each route's
       * own `loading.tsx` still streams inside the scoped document.
       */}
      <Suspense fallback={<DonorPortalFrameSkeleton />}>
        <DonorPortalDocument>
          <DonorPortalHeader />
          <div className="flex flex-1 flex-col">
            <main id="main-content" className="flex-1 pt-8 pb-20">
              <RouteMainViewTransitionBoundary className="container-responsive">
                {children}
              </RouteMainViewTransitionBoundary>
            </main>
          </div>
        </DonorPortalDocument>
      </Suspense>
      <DonorPortalFooter />
    </div>
  );
}

/** A quiet footer for signed-in donors: the legal pages and help. */
function DonorPortalFooter() {
  const links = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Help", href: "/help/about" },
  ];
  return (
    <footer className="border-t border-border pb-20 md:pb-0">
      <div className="container-responsive flex flex-col gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{siteConfig.name}</p>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

/**
 * The role gate and the portal's document scope.
 *
 * The gate is defence in depth: `apps/donor/proxy.ts` passes
 * `allowedRoles: ["donor"]` and `packages/auth/middleware.ts` rejects any
 * other role for `/donor-dashboard` before the app renders.
 *
 * Until WP3 resolves the portal's host, the scope is the person's one live
 * donor membership (plan 12, WP2, "Interim rules until WP3"; AL-2675): the
 * own-API wrapper, the browser client and the query cache read it as they
 * read a tenant address's scope elsewhere. A person with donor memberships in
 * two tenants resolves no assignment and is refused.
 */
async function DonorPortalDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthContext(undefined, { roleClass: "donor" });
  const authRedirectPath = getProtectedAppRedirectPath(
    authContext,
    "/login?next=/donor-dashboard",
  );

  if (authRedirectPath) {
    redirect(authRedirectPath);
  }

  if (!hasAnyContextRole(authContext, [...DONOR_ALLOWED_ROLES])) {
    redirect("/no-access");
  }

  const scope = readPortalDocumentScope(authContext);
  if (!scope) {
    redirect("/no-access");
  }

  // Retained drafts are scoped by the document's person and tenant.
  return (
    <PortalDocument scope={scope}>
      <RetainedDraftPageTenant
        userId={scope.userId}
        tenantId={scope.tenantId}
      />
      {children}
    </PortalDocument>
  );
}
