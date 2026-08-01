import { pageMetadata, BreadcrumbJsonLd } from "@asym/lib/seo";

import { WorkersPageClient } from "./workers-client";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata.workers;

export default function WorkerListPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Missionary Directory", href: "/workers" },
        ]}
      />
      <WorkersPageClient />
    </>
  );
}
