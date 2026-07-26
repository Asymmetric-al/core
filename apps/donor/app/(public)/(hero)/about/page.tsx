import { pageMetadata, BreadcrumbJsonLd } from "@asym/lib/seo";
import {
  AboutHero,
  AboutBelief,
  AboutValues,
  AboutLeadership,
  AboutCTA,
} from "@asym/ui/components/public/about-sections";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.about;

export default function AboutPage() {
  return (
    <div
      className="bg-white min-h-screen selection:bg-emerald-500/30"
      data-testid="about-route-shell"
    >
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />
      <AboutHero />
      <AboutBelief />
      <AboutValues />
      <AboutLeadership />
      <AboutCTA />
    </div>
  );
}
