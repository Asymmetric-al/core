import type { Metadata } from "next";
import { Navbar } from "@asym/ui/components/public/navbar";
import { Footer } from "@asym/ui/components/public/footer";
import { DonorSubNav } from "@asym/ui/components/donor/DonorSubNav";

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

export default function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
