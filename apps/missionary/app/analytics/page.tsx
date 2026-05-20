import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Track supporter engagement and giving trends.",
};

export default function Page() {
  return <PageClient />;
}
