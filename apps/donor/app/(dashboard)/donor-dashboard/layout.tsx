import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Navbar } from "@asym/ui/components/public/navbar";
import { Footer } from "@asym/ui/components/public/footer";
import { DonorSubNav } from "@/features/donor/components/DonorSubNav";
import { getAuthContext } from "@asym/auth";

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

  if (!auth.isAuthenticated) {
    redirect("/login");
  }

  if (auth.role !== "donor") {
    redirect("/");
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
