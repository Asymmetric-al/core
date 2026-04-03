import { getAuthContext } from "@asym/auth/context";
import { canAccessDashboard } from "@asym/auth/permissions";
import { Footer } from "@asym/ui/components/public/footer";
import { Navbar } from "@asym/ui/components/public/navbar";
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

export default async function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();

  if (!auth.isAuthenticated || !auth.userId) {
    redirect("/login?next=/donor-dashboard");
  }

  if (!canAccessDashboard(auth, "donor_portal")) {
    redirect("/no-access");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <div className="pt-16">
        <DonorSubNav />
        <main className="flex-1 pt-8 pb-20">
          <div className="container-responsive">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
