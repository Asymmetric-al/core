import { Suspense } from "react";

import Loading from "./loading";
import PageClient from "./page-client";
import { CRM_PAGE_META } from "../../../components/table-page-meta";

import type { Metadata } from "next";

// Same source as the PageShell heading, so the tab title cannot drift.
export const metadata: Metadata = { title: CRM_PAGE_META.title };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageClient />
    </Suspense>
  );
}
