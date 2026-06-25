import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boneyard contributions",
  description: "Capture route for the admin contributions skeleton snapshot.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function Page() {
  return <PageClient />;
}
