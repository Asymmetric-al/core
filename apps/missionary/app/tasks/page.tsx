import PageClient from "./page-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Track follow-ups and partner tasks.",
};

export default function Page() {
  return <PageClient />;
}
