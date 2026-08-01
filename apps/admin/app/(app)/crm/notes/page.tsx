import { Suspense } from "react";

import Loading from "./loading";
import CrmNotesPageClient from "./page-client";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CrmNotesPageClient />
    </Suspense>
  );
}
