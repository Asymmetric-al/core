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
             * Only the role gate reads the session, so it is the only thing
             * behind the boundary — the chrome above prerenders into the shell
             * of all six dashboard routes instead of collapsing to null.
             *
             * `fallback={null}` rather than a page-level skeleton: each route
             * owns its own `loading.tsx`, and a full-page fallback at layout
             * level would replace most of the page on every navigation.
             */}
            <Suspense fallback={null}>
              <DonorRoleGate>{children}</DonorRoleGate>
            </Suspense>
          </RouteMainViewTransitionBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
}

/**
 * Role-only defence in depth. `apps/donor/proxy.ts` already requires an
 * authenticated session for `/donor-dashboard` at the edge, so an anonymous
 * visitor never reaches this. Children render inside the gate, so an
 * unauthorized visitor gets the chrome and a redirect, never dashboard content.
 */
async function DonorRoleGate({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
