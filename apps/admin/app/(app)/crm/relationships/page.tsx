import { Suspense } from "react";

import Loading from "./loading";
import CrmRelationshipsPageClient from "./page-client";
import { CRM_RELATIONSHIPS_PAGE_META } from "../../../../components/table-page-meta";

import type { Metadata } from "next";

// Same source as the PageShell heading, so the tab title cannot drift.
export const metadata: Metadata = { title: CRM_RELATIONSHIPS_PAGE_META.title };

export default function CrmRelationshipsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CrmRelationshipsPageClient />
    </Suspense>
  );
}
