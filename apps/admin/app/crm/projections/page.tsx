import { Suspense } from "react";

import Loading from "./loading";
import CrmProjectionsPageClient from "./page-client";

export default function CrmProjectionsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CrmProjectionsPageClient />
    </Suspense>
  );
}
