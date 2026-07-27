import { connection } from "next/server";
import { Suspense } from "react";

import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign document",
  description: "Review and sign a document shared with you.",
};

/**
 * Marks the route request-time for metadata only. `[token]` has no
 * `generateStaticParams`, so metadata resolves per request while the body below
 * is static, and Next rejects that mismatch; this is the documented remedy.
 * Keep it inside its own boundary — in the page body it would opt the whole
 * route out of prerendering.
 */
const Connection = async () => {
  await connection();
  return null;
};

/**
 * Params are deliberately not awaited: the signing UI never read `token`, and
 * awaiting it here would push the static signing chrome out of the shell.
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
