import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { DonateActionJsonLd } from "@/lib/seo/json-ld";
import {
  HomeHero,
  HomeMission,
  HomeStats,
  HomeFeatured,
  HomeCTA,
  LiveTicker,
} from "@/components/public/home-sections";

export const metadata: Metadata = pageMetadata.home;

export default function Home() {
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
