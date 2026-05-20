import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boneyard tasks",
  description: "Archived or deferred tasks kept out of the main list.",
};

export default function Page() {
  return <PageClient />;
}
