import { pageMetadata, BreadcrumbJsonLd } from "@asym/lib/seo";

import { WaysToGiveClient } from "./ways-to-give-client";

import type { Metadata } from "next";

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
      <div data-testid="ways-to-give-route-shell">
        <WaysToGiveClient />
      </div>
    </>
  );
}
