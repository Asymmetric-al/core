import ContentModerationPage from "./content-moderation-page-client";

import type { Metadata } from "next";
export const metadata: Metadata = { title: "Moderation" };
export default function Page() {
  return <ContentModerationPage />;
}
