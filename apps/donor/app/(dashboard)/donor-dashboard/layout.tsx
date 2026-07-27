import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { Footer } from "@asym/ui/components/public/footer";
import { Navbar } from "@asym/ui/components/public/navbar";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DonorSubNav } from "../../../features/donor/components/DonorSubNav";

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
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Navbar variant="solid" />
      <div className="pt-16">
        <DonorSubNav />
        <main className="flex-1 pt-8 pb-20">
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
      <Footer />
    </div>
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
