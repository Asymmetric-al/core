import { Suspense } from "react";

import Loading from "./loading";
import CrmRelationshipsPageClient from "./page-client";

export default function CrmRelationshipsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CrmRelationshipsPageClient />
    </Suspense>
  );
}
