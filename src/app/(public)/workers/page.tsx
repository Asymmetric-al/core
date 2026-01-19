import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { BreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { WorkersPageClient } from "./workers-client";

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
