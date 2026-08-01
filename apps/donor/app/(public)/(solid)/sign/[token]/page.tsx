import { connection } from "next/server";
import { Suspense } from "react";

import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign document",
  description: "Review and sign a document shared with you.",
};

/**
 * Takes no props on purpose. The signing UI reads its token on the client, so
 * forwarding `params`/`searchParams` here would serialize an unresolved promise
 * across the client boundary and keep the page segment `isPartial`, holding an
 * otherwise fully static page out of the prerendered shell.
 */
export default function Page() {
  return (
    <>
      {/*
       * `[dynamic]` fix from
       * https://nextjs.org/docs/messages/blocking-prerender-metadata-runtime.
       * This is a fallback route (a `[token]` with no `generateStaticParams`),
       * so its metadata resolves per request. This marker renders nothing and
       * declares that, which keeps the metadata out of the prerender while the
       * page body above still prerenders into the shell.
       */}
      <Suspense fallback={null}>
        <RequestTimeMetadataMarker />
      </Suspense>
      <PageClient />
    </>
  );
}

async function RequestTimeMetadataMarker() {
  await connection();
  return null;
}
