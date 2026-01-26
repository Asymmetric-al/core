import type { Metadata } from "next";
import { pageMetadata } from "@asym/lib/seo";
import { BreadcrumbJsonLd } from "@asym/lib/seo";
import { WaysToGiveClient } from "./ways-to-give-client";

export const metadata: Metadata = pageMetadata.waysToGive;

export default function WaysToGivePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Ways to Give", href: "/ways-to-give" },
        ]}
      />
      <WaysToGiveClient />
    </>
  );
}
