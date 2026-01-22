import type { Metadata } from "next";
import { pageMetadata } from "@asym/lib/seo";
import { BreadcrumbJsonLd } from "@asym/lib/seo";
import { FinancialsPageClient } from "./financials-client";

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
      <FinancialsPageClient />
    </>
  );
}
