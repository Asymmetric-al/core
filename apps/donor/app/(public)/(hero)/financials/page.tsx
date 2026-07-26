import { pageMetadata, BreadcrumbJsonLd } from "@asym/lib/seo";

import { FinancialsPageClient } from "./financials-client";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.financials;

export default function FinancialsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Financial Transparency", href: "/financials" },
        ]}
      />
      <div data-testid="financials-route-shell">
        <FinancialsPageClient />
      </div>
    </>
  );
}
