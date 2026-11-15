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
 * The capture fixture (`DonorDashboardMainBody`) reads the current time during
 * render (for example `new Date().getFullYear()`), which Cache Components
 * requires to sit under a Suspense boundary, and the root layout has none.
 * Nothing here is indexed, so an empty fallback costs nothing.
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageClient />
    </Suspense>
  );
}
