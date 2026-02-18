import { pageMetadata, DonateActionJsonLd } from "@asym/lib/seo";
import {
  HomeHero,
  HomeMission,
  HomeStats,
  HomeFeatured,
  HomeCTA,
  LiveTicker,
} from "@asym/ui/components/public/home-sections";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.home;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-zinc-900/10 selection:text-zinc-900">
      <DonateActionJsonLd />
      <HomeHero />
      <LiveTicker />
      <HomeMission />
      <HomeStats />
      <HomeFeatured />
      <HomeCTA />
    </div>
  );
}
