import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { siteConfig } from "@asym/config/site-client";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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

const DONOR_ALLOWED_ROLES = ["donor", "super_admin"] as const;

export default function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <DonorPortalHeader />
      <div className="flex flex-1 flex-col">
        <main id="main-content" className="flex-1 pt-8 pb-20">
          <RouteMainViewTransitionBoundary className="container-responsive">
            {/*
             * Sibling, not a wrapper: while it wrapped `{children}` this null
             * fallback covered the whole page and the per-route `loading.tsx`
             * skeletons could never render. `fallback={null}` is only correct
             * because the gate renders nothing on success.
             */}
            <Suspense fallback={null}>
              <DonorRoleGate />
            </Suspense>
            {children}
          </RouteMainViewTransitionBoundary>
        </main>
      </div>
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
 * Role-only defence in depth; renders nothing, it only redirects.
 *
 * Safe as a sibling because the edge now enforces role, not just authentication:
 * `apps/donor/proxy.ts` passes `allowedRoles: ["donor", "super_admin"]` and
 * `packages/auth/middleware.ts` rejects any other role for `/donor-dashboard`
 * before the app renders. A wrong-role visitor is redirected at the proxy, so
 * `{children}` rendering beside this gate does not leak dashboard content.
 */
async function DonorRoleGate() {
  const authContext = await getAuthContext();
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

  return null;
}
