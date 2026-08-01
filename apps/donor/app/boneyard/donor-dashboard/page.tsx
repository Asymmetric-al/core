import { Suspense } from "react";

import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boneyard donor dashboard",
  description: "Capture route for the donor dashboard skeleton snapshot.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

/**
 * The capture client seeds its skeleton with `Math.random()`, which Cache
 * Components requires to sit under a Suspense boundary. This route used to
 * borrow the root layout's catch-all boundary; now it owns one. Nothing here is
 * indexed, so an empty fallback costs nothing.
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageClient />
    </Suspense>
  );
}
