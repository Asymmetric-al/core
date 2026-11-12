import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Member Care" };

export default function Page() {
  return <PageClient />;
}
