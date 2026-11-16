import { Suspense } from "react";

import Loading from "./loading";
import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events" };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageClient />
    </Suspense>
  );
}
