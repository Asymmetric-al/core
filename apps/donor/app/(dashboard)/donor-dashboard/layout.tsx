import { getAuthContext, hasAnyContextRole } from "@asym/auth/context";
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

const DONOR_ALLOWED_ROLES = ["donor", "super_admin"] as const;

export default async function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthContext();

  if (!authContext.isAuthenticated) {
    redirect("/login?next=/donor-dashboard");
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
          <div className="container-responsive">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
