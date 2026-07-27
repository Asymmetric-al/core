import { connection } from "next/server";
import { Suspense } from "react";

import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign document",
  description: "Review and sign a document shared with you.",
};

/**
 * Marks the route as request-time for metadata resolution only.
 *
 * `[token]` is a dynamic segment with no `generateStaticParams`, so metadata
 * still resolves per request while the page body below is fully static. Next
 * rejects that mismatch ("generateMetadata that depends on Request data when
 * the rest of the route does not"); this is the documented remedy. The
 * `connection()` call must stay inside its own boundary — putting it in the
 * page body would opt the whole route out of prerendering, which is what we
 * just removed from the worker profiles.
 */
const Connection = async () => {
  await connection();
  return null;
};

/**
 * The signing UI is a client component that never read the `token` param — it
 * called `use(params)` and discarded the result, which was enough to make the
 * route request-time under Cache Components. Not awaiting params here lets the
 * static signing chrome prerender; the token is read client-side when signing
 * is wired to a real backend.
 */
export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <Connection />
      </Suspense>
      <PageClient />
    </>
  );
}
