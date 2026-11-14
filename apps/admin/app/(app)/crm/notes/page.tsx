import { Suspense } from "react";

import Loading from "./loading";
import CrmNotesPageClient from "./page-client";
import { CRM_NOTES_PAGE_META } from "../../../../components/table-page-meta";

import type { Metadata } from "next";

// Same source as the PageShell heading, so the tab title cannot drift.
export const metadata: Metadata = { title: CRM_NOTES_PAGE_META.title };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CrmNotesPageClient />
    </Suspense>
  );
}
