import { Suspense } from "react";

import Loading from "./loading";
import PageClient from "./page-client";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <PageClient />
    </Suspense>
  );
}
