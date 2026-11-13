import { DashboardHome } from "@asym/missionary/components/dashboard-home";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your missionary activity and key metrics.",
};

export default function MissionaryDashboardPage() {
  return <DashboardHome />;
}
