import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
import { getProtectedAppRedirectPath } from "@asym/auth/redirects";
import { Footer } from "@asym/ui/components/public/footer";
import { Navbar } from "@asym/ui/components/public/navbar";
import { RouteMainViewTransitionBoundary } from "@asym/ui/components/view-transitions";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { DonorSubNav } from "@/features/donor/components/DonorSubNav";

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

export default async function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <DonorSubNav />
        <main className="flex-1 pt-8 pb-20">
          <RouteMainViewTransitionBoundary className="container-responsive">
            {children}
          </RouteMainViewTransitionBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
}
