import { pageMetadata, DonateActionJsonLd } from "@asym/lib/seo";
import {
  HomeHero,
  HomeMission,
  HomeStats,
  HomeFeatured,
  HomeCTA,
  LiveTicker,
} from "@asym/ui/components/public/home-sections";
import { Suspense } from "react";

import { LatestMinistryUpdates } from "./latest-ministry-updates";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.home;

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background selection:bg-invert/10 selection:text-foreground">
      <DonateActionJsonLd />
      <HomeHero />
      <LiveTicker />
      <HomeMission />
      <HomeStats />
      <HomeFeatured />
      {/* The only request-time read on this route; everything above it stays in
          the static shell. A null fallback is fine — the section renders null
          on an empty result anyway, and it sits below the fold. */}
      <Suspense fallback={null}>
        <LatestMinistryUpdates />
      </Suspense>
      <HomeCTA />
    </div>
  );
}
