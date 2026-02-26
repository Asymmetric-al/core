import { createClient } from "@asym/database/supabase/server";
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

const DONOR_ALLOWED_ROLES = new Set(["donor"]);

export default async function DonorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/donor-dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.role || !DONOR_ALLOWED_ROLES.has(profile.role)) {
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
