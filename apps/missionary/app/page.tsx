import { DashboardHome } from "@asym/missionary/components/dashboard-home";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your missionary activity and key metrics.",
};

export default function MissionaryDashboardPage() {
  return (
    <div className="container mx-auto py-2 md:py-4">
      <DashboardHome />
    </div>
  );
}
